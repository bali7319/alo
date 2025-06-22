'use client';

export default function AdminOdemelerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ödeme Yönetimi</h1>
      
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Ödeme İstatistikleri</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Toplam Gelir</h3>
            <p className="text-2xl font-bold text-blue-600">₺0</p>
            <p className="text-sm text-blue-700">Bu ay</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Başarılı Ödemeler</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-green-700">Bu ay</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-900">Başarısız Ödemeler</h3>
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-sm text-red-700">Bu ay</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Son Ödemeler</h3>
          <div className="text-center py-8 text-gray-500">
            <p>Henüz ödeme kaydı bulunmuyor.</p>
            <p className="text-sm mt-2">PayTR entegrasyonu tamamlandığında burada ödeme detayları görünecek.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
