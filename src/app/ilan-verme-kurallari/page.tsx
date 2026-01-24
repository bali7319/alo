import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İlan Verme Kuralları | Alo17',
  description:
    "Alo17.tr'de ilan verirken uyulması gereken kurallar: doğru kategori, doğru fiyat, yasaklı içerikler, güvenlik ve moderasyon.",
  alternates: {
    canonical: 'https://alo17.tr/ilan-verme-kurallari',
  },
};

export default function IlanVermeKurallariPage() {
  const lastUpdated = '19.01.2026';

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">İlan Verme Kuralları</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-700">
          Bu sayfa, <strong>Alo17.tr</strong> üzerinde ilan yayınlarken dikkat etmeniz gereken temel kuralları özetler. Amaç;
          Çanakkale odaklı, güvenli ve kaliteli bir ilan deneyimi sağlamaktır.
        </p>

        <div className="not-prose mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              Doğru bilgi
            </div>
            <p className="mt-2 text-sm text-gray-600">Başlık, açıklama, fiyat ve kategori gerçeği yansıtmalı.</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
              Güvenlik
            </div>
            <p className="mt-2 text-sm text-gray-600">Şüpheli link/kapora/ön ödeme taleplerine dikkat.</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-5 w-5 text-orange-600" aria-hidden="true" />
              Yasak içerik yok
            </div>
            <p className="mt-2 text-sm text-gray-600">Hukuka aykırı, telif ihlalli, yanıltıcı içerik yayınlanamaz.</p>
          </div>
        </div>

        <section className="mt-10">
          <h2>1) Doğru Kategori ve Doğru Başlık</h2>
          <ul>
            <li>İlanınızı <strong>en uygun kategori/alt kategoriye</strong> ekleyin.</li>
            <li>Başlık, ürün/hizmetin özünü anlatmalı; “anahtar kelime doldurma” (spam) yapılmamalıdır.</li>
            <li>Yanıltıcı “bedava/indirim/garantili” gibi ifadeler gerçeği yansıtmıyorsa kullanmayın.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2>2) Açıklama ve Fiyat Kuralları</h2>
          <ul>
            <li>Açıklama; ürün/hizmetin durumunu, varsa kusurlarını ve koşulları net belirtmelidir.</li>
            <li>Fiyat, gerçeğe uygun olmalıdır. “1 TL yaz, telefonda söyle” gibi pratikler ilan kalitesini düşürür.</li>
            <li>Komisyon, ek ücret, teslimat/kargo şartları gibi detaylar varsa açıkça yazın.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2>3) Görsel Kuralları</h2>
          <ul>
            <li>Başkasına ait fotoğrafları izinsiz kullanmayın (telif/kişilik hakkı).</li>
            <li>Ürünü/hizmeti yansıtmayan stok görseller mümkünse kullanılmamalıdır.</li>
            <li>Görsellerde yanıltıcı bilgi, sahte logo/sertifika, aldatıcı montaj kullanmayın.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2>4) Yasaklı İçerikler (Örnekler)</h2>
          <p>Aşağıdaki türde ilanlar yayınlanamaz ve kaldırılabilir:</p>
          <ul>
            <li>Hukuka aykırı ürün/hizmet satışı, dolandırıcılık, sahtecilik</li>
            <li>Çocuk istismarı, nefret söylemi, şiddet, taciz, tehdit, müstehcen içerik</li>
            <li>Telif/marka ihlali içeren ürünler veya içerikler</li>
            <li>Kişisel veri ifşası (TC kimlik no, banka bilgisi, açık adres vb.)</li>
            <li>Phishing/zararlı linkler, spam ve otomasyonla toplu ilan girişi</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2>5) Tekrarlayan İlan / Spam</h2>
          <ul>
            <li>Aynı ürün/hizmet için tekrar eden ilanlar birleştirilebilir veya kaldırılabilir.</li>
            <li>Farklı kategorilere aynı ilanı kopyalamak (çapraz spam) kısıtlamaya yol açabilir.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2>6) Moderasyon</h2>
          <p>
            Alo17.tr, güvenlik ve kalite için ilanları inceleyebilir; düzenleme isteyebilir veya ilanı yayından kaldırabilir.
          </p>
          <ul>
            <li>Uygunsuz ilanlar reddedilebilir veya kaldırılabilir.</li>
            <li>Tekrarlayan ihlallerde hesap kısıtlanabilir.</li>
            <li>Şüpheli durumlarda ek doğrulama istenebilir.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2>7) Güvenlik Uyarısı</h2>
          <ul>
            <li>Ürünü görmeden/teslim almadan <strong>kapora/ön ödeme</strong> göndermeyin.</li>
            <li>Şüpheli ödeme linklerine tıklamayın; kişisel/banka bilgilerinizi paylaşmayın.</li>
            <li>Şüpheli ilanları bildirerek topluluğa destek olun.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2>8) İlgili Sayfalar</h2>
          <ul>
            <li>
              <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>
            </li>
            <li>
              <Link href="/kvkk">KVKK</Link> / <Link href="/gizlilik">Gizlilik Politikası</Link> /{' '}
              <Link href="/cerez-politikasi">Çerez Politikası</Link>
            </li>
            <li>
              <Link href="/iletisim">İletişim</Link>
            </li>
          </ul>
        </section>

        <div className="mt-10 rounded-xl bg-gray-50 p-6">
          <p className="text-sm text-gray-600 mb-0">Son güncelleme: {lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}

