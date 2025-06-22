'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Edit, Eye, Star, Crown, MapPin, Phone, Calendar } from 'lucide-react';
import { categories, Category } from '@/lib/categories';

interface PreviewData {
  title: string;
  description: string;
  price: string;
  category: string;
  subCategory: string;
  location: string;
  phone: string;
  images: string[];
  isPremium: boolean;
}

export default function OnizlemePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/giris');
      return;
    }

    // URL'den preview verilerini al
    const data = searchParams?.get('data');
    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data));
        setPreviewData(decodedData);
      } catch (error) {
        console.error('Preview data parse error:', error);
        router.push('/ilan-ver');
      }
    } else {
      router.push('/ilan-ver');
    }
  }, [session, status, router, searchParams]);

  const handleGoBack = () => {
    router.back();
  };

  const handlePublish = () => {
    // İlanı yayınla
    router.push('/ilan-ver?publish=true');
  };

  const handleEdit = () => {
    router.back();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return null;
  }

  const selectedCategory = categories.find(cat => cat.slug === previewData.category);
  const selectedSubCategory = selectedCategory?.subcategories?.find(sub => sub.slug === previewData.subCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Geri Dön
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </button>
              <button
                onClick={handlePublish}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                İlanı Yayınla
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Premium Badge */}
          {previewData.isPremium && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 flex items-center justify-center">
              <Crown className="w-5 h-5 mr-2" />
              <span className="font-semibold">
                Premium İlan
              </span>
            </div>
          )}

          {/* Images */}
          <div className="relative">
            {previewData.images.length > 0 ? (
              <>
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={previewData.images[selectedImageIndex]}
                    alt={previewData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Navigation */}
                {previewData.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-2">
                      {previewData.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-3 h-3 rounded-full ${
                            index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Thumbnail Navigation */}
                {previewData.images.length > 1 && (
                  <div className="p-4 border-b">
                    <div className="flex space-x-2 overflow-x-auto">
                      {previewData.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${previewData.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <Eye className="w-8 h-8" />
                  </div>
                  <p>Resim yok</p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Price */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {previewData.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {previewData.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date().toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {previewData.price}
                </div>
                {previewData.isPremium && (
                  <div className="text-sm text-gray-500 mt-1">
                    Premium İlan
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Kategori:</span>
                <span className="ml-2">
                  {selectedCategory?.name}
                  {selectedSubCategory && ` > ${selectedSubCategory.name}`}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Açıklama</h3>
              <div className="text-gray-700 whitespace-pre-wrap">
                {previewData.description}
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">İletişim Bilgileri</h3>
              <div className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 mr-2" />
                <span>{previewData.phone}</span>
              </div>
            </div>

            {/* Premium Features */}
            {previewData.isPremium && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Premium Özellikler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-green-600">
                    <Star className="w-5 h-5 mr-2" />
                    <span>Öncelikli Gösterim</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Crown className="w-5 h-5 mr-2" />
                    <span>Premium Rozeti</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Eye className="w-5 h-5 mr-2" />
                    <span>Daha Fazla Görüntülenme</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Uzun Süreli Yayın</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleEdit}
            className="px-8 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Düzenle
          </button>
          <button
            onClick={handlePublish}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            İlanı Yayınla
          </button>
        </div>
      </div>
    </div>
  );
} 
