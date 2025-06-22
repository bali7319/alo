'use client';

export default function PaytrMockPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            PayTR Ödeme Sayfası (Mock)
          </h1>
          <p className="text-gray-600 mb-8">
            Burada gerçek PayTR ödeme entegrasyonu yapılacaktır.<br/>
            (Şu anda test amaçlı sahte sayfa gösteriliyor.)
          </p>
          <div className="space-y-4">
            <button
              onClick={() => alert('Ödeme başarılı!')}
              className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Ödemeyi Tamamla (Mock)
            </button>
            <button
              onClick={() => window.location.href = '/ilanlarim'}
              className="block w-full text-gray-600 hover:text-blue-600 transition-colors"
            >
              İlanlarım Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
