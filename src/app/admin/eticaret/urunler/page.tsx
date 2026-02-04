'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Search } from 'lucide-react';

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

  async function fetchProducts() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set('q', q.trim());
      sp.set('limit', '100');
      const res = await fetch(`/api/admin/marketplaces/products?${sp.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (e) {
      console.error(e);
      alert('Ürünler yüklenemedi (henüz sync yoksa normal).');
    } finally {
      setLoading(false);
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
        <button
          onClick={fetchProducts}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          type="button"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {p.price ? `${p.price} ${p.currency}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{p.stock ?? '-'}</td>
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

