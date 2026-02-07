import { redirect } from 'next/navigation';

/**
 * Eski admin e-ticaret rotaları kaldırıldı; admin paneline yönlendir.
 */
export default function AdminEticaretRedirect() {
  redirect('/admin');
}
