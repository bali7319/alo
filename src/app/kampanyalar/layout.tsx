import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kampanyalar - Alo17',
  description: 'Alo17 kampanyaları ve indirimler. İlan öne çıkarma ve premium fırsatları.',
  alternates: { canonical: 'https://alo17.tr/kampanyalar' },
};

export default function KampanyalarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
