import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as cheerio from 'cheerio'

export const metadata: Metadata = {
  title: 'Nöbetçi Eczaneler | Alo17',
  description: 'Çanakkale nöbetçi eczaneler listesi. Güncel nöbetçi eczane bilgileri ve iletişim detayları.',
}

interface Eczane {
  name: string
  district: string
  address: string
  phone?: string
  period: string
}

async function getNobetciEczaneler(): Promise<Eczane[]> {
  try {
    const response = await fetch('https://www.canakkaleeo.org.tr/', {
      next: { revalidate: 315360000 }, // 10 yıl cache (315360000 saniye)
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error('Eczane verileri alınamadı')
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const eczaneler: Eczane[] = []

    // H1 başlığından sonraki eczane bilgilerini bul
    $('h1').each((_, h1Element) => {
      const h1Text = $(h1Element).text().trim()
      if (h1Text.includes('Nöbetçi Eczaneler')) {
        let currentDistrict = ''
        
        // H1'den sonraki tüm elementleri kontrol et
        $(h1Element).nextAll().each((_, element) => {
          const tagName = $(element).prop('tagName')?.toLowerCase()
          const text = $(element).text().trim()
          
          // İlçe başlığı (h5)
          if (tagName === 'h5') {
            const districtMatch = text.match(/^\*\*?([^*]+)\*\*?\s*NÖBETÇİ ECZANELER/i)
            if (districtMatch) {
              currentDistrict = districtMatch[1].trim()
            }
          }
          
          // Eczane başlığı (h4)
          if (tagName === 'h4' && currentDistrict) {
            const nameMatch = text.match(/^\*\*([^*]+)\*\*/)
            if (nameMatch) {
              const eczaneName = nameMatch[1].trim()
              let address = ''
              let phone = ''
              let period = ''
              
              // Sonraki elementlerden bilgileri al
              $(element).nextAll().each((_, nextEl) => {
                const nextTag = $(nextEl).prop('tagName')?.toLowerCase()
                const nextText = $(nextEl).text().trim()
                
                // Adres (ÇANAKKALE içeriyorsa veya uzun metin)
                if (!address && nextText && nextText.length > 10 && !nextText.includes('Navigasyon')) {
                  if (nextText.includes('ÇANAKKALE') || nextText.includes('MAH') || nextText.includes('CAD')) {
                    address = nextText.replace(/\s+/g, ' ').trim()
                  }
                }
                
                // Telefon (11 haneli)
                if (!phone && /\d{11}/.test(nextText)) {
                  phone = nextText.match(/\d{11}/)?.[0] || ''
                }
                
                // Nöbet süresi
                if (!period && nextText.includes('arasında nöbetçidir')) {
                  period = nextText.replace(/\*\*/g, '').trim()
                }
                
                // Sonraki ilçe veya eczane başlığına gelince dur
                if (nextTag === 'h5' || (nextTag === 'h4' && nextText.match(/^\*\*/))) {
                  return false
                }
              })
              
              if (eczaneName && address) {
                eczaneler.push({
                  name: eczaneName,
                  district: currentDistrict,
                  address: address || 'Adres bilgisi bulunamadı',
                  phone: phone || undefined,
                  period: period || 'Süre bilgisi bulunamadı',
                })
              }
            }
          }
        })
      }
    })

    return eczaneler
  } catch (error) {
    console.error('Eczane verileri alınırken hata:', error)
    return []
  }
}

export default async function NobetciEczanelerPage() {
  const eczaneler = await getNobetciEczaneler()
  
  // İlçelere göre grupla
  const eczanelerByDistrict = eczaneler.reduce((acc, eczane) => {
    if (!acc[eczane.district]) {
      acc[eczane.district] = []
    }
    acc[eczane.district].push(eczane)
    return acc
  }, {} as Record<string, Eczane[]>)

  const districts = Object.keys(eczanelerByDistrict).sort()

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
        </div>

        {/* İlçe Seçimi */}
        {districts.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">İlçe Seçiniz</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {districts.map((district) => (
                <a
                  key={district}
                  href={`#${district.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')}`}
                  className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md text-center transition-colors"
                >
                  {district}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Eczane Listesi */}
        {eczaneler.length > 0 ? (
          <div className="space-y-6">
            {districts.map((district) => (
              <div
                key={district}
                id={district.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                  <h2 className="text-xl font-bold">{district} NÖBETÇİ ECZANELER</h2>
                </div>
                <div className="p-4 space-y-4">
                  {eczanelerByDistrict[district].map((eczane, index) => (
                    <div
                      key={`${eczane.name}-${index}`}
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
