'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Search, DownloadCloud, Save } from 'lucide-react';

type Product = {
  id: string;
  connectionId: string;
  externalId: string;
  merchantSku: string | null;
  barcode: string | null;
  title: string | null;
  price: string | null;
  currency: string;
  stock: number | null;
  updatedAt: string;
  connection: { id: string; provider: string; name: string };
};

export default function ECommerceProductsPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<Record<string, string>>({});
  const [editStock, setEditStock] = useState<Record<string, string>>({});

  async function fetchProducts() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set('q', q.trim());
      sp.set('limit', '100');
      const res = await fetch(`/api/admin/marketplaces/products?${sp.toString()}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || data?.details || `Sunucu hatası (${res.status})`;
        setProducts([]);
        alert(`Ürünler yüklenemedi: ${msg}`);
        return;
      }
      const list = Array.isArray(data.products) ? data.products : [];
      setProducts(list);
      const priceMap: Record<string, string> = {};
      const stockMap: Record<string, string> = {};
      list.forEach((p: Product) => {
        priceMap[p.id] = p.price ?? '';
        stockMap[p.id] = p.stock != null ? String(p.stock) : '';
      });
      setEditPrice(priceMap);
      setEditStock(stockMap);
    } catch (e: any) {
      console.error(e);
      setProducts([]);
      alert(e?.message || 'Ürünler yüklenemedi (ağ hatası veya henüz sync yok).');
    } finally {
      setLoading(false);
    }
  }

  async function updateProductPriceStock(p: Product) {
    const priceVal = editPrice[p.id];
    const stockVal = editStock[p.id];
    const price = priceVal === '' ? null : priceVal;
    const stock = stockVal === '' ? null : (Number(stockVal) || null);
    if (price === (p.price ?? null) && (stock ?? null) === (p.stock ?? null)) return;
    setUpdatingId(p.id);
    try {
      const res = await fetch(`/api/admin/marketplaces/products/${encodeURIComponent(p.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, stock }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || data?.details || `Güncelleme başarısız (${res.status})`);
        return;
      }
      setProducts((prev) =>
        prev.map((x) =>
          x.id === p.id
            ? { ...x, price: price ?? null, stock: stock ?? null, updatedAt: new Date().toISOString() }
            : x
        )
      );
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Güncelleme başarısız');
    } finally {
      setUpdatingId(null);
    }
  }

  async function syncWoo() {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/marketplaces/sync/woocommerce', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Senkron başarısız');
      await fetchProducts();
      alert(`✅ Çekildi. Ürün: ${data.products}, Sipariş: ${data.orders}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Senkron başarısız');
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-600 mt-1">
            Pazaryerlerinden çekilen ürün cache’i. Önce <Link className="text-blue-600 hover:underline" href="/admin/eticaret/entegrasyonlar">entegrasyon</Link> ekleyip senkron başlatacağız.
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
            {syncing ? 'Çekiliyor…' : 'Woo Ürünleri Çek'}
          </button>
          <button
            onClick={fetchProducts}
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
              placeholder="SKU / barcode / başlık / externalId ara…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchProducts();
              }}
            />
          </div>
          <button
            onClick={fetchProducts}
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
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-600">Ürün bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kanal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.connection?.provider} / {p.connection?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{p.title || '-'}</div>
                      <div className="text-xs text-gray-500 mt-1">externalId: {p.externalId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.merchantSku || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.barcode || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        value={editPrice[p.id] ?? ''}
                        onChange={(e) => setEditPrice((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Fiyat"
                      />
                      <span className="ml-1 text-gray-500 text-xs">{p.currency}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        value={editStock[p.id] ?? ''}
                        onChange={(e) => setEditStock((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Stok"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        disabled={updatingId === p.id}
                        onClick={() => updateProductPriceStock(p)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {updatingId === p.id ? 'Kaydediliyor…' : 'Güncelle'}
                      </button>
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

