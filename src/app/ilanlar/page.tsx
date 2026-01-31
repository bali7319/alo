import type { Metadata } from 'next';
import IlanlarClient from './IlanlarClient';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.search === 'string' ? sp.search.trim() : '';
  const pageParam = typeof sp.page === 'string' ? sp.page.trim() : '';
  const pageNum = pageParam && /^\d+$/.test(pageParam) ? Math.max(1, parseInt(pageParam, 10)) : 1;

  // "Niteliksiz" sayfalar: arama filtreli /ilanlar?search=...
  // Always on (as agreed): keep search result pages out of index.
  // Also keep paginated pages out of index to avoid duplicate content.
  const shouldNoindex = q.length > 0 || pageNum > 1;

  return {
    title: q
      ? `İlanlar: ${q} | Alo17`
      : pageNum > 1
        ? `İlanlar (Sayfa ${pageNum}) | Alo17`
        : 'İlanlar | Alo17',
    description: q
      ? `“${q}” için ilanları keşfedin.`
      : pageNum > 1
        ? `Çanakkale’de tüm ilanları keşfedin. (Sayfa ${pageNum})`
        : 'Çanakkale’de tüm ilanları keşfedin.',
    robots: shouldNoindex
      ? // search pages: noindex,nofollow. paginated: noindex,follow.
        (q.length > 0 ? { index: false, follow: false } : { index: false, follow: true })
      : { index: true, follow: true },
    alternates: {
      canonical: 'https://alo17.tr/ilanlar',
    },
  };
}

export default function IlanlarPage() {
  return <IlanlarClient />;
}

