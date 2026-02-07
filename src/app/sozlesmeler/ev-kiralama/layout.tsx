import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ev Kiralama Sözleşmesi - Alo17',
  description: 'Ev kiralama sözleşmesi oluşturun. Kiracı ve ev sahibi bilgileriyle hukuki sözleşme şablonu.',
  alternates: { canonical: 'https://alo17.tr/sozlesmeler/ev-kiralama' },
};

export default function EvKiralamaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
