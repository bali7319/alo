import React from 'react';

export default function KampanyalarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kampanyalar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Kampanya kartları buraya eklenecek */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Yaz İndirimi</h2>
          <p className="text-gray-600 mb-4">Tüm yaz ürünlerinde %50'ye varan indirimler!</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Detayları Gör
          </button>
        </div>
      </div>
    </div>
  );
} 
