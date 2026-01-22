import React from 'react';
import { Compass, BadgeCheck, Layers } from 'lucide-react';

const items = [
  {
    title: 'İlan Kalabalığına Son',
    description: 'Emlak ve vasıta ilanları arasında kaybolmayın. Sadece eşya, hizmet ve iş ilanlarına ulaşın.',
    Icon: Layers,
  },
  {
    title: 'Tamamen Ücretsiz',
    description: 'İlan vermek de, alıcıya ulaşmak da bedava. Aracı yok, komisyon yok.',
    Icon: BadgeCheck,
  },
  {
    title: 'Güvenilir Yerel Rehber',
    description: 'Çanakkale’nin esnafını tek çatı altında topluyoruz. Tanıdık yüzlerle güvenle alışveriş yapın.',
    Icon: Compass,
  },
] as const;

export function AdvantageBand() {
  return (
    <section aria-label="Alo17 avantajları" className="w-full bg-white border rounded-xl p-6 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(({ title, description, Icon }, idx) => (
          <div
            key={title}
            className={[
              'text-center',
              idx === 1 ? 'md:border-x md:border-slate-200 md:px-6' : '',
            ].join(' ')}
          >
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-orange-600">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

