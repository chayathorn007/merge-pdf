# 🚀 คู่มือ Deploy PDF OCR Backend ขึ้น GitHub และ Coolify

## 📋 ขั้นตอนการ Deploy

### 1. เตรียม Git Repository

```bash
# ❗ ทำความสะอาดไฟล์ที่ไม่ต้องการก่อน
rm -rf node_modules
rm -rf src/server/node_modules
rm -rf dist
rm -rf uploads/*
rm -rf src/server/uploads/*

# Initialize git (ถ้ายังไม่มี)
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit ครั้งแรก
git commit -m "🎉 Initial commit: PDF OCR Backend System"

# เชื่อมต่อกับ GitHub Repository (แทนที่ URL ด้วย repo จริง)
git remote add origin https://github.com/yourusername/pdf-ocr-backend.git

# Push ขึ้น GitHub
git branch -M main
git push -u origin main
```

### 2. ตั้งค่า Environment Variables สำหรับ Production

สร้างไฟล์ `.env.example` เพื่อแสดงตัวอย่างการตั้งค่า:

```bash
# Production Environment Variables
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Docker Compose สำหรับ Coolify

สำหรับ Coolify ให้ใช้ไฟล์ `docker-compose.yml` ที่มีอยู่แล้ว โดยจะต้องตั้งค่า Environment Variables ใน Coolify Dashboard

### 4. Commands สำหรับ Build และ Deploy

```bash
# ❗ Build Docker Image (ถ้าต้องการ test ก่อน deploy)
docker build -f Dockerfile.backend -t pdf-ocr-backend:latest .

# ❗ Tag Image สำหรับ Docker Registry (ถ้าต้องการ)
docker tag pdf-ocr-backend:latest yourdockerhub/pdf-ocr-backend:latest

# ❗ Push Image ขึ้น Docker Hub (ถ้าต้องการ)
docker push yourdockerhub/pdf-ocr-backend:latest
```

## 🔧 การตั้งค่าใน Coolify

### 1. สร้าง Project ใหม่ใน Coolify
- เลือก "Docker Compose"
- เชื่อมต่อกับ GitHub Repository

### 2. Environment Variables ที่ต้องตั้งค่าใน Coolify
```
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Volume Mapping
- ตั้งค่า Volume สำหรับ `uploads_data` เพื่อเก็บไฟล์
- ตั้งค่า Volume สำหรับ `backend_node_modules` เพื่อ cache

### 4. Port Mapping
- Internal Port: `3001`
- External Port: ปล่อยให้ Coolify จัดการ

## 📝 ไฟล์ที่สำคัญสำหรับ Deploy

1. `docker-compose.yml` - Configuration หลัก
2. `Dockerfile.backend` - Build instructions
3. `src/server/` - Source code ทั้งหมด
4. `.gitignore` - ไฟล์ที่ไม่ต้อง commit

## ⚠️ สิ่งที่ต้องระวัง

1. **OpenAI API Key**: ห้าม commit API key ขึ้น Git
2. **Uploads Folder**: ควร mount เป็น volume แยก
3. **Node Modules**: จะถูก build ใหม่ในแต่ละ deployment
4. **Port 3001**: ต้องให้ Coolify map ออกมาภายนอก

## 🚀 Deploy Commands

```bash
# 1. เตรียม Repository
git add .
git commit -m "📦 Ready for production deployment"
git push origin main

# 2. ใน Coolify Dashboard:
#    - เลือก GitHub Repository
#    - ตั้งค่า Environment Variables
#    - กด Deploy
```

## 🔍 การตรวจสอบหลัง Deploy

```bash
# เช็คว่า service รันอยู่
curl https://your-coolify-domain.com/

# เช็ค API endpoint
curl https://your-coolify-domain.com/upload/test
```

## 🐛 Troubleshooting

### ถ้า Build ล้มเหลว
- ตรวจสอบ `Dockerfile.backend`
- ตรวจสอบ dependencies ใน `package.json`
- ดู logs ใน Coolify Dashboard

### ถ้า API ไม่ทำงาน
- ตรวจสอบ Environment Variables
- ตรวจสอบ OpenAI API Key
- ดู Application logs

### ถ้า Upload ไม่ทำงาน
- ตรวจสอบ Volume mounting
- ตรวจสอบ file permissions
- ตรวจสอบว่า uploads directory ถูกสร้างแล้ว 