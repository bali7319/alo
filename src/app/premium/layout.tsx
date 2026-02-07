import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium İlan - Öne Çıkar | Alo17',
  description: 'İlanınızı öne çıkarın. Öne çıkan ilan, vurgulu ilan ve premium paketler ile daha fazla görünürlük.',
  alternates: { canonical: 'https://alo17.tr/premium' },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
