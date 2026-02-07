import type { Metadata } from 'next';

/**
 * Alt sayfalar (sikayet, yorumlar) ana ilan URL'sini canonical olarak kullanır.
 * Ana ilan sayfası kendi generateMetadata ile slug'lı canonical'ı override eder.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    alternates: { canonical: `https://alo17.tr/ilan/${id}` },
  };
}

export default function IlanIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
