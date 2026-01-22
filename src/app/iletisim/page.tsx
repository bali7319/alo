'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const { data: session } = useSession();
  const destination = encodeURIComponent('Cevatpaşa Mahallesi, Bayrak Sokak No:4, Çanakkale, Türkiye');
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // Kullanıcı bilgilerini yükle ve form'a doldur
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }));

      // API'den telefon bilgisini çek (gerekirse)
      const loadUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              // Telefon bilgisi gerekirse buraya eklenebilir
            }
          }
        } catch (error) {
          console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        }
      };

      loadUserProfile();
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form gönderme işlemi buraya eklenecek
    alert('Mesajınız gönderildi! (Bu özellik henüz aktif değil)');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">İletişim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* İletişim Bilgileri */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">İletişim Bilgileri</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium">Adres</h3>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="Haritalarda yol tarifi al"
                  title="Haritalarda yol tarifi al"
                >
                  Cevatpaşa Mahallesi, Bayrak Sokak No:4<br />
                  Çanakkale, Türkiye
                  <span className="block text-xs text-blue-600 mt-1 underline underline-offset-4">
                    Yol tarifi al
                  </span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium">Telefon</h3>
                <p className="text-gray-600">0541 404 2 404</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium">E-posta</h3>
                <p className="text-gray-600">destek@alo17.tr</p>
              </div>
            </div>
          </div>
        </div>

        {/* İletişim Formu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Bize Ulaşın</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Adınız Soyadınız
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta Adresiniz
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Konu
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Konu"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mesajınız
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mesajınızı yazın..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>

      {/* Harita */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Konum</h2>
        <div className="h-[400px] bg-gray-200 rounded-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3039.4283901490703!2d26.4089!3d40.1556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDA5JzIwLjEiTiAyNsKwMjQnMzIuMCJF!5e0!3m2!1str!2str!4v1635000000000!5m2!1str!2str"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  )
} 
