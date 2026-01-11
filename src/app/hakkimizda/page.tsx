import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda - Alo17',
  description: 'Alo17, Çanakkale\'nin en büyük ve güvenilir ilan sitesi. 2024 yılında kurulan platformumuz, Çanakkale halkının ihtiyaçlarını karşılamak ve yerel ekonomiyi desteklemek amacıyla hizmet vermektedir.',
  keywords: ['alo17 hakkında', 'çanakkale ilan sitesi', 'alo17 misyon', 'alo17 vizyon', 'güvenilir ilan sitesi'],
  openGraph: {
    title: 'Hakkımızda - Alo17',
    description: 'Alo17, Çanakkale\'nin en büyük ve güvenilir ilan sitesi.',
    url: 'https://alo17.tr/hakkimizda',
    type: 'website',
  },
  alternates: {
    canonical: 'https://alo17.tr/hakkimizda',
  },
};

export default function HakkimizdaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Biz Kimiz?</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg mb-6 leading-relaxed">
          Çanakkale'nin esnafını, ustasını ve tüm yerel hizmet verenlerini tek bir çatıda buluşturuyoruz! alo17.tr, şehrimizdeki işletmelerin ve profesyonel hizmet sağlayıcıların dijital dünyadaki en güçlü temsilcisidir.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          Sitemiz, tamamen Çanakkale'nin yerel dinamiklerine göre tasarlanmış olup; sadece gerçek hizmete, doğru esnafa ve güncel yerel tanıtımlara odaklanır. Aradığınız tesisatçıdan en sevilen restoranlara, özel ders verenlerden butik mağazalara kadar şehre dair her türlü ticari ilan ve tanıtım burada. Biz, Çanakkale esnafının sesi, vatandaşın ise en hızlı çözüm ortağıyız.
        </p>
      </div>
    </div>
  )
} 
