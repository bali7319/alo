import React from 'react';

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Çerez Politikası</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Çerez Nedir?</h2>
          <p>
            Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza yerleştirilen 
            küçük metin dosyalarıdır. Bu dosyalar, web sitemizi daha etkili bir şekilde kullanmanızı 
            sağlamak ve size daha iyi bir kullanıcı deneyimi sunmak amacıyla kullanılmaktadır.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Çerez Türleri</h2>
          <p>Web sitemizde aşağıdaki çerez türleri kullanılmaktadır:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>
              <strong>Zorunlu Çerezler:</strong> Web sitemizin düzgün çalışması için gerekli olan çerezlerdir. 
              Bu çerezler olmadan web sitemizin bazı özellikleri çalışmayabilir.
            </li>
            <li>
              <strong>Performans Çerezleri:</strong> Ziyaretçilerin web sitemizi nasıl kullandığı hakkında 
              bilgi toplayan çerezlerdir. Bu çerezler, web sitemizin performansını artırmamıza yardımcı olur.
            </li>
            <li>
              <strong>İşlevsellik Çerezleri:</strong> Size daha kişiselleştirilmiş bir deneyim sunmamızı 
              sağlayan çerezlerdir. Örneğin, dil tercihinizi hatırlamak için kullanılır.
            </li>
            <li>
              <strong>Hedefleme/Reklam Çerezleri:</strong> Size ilgi alanlarınıza uygun reklamlar göstermek 
              için kullanılan çerezlerdir.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Çerezleri Kontrol Etme</h2>
          <p>
            Tarayıcınızın ayarlarını değiştirerek çerezleri kontrol edebilir veya engelleyebilirsiniz. 
            Ancak, bazı çerezleri engellemek web sitemizin bazı özelliklerinin düzgün çalışmamasına 
            neden olabilir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Çerez Politikası Değişiklikleri</h2>
          <p>
            Bu çerez politikasını zaman zaman güncelleyebiliriz. Politikada yapılan değişiklikler, 
            web sitemizde yayınlandığı tarihte yürürlüğe girer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. İletişim</h2>
          <p>
            Çerez politikamız hakkında sorularınız veya endişeleriniz varsa, aşağıdaki iletişim 
            kanallarını kullanabilirsiniz:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>E-posta: destek@alo17.tr</li>
            <li>Telefon: 0541 404 2 404</li>
            <li>Adres: Cevatpaşa Mahallesi, Bayrak Sokak No:4, Çanakkale</li>
          </ul>
        </section>
      </div>
    </div>
  )
} 
