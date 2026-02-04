'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Search, DownloadCloud } from 'lucide-react';

type OrderItem = {
  id: string;
  title: string | null;
  quantity: number;
  merchantSku: string | null;
  barcode: string | null;
  unitPrice: string | null;
  totalPrice: string | null;
  currency: string;
};

type Order = {
  id: string;
  externalId: string;
  status: string;
  placedAt: string | null;
  buyerName: string | null;
  buyerEmail: string | null;
  shippingName: string | null;
  shippingCity: string | null;
  shippingDistrict: string | null;
  totalAmount: string | null;
  currency: string;
  connection: { provider: string; name: string };
  items: OrderItem[];
  labels: Array<{ id: string; format: string; createdAt: string }>;
  eInvoice: { id: string; status: string; provider: string } | null;
};

export default function ECommerceOrdersPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [syncing, setSyncing] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set('q', q.trim());
      sp.set('limit', '50');
      const res = await fetch(`/api/admin/marketplaces/orders?${sp.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (e) {
      console.error(e);
      alert('Siparişler yüklenemedi (henüz sync yoksa normal).');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncWoo() {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/marketplaces/sync/woocommerce', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Senkron başarısız');
      await fetchOrders();
      alert(`✅ Çekildi. Ürün: ${data.products}, Sipariş: ${data.orders}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Senkron başarısız');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-gray-600 mt-1">
            Pazaryerlerinden çekilen siparişler. Etiket/Fatura aksiyonlarını bir sonraki adımda ekleyeceğiz.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Önce <Link className="text-blue-600 hover:underline" href="/admin/eticaret/entegrasyonlar">entegrasyon</Link> ekleyip sync çalıştıracağız.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={syncWoo}
            disabled={syncing}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 flex items-center gap-2 disabled:opacity-50"
            type="button"
          >
            <DownloadCloud className="w-4 h-4" />
            {syncing ? 'Çekiliyor…' : 'Woo Siparişleri Çek'}
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            type="button"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Sipariş no / müşteri / email ara…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchOrders();
              }}
            />
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            type="button"
          >
            Ara
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Yükleniyor…</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-600">Sipariş bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kanal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiket</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {o.connection?.provider} / {o.connection?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{o.externalId}</div>
                      <div className="text-xs text-gray-500">
                        {o.placedAt ? new Date(o.placedAt).toLocaleString('tr-TR') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{o.buyerName || o.shippingName || '-'}</div>
                      <div className="text-xs text-gray-500">{o.buyerEmail || ''}</div>
                      <div className="text-xs text-gray-500">
                        {[o.shippingCity, o.shippingDistrict].filter(Boolean).join(' / ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{o.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {o.totalAmount ? `${o.totalAmount} ${o.currency}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {o.eInvoice ? `${o.eInvoice.provider} / ${o.eInvoice.status}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {o.labels?.length ? `${o.labels[0].format}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

