# 🚀 PDF OCR Backend - Complete Deployment Guide

> ระบบ PDF OCR Backend ที่พร้อม deploy ขึ้น Coolify ผ่าน GitHub

## 📋 ขั้นตอนการ Deploy (เร็วที่สุด)

### 🎯 วิธีที่ 1: ใช้ Script อัตโนมัติ
```bash
./deploy.sh
```

### 🎯 วิธีที่ 2: Manual Commands
```bash
# 1. ทำความสะอาด
rm -rf node_modules src/server/node_modules dist uploads/* src/server/uploads/*

# 2. Git operations  
git add .
git commit -m "📦 Ready for production"
git push origin main

# 3. Deploy ใน Coolify Dashboard
```

## ⚙️ Coolify Configuration

### 1. Project Settings
- **Type:** Docker Compose
- **Source:** GitHub Repository
- **Branch:** main

### 2. Environment Variables
```bash
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Volume Configuration
```bash
uploads_data:/app/uploads
backend_node_modules:/app/node_modules
```

### 4. Port Settings
- **Internal Port:** 3001
- **Public Port:** Auto-assigned by Coolify

## 🔧 ไฟล์สำคัญ

| ไฟล์ | คำอธิบาย |
|------|----------|
| `docker-compose.yml` | Configuration หลักสำหรับ Coolify |
| `Dockerfile.backend` | Build instructions สำหรับ backend |
| `src/server/` | Source code ทั้งหมด |
| `deploy.sh` | Script สำหรับ deploy อัตโนมัติ |
| `quick-commands.md` | Commands สำหรับ copy/paste |

## 🧪 การทดสอบ

### Local Testing
```bash
# รัน local
docker-compose up --build backend

# ทดสอบ
curl http://localhost:3001/
```

### Production Testing
```bash
# ทดสอบ production (แทนที่ domain)
curl https://your-app.coolify.io/
curl https://your-app.coolify.io/upload/test
```

## ⚠️ Security Checklist

- [ ] ✅ OpenAI API key ไม่ได้ commit ขึ้น Git
- [ ] ✅ Environment variables ตั้งค่าใน Coolify
- [ ] ✅ ไฟล์ uploads ถูก ignore จาก Git
- [ ] ✅ Node modules ถูก ignore จาก Git

## 🎯 URL Endpoints

| Endpoint | คำอธิบาย |
|----------|----------|
| `/` | หน้าหลักสำหรับอัปโหลด PDF |
| `/upload` | หน้าอัปโหลดทางเลือก |
| `/upload/api/*` | API endpoints สำหรับประมวลผล |
| `/pdf/*` | Static files สำหรับดาวน์โหลด |

## 📦 Docker Hub (Optional)

หากต้องการ push image ขึ้น Docker Hub:

```bash
# Build & tag
docker build -f Dockerfile.backend -t yourusername/pdf-ocr-backend:latest .

# Push
docker push yourusername/pdf-ocr-backend:latest
```

## 🔍 Troubleshooting

### ❌ Build ล้มเหลว
```bash
# ตรวจสอบ Dockerfile
cat Dockerfile.backend

# ตรวจสอบ dependencies
cat src/server/package.json
```

### ❌ API ไม่ทำงาน
```bash
# ตรวจสอบ environment variables ใน Coolify
# ตรวจสอบ logs ใน Coolify Dashboard
# ตรวจสอบ OpenAI API key
```

### ❌ Upload ไม่ทำงาน
```bash
# ตรวจสอบ volume mounting ใน Coolify
# ตรวจสอบ file permissions
```

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ Coolify logs
2. ทดสอบ local deployment ก่อน
3. ตรวจสอบ environment variables
4. ตรวจสอบ network connectivity

---

## 🎉 สำเร็จแล้ว!

หลังจาก deploy เสร็จ:
- ✅ เว็บไซต์พร้อมใช้งานที่ domain ที่ Coolify กำหนดให้
- ✅ สามารถอัปโหลด PDF และประมวลผลได้
- ✅ AI features ทำงานด้วย OpenAI API
- ✅ ไฟล์ถูกเก็บไว้ใน persistent volume

**ตัวอย่าง URL:** `https://your-app-name.coolify.io/` 