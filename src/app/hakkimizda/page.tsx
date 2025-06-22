import React from 'react';

export default function HakkimizdaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Biz Kimiz?</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          Alo17, Çanakkale'nin en büyük ve güvenilir ilan sitesidir. 2024 yılında kurulan platformumuz, 
          Çanakkale halkının ihtiyaçlarını karşılamak ve yerel ekonomiyi desteklemek amacıyla hizmet vermektedir.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Misyonumuz</h2>
        <p className="text-lg mb-6">
          Çanakkale'de yaşayan herkesin güvenle alım satım yapabileceği, 
          ihtiyaçlarını kolayca karşılayabileceği bir platform sunmak.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Vizyonumuz</h2>
        <p className="text-lg mb-6">
          Çanakkale'nin dijital alışveriş ve ilan platformunda lider konuma gelmek, 
          kullanıcılarımıza en iyi hizmeti sunmak.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Değerlerimiz</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="text-lg mb-2">Güvenilirlik</li>
          <li className="text-lg mb-2">Şeffaflık</li>
          <li className="text-lg mb-2">Kullanıcı Odaklılık</li>
          <li className="text-lg mb-2">Yerel Ekonomiye Destek</li>
          <li className="text-lg mb-2">Sürekli Gelişim</li>
        </ul>
      </div>
    </div>
  )
} 
