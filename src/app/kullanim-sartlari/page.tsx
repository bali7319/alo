import { permanentRedirect } from 'next/navigation';

/**
 * Kullanım Şartları tek sayfada (Kullanım Koşulları) toplandı.
 * Eski URL SEO ve link bütünlüğü için kalıcı yönlendiriliyor.
 */
export default function KullanimSartlariPage() {
  permanentRedirect('/kullanim-kosullari');
}
