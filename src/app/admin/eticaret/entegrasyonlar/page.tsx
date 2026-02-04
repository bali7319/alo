'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';

type Provider = 'trendyol' | 'hepsiburada' | 'n11' | 'pazarama' | 'woocommerce';

const providerLabels: Record<Provider, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  n11: 'N11',
  pazarama: 'Pazarama',
  woocommerce: 'WooCommerce',
};

export default function ECommerceIntegrationsPage() {
  const [provider, setProvider] = useState<Provider>('woocommerce');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteForProvider, setDeleteForProvider] = useState(false);

  const [existingMasked, setExistingMasked] = useState<{ baseUrl?: string; keyMasked?: string; secretMasked?: string } | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  const [form, setForm] = useState<{ baseUrl: string; key: string; secret: string }>({
    baseUrl: '',
    key: '',
    secret: '',
  });

  const canSubmit = useMemo(() => !saving, [saving]);

  async function loadProvider(p: Provider) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marketplaces/connections/provider/${p}`, { cache: 'no-store' });
      const data = await res.json();
      setExistingId(data?.connection?.id || null);
      setExistingMasked(data?.credentials || null);
      // baseUrl'yi doldur, key/secret boş kalsın (yenileyince eskiyi korur)
      setForm((f) => ({ ...f, baseUrl: data?.credentials?.baseUrl || '' , key: '', secret: '' }));
    } catch (e) {
      console.error(e);
      setExistingId(null);
      setExistingMasked(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProvider(provider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  async function saveConnection() {
    setSaving(true);
    try {
      if (deleteForProvider && existingId) {
        const resDel = await fetch(`/api/admin/marketplaces/connections/${existingId}`, { method: 'DELETE' });
        const dataDel = await resDel.json().catch(() => ({}));
        if (!resDel.ok) throw new Error(dataDel?.details || dataDel?.error || 'Silinemedi');
        setDeleteForProvider(false);
        await loadProvider(provider);
        return;
      }

      const res = await fetch('/api/admin/marketplaces/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          isActive: true,
          credentials: {
            baseUrl: form.baseUrl,
            consumerKey: form.key,
            consumerSecret: form.secret,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.details || data?.error || 'Kayıt başarısız');
      setDeleteForProvider(false);
      await loadProvider(provider);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pazar Yerleri Entegrasyon Ayarları</h1>
        <p className="text-gray-600 mt-1">Lütfen pazar yeri seçiniz ve API bilgilerini giriniz.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pazaryeri</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
            >
              {Object.entries(providerLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={deleteForProvider}
            onChange={(e) => setDeleteForProvider(e.target.checked)}
          />
          Bu pazaryeri için API bilgilerini sil
        </label>

        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-center">
            <div className="text-sm text-gray-600 font-medium">Key</div>
            <input
              className="lg:col-span-3 w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={existingMasked?.keyMasked ? existingMasked.keyMasked : 'ck_...'}
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              disabled={deleteForProvider}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-center">
            <div className="text-sm text-gray-600 font-medium">Secret Key</div>
            <input
              className="lg:col-span-3 w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={existingMasked?.secretMasked ? existingMasked.secretMasked : 'cs_...'}
              value={form.secret}
              onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
              disabled={deleteForProvider}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-center">
            <div className="text-sm text-gray-600 font-medium">Store Url</div>
            <input
              className="lg:col-span-3 w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="https://example.com"
              value={form.baseUrl}
              onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
              disabled={deleteForProvider}
            />
          </div>
        </div>

        <button
          onClick={saveConnection}
          disabled={!canSubmit || loading}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          type="button"
        >
          <span>Kaydet</span>
          <Save className="w-4 h-4" />
        </button>

        <div className="text-xs text-gray-500">
          {loading ? 'Yükleniyor…' : existingId ? 'Kayıt mevcut (secret maskeli gösterilir).' : 'Bu pazaryeri için henüz kayıt yok.'}
        </div>
      </div>
    </div>
  );
}

