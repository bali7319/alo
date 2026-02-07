import { useEffect, useMemo, useState } from 'react';
import { clearSession, getSessionUserId, setSessionUserId } from '@/lib/session';
import { createUser, getUserByEmail, getUserById, type UserRecord } from '@/lib/db';
import { createSaltBase64, hashPasswordPBKDF2 } from '@/lib/crypto';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/features/shell/AppShell';
import { BudgetPage } from '@/pages/BudgetPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { IncomePage } from '@/pages/IncomePage';
import { ExpensesPage } from '@/pages/ExpensesPage';

type AuthView = 'login' | 'register';

export function AuthGate() {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AuthView>('login');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const id = getSessionUserId();
        if (!id) return;
        const u = await getUserById(id);
        if (u) setUser(u);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const header = useMemo(() => {
    return (
      <header className="appHeader">
        <div className="brand">
          <div className="brandMark">K</div>
          <div>
            <div className="brandName">Kakeibo Offline</div>
            <div className="brandSub">İnternetsiz kişisel gelir/gider takibi</div>
          </div>
        </div>
        {user ? (
          <div className="userChip" title={user.email}>
            {user.email}
            <button
              className="btn btnGhost"
              onClick={() => {
                clearSession();
                setUser(null);
              }}
            >
              Çıkış
            </button>
          </div>
        ) : null}
      </header>
    );
  }, [user]);

  if (loading) {
    return (
      <div className="page">
        {header}
        <main className="container">
          <div className="card">
            <div className="skeletonTitle" />
            <div className="skeletonLine" />
            <div className="skeletonLine" />
          </div>
        </main>
      </div>
    );
  }

  if (user) {
    return (
      <Routes>
        <Route
          element={
            <AppShell
              user={user}
              onLogout={() => {
                clearSession();
                setUser(null);
              }}
            />
          }
        >
          <Route index element={<Navigate to="/budget" replace />} />
          <Route path="/budget" element={<BudgetPage user={user} />} />
          <Route path="/categories" element={<CategoriesPage user={user} />} />
          <Route path="/income" element={<IncomePage user={user} />} />
          <Route path="/expenses" element={<ExpensesPage user={user} />} />
          <Route path="/shared" element={<PlaceholderPage title="Paylaşım Bütçeler" />} />
          <Route path="/joint" element={<PlaceholderPage title="Ortak Hesap" />} />
          <Route path="/goals" element={<PlaceholderPage title="Hedefler" />} />
          <Route path="/calendar" element={<PlaceholderPage title="Takvim" />} />
          <Route path="*" element={<Navigate to="/budget" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="page">
      {header}
      <main className="container">
        <div className="grid2">
          <div className="card">
            <h1>Hoş geldiniz</h1>
            <p className="muted">
              Bu uygulama tamamen <strong>offline</strong> çalışır. Verileriniz bu bilgisayarda saklanır
              (IndexedDB).
            </p>

            <div className="tabs">
              <button
                className={`tab ${view === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setError(null);
                  setView('login');
                }}
              >
                Giriş Yap
              </button>
              <button
                className={`tab ${view === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setError(null);
                  setView('register');
                }}
              >
                Kayıt Ol
              </button>
            </div>

            {error ? <div className="alert alertError">{error}</div> : null}

            {view === 'login' ? (
              <LoginForm
                onLogin={async (email, password) => {
                  setError(null);
                  const u = await getUserByEmail(email);
                  if (!u) throw new Error('Kullanıcı bulunamadı.');
                  const hash = await hashPasswordPBKDF2(password, u.salt);
                  if (hash !== u.passwordHash) throw new Error('E-posta veya şifre hatalı.');
                  setSessionUserId(u.id);
                  setUser(u);
                }}
              />
            ) : (
              <RegisterForm
                onRegister={async ({ email, password, accepted }) => {
                  setError(null);
                  if (!accepted) throw new Error('Devam etmek için sözleşmeyi kabul etmelisiniz.');
                  const existing = await getUserByEmail(email);
                  if (existing) throw new Error('Bu e-posta ile zaten kayıt var.');

                  const id = crypto.randomUUID();
                  const salt = createSaltBase64();
                  const passwordHash = await hashPasswordPBKDF2(password, salt);
                  const now = new Date().toISOString();
                  const record: UserRecord = {
                    id,
                    email: email.trim().toLowerCase(),
                    salt,
                    passwordHash,
                    acceptedTermsAt: now,
                    createdAt: now,
                  };
                  await createUser(record);
                  setSessionUserId(id);
                  setUser(record);
                }}
              />
            )}
          </div>

          <div className="card subtle">
            <h2>Gizlilik</h2>
            <ul className="list">
              <li>Verileriniz bu cihazda kalır, internete gönderilmez.</li>
              <li>Şifreniz PBKDF2 ile türetilmiş hash olarak saklanır.</li>
              <li>Yedeklemek için ileride “Dışa Aktar” ekleyebiliriz.</li>
            </ul>

            <h2 className="mt">Sözleşme (özet)</h2>
            <p className="muted">
              Uygulama “olduğu gibi” sunulur. Verilerin yedeklenmesi ve cihaz güvenliği kullanıcı
              sorumluluğundadır.
            </p>
          </div>
        </div>
      </main>
    </div>
  );

  async function safeAction<T>(fn: () => Promise<T>) {
    try {
      return await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Bir hata oluştu.';
      setError(msg);
      throw e;
    }
  }

  function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);

    return (
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          safeAction(() => onLogin(email, password)).finally(() => setBusy(false));
        }}
      >
        <label className="field">
          <span>E-posta</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="field">
          <span>Şifre</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </button>
      </form>
    );
  }

  function RegisterForm({
    onRegister,
  }: {
    onRegister: (args: { email: string; password: string; accepted: boolean }) => Promise<void>;
  }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [busy, setBusy] = useState(false);

    return (
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          safeAction(() => onRegister({ email, password, accepted })).finally(() => setBusy(false));
        }}
      >
        <label className="field">
          <span>E-posta</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Şifre</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            minLength={6}
            required
          />
        </label>
        <label className="checkRow">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>
            <strong>Aydınlatma Metni</strong> ve <strong>Kullanıcı Sözleşmesi</strong>’ni okudum ve kabul
            ediyorum.
          </span>
        </label>
        <button className="btn" disabled={busy}>
          {busy ? 'Kayıt yapılıyor…' : 'Kayıt Ol'}
        </button>
      </form>
    );
  }
}

