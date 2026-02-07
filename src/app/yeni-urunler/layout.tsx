import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yeni Ürünler - Alo17',
  description: 'Çanakkale\'de yeni eklenen ürünler ve ilanlar.',
  alternates: { canonical: 'https://alo17.tr/yeni-urunler' },
};

export default function YeniUrunlerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
