'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminTestPage() {
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    const adminEmail = localStorage.getItem('adminEmail');
    const adminName = localStorage.getItem('adminName');
    
    if (adminEmail) {
      setAdminInfo({
        email: adminEmail,
        name: adminName || 'Admin'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    setAdminInfo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Test Sayfası</h1>
        
        {adminInfo ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Admin Girişi Başarılı!</h2>
              <p className="text-green-700">
                <strong>E-posta:</strong> {adminInfo.email}<br/>
                <strong>Ad:</strong> {adminInfo.name}
              </p>
            </div>
            
            <div className="space-y-2">
              <Link 
                href="/admin" 
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Admin Paneline Git
              </Link>
              
              <button
                onClick={(e) => handleLogout(e)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Admin Girişi Yapılmamış</h2>
              <p className="text-red-700">
                Admin paneline erişmek için önce giriş yapmalısınız.
              </p>
            </div>
            
            <Link 
              href="/giris" 
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Giriş Sayfasına Git
            </Link>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Admin Bilgileri:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>E-posta:</strong> admin@alo17.tr</p>
            <p><strong>Şifre:</strong> admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
} 