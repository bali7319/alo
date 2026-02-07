import { redirect } from 'next/navigation';

/**
 * Eski e-ticaret rotaları (urunler, siparisler vb.) kaldırıldı.
 * Bu URL'lere gelen istekleri anasayfaya yönlendir.
 */
export default function EticaretRedirect() {
  redirect('/');
}
