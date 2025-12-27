#!/bin/bash
# API endpoint'ini test et

echo "API endpoint'ini test ediyoruz..."
curl -s http://localhost:3000/api/listings?page=1&limit=100 | jq '.listings | length'

echo ""
echo "İlk 5 ilanın başlıkları:"
curl -s http://localhost:3000/api/listings?page=1&limit=100 | jq '.listings[0:5] | .[] | .title'

