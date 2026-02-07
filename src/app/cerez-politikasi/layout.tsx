import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası - Alo17',
  description: 'Alo17 çerez kullanımı ve çerez politikası. Web sitemizde kullanılan çerezler hakkında bilgi.',
  alternates: { canonical: 'https://alo17.tr/cerez-politikasi' },
};

export default function CerezPolitikasiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
