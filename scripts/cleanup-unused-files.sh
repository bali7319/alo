#!/bin/bash
# Sunucuda kullanılmayan dosya ve klasörleri temizle
# Kullanım: bash scripts/cleanup-unused-files.sh

set -e

echo "🧹 Kullanılmayan dosya ve klasörler temizleniyor...\n"

cd /var/www/alo17 || { echo "❌ Proje dizini bulunamadı!"; exit 1; }

# 1. Build cache temizle
echo "📦 .next klasörü temizleniyor..."
rm -rf .next
echo "✅ .next temizlendi\n"

# 2. Node modules cache temizle (isteğe bağlı - dikkatli!)
# echo "📦 node_modules/.cache temizleniyor..."
# rm -rf node_modules/.cache
# echo "✅ node_modules/.cache temizlendi\n"

# 3. Log dosyalarını temizle
echo "📋 Log dosyaları temizleniyor..."
find . -name "*.log" -type f -delete 2>/dev/null || true
echo "✅ Log dosyaları temizlendi\n"

# 4. Geçici dosyaları temizle
echo "🗑️  Geçici dosyalar temizleniyor..."
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.temp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
echo "✅ Geçici dosyalar temizlendi\n"

# 5. Eski backup dosyalarını kontrol et
echo "📦 Backup dosyaları kontrol ediliyor..."
BACKUP_COUNT=$(find . -name "*.bak" -o -name "*.backup" -o -name "*~" 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 0 ]; then
  echo "   ⚠️  $BACKUP_COUNT backup dosyası bulundu (silinmedi - manuel kontrol gerekli)"
  find . -name "*.bak" -o -name "*.backup" -o -name "*~" 2>/dev/null | head -10
else
  echo "✅ Backup dosyası bulunamadı\n"
fi

# 6. Kullanılmayan script dosyalarını kontrol et
echo "📋 Script dosyaları kontrol ediliyor..."
echo "   Mevcut script'ler:"
ls -la scripts/*.js scripts/*.ts 2>/dev/null | wc -l
echo ""

# 7. PM2 log dosyalarını temizle (isteğe bağlı)
echo "📋 PM2 log dosyaları kontrol ediliyor..."
if [ -d ~/.pm2/logs ]; then
  PM2_LOG_SIZE=$(du -sh ~/.pm2/logs 2>/dev/null | cut -f1)
  echo "   PM2 log boyutu: $PM2_LOG_SIZE"
  echo "   ⚠️  PM2 log'ları temizlemek için: pm2 flush"
else
  echo "✅ PM2 log dizini bulunamadı"
fi

echo "\n✅ Temizlik tamamlandı!"
echo "\n📊 Disk kullanımı:"
df -h /var/www/alo17 | tail -1

