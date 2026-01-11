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
      next: { revalidate: 3600 }, // 1 saat cache
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error('Eczane verileri alınamadı')
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const eczaneler: Eczane[] = []

    // İlçe başlıklarını bul
    $('h5').each((index, element) => {
      const districtText = $(element).text().trim()
      
      // İlçe başlığı mı kontrol et (NÖBETÇİ ECZANELER içeriyorsa)
      if (districtText.includes('NÖBETÇİ ECZANELER')) {
        const district = districtText.replace('NÖBETÇİ ECZANELER', '').trim()
        
        // Bu ilçenin eczanelerini bul
        let currentElement = $(element).next()
        
        while (currentElement.length > 0) {
          // Eczane başlığı (h4) bul
          if (currentElement.is('h4')) {
            const eczaneName = currentElement.text().trim().replace(/\*\*/g, '').trim()
            
            if (eczaneName) {
              // Sonraki paragraf veya div'lerden adres, telefon, süre bilgilerini al
              let infoElement = currentElement.next()
              let address = ''
              let phone = ''
              let period = ''
              
              // Birkaç sonraki elementi kontrol et
              for (let i = 0; i < 5 && infoElement.length > 0; i++) {
                const text = infoElement.text().trim()
                
                // Adres (ÇANAKKALE içeriyorsa)
                if (text.includes('ÇANAKKALE') && !address) {
                  address = text
                }
                
                // Telefon (11 haneli sayı)
                const phoneMatch = text.match(/(\d{11})/)
                if (phoneMatch && !phone) {
                  phone = phoneMatch[1]
                }
                
                // Nöbet süresi (arasında nöbetçidir)
                if (text.includes('arasında nöbetçidir')) {
                  const periodMatch = text.match(/\*\*([^*]+)\*\*/)
                  if (periodMatch) {
                    period = periodMatch[1].trim()
                  }
                }
                
                // Eğer bir sonraki ilçe başlığına geldiysek dur
                if (infoElement.is('h5') && infoElement.text().includes('NÖBETÇİ ECZANELER')) {
                  break
                }
                
                infoElement = infoElement.next()
              }
              
              if (eczaneName && district) {
                eczaneler.push({
                  name: eczaneName,
                  district: district,
                  address: address || 'Adres bilgisi bulunamadı',
                  phone: phone || undefined,
                  period: period || 'Süre bilgisi bulunamadı',
                })
              }
            }
          }
          
          // Sonraki ilçe başlığına geldiysek dur
          if (currentElement.is('h5') && currentElement.text().includes('NÖBETÇİ ECZANELER') && index > 0) {
            break
          }
          
          currentElement = currentElement.next()
        }
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
          <p className="text-gray-600">
            Çanakkale nöbetçi eczaneler listesi. Güncel bilgiler Çanakkale Eczacı Odası sitesinden alınmaktadır.
          </p>
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
                      className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {eczane.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                          <span>{eczane.address}</span>
                        </div>
                        {eczane.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a
                              href={`tel:${eczane.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {eczane.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-green-600">{eczane.period}</span>
                        </div>
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
              Eczane bilgileri şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.
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
