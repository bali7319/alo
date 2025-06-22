import React from 'react';

export default function TermsOfUsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kullanım Koşulları</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Genel Hükümler</h2>
          <p>
            Alo17.tr web sitesini kullanarak, aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. 
            Bu koşulları kabul etmiyorsanız, lütfen web sitemizi kullanmayınız.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Hizmet Kullanımı</h2>
          <p>
            Web sitemizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Yasalara ve etik kurallara uygun davranmak</li>
            <li>Başkalarının haklarına saygı göstermek</li>
            <li>Yanlış veya yanıltıcı bilgi paylaşmamak</li>
            <li>Spam veya zararlı içerik paylaşmamak</li>
            <li>Başkalarının kişisel bilgilerini izinsiz paylaşmamak</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. İlan Verme Kuralları</h2>
          <p>
            İlan verirken aşağıdaki kurallara uymanız gerekmektedir:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Doğru ve güncel bilgiler paylaşmak</li>
            <li>Yasal olmayan ürün veya hizmetler için ilan vermemek</li>
            <li>Telif hakkı ihlali yapmamak</li>
            <li>Uygunsuz içerik paylaşmamak</li>
            <li>Fiyat ve ürün bilgilerini doğru belirtmek</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Sorumluluk Reddi</h2>
          <p>
            Alo17.tr, kullanıcılar tarafından paylaşılan içeriklerin doğruluğunu, güncelliğini ve 
            yasal uygunluğunu garanti etmez. Kullanıcılar, paylaştıkları içeriklerden kendileri 
            sorumludur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Fikri Mülkiyet Hakları</h2>
          <p>
            Web sitemizdeki tüm içerikler (metin, görsel, logo vb.) Alo17.tr'nin fikri mülkiyetidir. 
            Bu içeriklerin izinsiz kullanımı, kopyalanması veya dağıtılması yasaktır.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Değişiklikler</h2>
          <p>
            Bu kullanım koşullarını zaman zaman güncelleyebiliriz. Değişiklikler, web sitemizde 
            yayınlandığı tarihte yürürlüğe girer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. İletişim</h2>
          <p>
            Kullanım koşulları hakkında sorularınız veya endişeleriniz varsa, aşağıdaki iletişim 
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
