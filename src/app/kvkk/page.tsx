import React from 'react';

export default function KVKKPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kişisel Verilerin Korunması</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Veri Sorumlusu</h2>
          <p>
            Alo17.tr olarak, kişisel verilerinizin güvenliği konusunda azami hassasiyet göstermekteyiz. 
            Bu kapsamda, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz, 
            veri sorumlusu olarak, tarafımızca aşağıda açıklanan kapsamda işlenebilecektir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Kişisel Verilerin İşlenme Amacı</h2>
          <p>
            Kişisel verileriniz, hizmetlerimizin sunulması, geliştirilmesi ve iyileştirilmesi amacıyla, 
            yasal yükümlülüklerimizin yerine getirilmesi, güvenliğin sağlanması ve hizmet kalitesinin 
            artırılması gibi amaçlarla işlenmektedir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz, yasal yükümlülüklerimiz kapsamında yetkili kamu kurum ve kuruluşlarına, 
            hizmetlerimizin sunulması amacıyla iş ortaklarımıza ve tedarikçilerimize aktarılabilecektir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Kişisel Veri Sahibinin Hakları</h2>
          <p>
            KVKK'nın 11. maddesi uyarınca, kişisel veri sahibi olarak aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. İletişim</h2>
          <p>
            Kişisel verilerinizle ilgili her türlü soru, görüş ve talepleriniz için aşağıdaki iletişim 
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
