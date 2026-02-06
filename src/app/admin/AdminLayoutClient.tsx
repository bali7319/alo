'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white shadow-lg print:hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Admin Paneli</h2>
          <p className="text-sm text-gray-600 mt-1">Alo17 Yönetim</p>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            <AdminNavLink href="/admin/istatistikler" label="İstatistikler" />
            <AdminNavLink href="/admin/ilanlar" label="İlanlar" />
            <AdminNavLink href="/admin/mesajlar" label="Mesajlar" />
            <AdminNavLink href="/admin/odemeler" label="Ödemeler" />
            <AdminNavLink href="/admin/faturalar" label="Faturalar" />
            <AdminNavLink href="/admin/uyeler" label="Kullanıcılar" />
            <AdminNavLink href="/admin/kariyer" label="Kariyer" />
            <AdminNavLink href="/admin/sozlesmeler" label="Hukuki Belgeler" />
            <AdminNavLink href="/admin/aboneler" label="Aboneler" />
            <AdminNavLink href="/admin/sikayetler" label="Şikayetler" />
            <AdminNavLink href="/admin/ayarlar" label="Ayarlar" />
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8 print:p-0">{children}</main>
    </div>
  )
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  )
}

