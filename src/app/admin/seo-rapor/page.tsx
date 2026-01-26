'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCcw, Trash2, Link2 } from 'lucide-react';

type Row = {
  href: string;
  count: number;
  lastAt?: string;
  source?: string | null;
  listingId?: string | null;
};

export default function AdminSeoRaporPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';

  const fetchReport = async (isManual = false) => {
    try {
      isManual ? setRefreshing(true) : setLoading(true);
      const res = await fetch(`/api/admin/seo-report?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Rapor alınamadı');
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch (e) {
      console.error(e);
      alert('SEO raporu alınamadı.');
      setRows([]);
    } finally {
      isManual ? setRefreshing(false) : setLoading(false);
    }
  };

  const clearReport = async () => {
    if (!confirm('Link takip verileri temizlensin mi?')) return;
    setClearing(true);
    try {
      const res = await fetch('/api/admin/seo-report?confirm=1', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Temizlenemedi');
      await fetchReport(true);
    } catch (e) {
      console.error(e);
      alert('Temizleme başarısız.');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !isAdmin) {
      router.push(`/giris?callbackUrl=${encodeURIComponent('/admin/seo-rapor')}`);
      return;
    }
    fetchReport(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.email]);

  const totalClicks = useMemo(() => rows.reduce((acc, r) => acc + (r.count || 0), 0), [rows]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Admin yetkisi gerekli...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Link2 className="h-6 w-6 text-indigo-600" />
              SEO Raporu (Link Takip)
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              İlan açıklamasındaki dış link tıklama sayıları. (Link Takip açıkken birikir.)
            </p>
            <div className="text-sm text-gray-700 mt-2">
              Toplam link: <strong>{rows.length}</strong> • Toplam tıklama: <strong>{totalClicks}</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchReport(true)} disabled={refreshing}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button variant="destructive" onClick={clearReport} disabled={clearing}>
              <Trash2 className="h-4 w-4 mr-2" />
              Temizle
            </Button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-700">
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3 whitespace-nowrap">Tıklama</th>
                  <th className="px-4 py-3 whitespace-nowrap">Son</th>
                  <th className="px-4 py-3">Kaynak</th>
                  <th className="px-4 py-3">İlan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-600" colSpan={5}>
                      Henüz veri yok. (Link Takip kapalıysa birikmez.)
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.href} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <a
                          href={r.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline underline-offset-4 break-all inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {r.href}
                        </a>
                      </td>
                      <td className="px-4 py-3 font-semibold">{r.count ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {r.lastAt ? new Date(r.lastAt).toLocaleString('tr-TR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.source || '-'}</td>
                      <td className="px-4 py-3">
                        {r.listingId ? (
                          <Link href={`/ilan/${r.listingId}`} className="text-indigo-600 hover:underline underline-offset-4">
                            {r.listingId}
                          </Link>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

