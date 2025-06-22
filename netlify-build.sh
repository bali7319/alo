#!/bin/bash

# Netlify Build Script for Alo17

echo "🚀 Starting Netlify build process..."

# Node.js versiyonunu kontrol et
echo "📋 Node.js version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Bağımlılıkları yükle
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Prisma client'ı generate et
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build işlemini başlat
echo "🔨 Building the application..."
npm run build

# Build başarılı mı kontrol et
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output directory: out/"
    ls -la out/
else
    echo "❌ Build failed!"
    exit 1
fi 