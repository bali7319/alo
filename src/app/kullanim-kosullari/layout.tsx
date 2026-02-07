import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları - Alo17',
  description: 'Alo17 kullanım koşulları ve hizmet şartları. Platform kullanımına ilişkin koşullar.',
  alternates: { canonical: 'https://alo17.tr/kullanim-kosullari' },
};

export default function KullanimKosullariLayout({ children }: { children: React.ReactNode }) {
  return children;
}
