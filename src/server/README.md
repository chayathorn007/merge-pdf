# PDF OCR Backend-Only System

ระบบประมวลผล PDF ด้วย AI ที่ทำงานได้ที่ backend เพียงอย่างเดียว ไม่ต้องใช้ frontend React แยกต่างหาก

## ✨ ความสามารถ

- 📄 อัปโหลด PDF ผ่านหน้าเว็บง่ายๆ
- 🤖 ประมวลผลด้วย AI (OpenAI GPT) หรือ Mock Data
- 📋 แยกข้อมูลจาก Shopee และแพลตฟอร์มอื่นๆ
- 🏷️ สร้างใบปะหน้าสำหรับการส่งคืน
- 📦 รวม PDF เดิมและใบปะหน้าในไฟล์เดียว
- ⬇️ ดาวน์โหลดไฟล์ผลลัพธ์อัตโนมัติ

## 🚀 การติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. การตั้งค่า OpenAI API Key (ไม่บังคับ)

สร้างไฟล์ `.env` ในโฟลเดอร์ `src/server/`:

```bash
# OpenAI API Key สำหรับ AI features
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Port (ไม่บังคับ)
PORT=3001
```

**หมายเหตุ:** หากไม่มี OpenAI API Key ระบบจะใช้ Mock Data แทน

### 3. รัน Server

#### วิธีที่ 1: ใช้ script ที่เตรียมไว้
```bash
./start.sh
```

#### วิธีที่ 2: รันด้วย npm/npx
```bash
npx ts-node index.ts
```

### 4. เข้าใช้งาน

เปิดเบราว์เซอร์และไปที่:
- **หน้าหลัก:** http://localhost:3001/
- **หน้าอัปโหลด:** http://localhost:3001/upload

## 📱 การใช้งาน

1. เปิดเบราว์เซอร์และไปที่ http://localhost:3001/
2. คลิก "เลือกไฟล์ PDF" เพื่ออัปโหลดไฟล์ PDF
3. คลิก "อัปโหลดและประมวลผล PDF"
4. รอการประมวลผล (อาจใช้เวลาสักครู่สำหรับไฟล์ใหญ่)
5. ไฟล์ PDF ที่ประมวลผลแล้วจะถูกดาวน์โหลดอัตโนมัติ

## 📁 โครงสร้างไฟล์

```
src/server/
├── index.ts              # Main server file
├── routes/
│   └── APIPDF.ts         # API routes สำหรับประมวลผล PDF
├── services/
│   └── AI/
│       └── extractShopeeWithAI.ts  # AI service
├── templates/
│   ├── upload.html       # หน้าอัปโหลดไฟล์
│   ├── template SPX.html # Template สำหรับใบปะหน้า
│   └── ...               # Templates อื่นๆ
├── utils/
│   └── mergePdfFiles.ts  # Utility สำหรับรวม PDF
├── start.sh              # Script สำหรับ start server
└── README.md             # คู่มือนี้
```

## 🛠️ API Endpoints

- `GET /` - หน้าอัปโหลดไฟล์
- `GET /upload` - หน้าอัปโหลดไฟล์ (alternative)
- `POST /upload/OCR` - API สำหรับประมวลผล PDF
- `GET /pdf/*` - เสิร์ฟไฟล์ PDF ที่ประมวลผลแล้ว

## ⚙️ Configuration

### Environment Variables

- `OPENAI_API_KEY` - OpenAI API key สำหรับ AI features
- `PORT` - Port ที่ server จะรัน (default: 3001)

### Dependencies หลัก

- `express` - Web framework
- `multer` - File upload handling
- `puppeteer` - PDF generation
- `pdf-parse` - PDF text extraction
- `pdf-lib` - PDF manipulation
- `openai` - OpenAI API client

## 🔧 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Server ไม่สามารถ start ได้**
   - ตรวจสอบว่าติดตั้ง dependencies ครบแล้ว: `npm install`
   - ตรวจสอบว่า port 3001 ไม่ถูกใช้งานโดยโปรแกรมอื่น

2. **AI features ไม่ทำงาน**
   - ตั้งค่า OpenAI API key ในไฟล์ `.env`
   - หรือใช้ Mock Data mode (ทำงานได้โดยไม่ต้อง API key)

3. **ไฟล์ PDF ประมวลผลไม่สำเร็จ**
   - ตรวจสอบว่าไฟล์ PDF ไม่เสียหาย
   - ตรวจสอบ log ในหน้าต่าง terminal ที่รัน server

## 🎯 การพัฒนาเพิ่มเติม

- เพิ่มการรองรับไฟล์ PDF ประเภทอื่นๆ
- ปรับปรุง UI/UX ของหน้าอัปโหลด
- เพิ่ม template สำหรับแพลตฟอร์มอื่นๆ (Lazada, TikTok Shop, etc.)
- เพิ่มระบบ authentication
- เพิ่มการ logging และ monitoring

## 📞 การสนับสนุน

หากมีปัญหาหรือข้อสงสัย กรุณาตรวจสอบ log ใน terminal และ browser console 