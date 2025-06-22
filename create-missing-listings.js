const fs = require('fs');
const path = require('path');

// Kategoriler dosyasını require et
const categories = require('./src/lib/categories').categories;

// listings.ts dosyasını string olarak oku
const listingsPath = path.join(__dirname, 'src/lib/listings.ts');
let fileContent = fs.readFileSync(listingsPath, 'utf8');

// Diziyi regex ile bul
const arrayMatch = fileContent.match(/const listings\s*=\s*\[(.*)\];/s);
if (!arrayMatch) {
  console.error('listings dizisi bulunamadı!');
  process.exit(1);
}
let listingsArrStr = arrayMatch[1];
// Her bir ilanı ayır (küme parantezleriyle)
const listingRegex = /{[^}]*}/gs;
let listings = [];
let match;
while ((match = listingRegex.exec(listingsArrStr)) !== null) {
  try {
    // Küçük bir hile: tek tırnakları çift tırnağa çevir, property isimlerine tırnak ekle
    let jsonStr = match[0]
      .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
      .replace(/'/g, '"');
    listings.push(JSON.parse(jsonStr));
  } catch (e) {
    // Hatalı parse edilenleri atla
  }
}

let maxId = listings.length > 0 ? Math.max(...listings.map(l => l.id)) : 1000;
const newListings = [];

function traverseCategories(cat, parentName = '', parentSlug = '') {
  if (cat.subcategories && Array.isArray(cat.subcategories)) {
    cat.subcategories.forEach(sub => {
      traverseCategories(sub, cat.name, cat.slug);
    });
  } else if (parentName && parentSlug) {
    // Alt kategori
    const exists = listings.some(l => l.category === parentName && l.subcategory === cat.slug);
    if (!exists) {
      maxId++;
      newListings.push({
        id: maxId,
        title: `${cat.name} için örnek ilan`,
        price: "1000 TL",
        location: "İstanbul",
        description: `${cat.name} kategorisinde örnek ilan.`,
        category: parentName,
        subcategory: cat.slug,
        isPremium: false,
        premiumUntil: null,
        features: [],
        imageUrl: "/images/listings/placeholder.jpg",
        seller: {
          id: "999",
          name: "Sistem",
          email: "sistem@ornek.com",
          phone: "0000 000 0000"
        },
        createdAt: new Date(),
        views: 0,
        condition: "Yeni",
        brand: "-",
        model: "-",
        year: 2024
      });
    }
  }
}

categories.forEach(cat => traverseCategories(cat));

if (newListings.length > 0) {
  const insertIndex = fileContent.lastIndexOf(']');
  const before = fileContent.slice(0, insertIndex);
  const after = fileContent.slice(insertIndex);
  const newContent = before + ',\n' + newListings.map(l => JSON.stringify(l, null, 2)).join(',\n') + after;
  fs.writeFileSync(listingsPath, newContent, 'utf8');
  console.log(`${newListings.length} yeni ilan eklendi!`);
} else {
  console.log('Tüm alt kategorilerde zaten ilan var.');
} 