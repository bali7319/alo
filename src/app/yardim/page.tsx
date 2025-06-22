'use client';

import React, { useState } from 'react';

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('general');

  const faqCategories = {
    general: [
      {
        question: 'ALO17.TR nedir?',
        answer: 'ALO17.TR, Türkiye\'nin önde gelen ilan platformlarından biridir. Kullanıcıların alım-satım işlemlerini güvenli bir şekilde gerçekleştirebilecekleri bir platform sunar.'
      },
      {
        question: 'Üyelik ücretli mi?',
        answer: 'Hayır, ALO17.TR\'de üyelik tamamen ücretsizdir. Temel özellikleri kullanmak için herhangi bir ücret ödemeniz gerekmez.'
      },
      {
        question: 'Nasıl üye olabilirim?',
        answer: 'Sağ üst köşedeki "Üye Ol" butonuna tıklayarak kayıt formunu doldurabilirsiniz. E-posta adresiniz ve şifrenizle hızlıca üye olabilirsiniz.'
      }
    ],
    listing: [
      {
        question: 'İlan nasıl verilir?',
        answer: 'Üye girişi yaptıktan sonra "İlan Ver" butonuna tıklayarak ilan verme formunu doldurabilirsiniz. İlanınız için gerekli bilgileri ve fotoğrafları ekleyerek ilanınızı yayınlayabilirsiniz.'
      },
      {
        question: 'İlanımı nasıl düzenleyebilirim?',
        answer: 'Profil sayfanızdan "İlanlarım" bölümüne giderek ilanınızı düzenleyebilir, güncelleyebilir veya silebilirsiniz.'
      },
      {
        question: 'İlanım ne kadar süre yayında kalır?',
        answer: 'İlanlarınız 30 gün süreyle yayında kalır. Bu süre sonunda otomatik olarak arşivlenir. İsterseniz ilanınızı yenileyerek süreyi uzatabilirsiniz.'
      }
    ],
    account: [
      {
        question: 'Şifremi unuttum, ne yapmalıyım?',
        answer: 'Giriş sayfasındaki "Şifremi Unuttum" linkine tıklayarak e-posta adresinize şifre sıfırlama bağlantısı gönderebilirsiniz.'
      },
      {
        question: 'Hesabımı nasıl silebilirim?',
        answer: 'Profil ayarlarınızdan hesap silme işlemini gerçekleştirebilirsiniz. Hesap silme işlemi geri alınamaz, bu yüzden dikkatli olun.'
      },
      {
        question: 'Profil bilgilerimi nasıl güncelleyebilirim?',
        answer: 'Profil sayfanızdan "Düzenle" butonuna tıklayarak kişisel bilgilerinizi güncelleyebilirsiniz.'
      }
    ],
    safety: [
      {
        question: 'Güvenli alışveriş için önerileriniz nelerdir?',
        answer: 'Alıcı ve satıcıların kimlik doğrulamasını yapın, ödemeleri güvenli yöntemlerle gerçekleştirin ve mümkünse yüz yüze görüşerek işlem yapın.'
      },
      {
        question: 'Şüpheli bir ilan gördüm, ne yapmalıyım?',
        answer: 'İlanın altındaki "Şikayet Et" butonunu kullanarak veya iletişim sayfamızdan bize bildirebilirsiniz.'
      },
      {
        question: 'Ödeme güvenliği nasıl sağlanıyor?',
        answer: 'Platformumuz güvenli ödeme sistemleri kullanmaktadır. Kullanıcılar arasındaki ödemeler için güvenli ödeme yöntemlerini tercih etmenizi öneririz.'
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-alo-dark mb-8">Yardım Merkezi</h1>

      {/* Kategori Seçimi */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setActiveCategory('general')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeCategory === 'general'
              ? 'bg-alo-orange text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Genel Sorular
        </button>
        <button
          onClick={() => setActiveCategory('listing')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeCategory === 'listing'
              ? 'bg-alo-orange text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          İlan Verme
        </button>
        <button
          onClick={() => setActiveCategory('account')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeCategory === 'account'
              ? 'bg-alo-orange text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Hesap İşlemleri
        </button>
        <button
          onClick={() => setActiveCategory('safety')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeCategory === 'safety'
              ? 'bg-alo-orange text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Güvenlik
        </button>
      </div>

      {/* SSS Listesi */}
      <div className="space-y-6">
        {faqCategories[activeCategory as keyof typeof faqCategories].map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-alo-dark mb-3">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>

      {/* İletişim Bölümü */}
      <div className="mt-12 bg-alo-light rounded-xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-alo-dark mb-4">Hala Yardıma İhtiyacınız Var mı?</h2>
        <p className="text-gray-600 mb-6">
          Sorularınız için 7/24 destek ekibimiz size yardımcı olmaktan mutluluk duyar.
        </p>
        <a
          href="/iletisim"
          className="inline-block bg-alo-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-alo-light-orange transition-colors"
        >
          Bize Ulaşın
        </a>
      </div>
    </div>
  );
} 
