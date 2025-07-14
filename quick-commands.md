# 🚀 Quick Commands สำหรับ Deploy

## 📦 GitHub Push Commands

```bash
# ทำความสะอาดไฟล์ก่อน commit
rm -rf node_modules src/server/node_modules dist uploads/* src/server/uploads/*

# Git operations
git add .
git commit -m "📦 Ready for production deployment"
git push origin main
```

## 🐳 Docker Commands

```bash
# Build Docker image
docker build -f Dockerfile.backend -t pdf-ocr-backend:latest .

# Tag for Docker Hub (แทนที่ yourusername)
docker tag pdf-ocr-backend:latest yourusername/pdf-ocr-backend:latest

# Push to Docker Hub
docker push yourusername/pdf-ocr-backend:latest

# Test locally
docker-compose up --build backend
```

## ☁️ Coolify Environment Variables

Copy และ paste ใน Coolify Dashboard:

```
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

## 🔧 Coolify Volume Settings

```
uploads_data:/app/uploads
backend_node_modules:/app/node_modules
```

## 🌐 Port Configuration

- **Internal Port:** 3001
- **External Port:** Auto (let Coolify handle)

## 🧪 Testing Commands

```bash
# Test local deployment
curl http://localhost:3001/

# Test production deployment (แทนที่ domain)
curl https://your-app.coolify.io/

# Check API endpoint
curl https://your-app.coolify.io/upload/test
```

## 📋 Complete Deploy Checklist

- [ ] ✅ Clean up temporary files
- [ ] ✅ Commit และ push ขึ้น GitHub
- [ ] ✅ Build Docker image (optional)
- [ ] ✅ Create project ใน Coolify
- [ ] ✅ Connect GitHub repository
- [ ] ✅ Set environment variables
- [ ] ✅ Configure volumes
- [ ] ✅ Deploy
- [ ] ✅ Test deployment

## 🚀 One-Line Deploy

```bash
# ใช้ deployment script ที่เตรียมไว้
./deploy.sh
``` 