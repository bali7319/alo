import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/features/shell/Sidebar';
import type { UserRecord } from '@/lib/db';

export function AppShell({ user, onLogout }: { user: UserRecord; onLogout: () => void }) {
  return (
    <div className="appFrame">
      <Sidebar />
      <div className="appMain">
        <header className="topbar">
          <div className="topbarLeft">
            <div className="topbarTitle">Kakeibo Offline</div>
          </div>
          <div className="topbarRight">
            <div className="topbarUser" title={user.email}>
              {user.email}
            </div>
            <button className="btn btnGhost" onClick={onLogout}>
              Çıkış
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

