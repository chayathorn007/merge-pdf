import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { uploadRouter } from "./routes/APIPDF";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// ✅ เพิ่มการตั้งค่า timeout สำหรับ requests
app.use((req: Request, res: Response, next: any) => {
  // ตั้งค่า timeout ที่ 5 นาที (300,000 ms) สำหรับการประมวลผล PDF
  req.setTimeout(300000, () => {
    console.log('⏰ Request timeout after 5 minutes');
    if (!res.headersSent) {
      res.status(408).json({ 
        error: 'Request timeout', 
        message: 'การประมวลผลใช้เวลานานเกินไป กรุณาลองใหม่หรือใช้ไฟล์ PDF ที่เล็กกว่า' 
      });
    }
  });
  
  res.setTimeout(300000, () => {
    console.log('⏰ Response timeout after 5 minutes');
    if (!res.headersSent) {
      res.status(408).json({ 
        error: 'Response timeout', 
        message: 'การประมวลผลใช้เวลานานเกินไป กรุณาลองใหม่' 
      });
    }
  });
  
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' })); // เพิ่ม limit สำหรับ large files
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ เสิร์ฟไฟล์ PDF จากโฟลเดอร์ combined
app.use("/pdf", express.static(path.resolve("uploads/combined")));

// ✅ เพิ่ม route สำหรับหน้าแรก - serve HTML page สำหรับอัปโหลด
app.get("/", (req: Request, res: Response) => {
  const htmlPath = path.join(__dirname, "templates", "upload.html");
  res.sendFile(htmlPath);
});

// ✅ เพิ่ม route สำหรับหน้าอัปโหลด (alternative route)
app.get("/upload", (req: Request, res: Response) => {
  const htmlPath = path.join(__dirname, "templates", "upload.html");
  res.sendFile(htmlPath);
});

// ✅ API routes
app.use("/upload", uploadRouter);

// ✅ Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('❌ Server Error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง'
    });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend ready at http://0.0.0.0:${PORT}`);
  console.log(`📝 Upload page available at http://0.0.0.0:${PORT}/`);
  console.log(`🔗 Alternative upload page at http://0.0.0.0:${PORT}/upload`);
});

// ✅ ตั้งค่า server timeout
server.timeout = 300000; // 5 นาที
server.keepAliveTimeout = 65000; // 65 วินาที 
server.headersTimeout = 66000; // 66 วินาที (มากกว่า keepAliveTimeout เล็กน้อย)

