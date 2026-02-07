import { Metadata } from 'next'

const baseUrl = 'https://alo17.tr'

/**
 * Canonical URL oluşturur
 */
export function getCanonicalUrl(path: string = ''): string {
  // Path zaten tam URL ise direkt döndür
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Path / ile başlamıyorsa ekle
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  
  // Query string'i temizle (canonical URL'lerde query string olmamalı)
  const cleanPath = normalizedPath.split('?')[0]
  
  return `${baseUrl}${cleanPath}`
}

/**
 * Sayfa metadata'sı için canonical URL ekler
 */
export function withCanonical(metadata: Metadata, path?: string): Metadata {
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: path ? getCanonicalUrl(path) : baseUrl,
    },
  }
}

/**
 * SEO için optimize edilmiş metadata oluşturur
 */
export function createMetadata({
  title,
  description,
  path,
  noindex = false,
  nofollow = false,
  image,
}: {
  title: string
  description: string
  path?: string
  noindex?: boolean
  nofollow?: boolean
  image?: string
}): Metadata {
  const canonical = path ? getCanonicalUrl(path) : baseUrl
  const fullTitle = title.includes('Alo17') ? title : `${title} | Alo17`
  
  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url: canonical,
      siteName: 'Alo17',
      title: fullTitle,
      description,
      images: image
        ? [
            {
              url: image.startsWith('http') ? image : `${baseUrl}${image}`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [
            {
              url: `${baseUrl}/images/placeholder.jpg`,
              width: 1200,
              height: 630,
              alt: 'Alo17 - İlan Sitesi',
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image
        ? [image.startsWith('http') ? image : `${baseUrl}${image}`]
        : [`${baseUrl}/images/placeholder.jpg`],
    },
  }
}
