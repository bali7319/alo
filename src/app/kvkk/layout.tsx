import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK - Kişisel Verilerin Korunması | Alo17',
  description: 'Alo17 KVKK bilgilendirmesi. Kişisel verilerin korunması ve işlenmesi hakkında bilgi.',
  alternates: { canonical: 'https://alo17.tr/kvkk' },
};

export default function KvkkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
