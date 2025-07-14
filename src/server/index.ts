import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { uploadRouter } from "./routes/APIPDF";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`🚀 Backend ready at http://localhost:${PORT}`);
  console.log(`📝 Upload page available at http://localhost:${PORT}/`);
  console.log(`🔗 Alternative upload page at http://localhost:${PORT}/upload`);
});

