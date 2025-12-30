import IlanOnizlePageContent from './IlanOnizleClient';

// Server component wrapper - ID'yi prop olarak geçir
export default async function IlanOnizlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <IlanOnizlePageContent id={id} />;
}
