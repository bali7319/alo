'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const rawCallbackUrl = searchParams?.get('callbackUrl') || '';
  // URL decode işlemi (hatalı encode durumlarına dayanıklı)
  const callbackUrl = (() => {
    try {
      return rawCallbackUrl ? decodeURIComponent(rawCallbackUrl) : '';
    } catch {
      return rawCallbackUrl || '';
    }
  })();
  const errorParam = searchParams?.get('error');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasGoogleProvider, setHasGoogleProvider] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resolvePostLoginRedirect = (): string => {
    if (typeof window === 'undefined') return '/';

    const normalize = (candidate: string | null | undefined): string | null => {
      if (!candidate) return null;
      const v = candidate.trim();
      if (!v) return null;
      if (v === '/giris' || v.startsWith('/giris?')) return null;
      // Internal path
      if (v.startsWith('/')) return v;
      // Absolute same-origin
      try {
        const u = new URL(v);
        if (u.origin === window.location.origin) {
          return u.pathname + u.search + u.hash;
        }
      } catch {
        // ignore
      }
      return null;
    };

    // 1) callbackUrl (en güvenilir)
    const fromCallback = normalize(callbackUrl);
    if (fromCallback) return fromCallback;

    // 2) referrer (aynı origin ise)
    const ref = normalize(document.referrer || '');
    if (ref) return ref;

    return '/';
  };

  // Sayfa yüklendiğinde kaydedilmiş bilgileri yükle ve hata mesajını kontrol et
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Logout parametresi kontrolü
    const logoutParam = searchParams?.get('logout');
    if (logoutParam === 'true') {
      // Client-side cookie silme, NextAuth credentials flow'undaki CSRF cookie'leriyle çakışıp
      // /api/auth/callback/credentials tarafında 401 üretebiliyor.
      // Güvenilir (HttpOnly dahil) cookie temizliği için server-side logout endpoint'ine yönlendir.
      console.log('[LOGIN] Logout parametresi tespit edildi, /api/logout ile çıkış tamamlanıyor...');
      const next = encodeURIComponent('/giris?loggedOut=true');
      window.location.replace(`/api/logout?next=${next}&ts=${Date.now()}`);
      return;
    }

    // Zaten giriş yaptıysa login sayfasında takılmasın.
    // (Örn. admin sayfasından login'e yönlenip sonra session gelince hala /giris'te kalma durumu)
    const loggedOutParam = searchParams?.get('loggedOut');
    const forceParam = searchParams?.get('force');
    if (status === 'authenticated' && session?.user && loggedOutParam !== 'true' && forceParam !== 'true') {
      window.location.replace(resolvePostLoginRedirect());
      return;
    }
    
    // URL'den gelen hata mesajını göster
    if (errorParam) {
      const errorMessages: { [key: string]: string } = {
        'Configuration': 'Sunucu yapılandırma hatası. Lütfen yöneticiye başvurun.',
        'AccessDenied': 'Giriş reddedildi. Lütfen tekrar deneyin.',
        'Verification': 'Doğrulama hatası. Lütfen tekrar deneyin.',
        'OAuthSignin': 'Google giriş hatası. Lütfen tekrar deneyin veya email/şifre ile giriş yapın.',
        'OAuthCallback': 'Google giriş callback hatası. Lütfen tekrar deneyin.',
        'OAuthCreateAccount': 'Hesap oluşturma hatası. Lütfen tekrar deneyin.',
        'EmailCreateAccount': 'Email ile hesap oluşturma hatası.',
        'Callback': 'Callback hatası. Lütfen tekrar deneyin.',
        'OAuthAccountNotLinked': 'Bu email adresi başka bir hesap ile bağlantılı. Email/şifre ile giriş yapmayı deneyin.',
        'EmailSignin': 'Email gönderme hatası. Lütfen tekrar deneyin.',
        'CredentialsSignin': 'Geçersiz email veya şifre.',
        'SessionRequired': 'Oturum açmanız gerekiyor.',
      };
      setError(errorMessages[errorParam] || 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
    
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
    if (savedPassword && savedRememberMe) {
      setFormData(prev => ({ ...prev, password: savedPassword }));
    }
    setRememberMe(savedRememberMe);
  }, [errorParam, searchParams, session?.user, status]);

  // Google provider aktif mi? (NextAuth providers endpoint'inden kontrol et)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/providers', { cache: 'no-store' });
        if (!res.ok) throw new Error('providers fetch failed');
        const providers = (await res.json()) as Record<string, unknown>;
        if (!cancelled) setHasGoogleProvider(Boolean((providers as any)?.google));
      } catch {
        // Provider listesi alınamazsa Google butonunu gizleyelim (safe default)
        if (!cancelled) setHasGoogleProvider(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      // NextAuth can return `undefined` on network/config errors
      if (!result) {
        setError('Giriş yapılamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
        return;
      }

      if (result.error) {
        // Keep user-friendly messaging but also handle non-credential errors.
        if (result.error === 'CredentialsSignin' || result.status === 401) {
          setError('Geçersiz email veya şifre');
        } else {
          setError('Giriş yapılamadı. Lütfen tekrar deneyin.');
        }
        return;
      }

      {
        // Giriş başarılı, bilgileri kaydet
        if (rememberMe) {
          localStorage.setItem('savedEmail', formData.email);
          localStorage.setItem('savedPassword', formData.password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
          localStorage.removeItem('rememberMe');
        }
        
        // Giriş başarılı: cookie gerçekten set oldu mu kontrol et (bazı tarayıcı ayarları cookie bloklayabilir)
        try {
          const sres = await fetch('/api/auth/session', { cache: 'no-store' });
          const sjson = await sres.json().catch(() => null);
          if (!sjson?.user) {
            setError('Giriş yapılamadı: tarayıcı çerezleri (cookie) engelliyor olabilir. Lütfen çerezlere izin verip tekrar deneyin.');
            return;
          }
        } catch {
          // ignore: yine de yönlendirelim
        }

        // Hard navigation daha güvenilir (cookie + middleware güncel state)
        window.location.href = resolvePostLoginRedirect();
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      setError('');

      // Provider aktif değilse kullanıcıyı yanıltmayalım
      if (provider === 'google' && hasGoogleProvider === false) {
        setError('Google ile giriş şu anda aktif değil. Email/şifre ile giriş yapın.');
        return;
      }
      
      // OAuth provider'lar için redirect gerekli (Google'a yönlendirme yapılacak)
      // NextAuth otomatik olarak callback URL'e yönlendirecek
      await signIn(provider, { 
        callbackUrl: resolvePostLoginRedirect(),
        redirect: true // OAuth için redirect: true olmalı
      });
      
      // Bu satıra gelinmez çünkü redirect yapılacak
      setIsLoading(false);
    } catch (error: any) {
      console.error('Sosyal medya giriş hatası:', error);
      setError('Sosyal medya ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-alo-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-alo-dark">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="font-medium text-alo-orange hover:text-alo-dark-orange">
              Hemen Kayıt Olun
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Adresi
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-alo-orange focus:border-alo-orange focus:z-10 sm:text-sm"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-alo-orange focus:border-alo-orange sm:text-sm"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  tabIndex={0}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-30 cursor-pointer hover:bg-gray-50 rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-alo-orange"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword((prev) => !prev);
                  }}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-alo-orange focus:ring-alo-orange border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Beni hatırla
              </label>
            </div>

            <div className="text-sm">
              <Link href="/sifremi-unuttum" className="font-medium text-alo-orange hover:text-alo-dark-orange">
                Şifremi unuttum
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-alo-orange hover:bg-alo-dark-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alo-orange disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Veya</span>
              </div>
            </div>

            <div className="mt-6">
              {hasGoogleProvider ? (
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google ile Giriş Yap</span>
                </button>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  Google ile giriş şu anda aktif değil.
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-alo-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alo-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 