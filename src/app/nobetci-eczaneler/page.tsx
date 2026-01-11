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
            Çanakkale nöbetçi eczaneler listesi. Veriler Çanakkale Eczacı Odası'ndan otomatik olarak güncellenmektedir.
          </p>
        </div>

        {/* Eczane Listesi */}
        {eczaneler.length > 0 ? (
          <div className="space-y-6">
            {districts.map((district) => (
              <div key={district} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                  <h2 className="text-xl font-bold">{district} NÖBETÇİ ECZANELER</h2>
                </div>
                <div className="p-4 space-y-4">
                  {eczanelerByDistrict[district].map((eczane, index) => (
                    <div
                      key={`${district}-${index}`}
                      className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {eczane.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                          <span className="flex-1">{eczane.address}</span>
                        </div>
                        {eczane.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <a
                              href={`tel:${eczane.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {eczane.phone}
                            </a>
                          </div>
                        )}
                        {eczane.period && (
                          <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-200">
                            <Clock className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                            <span className="flex-1 font-medium text-orange-700">
                              {eczane.period}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 mb-4">
              Eczane verileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
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
        )}
      </div>
    </div>
  )
}
