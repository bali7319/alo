import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    alternates: { canonical: `https://alo17.tr/sozlesmeler/${id}` },
  };
}

export default function SozlesmeIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
