#!/bin/bash
cd /var/www/alo17
sed -i 's/provider = "sqlite"/provider = "mysql"/g' prisma/schema.prisma
npx prisma generate
npm run build
pm2 restart alo17
