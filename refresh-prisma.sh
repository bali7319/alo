#!/bin/bash
cd /var/www/alo17
rm -rf node_modules/.prisma
rm -rf .next
npx prisma generate
pm2 restart alo17

