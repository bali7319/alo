import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
  CalendarDays,
  Target,
  Users,
  Share2,
} from 'lucide-react';

const items = [
  { to: '/', label: 'Ana Sayfa', icon: LayoutDashboard },
  { to: '/income', label: 'Gelirler', icon: ArrowUpCircle },
  { to: '/expenses', label: 'Giderler', icon: ArrowDownCircle },
  { to: '/budget', label: 'Bütçe', icon: Wallet },
  { to: '/shared', label: 'Paylaşım Bütçeler', icon: Share2 },
  { to: '/joint', label: 'Ortak Hesap', icon: Users },
  { to: '/goals', label: 'Hedefler', icon: Target },
  { to: '/categories', label: 'Kategoriler', icon: Layers },
  { to: '/calendar', label: 'Takvim', icon: CalendarDays },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebarTop">
        <div className="logo">
          <div className="logoMark">K</div>
          <div className="logoText">
            <div className="logoName">Kakeibo</div>
            <div className="logoSub">Offline</div>
          </div>
        </div>
      </div>

      <div className="navSectionTitle">ANA MENÜ</div>
      <nav className="nav">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}
              end={it.to === '/'}
            >
              <Icon size={18} />
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

