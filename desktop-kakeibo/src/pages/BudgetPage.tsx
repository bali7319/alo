import { useEffect, useMemo, useState } from 'react';
import type { TransactionRecord, UserRecord } from '@/lib/db';
import { db } from '@/lib/db';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

function yyyymm(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  try {
    return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(d);
  } catch {
    return ym;
  }
}

function formatTry(amount: number) {
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ₺`;
  }
}

function sumBy(list: TransactionRecord[], type: 'income' | 'expense') {
  return list.reduce((acc, t) => acc + (t.type === type ? t.amount : 0), 0);
}

const PIE_COLORS = ['#2563eb', '#f97316', '#16a34a', '#9333ea', '#0891b2', '#e11d48', '#a3a3a3'];

export function BudgetPage({ user }: { user: UserRecord }) {
  const [month, setMonth] = useState(() => yyyymm(new Date()));
  const [monthTx, setMonthTx] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    const start = `${month}-01`;
    const end = `${month}-\uffff`;
    db.transactions
      .where('[userId+date]')
      .between([user.id, start], [user.id, end])
      .toArray()
      .then((xs) => setMonthTx(xs))
      .catch(() => setMonthTx([]));
  }, [user.id, month]);

  // Build last 12 months series
  const series = useMemo(() => {
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(yyyymm(d));
    }
    return months.map((ym) => ({ ym, label: monthLabel(ym), income: 0, expense: 0 }));
  }, []);

  useEffect(() => {
    // aggregate all tx for last 12 months
    const fromYm = series[0]?.ym;
    const toYm = series[series.length - 1]?.ym;
    if (!fromYm || !toYm) return;

    const start = `${fromYm}-01`;
    const end = `${toYm}-\uffff`;
    db.transactions
      .where('[userId+date]')
      .between([user.id, start], [user.id, end])
      .toArray()
      .then((xs) => {
        const map = new Map(series.map((s) => [s.ym, { ...s }]));
        for (const t of xs) {
          const ym = t.date.slice(0, 7);
          const cur = map.get(ym);
          if (!cur) continue;
          if (t.type === 'income') cur.income += t.amount;
          else cur.expense += t.amount;
          map.set(ym, cur);
        }
        // Keep original order
        const next = series.map((s) => map.get(s.ym) ?? s);
        // Update via state setter pattern: local memo series is stable; store in ref state
        setChartSeries(next);
      })
      .catch(() => setChartSeries(series));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, series]);

  const [chartSeries, setChartSeries] = useState(series);

  const income = useMemo(() => sumBy(monthTx, 'income'), [monthTx]);
  const expense = useMemo(() => sumBy(monthTx, 'expense'), [monthTx]);
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.max(0, Math.min(100, Math.round(((income - expense) / income) * 100))) : 0;

  const byIncomeCategory = useMemo(() => aggregatePie(monthTx.filter((t) => t.type === 'income')), [monthTx]);
  const byExpenseCategory = useMemo(() => aggregatePie(monthTx.filter((t) => t.type === 'expense')), [monthTx]);

  return (
    <div className="pageStack">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Bütçe</h1>
          <div className="pageSub">{monthLabel(month)} • Aylık gelir ve gider analizini görüntüleyin</div>
        </div>
        <div className="pageActions">
          <input
            className="monthPicker"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="cardsRow">
        <StatCard title="Toplam Gelir" value={formatTry(income)} tone="green" />
        <StatCard title="Toplam Gider" value={formatTry(expense)} tone="red" />
        <StatCard title="Net Bakiye" value={formatTry(balance)} tone="neutral" sub="Dengeli bütçe" />
        <StatCard title="Tasarruf Oranı" value={`%${savingsRate}`} tone="blue" progress={savingsRate} />
        <StatCard title="Paylaşım Bütçe" value={formatTry(0)} tone="neutral" sub="Katkı yok" />
      </div>

      <div className="cardWhite">
        <div className="cardTitle">Aylık Gelir vs Gider</div>
        <div className="chartBox">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartSeries}>
              <CartesianGrid stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={2} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatTry(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="income" name="Gelir" stroke="#16a34a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid2Wide">
        <div className="cardWhite">
          <div className="cardTitle">Gelir Dağılımı</div>
          {byIncomeCategory.length === 0 ? (
            <div className="emptyChart">Bu dönemde gelir verisi yok</div>
          ) : (
            <PieBlock data={byIncomeCategory} />
          )}
        </div>
        <div className="cardWhite">
          <div className="cardTitle">Gider Dağılımı</div>
          {byExpenseCategory.length === 0 ? (
            <div className="emptyChart">Bu dönemde gider verisi yok</div>
          ) : (
            <PieBlock data={byExpenseCategory} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  tone,
  progress,
}: {
  title: string;
  value: string;
  sub?: string;
  tone: 'green' | 'red' | 'blue' | 'neutral';
  progress?: number;
}) {
  return (
    <div className={`statCard ${tone}`}>
      <div className="statTitle">{title}</div>
      <div className="statValue">{value}</div>
      {typeof progress === 'number' ? (
        <div className="progress">
          <div className="progressBar" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {sub ? <div className="statSub">{sub}</div> : null}
    </div>
  );
}

function PieBlock({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="chartBox">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatTry(Number(v))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function aggregatePie(list: TransactionRecord[]) {
  const map = new Map<string, number>();
  for (const t of list) {
    const key = t.category || 'Diğer';
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

