import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası - Alo17',
  description: 'Alo17 gizlilik politikası. Kişisel verilerin toplanması, kullanımı ve korunması.',
  alternates: { canonical: 'https://alo17.tr/gizlilik' },
};

export default function GizlilikLayout({ children }: { children: React.ReactNode }) {
  return children;
}
