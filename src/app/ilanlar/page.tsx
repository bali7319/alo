import type { Metadata } from 'next';
import IlanlarClient from './IlanlarClient';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.search === 'string' ? sp.search.trim() : '';

  // "Niteliksiz" sayfalar: arama filtreli /ilanlar?search=...
  // Always on (as agreed): keep search result pages out of index.
  const shouldNoindex = q.length > 0;

  return {
    title: q ? `İlanlar: ${q} | Alo17` : 'İlanlar | Alo17',
    description: q ? `“${q}” için ilanları keşfedin.` : 'Çanakkale’de tüm ilanları keşfedin.',
    robots: shouldNoindex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: {
      canonical: 'https://alo17.tr/ilanlar',
    },
  };
}

export default function IlanlarPage() {
  return <IlanlarClient />;
}

