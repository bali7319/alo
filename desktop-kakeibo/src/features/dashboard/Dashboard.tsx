import { useEffect, useMemo, useState } from 'react';
import { db, type MoneyFlow, type TransactionRecord, type UserRecord } from '@/lib/db';

type TxDraft = {
  type: MoneyFlow;
  amount: string;
  category: string;
  note: string;
  date: string;
};

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTry(amount: number) {
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ₺`;
  }
}

export function Dashboard({ user, onLogout }: { user: UserRecord; onLogout: () => void }) {
  const [txs, setTxs] = useState<TransactionRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<TxDraft>({
    type: 'expense',
    amount: '',
    category: '',
    note: '',
    date: todayYmd(),
  });

  async function refresh() {
    const items = await db.transactions
      .where('[userId+createdAt]')
      .between([user.id, ''], [user.id, '\uffff'])
      .reverse()
      .toArray();
    setTxs(items);
  }

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of txs) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [txs]);

  return (
    <div className="stack">
      <section className="card">
        <div className="rowBetween">
          <div>
            <h2 style={{ margin: 0 }}>Panel</h2>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {user.email} • Offline veritabanı: IndexedDB
            </div>
          </div>
          <button className="btn btnGhost" onClick={onLogout}>
            Çıkış
          </button>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="muted">Gelir</div>
            <div className="statVal">{formatTry(totals.income)}</div>
          </div>
          <div className="stat">
            <div className="muted">Gider</div>
            <div className="statVal">{formatTry(totals.expense)}</div>
          </div>
          <div className="stat">
            <div className="muted">Bakiye</div>
            <div className="statVal">{formatTry(totals.balance)}</div>
          </div>
        </div>
      </section>

      <section className="grid2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Yeni kayıt</h3>
          {error ? <div className="alert alertError">{error}</div> : null}

          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              setBusy(true);
              setError(null);
              (async () => {
                const amount = Number(String(draft.amount).replace(',', '.'));
                if (!Number.isFinite(amount) || amount <= 0) throw new Error('Tutar geçersiz.');
                if (!draft.category.trim()) throw new Error('Kategori gerekli.');
                if (!draft.date) throw new Error('Tarih gerekli.');

                const now = new Date().toISOString();
                const rec: TransactionRecord = {
                  id: crypto.randomUUID(),
                  userId: user.id,
                  type: draft.type,
                  amount,
                  category: draft.category.trim(),
                  note: draft.note.trim(),
                  date: draft.date,
                  createdAt: now,
                };
                await db.transactions.add(rec);
                setDraft((d) => ({ ...d, amount: '', note: '' }));
                await refresh();
              })()
                .catch((e) => setError(e instanceof Error ? e.message : 'Hata oluştu.'))
                .finally(() => setBusy(false));
            }}
          >
            <div className="seg">
              <button
                type="button"
                className={`segBtn ${draft.type === 'expense' ? 'active' : ''}`}
                onClick={() => setDraft((d) => ({ ...d, type: 'expense' }))}
              >
                Gider
              </button>
              <button
                type="button"
                className={`segBtn ${draft.type === 'income' ? 'active' : ''}`}
                onClick={() => setDraft((d) => ({ ...d, type: 'income' }))}
              >
                Gelir
              </button>
            </div>

            <label className="field">
              <span>Tutar (₺)</span>
              <input
                inputMode="decimal"
                placeholder="örn: 250"
                value={draft.amount}
                onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span>Kategori</span>
              <input
                placeholder="örn: Market, Kira, Maaş"
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span>Not (opsiyonel)</span>
              <input
                placeholder="örn: haftalık alışveriş"
                value={draft.note}
                onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
              />
            </label>

            <label className="field">
              <span>Tarih</span>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                required
              />
            </label>

            <button className="btn" disabled={busy}>
              {busy ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </form>
        </div>

        <div className="card subtle">
          <h3 style={{ marginTop: 0 }}>Kayıtlar</h3>
          {txs.length === 0 ? (
            <p className="muted">Henüz kayıt yok.</p>
          ) : (
            <div className="txList">
              {txs.slice(0, 200).map((t) => (
                <div key={t.id} className="txRow">
                  <div className="txLeft">
                    <div className="txTop">
                      <span className="txCat">{t.category}</span>
                      <span className="txDate">{t.date}</span>
                    </div>
                    {t.note ? <div className="txNote muted">{t.note}</div> : null}
                  </div>
                  <div className={`txAmount ${t.type}`}>{formatTry(t.type === 'expense' ? -t.amount : t.amount)}</div>
                  <button
                    className="iconBtn"
                    title="Sil"
                    onClick={() => {
                      setBusy(true);
                      db.transactions
                        .delete(t.id)
                        .then(refresh)
                        .finally(() => setBusy(false));
                    }}
                  >
                    Sil
                  </button>
                </div>
              ))}
              {txs.length > 200 ? <div className="muted">(+{txs.length - 200} daha)</div> : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

