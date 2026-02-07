import { permanentRedirect } from 'next/navigation';

/**
 * Gizlilik politikası tek sayfada (/gizlilik) toplandı.
 * Eski URL kalıcı yönlendiriliyor.
 */
export default function GizlilikPolitikasiPage() {
  permanentRedirect('/gizlilik');
}
