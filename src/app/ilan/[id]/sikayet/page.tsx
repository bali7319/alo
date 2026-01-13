'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ReportReason {
  id: string;
  label: string;
  description: string;
}

const reportReasons: ReportReason[] = [
  {
    id: 'fake',
    label: 'Sahte İlan',
    description: 'İlan gerçek değil veya yanıltıcı bilgiler içeriyor'
  },
  {
    id: 'spam',
    label: 'Spam',
    description: 'İstenmeyen veya tekrarlayan içerik'
  },
  {
    id: 'inappropriate',
    label: 'Uygunsuz İçerik',
    description: 'Uygunsuz, zararlı veya yasa dışı içerik'
  },
  {
    id: 'scam',
    label: 'Dolandırıcılık',
    description: 'Dolandırıcılık girişimi veya şüpheli aktivite'
  },
  {
    id: 'copyright',
    label: 'Telif Hakkı İhlali',
    description: 'Telif hakkı korumalı içerik kullanımı'
  },
  {
    id: 'other',
    label: 'Diğer',
    description: 'Yukarıdaki kategorilerde olmayan sorun'
  }
];

export default function IlanSikayetPage() {
  const params = useParams();
  const { data: session } = useSession();
  const listingId = params?.id as string;
  const [listing, setListing] = useState<any>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // İlan bilgilerini yükle
  useEffect(() => {
    if (!listingId) return;
    
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        if (response.ok) {
          const data = await response.json();
          setListing(data.listing);
        }
      } catch (error) {
        console.error('İlan yükleme hatası:', error);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || !description.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          reason: selectedReason,
          description: description.trim(),
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSelectedReason('');
        setDescription('');
        // 3 saniye sonra ilan sayfasına yönlendir
        setTimeout(() => {
          window.location.href = `/ilan/${listingId}`;
        }, 3000);
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        alert(errorData.error || 'Şikayet gönderilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Şikayet gönderme hatası:', error);
      setSubmitStatus('error');
      alert('Şikayet gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/ilan/${listingId}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-alo-orange transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>İlana Dön</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Şikayet Bildirimi</h1>
          </div>
          
          {listing && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{listing.title}</h2>
              <div className="text-gray-600">
                <p>Fiyat: {listing.price} TL</p>
                <p>Konum: {listing.location}</p>
                <p>Satıcı: {listing.seller.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Şikayet Formu */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">Şikayet Nedeni Seçin</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {reportReasons.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedReason === reason.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 text-alo-orange focus:ring-alo-orange"
                    required
                  />
                  <div>
                    <div className="font-medium text-gray-800">{reason.label}</div>
                    <div className="text-sm text-gray-600">{reason.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                rows={4}
                placeholder="Şikayetinizi detaylı olarak açıklayın..."
                required
              />
            </div>

            {submitStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">Şikayetiniz başarıyla gönderildi!</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link 
                href={`/ilan/${listingId}`}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                İptal
              </Link>
              <button 
                type="submit"
                disabled={isSubmitting || !selectedReason || !description.trim()}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Gönderiliyor...' : 'Şikayet Gönder'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 