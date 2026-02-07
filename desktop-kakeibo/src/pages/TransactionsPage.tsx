import { useEffect, useMemo, useState } from 'react';
import { db, listCategories, type CategoryRecord, type MoneyFlow, type TransactionRecord, type UserRecord } from '@/lib/db';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

type TxEditorState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; tx: TransactionRecord };

function yyyymm(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatTry(amount: number) {
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ₺`;
  }
}

function formatDateTr(ymd: string) {
  const d = new Date(`${ymd}T00:00:00`);
  try {
    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  } catch {
    return ymd;
  }
}

export function TransactionsPage({
  user,
  type,
  title,
}: {
  user: UserRecord;
  type: MoneyFlow;
  title: string;
}) {
  const [month, setMonth] = useState(() => yyyymm(new Date()));
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [cats, setCats] = useState<CategoryRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<TxEditorState>({ open: false });

  async function refresh() {
    const start = `${month}-01`;
    const end = `${month}-\uffff`;
    const [txs, categoryList] = await Promise.all([
      db.transactions.where('[userId+date]').between([user.id, start], [user.id, end]).toArray(),
      listCategories(user.id),
    ]);
    setCats(categoryList);
    setItems(txs);
  }

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, month]);

  const filtered = useMemo(() => {
    const query = q.trim().toLocaleLowerCase('tr-TR');
    return items
      .filter((t) => t.type === type)
      .filter((t) => (category === 'all' ? true : t.category === category))
      .filter((t) => {
        if (!query) return true;
        const hay = `${t.category} ${t.note}`.toLocaleLowerCase('tr-TR');
        return hay.includes(query);
      })
      .sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));
  }, [items, type, category, q]);

  const monthTotal = useMemo(() => filtered.reduce((acc, t) => acc + t.amount, 0), [filtered]);

  return (
    <div className="pageStack">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">{title}</h1>
          <div className="pageSub">Offline kayıtlarınızı ay bazında görüntüleyin ve yönetin</div>
        </div>
        <div className="pageActions">
          <input className="monthPicker" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <div className="searchBox">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." />
          </div>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Tüm Kategoriler</option>
            {cats.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon ? `${c.icon} ` : ''}{c.name}
              </option>
            ))}
          </select>
          <button className="btn btnPrimary" onClick={() => setEditor({ open: true, mode: 'create' })}>
            <Plus size={16} /> Yeni
          </button>
        </div>
      </div>

      {error ? <div className="alert alertError">{error}</div> : null}

      <div className="cardWhite">
        <div className="tableTopRow">
          <div className="mutedSmall">
            {filtered.length} kayıt • Toplam: <strong>{formatTry(monthTotal)}</strong>
          </div>
        </div>
        <div className="table">
          <div className="trTx th">
            <div>Kategori</div>
            <div>Not</div>
            <div>Tarih</div>
            <div className="right">Tutar</div>
            <div className="right">İşlemler</div>
          </div>
          {filtered.map((t) => (
            <div className="trTx" key={t.id}>
              <div className="catCell">
                <span className="catIcon">{iconForCategory(cats, t.category)}</span>
                <span>{t.category}</span>
              </div>
              <div className="mutedSmall">{t.note || '—'}</div>
              <div className="mutedSmall">{formatDateTr(t.date)}</div>
              <div className={`right amount ${t.type}`}>{formatTry(t.type === 'expense' ? -t.amount : t.amount)}</div>
              <div className="right actions">
                <button className="iconAction" title="Düzenle" onClick={() => setEditor({ open: true, mode: 'edit', tx: t })}>
                  <Pencil size={16} />
                </button>
                <button
                  className="iconAction danger"
                  title="Sil"
                  onClick={() => {
                    setBusy(true);
                    setError(null);
                    db.transactions
                      .delete(t.id)
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
        <TxEditor
          user={user}
          type={type}
          mode={editor.mode}
          tx={editor.mode === 'edit' ? editor.tx : null}
          categories={cats}
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

function iconForCategory(cats: CategoryRecord[], name: string) {
  const found = cats.find((c) => c.name === name);
  return found?.icon || '•';
}

function TxEditor({
  user,
  type,
  mode,
  tx,
  categories,
  onClose,
  onSaved,
}: {
  user: UserRecord;
  type: MoneyFlow;
  mode: 'create' | 'edit';
  tx: TransactionRecord | null;
  categories: CategoryRecord[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState<string>(tx ? String(tx.amount) : '');
  const [category, setCategory] = useState<string>(tx?.category ?? '');
  const [note, setNote] = useState<string>(tx?.note ?? '');
  const [date, setDate] = useState<string>(tx?.date ?? new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = mode === 'create' ? (type === 'income' ? 'Yeni Gelir' : 'Yeni Gider') : 'Kaydı Düzenle';

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
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
              const amt = Number(String(amount).replace(',', '.'));
              if (!Number.isFinite(amt) || amt <= 0) throw new Error('Tutar geçersiz.');
              if (!category.trim()) throw new Error('Kategori gerekli.');
              if (!date) throw new Error('Tarih gerekli.');

              if (mode === 'create') {
                const now = new Date().toISOString();
                const rec: TransactionRecord = {
                  id: crypto.randomUUID(),
                  userId: user.id,
                  type,
                  amount: amt,
                  category: category.trim(),
                  note: note.trim(),
                  date,
                  createdAt: now,
                };
                await db.transactions.add(rec);
              } else if (tx) {
                await db.transactions.update(tx.id, {
                  amount: amt,
                  category: category.trim(),
                  note: note.trim(),
                  date,
                });
              }

              onSaved();
            })()
              .catch((e) => setError(e instanceof Error ? e.message : 'Kaydedilemedi.'))
              .finally(() => setBusy(false));
          }}
        >
          <label className="fieldLight">
            <span>Tutar (₺)</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" autoFocus />
          </label>

          <label className="fieldLight">
            <span>Kategori</span>
            <div className="rowGap">
              <select className="selectWide" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Seçin…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon ? `${c.icon} ` : ''}{c.name}
                  </option>
                ))}
              </select>
              <input
                className="inputInline"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Yazabilirsiniz…"
              />
            </div>
          </label>

          <label className="fieldLight">
            <span>Not</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opsiyonel" />
          </label>

          <label className="fieldLight">
            <span>Tarih</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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

