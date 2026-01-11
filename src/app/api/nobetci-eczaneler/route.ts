import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface Eczane {
  name: string
  district: string
  address: string
  phone?: string
  period: string
}

export async function GET() {
  try {
    const response = await fetch('https://www.canakkaleeo.org.tr/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Eczane verileri alınamadı' }, { status: 500 })
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const eczaneler: Eczane[] = []

    // H5 başlıklarından ilçe bilgilerini bul
    $('h5').each((_, h5Element) => {
      const h5Text = $(h5Element).text().trim()
      
      if (h5Text.includes('NÖBETÇİ ECZANELER') || h5Text.includes('Nöbetçi Eczaneler')) {
        const districtMatch = h5Text.match(/\*\*([^*]+)\*\*/) || h5Text.match(/([A-Z\s/]+)\s*NÖBETÇİ/i)
        const currentDistrict = districtMatch ? districtMatch[1].trim() : 'MERKEZ'
        
        // Bu ilçenin eczanelerini bul
        let nextElement = $(h5Element).next()
        let maxIterations = 100
        
        while (nextElement.length > 0 && maxIterations > 0) {
          const tagName = nextElement.prop('tagName')?.toLowerCase()
          const text = nextElement.text().trim()
          
          if (tagName === 'h5' && text.includes('NÖBETÇİ ECZANELER')) {
            break
          }
          
          if (tagName === 'h4') {
            const nameMatch = text.match(/\*\*([^*]+)\*\*/)
            if (nameMatch) {
              const eczaneName = nameMatch[1].trim()
              let address = ''
              let phone = ''
              let period = ''
              
              let infoElement = nextElement.next()
              let infoCount = 0
              
              while (infoElement.length > 0 && infoCount < 10) {
                const infoTag = infoElement.prop('tagName')?.toLowerCase()
                const infoText = infoElement.text().trim()
                
                if (infoTag === 'h4' || (infoTag === 'h5' && infoText.includes('NÖBETÇİ'))) {
                  break
                }
                
                if (!address && infoText && infoText.length > 15) {
                  if (infoText.includes('ÇANAKKALE') || infoText.includes('MAH') || infoText.includes('CAD')) {
                    address = infoText.replace(/\s+/g, ' ').trim()
                  }
                }
                
                const phoneMatch = infoText.match(/(0\d{10}|\d{11})/)
                if (phoneMatch && !phone) {
                  phone = phoneMatch[1]
                }
                
                if (infoText.includes('arasında nöbetçidir')) {
                  const periodMatch = infoText.match(/\*\*([^*]+)\*\*/) || infoText.match(/(\d{2}\.\d{2}\.\d{4}.*?\d{2}\.\d{2}\.\d{4})/)
                  if (periodMatch) {
                    period = periodMatch[1].trim()
                  }
                }
                
                infoElement = infoElement.next()
                infoCount++
              }
              
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

    return NextResponse.json({ eczaneler, count: eczaneler.length })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Eczane verileri alınamadı', details: String(error) }, { status: 500 })
  }
}
