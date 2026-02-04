'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Trash2, TestTube2 } from 'lucide-react';

type Provider = 'trendyol' | 'hepsiburada' | 'n11' | 'pazarama' | 'woocommerce';

type Connection = {
  id: string;
  provider: Provider;
  name: string;
  isActive: boolean;
  credentialsHint: string | null;
  metadata: any;
  lastTestAt: string | null;
  lastTestOk: boolean;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

const providerLabels: Record<Provider, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  n11: 'N11',
  pazarama: 'Pazarama',
  woocommerce: 'WooCommerce',
};

export default function ECommerceIntegrationsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    provider: Provider;
    name: string;
    isActive: boolean;
    credentialsJson: string;
    credentialsHint: string;
    metadataJson: string;
  }>({
    provider: 'trendyol',
    name: '',
    isActive: true,
    credentialsJson: '{\n  \n}',
    credentialsHint: '',
    metadataJson: '{\n  \n}',
  });

  const canSubmit = useMemo(() => form.name.trim().length >= 2 && !saving, [form.name, saving]);

  async function fetchConnections() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketplaces/connections', { cache: 'no-store' });
      const data = await res.json();
      setConnections(Array.isArray(data.connections) ? data.connections : []);
    } catch (e) {
      console.error(e);
      alert('Bağlantılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConnections();
  }, []);

  async function createConnection() {
    setSaving(true);
    try {
      const credentials = JSON.parse(form.credentialsJson || '{}');
      const metadata = JSON.parse(form.metadataJson || '{}');

      const res = await fetch('/api/admin/marketplaces/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: form.provider,
          name: form.name.trim(),
          isActive: form.isActive,
          credentials,
          credentialsHint: form.credentialsHint.trim() || undefined,
          metadata,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.details || data?.error || 'Kayıt başarısız');

      setForm((f) => ({ ...f, name: '' }));
      await fetchConnections();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  async function deleteConnection(id: string) {
    if (!confirm('Bu bağlantı silinsin mi?')) return;
    try {
      const res = await fetch(`/api/admin/marketplaces/connections/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Silinemedi');
      }
      await fetchConnections();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Silinemedi');
    }
  }

  async function testConnection(id: string) {
    setTestingId(id);
    try {
      const res = await fetch(`/api/admin/marketplaces/connections/${id}/test`, { method: 'POST' });
      const data = await res.json();
      alert(data?.ok ? `✅ Test OK: ${data?.message || ''}` : `❌ Test başarısız: ${data?.message || ''}`);
      await fetchConnections();
    } catch (e) {
      console.error(e);
      alert('Test çağrısı başarısız');
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E‑Ticaret Entegrasyonları</h1>
          <p className="text-gray-600 mt-1">Trendyol, Hepsiburada, N11, Pazarama, WooCommerce bağlantılarını yönetin</p>
        </div>
        <button
          onClick={fetchConnections}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          type="button"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Yeni Bağlantı</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kanal</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as Provider }))}
            >
              {Object.entries(providerLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bağlantı adı</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="örn: Trendyol-1 / HB-Canli / Woo-Store"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Credential (JSON)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm min-h-[140px]"
              value={form.credentialsJson}
              onChange={(e) => setForm((f) => ({ ...f, credentialsJson: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">Bu veri veritabanında şifreli saklanır.</p>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Metadata (JSON) (opsiyonel)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm min-h-[110px]"
              value={form.metadataJson}
              onChange={(e) => setForm((f) => ({ ...f, metadataJson: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İpucu (maskeli)</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.credentialsHint}
              onChange={(e) => setForm((f) => ({ ...f, credentialsHint: e.target.value }))}
              placeholder="örn: sellerId=12345"
            />
          </div>

          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Aktif
            </label>
            <button
              onClick={createConnection}
              disabled={!canSubmit}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              type="button"
            >
              <Plus className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Bağlantılar</h2>
          <div className="text-sm text-gray-500">{connections.length} kayıt</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Yükleniyor…</div>
        ) : connections.length === 0 ? (
          <div className="p-8 text-center text-gray-600">Henüz bağlantı yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kanal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son test</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {connections.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{providerLabels[c.provider]}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.credentialsHint || ''}</div>
                      {c.lastError ? <div className="text-xs text-red-600 mt-1">{c.lastError}</div> : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.isActive ? 'Evet' : 'Hayır'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {c.lastTestAt ? (
                        <div className={c.lastTestOk ? 'text-green-700' : 'text-red-700'}>
                          {new Date(c.lastTestAt).toLocaleString('tr-TR')}
                        </div>
                      ) : (
                        <div className="text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => testConnection(c.id)}
                          disabled={testingId === c.id}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                          type="button"
                          title="Test et"
                        >
                          <TestTube2 className="w-4 h-4" />
                          Test
                        </button>
                        <button
                          onClick={() => deleteConnection(c.id)}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 text-red-700 flex items-center gap-2"
                          type="button"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                          Sil
                        </button>
                      </div>
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

