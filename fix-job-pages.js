const fs = require('fs');
const path = require('path');

// İş alt kategorileri ve doğru adları
const jobSubcategories = {
  'garson-komi': 'Garson / Komi',
  'sofor-kurye': 'Şoför / Kurye',
  'temizlik-personeli': 'Temizlik Personeli',
  'satis-danismani': 'Satış Danışmanı',
  'guvenlik-gorevlisi': 'Güvenlik Görevlisi',
  'sekreter-ofis-elemani': 'Sekreter / Ofis Elemanı',
  'cagri-merkezi-elemani': 'Çağrı Merkezi Elemanı',
  'insaat-ustasi-iscisi': 'İnşaat Ustası / İşçisi',
  'ogretmen-egitmen': 'Öğretmen / Eğitmen',
  'saglik-personeli': 'Sağlık Personeli',
  'yazilim-bilisim-uzmani': 'Yazılım / Bilişim Uzmanı',
  'muhasebeci-finans-elemani': 'Muhasebeci / Finans Elemanı',
  'tekniker-muhendis': 'Tekniker / Mühendis',
  'pazarlama-reklam-uzmani': 'Pazarlama / Reklam Uzmanı'
};

// Her alt kategori için sayfa dosyasını düzelt
Object.entries(jobSubcategories).forEach(([slug, name]) => {
  const filePath = path.join(__dirname, 'src', 'app', 'kategori', 'is', slug, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Filtreleme mantığını düzelt
    const oldFilter = `listing.category.toLowerCase() === 'iş' && \n        listing.subcategory.toLowerCase() === '${name.toLowerCase()}'`;
    const newFilter = `listing.category === 'İş' && \n        listing.subcategory === '${name}'`;
    
    content = content.replace(oldFilter, newFilter);
    
    // FeaturedAds ve LatestAds parametrelerini düzelt
    content = content.replace(
      /category=\{category\.slug\}/g,
      'category="İş"'
    );
    content = content.replace(
      /subcategory=\{subcategory\.slug\}/g,
      `subcategory="${name}"`
    );
    
    // Debug bilgileri ekle
    if (!content.includes('console.log')) {
      const debugCode = `
    console.log('Raw listings count:', rawListings.length)
    
    const filtered = rawListings.filter(listing => {
      const categoryMatch = listing.category === 'İş'
      const subcategoryMatch = listing.subcategory === '${name}'
      const matches = categoryMatch && subcategoryMatch
      console.log(\`Listing \${listing.id}: category="\${listing.category}" subcategory="\${listing.subcategory}" matches=\${matches}\`)
      return matches
    })
    
    console.log('Filtered listings count:', filtered.length)
    
    const mapped = filtered.map(listing => ({`;
      
      content = content.replace(
        /const mapped = rawListings/,
        debugCode
      );
      
      content = content.replace(
        /console\.log\('Mapped listings count:', mapped\.length\)/,
        'console.log(\'Mapped listings count:\', mapped.length)'
      );
    }
    
    // Debug kutusu ekle
    if (!content.includes('Debug Info')) {
      const debugBox = `
          {/* Debug Info */}
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>Debug: {mappedListings.length} ilan bulundu</p>
          </div>`;
      
      content = content.replace(
        /<div className="mb-8">/,
        `${debugBox}\n\n          <div className="mb-8">`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${slug} sayfası düzeltildi`);
  } else {
    console.log(`❌ ${slug} sayfası bulunamadı`);
  }
});

console.log('Tüm İş alt kategorileri düzeltildi!'); 