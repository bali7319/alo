import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İlan Ver - Ücretsiz İlan Yayınla | Alo17',
  description: 'Çanakkale\'de ücretsiz ilan ver. İkinci el, satılık, kiralık, iş ilanları. Hızlı ve güvenli ilan yayınlama.',
  alternates: { canonical: 'https://alo17.tr/ilan-ver' },
};

export default function IlanVerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
