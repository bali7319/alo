'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'alo17_cookie_consent_v1';

type ConsentValue = 'accepted' | 'rejected';

function readConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'accepted' || v === 'rejected') return v;
    return null;
  } catch {
    return null;
  }
}

function writeConsent(v: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // ignore
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setVisible(!existing);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white shadow-lg">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Çerez kullanımı</div>
            <p className="mt-1">
              Alo17.tr, deneyiminizi iyileştirmek için çerezler kullanır. Detaylar için{' '}
              <Link href="/cerez-politikasi" className="text-alo-orange hover:underline underline-offset-4">
                Çerez Politikası
              </Link>{' '}
              sayfasını inceleyin.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => {
                writeConsent('rejected');
                setVisible(false);
              }}
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reddet
            </button>
            <button
              type="button"
              onClick={() => {
                writeConsent('accepted');
                setVisible(false);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-alo-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Kabul et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

