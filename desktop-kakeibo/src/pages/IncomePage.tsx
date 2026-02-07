import type { UserRecord } from '@/lib/db';
import { TransactionsPage } from '@/pages/TransactionsPage';

export function IncomePage({ user }: { user: UserRecord }) {
  return <TransactionsPage user={user} type="income" title="Gelirler" />;
}

