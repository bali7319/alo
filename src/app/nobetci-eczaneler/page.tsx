import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Nöbetçi Eczaneler | Alo17',
  description: 'Çanakkale nöbetçi eczaneler listesi. Güncel nöbetçi eczane bilgileri ve iletişim detayları.',
}

export default async function NobetciEczanelerPage() {
  // İlçe seçimi için
  const districts = [
    'MERKEZ', 'AYVACIK', 'AYVACIK/KÜÇÜKKUYU', 'BAYRAMİÇ', 'BİGA', 
    'BOZCAADA', 'ÇAN', 'ECEABAT', 'EZİNE', 'EZİNE/GEYİKLİ', 
    'GÖKÇEADA', 'GELİBOLU', 'LAPSEKİ', 'LAPSEKİ /ÇARDAK', 'YENİCE'
  ]

  // Şimdilik iframe ile gösterelim (daha güvenilir)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Nöbetçi Eczaneler
          </h1>
          <p className="text-gray-600">
            Çanakkale nöbetçi eczaneler listesi. Güncel bilgiler için{' '}
            <a 
              href="https://www.canakkaleeo.org.tr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Çanakkale Eczacı Odası
            </a>
            {' '}ana sayfasını ziyaret edebilirsiniz.
          </p>
        </div>

        {/* İlçe Seçimi */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">İlçe Seçiniz</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {districts.map((district) => (
              <a
                key={district}
                href={`https://www.canakkaleeo.org.tr/#${district.toLowerCase().replace(/\//g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md text-center transition-colors"
              >
                {district}
              </a>
            ))}
          </div>
        </div>

        {/* Iframe ile Eczane Listesi - Ana sayfadan */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Güncel Nöbetçi Eczaneler</h2>
            <p className="text-sm text-gray-600 mt-1">
              Aşağıdaki iframe içinde Çanakkale Eczacı Odası'nın ana sayfasından güncel nöbetçi eczaneler listesi gösterilmektedir.
            </p>
          </div>
          <div className="w-full" style={{ height: '800px' }}>
            <iframe
              src="https://www.canakkaleeo.org.tr/"
              className="w-full h-full border-0"
              title="Nöbetçi Eczaneler"
              loading="lazy"
            />
          </div>
        </div>

        {/* Alternatif: Direkt Link */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-gray-700 mb-3">
            Sayfa düzgün görünmüyorsa, doğrudan Çanakkale Eczacı Odası ana sayfasını ziyaret edin:
          </p>
          <a
            href="https://www.canakkaleeo.org.tr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MapPin className="h-5 w-5 mr-2" />
            Çanakkale Eczacı Odası - Ana Sayfa
          </a>
        </div>
      </div>
    </div>
  )
}
