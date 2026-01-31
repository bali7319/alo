# 410 Gone Deploy - Tek Komut
# PowerShell'de çalıştırın

ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && git pull origin main && npm install --legacy-peer-deps && (grep -q 'provider = \"sqlite\"' prisma/schema.prisma && sed -i 's/provider = \"sqlite\"/provider = \"postgresql\"/g' prisma/schema.prisma || true) && npx prisma generate && npm run build && pm2 restart alo17 && echo '✅ Sunucu guncellemesi tamamlandi - 410 Gone aktif'"
