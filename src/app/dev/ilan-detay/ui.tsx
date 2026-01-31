'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { MapPin, MessageSquare, Phone, Flag } from 'lucide-react';

const FALLBACK_IMAGE_SRC = '/images/placeholder.svg';

export default function DemoIlanDetayClient() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState<'info' | 'desc' | 'services'>('info');

  const listing = useMemo(
    () => ({
      title: 'İLK SAHİBİNDEN DIŞ ORJİNAL R-LINE',
      location: 'Mehmet Akif Ersoy Mh. Ceylanpınar, Şanlıurfa (çok uzun adres testi için uzatıldı)',
      priceText: '1.829.000 TL',
      createdAt: '25 Ocak 2026',
      images: [FALLBACK_IMAGE_SRC, FALLBACK_IMAGE_SRC, FALLBACK_IMAGE_SRC],
      info: [
        ['İlan No', '36710426'],
        ['İlan Tarihi', '25 Ocak 2026'],
        ['Marka', 'Volkswagen'],
        ['Model', 'Passat'],
        ['Yıl', '2017'],
      ],
      desc:
        'Araç temiz ve bakımlıdır.\nDetaylı bilgi için arayın.\n\nBu sayfa sadece mobil tasarım önizlemesidir.',
      services: [
        'AUX',
        'USB',
        'Bluetooth',
        'ABS',
        'ESP/DSTC',
        'Isofix',
        'Yokuş Kalkış Desteği',
        'Yorgunluk Tespit Sistemi',
      ],
    }),
    []
  );

  const scrollTo = (tab: 'info' | 'desc' | 'services') => {
    setMobileTab(tab);
    const id = tab === 'info' ? 'sec-info' : tab === 'desc' ? 'sec-desc' : 'sec-services';
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50 md:hidden">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="px-3">
          <nav className="py-2">
            <ol className="flex flex-nowrap items-center gap-x-2 overflow-x-auto text-[12px] text-gray-600 leading-none">
              <li className="shrink-0">Ana Sayfa</li>
              <li className="shrink-0 text-gray-400">›</li>
              <li className="shrink-0">İlanlar</li>
              <li className="shrink-0 text-gray-400">›</li>
              <li className="shrink-0">Otomobil</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Galeri */}
      <div className="bg-black">
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={listing.images[selectedImageIndex] || FALLBACK_IMAGE_SRC}
            alt={listing.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute left-3 bottom-3 rounded bg-black/60 text-white text-xs px-2 py-1">
            {selectedImageIndex + 1} / {listing.images.length}
          </div>
        </div>
        <div className="bg-white px-3 py-2">
          <div className="flex gap-2 overflow-x-auto">
            {listing.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded border ${
                  idx === selectedImageIndex ? 'border-alo-orange' : 'border-gray-200'
                }`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Başlık / Konum / Fiyat */}
      <div className="bg-white px-3 py-3">
        <h1 className="text-[18px] font-bold text-gray-900 leading-snug">{listing.title}</h1>
        <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-3xl font-extrabold text-alo-red">{listing.priceText}</div>
          <div className="text-xs text-gray-500">{listing.createdAt}</div>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="sticky top-14 z-40 bg-white border-b">
        <div className="px-3">
          <div className="flex gap-5 text-sm font-medium">
            <button
              type="button"
              onClick={() => scrollTo('info')}
              className={`py-3 ${mobileTab === 'info' ? 'text-alo-orange border-b-2 border-alo-orange' : 'text-gray-700'}`}
            >
              İlan bilgileri
            </button>
            <button
              type="button"
              onClick={() => scrollTo('desc')}
              className={`py-3 ${mobileTab === 'desc' ? 'text-alo-orange border-b-2 border-alo-orange' : 'text-gray-700'}`}
            >
              Açıklama
            </button>
            <button
              type="button"
              onClick={() => scrollTo('services')}
              className={`py-3 ${mobileTab === 'services' ? 'text-alo-orange border-b-2 border-alo-orange' : 'text-gray-700'}`}
            >
              Hizmetler
            </button>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="pb-24">
        <div id="sec-info" className="bg-white mt-2">
          <div className="px-3 py-3 border-b text-sm font-semibold text-gray-900">İlan bilgileri</div>
          <div className="divide-y text-sm">
            {listing.info.map(([k, v]) => (
              <div key={k} className="flex justify-between px-3 py-3">
                <span className="text-gray-600">{k}</span>
                <span className="font-medium text-gray-900">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="sec-desc" className="bg-white mt-2">
          <div className="px-3 py-3 border-b text-sm font-semibold text-gray-900">Açıklama</div>
          <div className="px-3 py-3 text-sm text-gray-700 whitespace-pre-line">{listing.desc}</div>
        </div>

        <div id="sec-services" className="bg-white mt-2">
          <div className="px-3 py-3 border-b text-sm font-semibold text-gray-900">Hizmetler</div>
          <div className="px-3 py-3">
            <div className="flex flex-wrap gap-2">
              {listing.services.map((s) => (
                <span key={s} className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="px-3 pb-4">
            <button
              type="button"
              className="w-full rounded-lg border border-gray-200 py-3 text-sm text-gray-800 flex items-center justify-center gap-2"
            >
              <Flag className="h-4 w-4" />
              Şikayet et
            </button>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t">
        <div className="px-3 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
          <div className="grid grid-cols-3 gap-2">
            <button className="h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold bg-alo-red text-white">
              <Phone className="h-4 w-4" />
              Ara
            </button>
            <button className="h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold bg-gray-100 text-gray-800">
              <MessageSquare className="h-4 w-4" />
              Mesaj gönder
            </button>
            <button className="h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold bg-[#25D366] text-white">
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

