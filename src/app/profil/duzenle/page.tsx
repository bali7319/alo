'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: File | null;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: null,
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Onboarding parametresi: Google kullanıcıları için telefon zorunlu akış
    try {
      const sp = new URLSearchParams(window.location.search);
      setIsOnboarding(sp.get('onboarding') === '1');
    } catch {
      setIsOnboarding(false);
    }

    // Sadece ilk yüklemede API'den çek
    if (!isInitialLoad) {
      return; // Form zaten yüklendi, tekrar yükleme
    }

    // API'den güncel kullanıcı bilgilerini çek
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          cache: 'no-store' // Her zaman güncel bilgileri çek
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setFormData({
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              location: data.user.location || '',
              avatar: null,
            });
            setPreviewImage(data.user.image || '');
            setIsInitialLoad(false);
            return;
          }
        }
        // API'den alınamazsa session'dan yükle
        setFormData({
          name: session.user?.name || '',
          email: session.user?.email || '',
          phone: (session.user as any)?.phone || '',
          location: (session.user as any)?.location || '',
          avatar: null,
        });
        setPreviewImage(session.user?.image || '');
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Profil bilgileri yüklenirken hata:', error);
        // Hata durumunda session'dan yükle
        setFormData({
          name: session.user?.name || '',
          email: session.user?.email || '',
          phone: (session.user as any)?.phone || '',
          location: (session.user as any)?.location || '',
          avatar: null,
        });
        setPreviewImage(session.user?.image || '');
        setIsInitialLoad(false);
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, status]); // Sadece email değiştiğinde veya status değiştiğinde çalış

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setError('Sadece resim dosyaları yükleyebilirsiniz');
        return;
      }

      setFormData(prev => ({
        ...prev,
        avatar: file,
      }));
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Onboarding sırasında telefon zorunlu
      if (isOnboarding && !formData.phone?.trim()) {
        setError('Devam etmek için telefon numaranızı eklemelisiniz.');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('location', formData.location);
      
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Profil başarıyla güncellendi!');
        
        // Form'u güncel bilgilerle güncelle (API'den gelen verilerle)
        if (data.user) {
          setFormData(prev => ({
            name: data.user.name || prev.name,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
            location: data.user.location || prev.location,
            avatar: null, // Avatar yüklendikten sonra null yap
          }));
          if (data.user.image) {
            setPreviewImage(data.user.image);
          }
        }
        
        // Session'ı güncelle - NextAuth session'ı yenile (veritabanından güncel bilgileri çekecek)
        if (update) {
          // JWT token'ı anında güncelle (middleware onboarding kontrolü için kritik)
          await update({
            name: data.user?.name ?? formData.name,
            email: data.user?.email ?? formData.email,
            image: data.user?.image ?? previewImage,
            phone: data.user?.phone ?? formData.phone,
            location: data.user?.location ?? formData.location,
          } as any);
        }
        
        // Başarı mesajını göster ve kısa bir süre sonra profil sayfasına yönlendir
        setTimeout(() => {
          router.push('/profil');
          router.refresh(); // Sayfayı yenile
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Profil güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setError('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');
    setSuccess('');

    // Şifre validasyonu
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Şifre başarıyla değiştirildi!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Şifre değiştirilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      setError('Şifre değiştirilirken bir hata oluştu');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alo-orange"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-alo-dark mb-8">Profili Düzenle</h1>
          
          {isOnboarding && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
              Telefon numaranız eksik. Devam etmek için lütfen telefon numaranızı ekleyip kaydedin.
            </div>
          )}

          {/* Hata ve Başarı Mesajları */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profil Fotoğrafı */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={previewImage || '/images/placeholder.jpg'}
                    alt="Profil fotoğrafı"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-alo-orange text-white rounded-full hover:bg-alo-light-orange cursor-pointer transition-colors">
                  <CameraIcon className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">Profil fotoğrafınızı değiştirmek için tıklayın (Max: 5MB)</p>
            </div>

            {/* Ad Soyad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </div>
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                  placeholder="E-posta adresiniz"
                  required
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon{isOnboarding ? ' *' : ''}
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                  placeholder="Telefon numaranız"
                  required={isOnboarding}
                />
              </div>
            </div>

            {/* Konum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konum
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                  placeholder="Şehir, ilçe"
                />
              </div>
            </div>

            {/* Şifre Değiştirme Bölümü */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-sm text-alo-orange hover:text-alo-light-orange"
                >
                  {showPasswordForm ? 'Gizle' : 'Şifre Değiştir'}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  {/* Mevcut Şifre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mevcut Şifre
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                        placeholder="Mevcut şifreniz"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.current ? (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Yeni Şifre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yeni Şifre
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                        placeholder="Yeni şifreniz (min. 6 karakter)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.new ? (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Şifre Tekrar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yeni Şifre Tekrar
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                        placeholder="Yeni şifrenizi tekrar girin"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.confirm ? (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full px-4 py-2 bg-alo-orange text-white rounded-lg hover:bg-alo-light-orange disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Şifre Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </button>
                </form>
              )}
            </div>

            {/* Butonlar */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/profil')}
                disabled={isOnboarding}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-alo-orange text-white rounded-lg hover:bg-alo-light-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
