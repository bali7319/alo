'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin } from 'lucide-react';

export default function IlanlarPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Örnek ilan verileri
  const ilanlar = [
    {
      id: 1,
      title: 'Örnek İlan 1',
      price: '1.000,00',
      location: 'Çanakkale',
      image: '/placeholder1.jpg',
      category: 'arac',
      createdAt: '2024-03-20'
    },
    {
      id: 2,
      title: 'Örnek İlan 2',
      price: '2.000,00',
      location: 'İstanbul',
      image: '/placeholder2.jpg',
      category: 'emlak',
      createdAt: '2024-03-19'
    }
  ];

  const handleIlanClick = (ilanId: number) => {
    router.push(`/ilan/${ilanId}`);
  };

  const handleNewIlan = () => {
    if (!session) {
      router.push('/giris?callbackUrl=/ilan-ver');
      return;
    }
    router.push('/ilan-ver');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">İlanlar</h1>
        <button
          onClick={handleNewIlan}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Yeni İlan Ver
        </button>
      </div>

      {/* İlan Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ilanlar.map((ilan) => (
          <div
            key={ilan.id}
            onClick={() => handleIlanClick(ilan.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={ilan.image}
                alt={ilan.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{ilan.title}</h2>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                {ilan.price} ₺
              </p>
              <div className="flex items-center text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{ilan.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
