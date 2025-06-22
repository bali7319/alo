import React from 'react';

export default function YeniUrunlerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Yeni Ürünler</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Yeni ürün kartları buraya eklenecek */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Yeni Ürün Adı</h2>
          <p className="text-gray-600 mb-2">1.299,99 TL</p>
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
} 
