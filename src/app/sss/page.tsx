import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, FileText, CreditCard, Shield, Users, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular (SSS) - Alo17',
  description: 'Alo17 ilan ve reklam sitesi hakkında sıkça sorulan sorular ve cevapları. İlan verme, reklam verme, ödeme ve site kullanımı hakkında bilgiler.',
  alternates: { canonical: 'https://alo17.tr/sss' },
};

export default function SSSPage() {
  const faqs = [
    {
      icon: FileText,
      question: "İlan nasıl verilir?",
      answer: "Ana sayfadaki 'İlan Ver' butonuna tıklayarak veya üst menüden 'İlan Ver' sayfasına giderek ilanınızı oluşturabilirsiniz. İlan formunu doldurduktan sonra ödeme işlemini tamamlayarak ilanınız yayına alınır."
    },
    {
      icon: CreditCard,
      question: "Ödeme seçenekleri nelerdir?",
      answer: "Kredi kartı, banka kartı ve PayTR ile güvenli ödeme yapabilirsiniz. Tüm ödemeler SSL sertifikası ile korunmaktadır."
    },
    {
      icon: TrendingUp,
      question: "Reklam ve öne çıkarma seçenekleri nelerdir?",
      answer: "İlanınızı öne çıkarmak için 'Öne Çıkan İlan', 'Acil İlan', 'Vurgulu İlan' ve 'En Üstte' gibi seçeneklerden yararlanabilirsiniz. Bu seçenekler ilanınızın daha fazla görünürlük kazanmasını sağlar."
    },
    {
      icon: Shield,
      question: "İlanım ne kadar süre yayında kalır?",
      answer: "İlanlarınız varsayılan olarak 30 gün süreyle yayında kalır. Süre dolmadan önce ilanınızı yenileyebilir veya süresini uzatabilirsiniz."
    },
    {
      icon: Users,
      question: "İlanımı nasıl düzenleyebilirim?",
      answer: "Profil sayfanızdaki 'İlanlarım' bölümünden ilanlarınızı görüntüleyebilir, düzenleyebilir veya silebilirsiniz. İlan düzenleme işlemi için ek bir ücret alınmaz."
    },
    {
      icon: HelpCircle,
      question: "İlanım neden onaylanmadı?",
      answer: "İlanlarınız içerik kurallarına uygun olmalıdır. Yasalara aykırı, yanıltıcı veya spam içerikli ilanlar onaylanmaz. İlanınızın onaylanmama nedeni e-posta adresinize bildirilir."
    },
    {
      icon: FileText,
      question: "Kaç ilan verebilirim?",
      answer: "Ücretsiz üyelik ile sınırlı sayıda ilan verebilirsiniz. Premium üyelikler ile daha fazla ilan hakkı ve ek özelliklerden yararlanabilirsiniz."
    },
    {
      icon: CreditCard,
      question: "Ödeme işlemi güvenli mi?",
      answer: "Evet, tüm ödeme işlemleri SSL sertifikası ile korunmaktadır. PayTR ödeme altyapısı kullanılarak güvenli ödeme sağlanmaktadır. Kredi kartı bilgileriniz saklanmaz."
    },
    {
      icon: TrendingUp,
      question: "İlanımı nasıl öne çıkarabilirim?",
      answer: "İlan oluştururken veya düzenlerken 'Öne Çıkan İlan', 'Acil İlan', 'Vurgulu İlan' gibi seçenekleri işaretleyerek ilanınızı öne çıkarabilirsiniz. Bu seçenekler ücretlidir."
    },
    {
      icon: Shield,
      question: "İlanımı nasıl silebilirim?",
      answer: "Profil sayfanızdaki 'İlanlarım' bölümünden ilanınızı seçerek 'Sil' butonuna tıklayabilirsiniz. Silinen ilanlar geri alınamaz."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-gray-600">
              İlan verme, reklam verme ve site kullanımı hakkında merak ettikleriniz
            </p>
          </div>

          {/* SSS Listesi */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const Icon = faq.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {faq.question}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Yardım Bölümü */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hala sorunuz mu var?
                </h3>
                <p className="text-gray-700 mb-4">
                  Sorularınız için yardım merkezimizi ziyaret edebilir veya bizimle iletişime geçebilirsiniz.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/yardim"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Yardım Merkezi
                  </Link>
                  <Link
                    href="/iletisim"
                    className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    İletişime Geç
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
