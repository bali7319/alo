import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-alo-dark mb-8">Gizlilik Politikası</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-6">
          ALO17.TR olarak kişisel verilerinizin güvenliği bizim için önemlidir. Bu gizlilik politikası, platformumuzu kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-alo-dark mb-4">1. Toplanan Bilgiler</h2>
          <p className="text-gray-600 mb-4">
            Platformumuzda aşağıdaki bilgileri topluyoruz:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Ad, soyad ve iletişim bilgileri</li>
            <li>E-posta adresi ve telefon numarası</li>
            <li>Hesap bilgileri ve şifre</li>
            <li>İlan bilgileri ve fotoğraflar</li>
            <li>IP adresi ve tarayıcı bilgileri</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-alo-dark mb-4">2. Bilgilerin Kullanımı</h2>
          <p className="text-gray-600 mb-4">
            Topladığımız bilgileri aşağıdaki amaçlar için kullanıyoruz:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Hesabınızın oluşturulması ve yönetilmesi</li>
            <li>İlanlarınızın yayınlanması ve yönetilmesi</li>
            <li>Platform hizmetlerinin sunulması ve iyileştirilmesi</li>
            <li>Güvenlik ve dolandırıcılık önleme</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Müşteri hizmetleri ve destek</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-alo-dark mb-4">3. Bilgi Paylaşımı</h2>
          <p className="text-gray-600 mb-4">
            Kişisel verileriniz, aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Yasal zorunluluk durumunda</li>
            <li>Platform hizmetlerinin sağlanması için gerekli olan durumlarda</li>
            <li>Kullanıcının açık rızası olduğunda</li>
            <li>Güvenlik ve dolandırıcılık önleme amaçlı</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-alo-dark mb-4">4. Veri Güvenliği</h2>
          <p className="text-gray-600 mb-4">
            Kişisel verilerinizin güvenliği için aldığımız önlemler:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>SSL şifreleme teknolojisi</li>
            <li>Güvenli veri depolama sistemleri</li>
            <li>Düzenli güvenlik güncellemeleri</li>
            <li>Erişim kontrolü ve yetkilendirme</li>
            <li>Düzenli güvenlik denetimleri</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-alo-dark mb-4">5. Çerezler</h2>
          <p className="text-gray-600 mb-4">
            Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Çerezler:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Oturum yönetimi</li>
            <li>Tercihlerinizin hatırlanması</li>
            <li>Platform performansının analizi</li>
            <li>Güvenlik ve doğrulama</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-alo-dark mb-4">6. Kullanıcı Hakları</h2>
          <p className="text-gray-600 mb-4">
            KVKK kapsamında aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Kişisel verilerinize erişim</li>
            <li>Verilerinizin düzeltilmesi</li>
            <li>Verilerinizin silinmesi</li>
            <li>Veri işlemeye itiraz etme</li>
            <li>Veri taşınabilirliği</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-alo-dark mb-4">7. Değişiklikler</h2>
          <p className="text-gray-600 mb-4">
            Bu gizlilik politikası, gerekli görüldüğünde güncellenebilir. Önemli değişiklikler olması durumunda kullanıcılarımız bilgilendirilecektir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-alo-dark mb-4">8. İletişim</h2>
          <p className="text-gray-600 mb-4">
            Gizlilik politikamız hakkında sorularınız için <a href="/iletisim" className="text-alo-orange hover:underline">iletişim sayfamızı</a> kullanabilir veya aşağıdaki adreslere ulaşabilirsiniz:
          </p>
          <div className="bg-alo-light rounded-lg p-6 mt-4">
            <p className="text-gray-600">
              E-posta: destek@alo17.tr<br />
              Adres: Cevatpaşa Mahallesi, Bayrak Sokak No:4<br />
              Çanakkale
            </p>
          </div>
        </section>

        <div className="bg-alo-light rounded-xl p-6 mt-12">
          <p className="text-gray-600 text-sm">
            Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>
    </div>
  );
} 
