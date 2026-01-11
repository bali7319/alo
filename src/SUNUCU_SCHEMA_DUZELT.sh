#!/bin/bash
# Sunucuda Prisma schema'yı PostgreSQL'e çevir

cd /var/www/alo17

# Schema'yı PostgreSQL'e çevir
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

# Prisma generate
npx prisma generate

echo "Schema PostgreSQL'e çevrildi ve Prisma Client generate edildi."
