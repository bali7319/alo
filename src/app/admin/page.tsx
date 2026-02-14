'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, FileText, Eye, MessageSquare, Star, Clock, XCircle, CheckCircle, LogOut, Trash2, Search, Mail } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  rejectedListings: number;
  premiumListings: number;
  totalViews: number;
  totalMessages: number;
  latestUser?: { name: string | null; createdAt: string } | null;
  latestListing?: { title: string; createdAt: string } | null;
}

export default function AdminPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoListings, setDemoListings] = useState<any[]>([]);
  const [checkingDemo, setCheckingDemo] = useState(false);
  const [deletingDemo, setDeletingDemo] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Console log'lar sadece development'ta
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin sayfası yüklendi');
      console.log('Session:', session);
      console.log('Status:', status);
    }
    
    if (status === 'loading') {
      return; // Hala yükleniyor
    }

    // Admin kontrolü
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Admin yetkisi yok, giriş sayfasına yönlendiriliyor');
      }
      setError('Admin girişi gerekli. Lütfen giriş yapın.');
      setTimeout(() => {
        const currentPath = window.location.pathname;
        router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      }, 2000);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Admin kimlik doğrulama başarılı');
    }
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('İstatistikler getiriliyor');
      }
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('İstatistikler alınamadı');
      const data = await res.json();
      setStats(data);
      if (process.env.NODE_ENV === 'development') {
        console.log('İstatistikler başarıyla yüklendi');
      }
    } catch (error) {
      console.error('İstatistik getirme hatası:', error);
      setError('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (e?: React.MouseEvent) => {
    // 1. Eğer bir form veya link ise default davranışı durdurun
    if (e && e.preventDefault) e.preventDefault();
    
    // 2. Fonksiyonun birden fazla kez tetiklenmesini engellemek için kontrol
    if ((window as any).isLoggingOut) return;
    (window as any).isLoggingOut = true;
    
    setIsLoggingOut(true);

    console.log('SignOut başlatılıyor...');

    try {
      // 1. Tüm çerezleri (HttpOnly olmayanları) temizle
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + window.location.hostname;
      }

      // Storage temizleme
      localStorage.clear();
      sessionStorage.clear();
      console.log('Storage temizlendi');

      // Sunucu tarafında cookie temizleyip redirect eden güvenilir logout
      window.location.href = `/api/logout?next=${encodeURIComponent('/giris?logout=true')}&ts=${Date.now()}`;
      
    } catch (error) {
      console.error('Çıkış hatası:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + '/giris?logout=true';
    } finally {
      setIsLoggingOut(false);
      (window as any).isLoggingOut = false;
    }
  };

  const checkDemoListings = async () => {
    setCheckingDemo(true);
    try {
      const response = await fetch('/api/admin/check-demo-listings');
      const data = await response.json();
      
      if (response.ok) {
        setDemoListings(data.listings || []);
        if (data.count === 0) {
          alert('✅ Demo/örnek ilan bulunamadı.');
        } else {
          alert(`📋 ${data.count} demo/örnek ilan bulundu. Detaylar için konsolu kontrol edin.`);
          console.log('Bulunan demo ilanlar:', data.listings);
        }
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      console.error('Demo ilan kontrol hatası:', error);
      alert('Kontrol sırasında bir hata oluştu.');
    } finally {
      setCheckingDemo(false);
    }
  };

  const deleteDemoListings = async () => {
    if (!confirm('Demo/örnek ilanları silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    setDeletingDemo(true);
    try {
      const response = await fetch('/api/admin/check-demo-listings', {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.deleted} demo/örnek ilan başarıyla silindi.`);
        setDemoListings([]);
        // İstatistikleri yenile
        fetchStats();
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      console.error('Demo ilan silme hatası:', error);
      alert('Silme işlemi sırasında bir hata oluştu.');
    } finally {
      setDeletingDemo(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              const currentPath = window.location.pathname;
              router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Giriş Sayfasına Git
          </button>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  if (!session || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Admin yetkisi gerekli...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Admin paneli yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
            <p className="mt-2 text-gray-600">
              Hoş geldin <b>{session.user?.name || 'Admin'}</b>!
            </p>
          </div>
          <button
            onClick={(e) => handleLogout(e)}
            disabled={isLoggingOut}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            id="admin-logout-button"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
          </button>
        </div>

        {/* İstatistikler */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Toplam Kullanıcı</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Toplam İlan</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalListings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Aktif İlan</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeListings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Bekleyen İlan</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingListings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Reddedilen İlan</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.rejectedListings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Premium İlan</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.premiumListings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Toplam Görüntüleme</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-8 w-8 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Toplam Mesaj</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hızlı Eylemler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Eylemler</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/admin/ilanlar')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Yeni İlanları İncele
              </button>
              <button 
                onClick={checkDemoListings}
                disabled={checkingDemo}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center justify-between disabled:opacity-50"
              >
                <span className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Demo/Örnek İlanları Kontrol Et
                </span>
                {checkingDemo && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>}
              </button>
              {demoListings.length > 0 && (
                <button 
                  onClick={deleteDemoListings}
                  disabled={deletingDemo}
                  className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md flex items-center justify-between disabled:opacity-50"
                >
                  <span className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Demo İlanları Sil ({demoListings.length})
                  </span>
                  {deletingDemo && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>}
                </button>
              )}
              <button
                onClick={() => router.push('/admin/sikayetler')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Kullanıcı Şikayetleri
              </button>
              <button 
                onClick={() => router.push('/admin/ayarlar')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Sistem Ayarları
              </button>
              <button 
                onClick={() => router.push('/admin/aboneler')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Aboneleri
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
            <div className="space-y-3">
              {stats?.latestUser ? (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Yeni kullanıcı kaydı: {stats.latestUser.name || 'İsimsiz'}</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-500">Henüz kayıtlı kullanıcı yok.</div>
              )}
              {stats?.latestListing ? (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Yeni ilan eklendi: {stats.latestListing.title}</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-500">Henüz ilan yok.</div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span>Bekleyen onay: {stats?.pendingListings ?? 0} ilan</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Durumu</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sunucu Durumu</span>
                <span className="text-sm text-green-600 font-medium">Aktif</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Veritabanı</span>
                <span className="text-sm text-green-600 font-medium">Bağlı</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cache</span>
                <span className="text-sm text-green-600 font-medium">Çalışıyor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
