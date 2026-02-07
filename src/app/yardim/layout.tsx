import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yardım Merkezi - Alo17',
  description: 'Alo17 kullanım rehberi, sık sorulan sorular ve destek. İlan verme, üyelik ve güvenlik hakkında yardım.',
  alternates: { canonical: 'https://alo17.tr/yardim' },
};

export default function YardimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
