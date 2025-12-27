// API'yi test et - sunucuda çalıştır
// Kullanım: node scripts/test-api-listings.js

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/listings?page=1&limit=10',
  method: 'GET',
  headers: {
    'Cache-Control': 'no-cache',
  },
};

console.log('🔍 API test ediliyor: GET /api/listings\n');

const req = http.request(options, (res) => {
  let data = '';

  console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📋 Headers:`, res.headers);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`\n✅ Toplam ilan: ${json.listings?.length || 0}`);
      console.log(`📊 Total: ${json.pagination?.total || 0}`);
      
      if (json.listings && json.listings.length > 0) {
        console.log(`\n📋 İlk 5 ilan:`);
        json.listings.slice(0, 5).forEach((l, i) => {
          console.log(`   ${i + 1}. ${l.title} (${l.category}) - User: ${l.user?.name || 'N/A'}`);
        });
      } else {
        console.log('\n✅ İlan bulunamadı (bu normal - admin filtresi çalışıyor)');
      }
    } catch (e) {
      console.error('❌ JSON parse hatası:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request hatası: ${e.message}`);
});

req.end();

