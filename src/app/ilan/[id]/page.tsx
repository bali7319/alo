import { Suspense } from 'react';
import IlanDetayClient from './IlanDetayClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IlanDetayPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <IlanDetayClient id={id} />
    </Suspense>
  );
} 