'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminStats() {
  const { data, error, isLoading } = useSWR('/api/admin/stats', fetcher);

  if (isLoading) return <div>Yükleniyor...</div>;
  if (error || data?.error) return <div>Hata: {data?.error || error?.message}</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      <StatBox label="Toplam Kullanıcı" value={data.totalUsers} />
      <StatBox label="Toplam İlan" value={data.totalListings} />
      <StatBox label="Aktif İlan" value={data.activeListings} />
      <StatBox label="Bekleyen İlan" value={data.pendingListings} />
      <StatBox label="Reddedilen İlan" value={data.rejectedListings} />
      <StatBox label="Premium İlan" value={data.premiumListings} />
      <StatBox label="Toplam Görüntülenme" value={data.totalViews} />
      <StatBox label="Toplam Mesaj" value={data.totalMessages} />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded shadow p-6 text-center">
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
} 
