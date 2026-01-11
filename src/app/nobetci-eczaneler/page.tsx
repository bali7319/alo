import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { load } from 'cheerio'

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
      },
    })

    if (!response.ok) {
      throw new Error('Eczane verileri alınamadı')
    }

    const html = await response.text()
    const $ = load(html)
    const eczaneler: Eczane[] = []

    // İlçe başlıklarını bul
    $('h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim()
      
      // İlçe başlığı kontrolü (MERKEZ, AYVACIK, vb.)
      if (text.includes('NÖBETÇİ ECZANELER') || text.match(/^[A-Z\s/]+$/)) {
        const district = text.replace('NÖBETÇİ ECZANELER', '').trim()
        
        // Bu ilçenin eczanelerini bul
        let currentElement = $(element).next()
        while (currentElement.length) {
          // Eczane adı (h4, h5, h6 içinde ** ile vurgulanmış)
          const eczaneName = currentElement.find('strong, b').first().text().trim()
          
          if (eczaneName && eczaneName.length > 0 && !eczaneName.includes('NÖBETÇİ')) {
            // Adres bilgisi
            let address = ''
            let phone = ''
            let period = ''
            
            // Sonraki elementlerde adres, telefon ve nöbet süresi bilgilerini ara
            let infoElement = currentElement.next()
            let infoCount = 0
            
            while (infoElement.length && infoCount < 5) {
              const infoText = infoElement.text().trim()
              
              // Telefon numarası (11 haneli)
              if (!phone && /0\d{10}/.test(infoText)) {
                phone = infoText.match(/0\d{10}/)?.[0] || ''
              }
              
              // Nöbet süresi (tarih formatı)
              if (!period && /\d{2}\.\d{2}\.\d{4}/.test(infoText)) {
                period = infoText.match(/\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/)?.[0] || ''
              }
              
              // Adres (ÇANAKKALE içeren)
              if (!address && infoText.includes('ÇANAKKALE') && infoText.length > 10) {
                address = infoText.replace(/\*\*/g, '').trim()
              }
              
              infoElement = infoElement.next()
              infoCount++
            }
            
            if (eczaneName) {
              eczaneler.push({
                name: eczaneName,
                district: district || 'MERKEZ',
                address: address || 'Adres bilgisi bulunamadı',
                phone: phone || undefined,
                period: period || 'Nöbet süresi bilgisi bulunamadı',
              })
            }
          }
          
          // Sonraki ilçe başlığına gelince dur
          if (currentElement.is('h4, h5, h6') && currentElement.text().includes('NÖBETÇİ ECZANELER')) {
            break
          }
          
          currentElement = currentElement.next()
        }
      }
    })

    // Alternatif parsing: Daha basit yapı
    if (eczaneler.length === 0) {
      // Tüm strong/b etiketlerini kontrol et
      $('strong, b').each((_, element) => {
        const text = $(element).text().trim()
        
        // Eczane adı kontrolü (çok kısa veya çok uzun değilse)
        if (text.length > 5 && text.length < 50 && !text.includes('NÖBETÇİ') && !text.includes('ECZANELER')) {
          const parent = $(element).parent()
          const nextSiblings = parent.nextAll()
          
          let address = ''
          let phone = ''
          let period = ''
          let district = 'MERKEZ'
          
          // Önceki elementlerde ilçe bilgisini ara
          const prevElements = parent.prevAll()
          prevElements.each((_, prevEl) => {
            const prevText = $(prevEl).text().trim()
            if (prevText.includes('NÖBETÇİ ECZANELER')) {
              district = prevText.replace('NÖBETÇİ ECZANELER', '').trim() || 'MERKEZ'
              return false // break
            }
          })
          
          // Sonraki elementlerde bilgileri ara
          nextSiblings.slice(0, 10).each((_, sibling) => {
            const siblingText = $(sibling).text().trim()
            
            if (!phone && /0\d{10}/.test(siblingText)) {
              phone = siblingText.match(/0\d{10}/)?.[0] || ''
            }
            
            if (!period && /\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/.test(siblingText)) {
              period = siblingText.match(/\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/)?.[0] || ''
            }
            
            if (!address && siblingText.includes('ÇANAKKALE') && siblingText.length > 10) {
              address = siblingText.replace(/\*\*/g, '').trim()
            }
          })
          
          if (address || phone || period) {
            eczaneler.push({
              name: text,
              district,
              address: address || 'Adres bilgisi bulunamadı',
              phone: phone || undefined,
              period: period || 'Nöbet süresi bilgisi bulunamadı',
            })
          }
        }
      })
    }

    return eczaneler
  } catch (error) {
    console.error('Eczane verileri alınırken hata:', error)
    return []
  }
}

export default async function NobetciEczanelerPage() {
  const eczaneler = await getNobetciEczaneler()
  
  // İlçelere göre grupla
  const eczanelerByDistrict: Record<string, Eczane[]> = {}
  eczaneler.forEach((eczane) => {
    if (!eczanelerByDistrict[eczane.district]) {
      eczanelerByDistrict[eczane.district] = []
    }
    eczanelerByDistrict[eczane.district].push(eczane)
  })

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
                  href={`#${district.toLowerCase().replace(/\//g, '-').replace(/\s/g, '-')}`}
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
                id={district.toLowerCase().replace(/\//g, '-').replace(/\s/g, '-')}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                  {district} NÖBETÇİ ECZANELER
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eczanelerByDistrict[district].map((eczane, index) => (
                    <div
                      key={`${district}-${index}`}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {eczane.name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{eczane.address}</span>
                        </div>
                        {eczane.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={`tel:${eczane.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {eczane.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-green-600 font-medium">{eczane.period}</span>
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
              Eczane bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.
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

    // Alternatif parsing: Daha basit yapı
    if (eczaneler.length === 0) {
      // Tüm strong/b etiketlerini kontrol et
      $('strong, b').each((_, element) => {
        const text = $(element).text().trim()
        
        // Eczane adı kontrolü (çok kısa veya çok uzun değilse)
        if (text.length > 5 && text.length < 50 && !text.includes('NÖBETÇİ') && !text.includes('ECZANELER')) {
          const parent = $(element).parent()
          const nextSiblings = parent.nextAll()
          
          let address = ''
          let phone = ''
          let period = ''
          let district = 'MERKEZ'
          
          // Önceki elementlerde ilçe bilgisini ara
          const prevElements = parent.prevAll()
          prevElements.each((_, prevEl) => {
            const prevText = $(prevEl).text().trim()
            if (prevText.includes('NÖBETÇİ ECZANELER')) {
              district = prevText.replace('NÖBETÇİ ECZANELER', '').trim() || 'MERKEZ'
              return false // break
            }
          })
          
          // Sonraki elementlerde bilgileri ara
          nextSiblings.slice(0, 10).each((_, sibling) => {
            const siblingText = $(sibling).text().trim()
            
            if (!phone && /0\d{10}/.test(siblingText)) {
              phone = siblingText.match(/0\d{10}/)?.[0] || ''
            }
            
            if (!period && /\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/.test(siblingText)) {
              period = siblingText.match(/\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/)?.[0] || ''
            }
            
            if (!address && siblingText.includes('ÇANAKKALE') && siblingText.length > 10) {
              address = siblingText.replace(/\*\*/g, '').trim()
            }
          })
          
          if (address || phone || period) {
            eczaneler.push({
              name: text,
              district,
              address: address || 'Adres bilgisi bulunamadı',
              phone: phone || undefined,
              period: period || 'Nöbet süresi bilgisi bulunamadı',
            })
          }
        }
      })
    }

    return eczaneler
  } catch (error) {
    console.error('Eczane verileri alınırken hata:', error)
    return []
  }
}

export default async function NobetciEczanelerPage() {
  const eczaneler = await getNobetciEczaneler()
  
  // İlçelere göre grupla
  const eczanelerByDistrict: Record<string, Eczane[]> = {}
  eczaneler.forEach((eczane) => {
    if (!eczanelerByDistrict[eczane.district]) {
      eczanelerByDistrict[eczane.district] = []
    }
    eczanelerByDistrict[eczane.district].push(eczane)
  })

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
                  href={`#${district.toLowerCase().replace(/\//g, '-').replace(/\s/g, '-')}`}
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
                id={district.toLowerCase().replace(/\//g, '-').replace(/\s/g, '-')}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                  {district} NÖBETÇİ ECZANELER
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eczanelerByDistrict[district].map((eczane, index) => (
                    <div
                      key={`${district}-${index}`}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {eczane.name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{eczane.address}</span>
                        </div>
                        {eczane.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={`tel:${eczane.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {eczane.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-green-600 font-medium">{eczane.period}</span>
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
              Eczane bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.
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

    // Alternatif parsing: Daha basit yapı
    if (eczaneler.length === 0) {
      // Tüm strong/b etiketlerini kontrol et
      $('strong, b').each((_, element) => {
        const text = $(element).text().trim()
        
        // Eczane adı kontrolü (çok kısa veya çok uzun değilse)
        if (text.length > 5 && text.length < 50 && !text.includes('NÖBETÇİ') && !text.includes('ECZANELER')) {
          const parent = $(element).parent()
          const nextSiblings = parent.nextAll()
          
          let address = ''
          let phone = ''
          let period = ''
          let district = 'MERKEZ'
          
          // Önceki elementlerde ilçe bilgisini ara
          const prevElements = parent.prevAll()
          prevElements.each((_, prevEl) => {
            const prevText = $(prevEl).text().trim()
            if (prevText.includes('NÖBETÇİ ECZANELER')) {
              district = prevText.replace('NÖBETÇİ ECZANELER', '').trim() || 'MERKEZ'
              return false // break
            }
          })
          
          // Sonraki elementlerde bilgileri ara
          nextSiblings.slice(0, 10).each((_, sibling) => {
            const siblingText = $(sibling).text().trim()
            
            if (!phone && /0\d{10}/.test(siblingText)) {
              phone = siblingText.match(/0\d{10}/)?.[0] || ''
            }
            
            if (!period && /\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/.test(siblingText)) {
              period = siblingText.match(/\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/)?.[0] || ''
            }
            
            if (!address && siblingText.includes('ÇANAKKALE') && siblingText.length > 10) {
              address = siblingText.replace(/\*\*/g, '').trim()
            }
          })
          
          if (address || phone || period) {
            eczaneler.push({
              name: text,
              district,
              address: address || 'Adres bilgisi bulunamadı',
              phone: phone || undefined,
              period: period || 'Nöbet süresi bilgisi bulunamadı',
            })
          }
        }
      })
    }

    return eczaneler
  } catch (error) {
    console.error('Eczane verileri alınırken hata:', error)
    return []
  }
}

export default async function NobetciEczanelerPage() {
  const eczaneler = await getNobetciEczaneler()
  
  // İlçelere göre grupla
  const eczanelerByDistrict: Record<string, Eczane[]> = {}
  eczaneler.forEach((eczane) => {
    if (!eczanelerByDistrict[eczane.district]) {
      eczanelerByDistrict[eczane.district] = []
    }
    eczanelerByDistrict[eczane.district].push(eczane)
  })

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
                  href={`#${district.toLowerCase().replace(/\//g, '-').replace(/\s/g, '-')}`}
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
                id={district.toLowerCase().replace(/\//g, '-').replace(/\s/g, '-')}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                  {district} NÖBETÇİ ECZANELER
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eczanelerByDistrict[district].map((eczane, index) => (
                    <div
                      key={`${district}-${index}`}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {eczane.name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{eczane.address}</span>
                        </div>
                        {eczane.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={`tel:${eczane.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {eczane.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-green-600 font-medium">{eczane.period}</span>
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
              Eczane bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.
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

    // Alternatif parsing: Daha basit yapı
    if (eczaneler.length === 0) {
      // Tüm strong/b etiketlerini kontrol et
      $('strong, b').each((_, element) => {
        const text = $(element).text().trim()
        
        // Eczane adı kontrolü (çok kısa veya çok uzun değilse)
        if (text.length > 5 && text.length < 50 && !text.includes('NÖBETÇİ') && !text.includes('ECZANELER')) {
          const parent = $(element).parent()
          const nextSiblings = parent.nextAll()
          
          let address = ''
          let phone = ''
          let period = ''
          let district = 'MERKEZ'
          
          // Önceki elementlerde ilçe bilgisini ara
          const prevElements = parent.prevAll()
          prevElements.each((_, prevEl) => {
            const prevText = $(prevEl).text().trim()
            if (prevText.includes('NÖBETÇİ ECZANELER')) {
              district = prevText.replace('NÖBETÇİ ECZANELER', '').trim() || 'MERKEZ'
              return false // break
            }
          })
          
          // Sonraki elementlerde bilgileri ara
          nextSiblings.slice(0, 10).each((_, sibling) => {
            const siblingText = $(sibling).text().trim()
            
            if (!phone && /0\d{10}/.test(siblingText)) {
              phone = siblingText.match(/0\d{10}/)?.[0] || ''
            }
            
            if (!period && /\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/.test(siblingText)) {
              period = siblingText.match(/\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4}/)?.[0] || ''
            }
            
            if (!address && siblingText.includes('ÇANAKKALE') && siblingText.length > 10) {
              address = siblingText.replace(/\*\*/g, '').trim()
            }
          })
          
          if (address || phone || period) {
            eczaneler.push({
              name: text,
              district,
              address: address || 'Adres bilgisi bulunamadı',
              phone: phone || undefined,
              period: period || 'Nöbet süresi bilgisi bulunamadı',
            })
          }
        }
      })
    }

    return eczaneler
  } catch (error) {
    console.error('Eczane verileri alınırken hata:', error)
    return []
  }
}

export default async function NobetciEczanelerPage() {
  const eczaneler = await getNobetciEczaneler()
  
  // İlçelere göre grupla
  const eczanelerByDistrict: Record<string, Eczane[]> = {}
  eczaneler.forEach((eczane) => {
    if (!eczanelerByDistrict[eczane.district]) {
      eczanelerByDistrict[eczane.district] = []
    }
    eczanelerByDistrict[eczane.district].push(eczane)
  })

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
                  href={`#${district.toLowerCase().replace(/\//g, '-').replace(/\s/g, '-')}`}
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
                id={district.toLowerCase().replace(/\//g, '-').replace(/\s/g, '-')}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                  {district} NÖBETÇİ ECZANELER
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eczanelerByDistrict[district].map((eczane, index) => (
                    <div
                      key={`${district}-${index}`}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {eczane.name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{eczane.address}</span>
                        </div>
                        {eczane.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={`tel:${eczane.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {eczane.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-green-600 font-medium">{eczane.period}</span>
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
              Eczane bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.
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
