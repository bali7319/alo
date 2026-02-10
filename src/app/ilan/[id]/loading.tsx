import { Skeleton } from '@/components/ui/skeleton';

export default function IlanDetayLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="py-3 sm:py-4 flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Sol kolon - başlık + galeri + açıklama */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-8 w-full max-w-md mb-2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-10 w-28 shrink-0" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="w-full aspect-[4/3] rounded-lg" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-14 w-14 rounded" />
                <Skeleton className="h-14 w-14 rounded" />
                <Skeleton className="h-14 w-14 rounded" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          {/* Sağ kolon - iletişim kutusu */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <Skeleton className="h-10 w-24 mb-4" />
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
