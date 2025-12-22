import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kariyer',
  description: 'Alo17 ekibine katılmak ister misiniz? Kariyer başvuru formunu doldurarak bizimle çalışma fırsatı yakalayın.',
};

export default function KariyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

