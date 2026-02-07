import type { UserRecord } from '@/lib/db';
import { TransactionsPage } from '@/pages/TransactionsPage';

export function ExpensesPage({ user }: { user: UserRecord }) {
  return <TransactionsPage user={user} type="expense" title="Giderler" />;
}

