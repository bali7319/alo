import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim - Alo17',
  description: 'Alo17 ile iletişime geçin. Çanakkale ilan sitesi adres, telefon ve iletişim formu.',
  alternates: { canonical: 'https://alo17.tr/iletisim' },
};

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
