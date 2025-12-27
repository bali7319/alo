#!/bin/bash
# API hatasını kontrol et

echo "PM2 loglarını kontrol ediyoruz..."
pm2 logs alo17 --lines 50 --nostream

echo ""
echo "API endpoint'ini test ediyoruz..."
curl -v http://localhost:3000/api/listings?page=1&limit=100 2>&1 | head -30

