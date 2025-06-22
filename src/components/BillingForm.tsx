'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, MapPin, Phone, Mail, Building, Zap } from 'lucide-react';

interface BillingFormProps {
  onSubmit: (billingData: BillingData) => void;
  onCancel: () => void;
  hideButtons?: boolean;
}

export interface BillingData {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  taxNumber?: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  isCompany: boolean;
}

export default function BillingForm({ onSubmit, onCancel, hideButtons = false }: BillingFormProps) {
  const { data: session } = useSession();
  const [isCompany, setIsCompany] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [formData, setFormData] = useState<BillingData>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    taxNumber: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    country: 'Türkiye',
    isCompany: false,
  });

  // Kullanıcı profil bilgilerini yükle
  useEffect(() => {
    if (session?.user?.id) {
      loadUserProfile();
    }
  }, [session]);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Tüm alanları otomatik doldur
  const fillAllFields = () => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        companyName: '',
        taxNumber: '',
        address: userProfile.location || '',
        city: userProfile.city || '',
        district: userProfile.district || '',
        postalCode: '',
        country: 'Türkiye',
        isCompany: false,
      });
    }
  };

  // Belirli alanları doldur
  const fillField = (field: keyof BillingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, isCompany });
  };

  const handleInputChange = (field: keyof BillingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Fatura Bilgileri</h2>
        <p className="text-gray-600">
          Ödeme işlemi için fatura bilgilerinizi doldurun
        </p>
      </div>

      {/* Hızlı Doldurma Bölümü */}
      {userProfile && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-900 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Hızlı Doldurma
            </h3>
            <button
              type="button"
              onClick={fillAllFields}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Tümünü Doldur
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {userProfile.name && (
              <button
                type="button"
                onClick={() => fillField('fullName', userProfile.name)}
                className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors flex items-center"
              >
                <User className="w-3 h-3 mr-1" />
                Ad Soyad
              </button>
            )}
            {userProfile.email && (
              <button
                type="button"
                onClick={() => fillField('email', userProfile.email)}
                className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors flex items-center"
              >
                <Mail className="w-3 h-3 mr-1" />
                E-posta
              </button>
            )}
            {userProfile.phone && (
              <button
                type="button"
                onClick={() => fillField('phone', userProfile.phone)}
                className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors flex items-center"
              >
                <Phone className="w-3 h-3 mr-1" />
                Telefon
              </button>
            )}
            {userProfile.location && (
              <button
                type="button"
                onClick={() => fillField('address', userProfile.location)}
                className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors flex items-center"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Adres
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fatura Türü Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fatura Türü
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="billingType"
                checked={!isCompany}
                onChange={() => setIsCompany(false)}
                className="mr-2"
              />
              <span className="text-sm">Bireysel</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="billingType"
                checked={isCompany}
                onChange={() => setIsCompany(true)}
                className="mr-2"
              />
              <span className="text-sm">Kurumsal</span>
            </label>
          </div>
        </div>

        {/* Bireysel Bilgiler */}
        {!isCompany && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Ad ve soyadınızı girin"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="E-posta adresinizi girin"
                autoComplete="email"
              />
            </div>
          </div>
        )}

        {/* Kurumsal Bilgiler */}
        {isCompany && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firma Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={isCompany}
                placeholder="Firma adını girin"
                autoComplete="organization"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vergi Numarası <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={isCompany}
                placeholder="Vergi numarasını girin"
                autoComplete="off"
              />
            </div>
          </div>
        )}

        {/* İletişim Bilgileri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Telefon numaranızı girin"
            autoComplete="tel"
          />
        </div>

        {/* Adres Bilgileri */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Adres Bilgileri</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
              placeholder="Açık adresinizi girin"
              autoComplete="street-address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İl <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="İl"
                autoComplete="address-level1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlçe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="İlçe"
                autoComplete="address-level2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posta Kodu
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Posta kodu"
                autoComplete="postal-code"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ülke
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ülke"
              autoComplete="country-name"
            />
          </div>
        </div>

        {/* Butonlar */}
        {!hideButtons && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              İlan Bilgilerine Dön
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Ödemeye Geç
            </button>
          </div>
        )}
      </form>
    </div>
  );
} 
