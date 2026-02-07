import type { UserRecord } from '@/lib/db';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="pageStack">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">{title}</h1>
          <div className="pageSub">Bu ekranı istersen sıradaki adımda aynen kopyalayabiliriz.</div>
        </div>
      </div>
      <div className="cardWhite">
        <div className="empty">Henüz uygulanmadı.</div>
      </div>
    </div>
  );
}

// kept for potential future typing use
export type _Unused = UserRecord;

