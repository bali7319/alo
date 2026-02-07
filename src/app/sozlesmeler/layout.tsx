import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hukuki Belgeler ve Dilekçe',
  description: 'İhtiyacınıza uygun hukuki belge ve dilekçe şablonlarını seçin ve oluşturun. Ev kiralama sözleşmesi, tahliye dilekçesi, kira artış itirazı ve daha fazlası.',
  keywords: [
    'hukuki belgeler',
    'dilekçe',
    'sözleşme',
    'ev kiralama sözleşmesi',
    'tahliye dilekçesi',
    'kira artış itiraz',
    'hukuki şablon',
    'dilekçe örneği',
    'sözleşme şablonu',
  ],
  alternates: { canonical: 'https://alo17.tr/sozlesmeler' },
  openGraph: {
    title: 'Hukuki Belgeler ve Dilekçe - Alo17',
    description: 'İhtiyacınıza uygun hukuki belge ve dilekçe şablonlarını seçin ve oluşturun.',
    url: 'https://alo17.tr/sozlesmeler',
    siteName: 'Alo17',
    type: 'website',
  },
};

export default function SozlesmelerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
