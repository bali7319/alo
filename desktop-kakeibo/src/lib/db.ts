import Dexie, { type Table } from 'dexie';

export type MoneyFlow = 'income' | 'expense';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  acceptedTermsAt: string;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: MoneyFlow;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface CategoryRecord {
  id: string;
  userId: string;
  name: string;
  icon: string; // emoji / short label
  createdAt: string;
  updatedAt: string;
}

class KakeiboDb extends Dexie {
  users!: Table<UserRecord, string>;
  transactions!: Table<TransactionRecord, string>;
  categories!: Table<CategoryRecord, string>;

  constructor() {
    super('kakeibo_offline');
    this.version(1).stores({
      users: 'id, email',
      transactions: 'id, userId, [userId+createdAt], [userId+date], type, date, createdAt',
    });

    // Add categories table
    this.version(2).stores({
      users: 'id, email',
      transactions: 'id, userId, [userId+createdAt], [userId+date], type, date, createdAt',
      categories: 'id, userId, [userId+name], name, createdAt, updatedAt',
    });
  }
}

export const db = new KakeiboDb();

export async function getUserById(id: string) {
  return db.users.get(id);
}

export async function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return db.users.where('email').equals(normalized).first();
}

export async function createUser(user: UserRecord) {
  return db.users.add({ ...user, email: user.email.trim().toLowerCase() });
}

export async function listCategories(userId: string) {
  return db.categories
    .where('userId')
    .equals(userId)
    .sortBy('name');
}

export async function createCategory(category: CategoryRecord) {
  return db.categories.add(category);
}

export async function updateCategory(id: string, patch: Partial<Omit<CategoryRecord, 'id' | 'userId'>>) {
  return db.categories.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function deleteCategory(id: string) {
  return db.categories.delete(id);
}

