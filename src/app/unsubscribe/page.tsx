'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email')?.trim() || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const toUse = email.trim() || emailFromUrl;
    if (!toUse) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: toUse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İşlem başarısız oldu.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasEmail = !!emailFromUrl;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bildirim Aboneliğini İptal Et
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            {hasEmail
              ? `Bu e-posta adresinin bildirimlerini iptal etmek istediğinize emin misiniz?`
              : 'E-posta bildirim aboneliğinizi iptal etmek için adresinizi girin veya e-postanızdaki iptal linkini kullanın.'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 shrink-0" />
              <span>Aboneliğiniz iptal edildi. Artık bildirim e-postası almayacaksınız.</span>
            </div>
          )}

          <div>
            <label htmlFor="unsubscribe-email" className="sr-only">
              E-posta adresi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="unsubscribe-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresi"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'İşleniyor...' : 'Aboneliği İptal Et'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
