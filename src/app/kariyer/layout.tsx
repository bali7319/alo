import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kariyer - Alo17',
  description: 'Alo17 ekibine katılmak ister misiniz? Kariyer başvuru formunu doldurarak bizimle çalışma fırsatı yakalayın.',
  alternates: { canonical: 'https://alo17.tr/kariyer' },
};

export default function KariyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

