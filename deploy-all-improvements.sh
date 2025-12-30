#!/bin/bash
# Tüm iyileştirmeleri deploy et
# Kullanım: ./deploy-all-improvements.sh

echo "🚀 Tüm iyileştirmeler deploy ediliyor..."

# Yeni dosyaları yükle
scp -r "src/lib/category-mappings.ts" "src/lib/admin.ts" "src/lib/rate-limit.ts" "src/lib/cache.ts" root@alo17.tr:/var/www/alo17/src/lib/
scp -r "src/services/listing-service.ts" root@alo17.tr:/var/www/alo17/src/services/
scp -r "src/types/api.ts" root@alo17.tr:/var/www/alo17/src/types/
scp -r "src/lib/validations/category.ts" root@alo17.tr:/var/www/alo17/src/lib/validations/
scp "src/app/api/listings/category/[slug]/route.ts" root@alo17.tr:/var/www/alo17/src/app/api/listings/category/[slug]/

# Zod paketini yükle, build yap ve restart
ssh root@alo17.tr "cd /var/www/alo17 && npm install zod && rm -rf .next && npm run build && pm2 restart alo17"

echo "✅ Deploy tamamlandı!"

