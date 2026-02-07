import { useEffect, useMemo, useState } from 'react';
import { createCategory, deleteCategory, listCategories, updateCategory, type CategoryRecord, type UserRecord } from '@/lib/db';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

type EditorState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; category: CategoryRecord };

export function CategoriesPage({ user }: { user: UserRecord }) {
  const [items, setItems] = useState<CategoryRecord[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ open: false });

  async function refresh() {
    const cats = await listCategories(user.id);
    setItems(cats);
  }

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const filtered = useMemo(() => {
    const query = q.trim().toLocaleLowerCase('tr-TR');
    if (!query) return items;
    return items.filter((c) => c.name.toLocaleLowerCase('tr-TR').includes(query));
  }, [items, q]);

  return (
    <div className="pageStack">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Kategoriler</h1>
          <div className="pageSub">Gelir ve gider kategorilerinizi yönetin</div>
        </div>
        <div className="pageActions">
          <div className="searchBox">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kategori ara..." />
          </div>
          <button className="btn btnPrimary" onClick={() => setEditor({ open: true, mode: 'create' })}>
            <Plus size={16} /> Yeni Kategori
          </button>
        </div>
      </div>

      {error ? <div className="alert alertError">{error}</div> : null}

      <div className="cardWhite">
        <div className="tableTop">
          <div className="mutedSmall">{filtered.length} kayıt</div>
        </div>
        <div className="table">
          <div className="tr th">
            <div>Kategori Adı</div>
            <div>Oluşturma Tarihi</div>
            <div className="right">İşlemler</div>
          </div>
          {filtered.map((c) => (
            <div className="tr" key={c.id}>
              <div className="catCell">
                <span className="catIcon">{c.icon || '•'}</span>
                <span>{c.name}</span>
              </div>
              <div className="mutedSmall">{formatDateTimeTr(c.createdAt)}</div>
              <div className="right actions">
                <button className="iconAction" title="Düzenle" onClick={() => setEditor({ open: true, mode: 'edit', category: c })}>
                  <Pencil size={16} />
                </button>
                <button
                  className="iconAction danger"
                  title="Sil"
                  onClick={() => {
                    setBusy(true);
                    setError(null);
                    deleteCategory(c.id)
                      .then(refresh)
                      .catch((e) => setError(e instanceof Error ? e.message : 'Silinemedi.'))
                      .finally(() => setBusy(false));
                  }}
                  disabled={busy}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 ? <div className="empty">Kayıt yok.</div> : null}
        </div>
      </div>

      {editor.open ? (
        <CategoryEditor
          user={user}
          mode={editor.mode}
          category={editor.mode === 'edit' ? editor.category : null}
          onClose={() => setEditor({ open: false })}
          onSaved={() => {
            setEditor({ open: false });
            refresh().catch(() => {});
          }}
        />
      ) : null}
    </div>
  );
}

function CategoryEditor({
  user,
  mode,
  category,
  onClose,
  onSaved,
}: {
  user: UserRecord;
  mode: 'create' | 'edit';
  category: CategoryRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHeader">
          <div className="modalTitle">{mode === 'create' ? 'Yeni Kategori' : 'Kategori Düzenle'}</div>
          <button className="iconAction" onClick={onClose} title="Kapat">
            <X size={18} />
          </button>
        </div>

        {error ? <div className="alert alertError">{error}</div> : null}

        <form
          className="formGrid"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            (async () => {
              if (!name.trim()) throw new Error('Kategori adı gerekli.');
              const now = new Date().toISOString();

              if (mode === 'create') {
                const rec: CategoryRecord = {
                  id: crypto.randomUUID(),
                  userId: user.id,
                  name: name.trim(),
                  icon: icon.trim(),
                  createdAt: now,
                  updatedAt: now,
                };
                await createCategory(rec);
              } else if (category) {
                await updateCategory(category.id, { name: name.trim(), icon: icon.trim() });
              }

              onSaved();
            })()
              .catch((e) => setError(e instanceof Error ? e.message : 'Kaydedilemedi.'))
              .finally(() => setBusy(false));
          }}
        >
          <label className="fieldLight">
            <span>Kategori Adı</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>

          <label className="fieldLight">
            <span>İkon (emoji)</span>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="örn: 🛒" />
          </label>

          <div className="modalActions">
            <button type="button" className="btn btnGhostLight" onClick={onClose}>
              İptal
            </button>
            <button className="btn btnPrimary" disabled={busy}>
              {busy ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateTimeTr(iso: string) {
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
}

