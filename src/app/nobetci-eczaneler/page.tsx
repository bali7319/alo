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
    // Önce kendi API'mizi dene (daha güvenilir)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alo17.tr'
      const apiResponse = await fetch(`${apiUrl}/api/nobetci-eczaneler`, {
        next: { revalidate: 3600 },
      })
      
      if (apiResponse.ok) {
        const data = await apiResponse.json()
        if (data.eczaneler && data.eczaneler.length > 0) {
          console.log(`API'den ${data.eczaneler.length} eczane alındı`)
          return data.eczaneler
        }
      }
    } catch (apiError) {
      console.log('API hatası, direkt scraping deneniyor:', apiError)
    }
    
    // API çalışmazsa direkt scraping yap
    const response = await fetch('https://www.canakkaleeo.org.tr/', {
      next: { revalidate: 3600 }, // 1 saat cache (eczane bilgileri günlük değişir)
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    
    // HTML'in geldiğini kontrol et
    if (!html || html.length < 1000) {
      console.error('HTML çok kısa veya boş:', html.length)
      return []
    }
    
    const $ = cheerio.load(html)
    const eczaneler: Eczane[] = []
    
    console.log('HTML yüklendi, parsing başlıyor...')

    // H1 başlığını bul
    const h1Element = $('h1').filter((_, el) => $(el).text().includes('Nöbetçi Eczaneler') || $(el).text().includes('NÖBETÇİ ECZANELER')).first()
    
    if (h1Element.length === 0) {
      console.log('H1 başlığı bulunamadı, alternatif yöntem deneniyor...')
    }
    
    // Tüm h5 başlıklarını bul (ilçe başlıkları)
    const h5Elements = $('h5')
    console.log(`Toplam ${h5Elements.length} h5 elementi bulundu`)
    
    h5Elements.each((_, h5Element) => {
      const h5Text = $(h5Element).text().trim()
      
      // İlçe başlığı kontrolü
      if (h5Text.includes('NÖBETÇİ ECZANELER') || h5Text.includes('Nöbetçi Eczaneler')) {
        // İlçe adını çıkar
        const districtMatch = h5Text.match(/\*\*([^*]+)\*\*\s*NÖBETÇİ ECZANELER/i) || 
                             h5Text.match(/([A-Z\s/]+)\s*NÖBETÇİ ECZANELER/i)
        const currentDistrict = districtMatch ? districtMatch[1].trim() : 'MERKEZ'
        
        // Bu ilçenin eczanelerini bul
        let nextElement = $(h5Element).next()
        let maxIterations = 100 // Güvenlik için limit
        
        while (nextElement.length > 0 && maxIterations > 0) {
          const tagName = nextElement.prop('tagName')?.toLowerCase()
          const text = nextElement.text().trim()
          
          // Sonraki ilçe başlığına gelince dur
          if (tagName === 'h5' && text.includes('NÖBETÇİ ECZANELER')) {
            break
          }
          
          // Eczane başlığı (h4)
          if (tagName === 'h4') {
            const nameMatch = text.match(/\*\*([^*]+)\*\*/) || text.match(/^([A-Z\s]+)$/)
            if (nameMatch && nameMatch[1].length > 3) {
              const eczaneName = nameMatch[1].trim()
              
              // Eczane bilgilerini topla
              let address = ''
              let phone = ''
              let period = ''
              
              // Sonraki 10 elementi kontrol et
              let infoElement = nextElement.next()
              let infoCount = 0
              
              while (infoElement.length > 0 && infoCount < 10) {
                const infoTag = infoElement.prop('tagName')?.toLowerCase()
                const infoText = infoElement.text().trim()
                
                // Sonraki eczane veya ilçe başlığına gelince dur
                if (infoTag === 'h4' || (infoTag === 'h5' && infoText.includes('NÖBETÇİ'))) {
                  break
                }
                
                // Adres bilgisi
                if (!address && infoText && infoText.length > 15) {
                  if (infoText.includes('ÇANAKKALE') || infoText.includes('MAH') || infoText.includes('CAD') || infoText.includes('SOK')) {
                    address = infoText.replace(/\s+/g, ' ').trim()
                  }
                }
                
                // Telefon numarası
                const phoneMatch = infoText.match(/(0\d{10}|\d{11})/)
                if (phoneMatch && !phone) {
                  phone = phoneMatch[1]
                }
                
                // Nöbet süresi
                if (infoText.includes('arasında nöbetçidir')) {
                  const periodMatch = infoText.match(/\*\*([^*]+)\*\*/) || 
                                     infoText.match(/(\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4})/)
                  if (periodMatch) {
                    period = periodMatch[1].trim()
                  }
                }
                
                infoElement = infoElement.next()
                infoCount++
              }
              
              // Eczane bilgilerini kaydet
              if (eczaneName && (address || phone || period)) {
                eczaneler.push({
                  name: eczaneName,
                  district: currentDistrict,
                  address: address || 'Adres bilgisi bulunamadı',
                  phone: phone || undefined,
                  period: period || 'Nöbet süresi bilgisi bulunamadı',
                })
              }
            }
          }
          
          nextElement = nextElement.next()
          maxIterations--
        }
      }
    })

    console.log(`İlk yöntemle ${eczaneler.length} eczane bulundu`)
    
    // Alternatif parsing: Eğer yukarıdaki yöntem çalışmazsa
    if (eczaneler.length === 0) {
      console.log('Alternatif parsing yöntemi deneniyor...')
      
      // Tüm strong/b tag'lerini kontrol et
      $('strong, b, h4').each((_, element) => {
        const text = $(element).text().trim()
        
        // Eczane adı kontrolü
        if (text && text.length > 5 && text.length < 50 && !text.includes('NÖBETÇİ') && !text.includes('ECZANELER')) {
          const eczaneName = text.replace(/\*\*/g, '').trim()
          
          // Önceki h5'ten ilçe bilgisini bul
          let district = 'MERKEZ'
          let prevElement = $(element).prevAll('h5').first()
          if (prevElement.length) {
            const prevText = prevElement.text().trim()
            if (prevText.includes('NÖBETÇİ ECZANELER')) {
              const districtMatch = prevText.match(/\*\*([^*]+)\*\*/) || prevText.match(/([A-Z\s/]+)\s*NÖBETÇİ/)
              if (districtMatch) {
                district = districtMatch[1].trim()
              }
            }
          }
          
          // Sonraki elementlerden bilgileri al
          let address = ''
          let phone = ''
          let period = ''
          
          $(element).nextAll().slice(0, 8).each((_, nextEl) => {
            const nextText = $(nextEl).text().trim()
            
            if (!address && nextText.includes('ÇANAKKALE') && nextText.length > 15) {
              address = nextText.replace(/\s+/g, ' ').trim()
            }
            
            const phoneMatch = nextText.match(/(0\d{10}|\d{11})/)
            if (phoneMatch && !phone) {
              phone = phoneMatch[1]
            }
            
            if (nextText.includes('arasında nöbetçidir')) {
              const periodMatch = nextText.match(/\*\*([^*]+)\*\*/) || nextText.match(/(\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4})/)
              if (periodMatch) {
                period = periodMatch[1].trim()
              }
            }
          })
          
          if (address || phone || period) {
            eczaneler.push({
              name: eczaneName,
              district,
              address: address || 'Adres bilgisi bulunamadı',
              phone: phone || undefined,
              period: period || 'Nöbet süresi bilgisi bulunamadı',
            })
          }
        }
      })
    }

    console.log(`Toplam ${eczaneler.length} eczane bulundu`)
    return eczaneler
  } catch (error) {
    console.error('Eczane verileri alınırken hata:', error)
    // Hata durumunda boş liste döndür (fallback mesajı gösterilecek)
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
            <p className="text-yellow-800 mb-2">
              Eczane verileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
            </p>
            <p className="text-sm text-yellow-700">
              Veriler Çanakkale Eczacı Odası sitesinden otomatik olarak çekilmektedir.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
