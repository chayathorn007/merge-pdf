import { Request, Response, Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import pdf from "pdf-parse";
import axios from "axios";
import { extractShopeeWithAI, ExtractedData } from "../services/AI/extractShopeeWithAI";  // AI function
import { mergePdfFilesOCR } from "../utils/mergePdfFiles";  // PDF merging function

const uploadRouter = Router();

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// ✅ ฟังก์ชันส่งข้อมูลไป Google Sheets
const sendToGoogleSheets = async (data: ExtractedData[]): Promise<void> => {
  try {
    console.log("📊 Sending data to Google Sheets...");
    const response = await axios.post(
      "https://script.google.com/macros/s/AKfycbzuDkw4mXI7AmJ0WD1Uas_IkJQKl3KI-bGZ2Cmh6v9h8QC7_QyHCFcoQvECEbxtinLk/exec",
      { data },
      { 
        headers: { "Content-Type": "application/json" },
        timeout: 30000 // 30 วินาที timeout
      }
    );
    console.log("✅ Data sent to Google Sheets successfully:", response.data);
  } catch (error: any) {
    console.error("❌ Error sending to Google Sheets:", error.message || error);
    // ไม่ throw error เพื่อไม่ให้กระทบกับกระบวนการหลัก
  }
};

// ✅ ฟังก์ชันแยกข้อมูลจากแต่ละหน้า PDF - ปรับปรุงให้เร็วขึ้น
async function extractTextByPage(filePath: string): Promise<string[]> {
  try {
    const data = fs.readFileSync(filePath);
    const pdfData = await pdf(data);

    // ✅ จำกัดจำนวนหน้าที่ประมวลผลเพื่อลด timeout
    const MAX_PAGES = 10; // จำกัดไม่เกิน 10 หน้า
    
    // แยกข้อความจาก PDF เป็นหน้าตามบรรทัด
    const pagesText = pdfData.text.split("\n\n");
    const limitedPages = pagesText.slice(0, MAX_PAGES);
    
    console.log(`📄 Processing ${limitedPages.length} pages (limited from ${pagesText.length} total pages)`);
    return limitedPages;
  } catch (error) {
    console.error("❌ Error extracting PDF text:", error);
    throw new Error("ไม่สามารถอ่านไฟล์ PDF ได้ กรุณาตรวจสอบไฟล์");
  }
}

// ✅ ฟังก์ชันการประมวลผลทีละหน้า - เพิ่ม timeout protection
async function processPageByPage(filePath: string): Promise<ExtractedData[]> {
  const pages = await extractTextByPage(filePath);
  const allExtractedData: ExtractedData[] = [];
  
  console.log(`🔄 Starting to process ${pages.length} pages...`);

  // ประมวลผลแต่ละหน้า
  for (let i = 0; i < pages.length; i++) {
    try {
      console.log(`📋 Processing page ${i + 1}/${pages.length}...`);
      const pageText = pages[i];
      
      // ข้ามหน้าที่มีข้อความน้อยเกินไป
      if (pageText.trim().length < 50) {
        console.log(`⏭️ Skipping page ${i + 1} - too little content`);
        continue;
      }
      
      // ส่งข้อความแต่ละหน้ามาให้ AI ประมวลผล
      const extracted = await extractShopeeWithAI(pageText);
      if (extracted.length > 0) {
        allExtractedData.push(...extracted);
        console.log(`✅ Page ${i + 1} extracted ${extracted.length} items`);
      } else {
        console.log(`⚠️ Page ${i + 1} - no data extracted`);
      }
      
      // ✅ เพิ่มการหยุดพักเล็กน้อยเพื่อไม่ให้ AI API overwhelmed
      if (i < pages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // พัก 0.5 วินาที
      }
      
    } catch (error) {
      console.error(`❌ Error processing page ${i + 1}:`, error);
      // ถ้า AI ล้มเหลว ให้ข้ามหน้านี้และทำต่อ
      continue;
    }
  }

  console.log(`🎯 Total extracted items: ${allExtractedData.length}`);
  return allExtractedData;
}

// ✅ ฟังก์ชันสำหรับการสร้าง PDF ใหม่จากข้อมูลที่ได้รับจาก AI - เพิ่ม timeout protection
async function generatePDFFromAIData(data: ExtractedData[], outputPath: string) {
  let browser = null;
  try {
    console.log("🖨️ Starting PDF generation...");
    const startTime = Date.now();
    
    browser = await puppeteer.launch({
      headless: true,  
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor"
      ],
      timeout: 30000 // 30 วินาที timeout สำหรับ browser launch
    });
    
    const page = await browser.newPage();
    
    // ✅ ตั้งค่า timeout สำหรับ page
    page.setDefaultTimeout(30000); // 30 วินาที
    page.setDefaultNavigationTimeout(30000); // 30 วินาที

    // โหลด HTML template
    const templatePath = path.join(__dirname, "../templates/template SPX.html");
    const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    // ใช้ข้อมูลที่ได้รับจาก AI เติมลงใน HTML template
    const filledHtml = data
      .map((item) => {
        const lines = splitTextSmart(item.recipient, 36);
        let html = htmlTemplate
          .replace(/{{order_number}}/g, item.order || "")
          .replace(/{{sender_line1}}/g, lines[0] || "")
          .replace(/{{sender_line2}}/g, lines[1] || "")
          .replace(/{{sender_line3}}/g, lines[2] || "");

        if (lines[3]) {
          html = html.replace("{{sender_line4}}", lines[3]);
        } else {
          html = html.replace("{{sender_line4}}", "");
        }

        return html;
      })
      .join("\n<div style='page-break-after:always'></div>\n");

    // สร้าง PDF จาก HTML
    await page.setContent(filledHtml, { waitUntil: "networkidle0" });
    await page.pdf({ 
      path: outputPath, 
      width: "384px", 
      height: "576px", 
      printBackground: true,
      timeout: 30000 // 30 วินาที timeout สำหรับ PDF generation
    });
    
    const generationTime = Date.now() - startTime;
    console.log(`✅ PDF generated successfully in ${generationTime}ms`);
    
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw new Error("ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function splitTextSmart(input: string, maxCharsPerLine = 36): string[] {
  const words = input.trim().split(/\s+/);
  const lines = [""];
  for (const word of words) {
    const currentLine = lines[lines.length - 1];
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      lines[lines.length - 1] = (currentLine + " " + word).trim();
    } else {
      lines.push(word);
    }
  }
  return lines;
}


// POST handler สำหรับการประมวลผล OCR และสร้าง PDF
uploadRouter.post("/OCR", upload.single("pdf"), async (req: Request, res: Response) => {
  const startTime = Date.now();
  let filePath = "";
  let generatedPath = "";
  
  try {
    console.log("🚀 Starting PDF OCR processing...");
    
    if (!req.file || !req.file.path) {
      res.status(400).json({ error: "❌ ไม่พบไฟล์ PDF" });
      return;
    }

    filePath = req.file.path;
    const fileName = path.basename(filePath, path.extname(filePath));
    generatedPath = path.join(uploadsDir, `${fileName}_gen.pdf`);

    console.log(`📂 Processing file: ${fileName}`);

    // ✅ ตรวจสอบขนาดไฟล์
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`📏 File size: ${fileSizeInMB.toFixed(2)} MB`);
    
    if (fileSizeInMB > 20) {
      throw new Error("ไฟล์ใหญ่เกิน 20MB กรุณาใช้ไฟล์ที่เล็กกว่า");
    }

    // ประมวลผลไฟล์ PDF ทีละหน้า
    const extractedData = await processPageByPage(filePath);

    if (extractedData.length === 0) {
      res.status(400).json({ 
        error: "❌ ไม่พบข้อมูลจาก AI",
        message: "ไม่สามารถดึงข้อมูลจากไฟล์ PDF ได้ กรุณาตรวจสอบไฟล์หรือลองใหม่"
      });
      return;
    }

    console.log(`💾 Found ${extractedData.length} orders to process`);

    // สร้าง PDF ใหม่จากข้อมูลที่ได้จาก AI
    await generatePDFFromAIData(extractedData, generatedPath);

    // ✅ ส่งข้อมูลไป Google Sheets หลังจากสร้าง PDF เสร็จ
    await sendToGoogleSheets(extractedData);

    // รวม PDF ที่มีทั้งไฟล์เดิมและไฟล์ที่สร้างใหม่
    console.log("🔗 Merging PDF files...");
    const mergedBuffer = await mergePdfFilesOCR([filePath, generatedPath]);

    // การใช้ encodeURIComponent เพื่อทำให้ชื่อไฟล์ปลอดภัยใน header
    const safeFileName = encodeURIComponent(fileName).replace(/%/g, "");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName}_label.pdf"`,
      "Content-Length": mergedBuffer.length,
    });

    const totalTime = Date.now() - startTime;
    console.log(`🎉 Processing completed successfully in ${totalTime}ms`);

    res.send(mergedBuffer);
    
  } catch (err: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ ERROR after ${totalTime}ms:`, err);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "❌ ระบบมีปัญหา",
        message: err.message || "เกิดข้อผิดพลาดในการประมวลผล",
        processingTime: totalTime
      });
    }
  } finally {
    // 🧹 ลบไฟล์ชั่วคราว
    [filePath, generatedPath].forEach((p) => {
      if (p && fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
          console.log(`🗑️ Cleaned up temporary file: ${path.basename(p)}`);
        } catch (cleanupError) {
          console.warn(`⚠️ Failed to cleanup file ${p}:`, cleanupError);
        }
      }
    });
  }
});

export { uploadRouter };

