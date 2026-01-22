import React from 'react';
import { Zap, Target, HandCoins, Timer } from 'lucide-react';

const bullets = [
  { title: 'Odak Noktası', text: 'Sadece Çanakkale.', Icon: Target },
  { title: 'Zaman Tasarrufu', text: '%50 daha hızlı sonuç.', Icon: Timer },
  { title: 'Esnaf Dostu', text: 'Ücretsiz doping seçenekleri.', Icon: HandCoins },
  { title: 'Yıldırım Hızında', text: 'Next.js ile mobil performans.', Icon: Zap },
] as const;

function DifferenceContent({ compact }: { compact?: boolean }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Alo17.tr Farkı Nedir?</h3>
      <ul className={['mt-4', compact ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'].join(' ')}>
        {bullets.map(({ title, text, Icon }) => (
          <li key={title} className="flex gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{title}</div>
              <div className="text-sm text-slate-600">{text}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DifferenceInline() {
  return <DifferenceContent compact />;
}

export function DifferenceSidebar() {
  return (
    <aside className="hidden lg:block w-full lg:w-72 xl:w-80 flex-shrink-0">
      <div className="sticky top-24">
        <DifferenceContent />
      </div>
    </aside>
  );
}

