#!/bin/bash
# Database Index'lerini Ekler
# Kullanım: ./scripts/add-database-indexes.sh

echo "📊 Database index'leri ekleniyor..."

# PostgreSQL'e bağlan ve index'leri ekle
sudo -u postgres psql -d alo17_db -f prisma/migrations/add_performance_indexes.sql

if [ $? -eq 0 ]; then
    echo "✅ Index'ler başarıyla eklendi!"
    echo "📈 Query performansı artacak."
else
    echo "❌ Index ekleme hatası!"
    exit 1
fi

