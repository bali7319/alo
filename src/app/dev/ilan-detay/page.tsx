import { notFound } from 'next/navigation';
import DemoIlanDetayClient from './ui';

export default function DevIlanDetayPage() {
  // Bu sayfa sadece local/dev için: production'da görünmesin
  if (process.env.NODE_ENV === 'production') notFound();
  return <DemoIlanDetayClient />;
}

