import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Store, Users, Zap, Search, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hakkımızda - Alo17',
  description:
    "Alo17, Çanakkale'nin esnafını ve yerel hizmet verenlerini tek çatıda buluşturan ilan platformu. Yerel ekonomiyi destekler, hızlı ve güvenli bir deneyim sunmayı hedefler.",
  keywords: ['alo17 hakkında', 'çanakkale ilan sitesi', 'alo17 misyon', 'alo17 vizyon', 'güvenilir ilan sitesi'],
  openGraph: {
    title: 'Hakkımızda - Alo17',
    description: 'Alo17, Çanakkale\'nin en büyük ve güvenilir ilan sitesi.',
    url: 'https://alo17.tr/hakkimizda',
    type: 'website',
  },
  alternates: {
    canonical: 'https://alo17.tr/hakkimizda',
  },
};

export default function HakkimizdaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <h1 className="text-4xl font-bold mb-4">Biz Kimiz?</h1>
          <div className="prose max-w-none">
            <p className="text-lg mb-6 leading-relaxed">
              Çanakkale'nin esnafını, ustasını ve tüm yerel hizmet verenlerini tek bir çatıda buluşturuyoruz!{' '}
              <strong>alo17.tr</strong>, şehrimizdeki işletmelerin ve profesyonel hizmet sağlayıcıların dijital dünyadaki en
              güçlü temsilcisidir.
            </p>
            <p className="text-lg mb-6 leading-relaxed">
              Platformumuz tamamen Çanakkale'nin yerel dinamiklerine göre tasarlandı; sadece gerçek hizmete, doğru esnafa ve
              güncel yerel tanıtımlara odaklanır. Aradığınız tesisatçıdan en sevilen restoranlara, özel ders verenlerden butik
              mağazalara kadar şehre dair her türlü ticari ilan ve tanıtım burada.
            </p>
            <p className="text-lg mb-2 leading-relaxed">
              Biz, Çanakkale esnafının sesi; vatandaşın ise en hızlı çözüm ortağıyız.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ilan-ver"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-white font-semibold hover:bg-orange-600 transition-colors"
            >
              <Store className="h-5 w-5" aria-hidden="true" />
              İlan Ver
            </Link>
            <Link
              href="/kategoriler"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              Kategorileri Keşfet
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              İletişim
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Alo17 Kimin İçin?</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Store className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold">Esnaf &amp; İşletmeler</div>
                  <div className="text-sm text-gray-600">Hizmetlerini görünür kıl, yeni müşterilere ulaş.</div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold">Çanakkale Halkı</div>
                  <div className="text-sm text-gray-600">İhtiyacını hızlıca bul, yerel hizmete güvenle ulaş.</div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Zap className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold">Hız Arayanlar</div>
                  <div className="text-sm text-gray-600">Karmaşa yok, hedefe odaklı sonuç.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Misyonumuz</h2>
          <p className="text-gray-700">
            Çanakkale’de yerel hizmeti ve ticareti dijitalde güçlendirmek; kullanıcıları doğru esnafla hızlı şekilde
            buluşturmak.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Vizyonumuz</h2>
          <p className="text-gray-700">
            Çanakkale’nin “yeni nesil meydanı” olmak: güvenilir, hızlı ve şehrin dinamikleriyle yaşayan bir platform.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Değerlerimiz</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Yerellik ve gerçek ihtiyaçlara odak</li>
            <li>Şeffaflık ve kullanıcı güvenliği</li>
            <li>Hız, sade arayüz ve mobil performans</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border bg-slate-50 p-8">
        <h2 className="text-2xl font-bold mb-6">Nasıl Çalışır?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white border p-6">
            <div className="text-sm font-semibold text-orange-600">1) İlanını oluştur</div>
            <p className="mt-2 text-gray-700">Hizmetini veya ürününü doğru kategoriyle ekle, net açıklama ve görsel kullan.</p>
          </div>
          <div className="rounded-xl bg-white border p-6">
            <div className="text-sm font-semibold text-orange-600">2) Yerel kitleye ulaş</div>
            <p className="mt-2 text-gray-700">Çanakkale odaklı yapımız sayesinde doğru kullanıcı seni daha hızlı bulur.</p>
          </div>
          <div className="rounded-xl bg-white border p-6">
            <div className="text-sm font-semibold text-orange-600">3) Güvenle iletişime geç</div>
            <p className="mt-2 text-gray-700">Mesajlaşma ve iletişim üzerinden anlaş, şüpheli durumlarda “ilanı bildir”.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-orange-200 bg-orange-50 p-8">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-orange-600 border border-orange-200">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Güvenlik Uyarısı</h2>
            <p className="text-gray-800">
              Kendi güvenliğiniz için, ürünü teslim almadan <strong>ön ödeme/avans/kapora</strong> göndermemeye özen gösterin.
              İlan bilgilerinin gerçeği yansıtmadığını düşünüyorsanız veya şüpheli bir durum varsa lütfen ilanı bildiriniz.
            </p>
            <p className="mt-3 text-gray-700">
              Platform’da yer alan kullanıcı içeriklerinin doğruluğu ve hukuka uygunluğu, içeriği oluşturan kullanıcıya aittir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
