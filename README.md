# PDF OCR Backend System 📄🤖

ระบบประมวลผล PDF ด้วย AI ที่ทำงานได้ที่ backend เพียงอย่างเดียว พร้อม Web Interface สำหรับอัปโหลดไฟล์

## ✨ ความสามารถ

- 📄 **อัปโหลด PDF** ผ่านหน้าเว็บง่ายๆ 
- 🤖 **ประมวลผลด้วย AI** (OpenAI GPT) 
- 📋 **แยกข้อมูล** จาก Shopee และแพลตฟอร์มอีคอมเมิร์ซอื่นๆ
- 🏷️ **สร้างใบปะหน้า** สำหรับการส่งคืนสินค้า
- 📦 **รวม PDF** เดิมและใบปะหน้าในไฟล์เดียว
- ⬇️ **ดาวน์โหลดไฟล์** ผลลัพธ์อัตโนมัติ

## 🚀 วิธีรัน Backend

### วิธีที่ 1: รันด้วย Docker (แนะนำ)

```bash
# รันด้วย script ที่เตรียมไว้
./start-docker.sh

# หรือรันด้วย docker-compose โดยตรง
docker-compose up --build backend
```

### วิธีที่ 2: รันแบบ Development

```bash
cd src/server/
npm install
npx ts-node index.ts

# หรือใช้ script ที่เตรียมไว้
./start.sh
```

## 🌐 การเข้าใช้งาน

หลังจากรัน server แล้ว เปิดเบราว์เซอร์ไปที่:

- **หน้าหลัก:** http://localhost:3001/
- **หน้าอัปโหลด:** http://localhost:3001/upload

## 🔧 การตั้งค่า

### OpenAI API Key

ระบบได้ตั้งค่า OpenAI API Key ไว้แล้วใน `docker-compose.yml` 

หากต้องการเปลี่ยนแปลง สามารถแก้ไขได้ในไฟล์ `docker-compose.yml`:

```yaml
environment:
  - OPENAI_API_KEY=your-api-key-here
```

### Port Configuration

- **Backend:** รันที่ port `3001`
- **Web Interface:** เข้าถึงผ่าน `http://localhost:3001`

## 📁 โครงสร้างโปรเจค

```
pdf-final-docker-ver-be/
├── docker-compose.yml          # Docker configuration (Backend only)
├── Dockerfile.backend          # Backend Docker image
├── start-docker.sh            # Script สำหรับรัน Docker
├── src/server/                # Backend source code
│   ├── index.ts               # Main server file
│   ├── start.sh              # Development start script
│   ├── templates/            # HTML templates
│   │   └── upload.html       # Upload page
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── utils/                # Utility functions
└── uploads/                   # File storage
```

## 🛠 การพัฒนา

### ติดตั้ง Dependencies

```bash
cd src/server/
npm install
```

### รันในโหมด Development

```bash
npm run dev
# หรือ
npx ts-node index.ts
```

## 🐳 Docker Commands

```bash
# Build และรัน backend
docker-compose up --build backend

# รันใน background
docker-compose up -d backend

# หยุดการทำงาน
docker-compose down

# ดู logs
docker-compose logs backend

# เข้าไปใน container
docker-compose exec backend sh
```

## 📝 หมายเหตุ

- ระบบนี้ **ไม่ต้องใช้ frontend React** แยกต่างหาก
- **Web Interface** ถูกสร้างด้วย HTML/CSS/JavaScript ธรรมดา
- **OpenAI API Key** จำเป็นสำหรับการทำงานของ AI features
- **ไฟล์ที่อัปโหลด** จะถูกเก็บไว้ใน volume `uploads_data`

## 🆘 Troubleshooting

### ถ้า Docker ไม่รัน
```bash
# ตรวจสอบว่า Docker ทำงานอยู่
docker --version
docker-compose --version

# ล้างข้อมูลเก่า
docker-compose down -v
docker system prune -f
```

### ถ้า Port ขัดแย้ง
```bash
# ตรวจสอบ process ที่ใช้ port 3001
lsof -i :3001

# หยุด process ที่ขัดแย้ง
kill -9 <PID>
```
