# 🐳 Docker Login สำหรับ GitHub Container Registry

## 📋 ข้อมูลสำหรับ Login

### 🔑 ข้อมูลที่ต้องการ:
- **Registry URL:** `ghcr.io`
- **Username:** GitHub username ของคุณ
- **Password:** GitHub Personal Access Token (PAT)

## 🚀 วิธีการ Login

### 1. สร้าง Personal Access Token (PAT)

1. ไป GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. กดปุ่ม "Generate new token (classic)"
3. ตั้งชื่อ token: เช่น "Docker Registry Access"
4. เลือก permissions:
   - ✅ `read:packages` - อ่าน packages
   - ✅ `write:packages` - เขียน packages
   - ✅ `delete:packages` - ลบ packages (ถ้าต้องการ)
5. กด "Generate token"
6. **🚨 คัดลอกและเก็บ token ไว้ทันที** (จะไม่แสดงอีก)

### 2. Docker Login Commands

```bash
# วิธีที่ 1: ใช้ stdin (ปลอดภัยกว่า)
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# วิธีที่ 2: ใส่ password ตรงๆ (ไม่แนะนำ)
docker login ghcr.io -u YOUR_GITHUB_USERNAME -p YOUR_GITHUB_PAT

# วิธีที่ 3: Interactive (จะถาม password)
docker login ghcr.io -u YOUR_GITHUB_USERNAME
```

### 3. ตัวอย่างการใช้งาน

```bash
# ตัวอย่าง: username คือ "johndoe"
echo "ghp_xxxxxxxxxxxxxxxxxxxx" | docker login ghcr.io -u johndoe --password-stdin

# หลังจาก login สำเร็จ
docker tag pdf-ocr-backend:latest ghcr.io/johndoe/pdf-ocr-backend:latest
docker push ghcr.io/johndoe/pdf-ocr-backend:latest
```

## 📦 การ Push/Pull Images

### Push Image
```bash
# Tag image ให้ชี้ไป GitHub Container Registry
docker tag your-image:latest ghcr.io/YOUR_USERNAME/your-image:latest

# Push ขึ้น GitHub
docker push ghcr.io/YOUR_USERNAME/your-image:latest
```

### Pull Image
```bash
# Pull image จาก GitHub
docker pull ghcr.io/YOUR_USERNAME/your-image:latest
```

## 🔒 ความปลอดภัย

### ✅ แนะนำ:
- ใช้ Personal Access Token แทน password
- ใช้ `--password-stdin` เพื่อไม่ให้ password ปรากฏใน command history
- ตั้งค่า permissions ให้น้อยที่สุดตามที่ต้องการใช้งาน
- ตั้ง expiration date สำหรับ PAT

### ❌ ไม่ควรทำ:
- ใส่ password ตรงๆ ใน command line
- ใช้ GitHub password ตรงๆ
- แชร์ PAT กับคนอื่น
- Commit PAT ขึ้น Git

## 🔧 สำหรับโปรเจคนี้

### ถ้าต้องการใช้ GitHub Container Registry:

```bash
# 1. Login
echo "YOUR_PAT" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 2. Build & Tag
docker build -f Dockerfile.backend -t ghcr.io/YOUR_USERNAME/pdf-ocr-backend:latest .

# 3. Push
docker push ghcr.io/YOUR_USERNAME/pdf-ocr-backend:latest

# 4. แก้ไข docker-compose.yml ให้ใช้ image จาก GitHub
```

### แก้ไข docker-compose.yml:
```yaml
services:
  backend:
    image: ghcr.io/YOUR_USERNAME/pdf-ocr-backend:latest
    # แทนที่ build section
```

## 🆚 เปรียบเทียบ Docker Hub vs GitHub Container Registry

| | Docker Hub | GitHub Container Registry |
|---|---|---|
| **URL** | docker.io | ghcr.io |
| **Free Tier** | 1 private repo | Unlimited private repos |
| **Integration** | แยกต่างหาก | รวมกับ GitHub |
| **Login** | Docker Hub account | GitHub PAT |
| **ราคา** | $5/month สำหรับ private | ฟรีสำหรับ public repos |

## 🚨 Troubleshooting

### "unauthorized: authentication required"
```bash
# ตรวจสอบว่า login แล้วหรือยัง
docker info | grep Username

# Login ใหม่
docker logout ghcr.io
echo "YOUR_PAT" | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### "denied: requested access to the resource is denied"
- ตรวจสอบ permissions ของ PAT
- ตรวจสอบชื่อ repository ให้ถูกต้อง
- ตรวจสอบว่าเป็นเจ้าของ repo หรือมีสิทธิ์ push

### "repository does not exist"
- ตรวจสอบชื่อ username และ repository name
- ตรวจสอบว่า repository เป็น public หรือ private 