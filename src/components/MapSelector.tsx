'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number };
}

// Leaflet bileşenlerini dinamik olarak yükle
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

export default function MapSelector({ onLocationSelect, onClose, initialLocation }: MapSelectorProps) {
  const [isClient, setIsClient] = useState(false);
  const [useMapEvents, setUseMapEvents] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Leaflet'i sadece client-side'da yükle
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        const { useMapEvents } = await import('react-leaflet');
        
        // Leaflet CSS'ini dinamik olarak yükle
        if (typeof window !== 'undefined') {
          // CSS'in zaten yüklenip yüklenmediğini kontrol et
          const existingLink = document.querySelector('link[href*="leaflet"]');
          if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
            document.head.appendChild(link);
          }
          
          // Leaflet marker icon sorununu çöz
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          });
        }

        setUseMapEvents(useMapEvents);
      } catch (err) {
        console.error('Harita yükleme hatası:', err);
        setError('Harita yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
      }
    };

    loadMap();
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Harita Yüklenemedi</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sayfayı Yenile
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isClient || !useMapEvents) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Harita yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, address: string) => void }) {
    const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);

    useMapEvents({
      click: async (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition(e.latlng);
        
        // Reverse geocoding ile adres alma
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data.display_name) {
            // Adres parçalarını daha düzenli hale getir
            const addressParts = data.display_name.split(',');
            let formattedAddress = '';
            
            // Türkiye için özel format
            if (data.address?.country === 'Türkiye') {
              const city = data.address?.city || data.address?.state || data.address?.province || '';
              const district = data.address?.suburb || data.address?.district || data.address?.county || '';
              const street = data.address?.road || '';
              const houseNumber = data.address?.house_number || '';
              
              if (street && houseNumber) {
                formattedAddress = `${street} ${houseNumber}, ${district}, ${city}`;
              } else if (district && city) {
                formattedAddress = `${district}, ${city}`;
              } else if (city) {
                formattedAddress = city;
              } else {
                formattedAddress = data.display_name;
              }
            } else {
              // Diğer ülkeler için ilk 3 parçayı al
              formattedAddress = addressParts.slice(0, 3).join(', ');
            }
            
            onLocationSelect(lat, lng, formattedAddress);
          } else {
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        } catch (error) {
          console.error('Adres alma hatası:', error);
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      },
    });

    return selectedPosition ? <Marker position={selectedPosition} /> : null;
  }

  const defaultLocation = initialLocation || { lat: 39.9334, lng: 32.8597 }; // Ankara

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Haritadan Adres Seçin</h3>
            <p className="text-sm text-gray-600">Haritada istediğiniz yere tıklayın</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🗺️ Haritada istediğiniz yere tıklayarak adres seçebilirsiniz. 
            Seçilen konum otomatik olarak adres bilgisine dönüştürülecektir.
          </p>
        </div>

        <div className="h-96 w-full rounded-lg overflow-hidden border">
          <MapContainer
            center={[defaultLocation.lat, defaultLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler onLocationSelect={onLocationSelect} />
          </MapContainer>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
} 
