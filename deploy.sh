#!/bin/bash

echo "🚀 PDF OCR Backend Deployment Script"
echo "======================================"

# สีสำหรับแสดงผล
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ฟังก์ชันสำหรับแสดงข้อความ
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ตรวจสอบว่ามี git หรือไม่
if ! command -v git &> /dev/null; then
    print_error "Git is not installed!"
    exit 1
fi

# ตรวจสอบว่ามี docker หรือไม่
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    exit 1
fi

print_info "Cleaning up temporary files..."
rm -rf node_modules 2>/dev/null
rm -rf src/server/node_modules 2>/dev/null
rm -rf dist 2>/dev/null
rm -rf uploads/* 2>/dev/null
rm -rf src/server/uploads/* 2>/dev/null

print_info "Cleaning up complete!"

# ขั้นตอนที่ 1: Git Operations
echo ""
echo "📋 Step 1: Git Repository Setup"
echo "==============================="

# ตรวจสอบว่ามี git repository หรือยัง
if [ ! -d ".git" ]; then
    print_info "Initializing Git repository..."
    git init
else
    print_info "Git repository already exists"
fi

# เพิ่มไฟล์ทั้งหมด
print_info "Adding all files to Git..."
git add .

# ถามข้อความ commit
echo ""
read -p "📝 Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="📦 Ready for production deployment"
fi

print_info "Committing changes..."
git commit -m "$commit_msg"

# ถาม GitHub Repository URL
echo ""
read -p "🔗 Enter GitHub repository URL (https://github.com/username/repo.git): " repo_url
if [ ! -z "$repo_url" ]; then
    # ตรวจสอบว่ามี remote origin หรือยัง
    if git remote get-url origin &> /dev/null; then
        print_warning "Remote origin already exists, updating..."
        git remote set-url origin "$repo_url"
    else
        print_info "Adding remote origin..."
        git remote add origin "$repo_url"
    fi
    
    print_info "Pushing to GitHub..."
    git branch -M main
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        print_info "✅ Successfully pushed to GitHub!"
    else
        print_error "❌ Failed to push to GitHub. Please check your repository URL and permissions."
    fi
else
    print_warning "Skipping GitHub push (no repository URL provided)"
fi

# ขั้นตอนที่ 2: Docker Image Building
echo ""
echo "🐳 Step 2: Docker Image Building"
echo "================================="

read -p "🏗️  Do you want to build Docker image? (y/n): " build_docker
if [[ $build_docker =~ ^[Yy]$ ]]; then
    print_info "Building Docker image..."
    
    # ถามชื่อ image
    read -p "📦 Enter Docker image name (default: pdf-ocr-backend): " image_name
    if [ -z "$image_name" ]; then
        image_name="pdf-ocr-backend"
    fi
    
    docker build -f Dockerfile.backend -t "${image_name}:latest" .
    
    if [ $? -eq 0 ]; then
        print_info "✅ Docker image built successfully!"
        
        # ถามว่าต้องการ push ขึ้น Docker Hub หรือไม่
        read -p "🚀 Do you want to push to Docker Hub? (y/n): " push_docker
        if [[ $push_docker =~ ^[Yy]$ ]]; then
            read -p "📦 Enter Docker Hub username: " docker_username
            if [ ! -z "$docker_username" ]; then
                docker tag "${image_name}:latest" "${docker_username}/${image_name}:latest"
                
                print_info "Pushing to Docker Hub..."
                docker push "${docker_username}/${image_name}:latest"
                
                if [ $? -eq 0 ]; then
                    print_info "✅ Successfully pushed to Docker Hub!"
                    echo "🔗 Image URL: ${docker_username}/${image_name}:latest"
                else
                    print_error "❌ Failed to push to Docker Hub. Please login first: docker login"
                fi
            fi
        fi
    else
        print_error "❌ Failed to build Docker image!"
    fi
fi

# ขั้นตอนที่ 3: Coolify Instructions
echo ""
echo "☁️  Step 3: Coolify Deployment Instructions"
echo "==========================================="

print_info "Follow these steps in Coolify Dashboard:"
echo ""
echo "1. 🔗 Create new project and connect to your GitHub repository"
echo "2. 📁 Select 'Docker Compose' as deployment type"
echo "3. 🔧 Set Environment Variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=3001"
echo "   - OPENAI_API_KEY=sk-your-actual-openai-api-key-here"
echo ""
echo "4. 💾 Configure Volumes:"
echo "   - uploads_data:/app/uploads"
echo "   - backend_node_modules:/app/node_modules"
echo ""
echo "5. 🌐 Port Mapping:"
echo "   - Internal Port: 3001"
echo "   - Let Coolify handle external port"
echo ""
echo "6. 🚀 Deploy!"

# สรุป
echo ""
echo "✨ Deployment Summary"
echo "===================="
print_info "✅ Files cleaned up"
print_info "✅ Git repository prepared"
if [ ! -z "$repo_url" ]; then
    print_info "✅ Code pushed to GitHub: $repo_url"
fi
if [[ $build_docker =~ ^[Yy]$ ]]; then
    print_info "✅ Docker image built: ${image_name}:latest"
fi
print_info "✅ Ready for Coolify deployment!"

echo ""
print_warning "⚠️  Remember to:"
echo "   1. Keep your OpenAI API key secure"
echo "   2. Test the deployment after going live"
echo "   3. Monitor logs in Coolify dashboard"

echo ""
print_info "🎉 Deployment script completed!" 