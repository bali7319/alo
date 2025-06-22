import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>
      <div className="prose max-w-none">
        <p>Bu gizlilik politikası, Alo17 platformunun kullanıcı verilerini nasıl topladığını, kullandığını ve koruduğunu açıklar.</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Toplanan Bilgiler</h2>
        <p>Platformumuz aşağıdaki bilgileri toplar:</p>
        <ul className="list-disc pl-6">
          <li>Ad, soyad ve iletişim bilgileri</li>
          <li>Kullanıcı hesap bilgileri</li>
          <li>İlan bilgileri ve içerikleri</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Bilgilerin Kullanımı</h2>
        <p>Toplanan bilgiler şu amaçlarla kullanılır:</p>
        <ul className="list-disc pl-6">
          <li>Hizmetlerimizi sağlamak ve geliştirmek</li>
          <li>Kullanıcı deneyimini iyileştirmek</li>
          <li>Güvenliği sağlamak</li>
          <li>Yasal yükümlülükleri yerine getirmek</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Veri Güvenliği</h2>
        <p>Kullanıcı verilerinizin güvenliği bizim için önemlidir. Verilerinizi korumak için uygun teknik ve organizasyonel önlemler alıyoruz.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">İletişim</h2>
        <p>Gizlilik politikamız hakkında sorularınız için bize ulaşabilirsiniz.</p>
      </div>
    </div>
  );
}
