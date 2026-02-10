import { Skeleton } from '@/components/ui/skeleton';

/** Global loading: sayfa geçişlerinde anında gösterilir, boş ekran önlenir */
export default function GlobalLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
      <Skeleton className="h-8 w-3/4 max-w-md mb-4 rounded" />
      <Skeleton className="h-4 w-full max-w-sm mb-2 rounded" />
      <Skeleton className="h-4 w-2/3 max-w-xs rounded" />
    </div>
  );
}
