import { Request, Response, Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import pdf from "pdf-parse";
import { extractShopeeWithAI } from "../services/AI/extractShopeeWithAI";  // AI function
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

const upload = multer({ storage });

// ฟังก์ชันแยกข้อมูลจากแต่ละหน้า PDF
async function extractTextByPage(filePath: string): Promise<string[]> {
  const data = fs.readFileSync(filePath);
  const pdfData = await pdf(data);

  // แยกข้อความจาก PDF เป็นหน้าตามบรรทัด
  const pagesText = pdfData.text.split("\n\n");
  return pagesText;
}

// ฟังก์ชันการประมวลผลทีละหน้า
async function processPageByPage(filePath: string) {
  const pages = await extractTextByPage(filePath);
  const allExtractedData: any[] = [];

  // ประมวลผลแต่ละหน้า
  for (let i = 0; i < pages.length; i++) {
    const pageText = pages[i];
    
    // ส่งข้อความแต่ละหน้ามาให้ AI ประมวลผล
    const extracted = await extractShopeeWithAI(pageText);
    if (extracted.length > 0) {
      allExtractedData.push(...extracted);
    }
  }

  return allExtractedData;
}

// ฟังก์ชันสำหรับการสร้าง PDF ใหม่จากข้อมูลที่ได้รับจาก AI
async function generatePDFFromAIData(data: any[], outputPath: string) {
  const browser = await puppeteer.launch({
    headless: true,  // ใช้ headless เมื่อรันใน production
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

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
  await page.pdf({ path: outputPath, width: "384px", height: "576px", printBackground: true });
  await browser.close();
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
  try {
    if (!req.file || !req.file.path) {
      res.status(400).send("❌ ไม่พบไฟล์ PDF");
      return;
    }

    const filePath = req.file.path;
    const fileName = path.basename(filePath, path.extname(filePath));
    const generatedPath = path.join(uploadsDir, `${fileName}_gen.pdf`);

    // ประมวลผลไฟล์ PDF ทีละหน้า
    const extractedData = await processPageByPage(filePath);

    if (extractedData.length === 0) {
      res.status(400).json({ message: "❌ ไม่พบข้อมูลจาก AI" });
      return;
    }

    // สร้าง PDF ใหม่จากข้อมูลที่ได้จาก AI
    await generatePDFFromAIData(extractedData, generatedPath);

    // รวม PDF ที่มีทั้งไฟล์เดิมและไฟล์ที่สร้างใหม่
    const mergedBuffer = await mergePdfFilesOCR([filePath, generatedPath]);

    // 🧹 ลบไฟล์ชั่วคราว
    [filePath, generatedPath].forEach((p) => {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    // การใช้ encodeURIComponent เพื่อทำให้ชื่อไฟล์ปลอดภัยใน header
    const safeFileName = encodeURIComponent(fileName).replace(/%/g, "");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName}_label.pdf"`,
      "Content-Length": mergedBuffer.length,
    });

    res.send(mergedBuffer);
  } catch (err: any) {
    console.error("❌ ERROR:", err);
    res.status(500).send("❌ ระบบมีปัญหา: " + err.message);
  }
});

export { uploadRouter };

