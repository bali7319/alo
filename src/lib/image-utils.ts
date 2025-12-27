/**
 * Resim optimizasyon yardımcı fonksiyonları
 * Base64 resimleri küçültmek için kullanılır
 */

/**
 * Resmi base64'e çevirirken boyutunu küçültür
 * @param file - Yüklenecek resim dosyası
 * @param maxWidth - Maksimum genişlik (varsayılan: 1920)
 * @param maxHeight - Maksimum yükseklik (varsayılan: 1080)
 * @param quality - JPEG kalitesi 0-1 arası (varsayılan: 0.8)
 * @returns Base64 string
 */
export async function compressImageToBase64(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Dosya boyutu kontrolü (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Resim dosyası 5MB\'dan büyük olamaz'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Canvas oluştur
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Boyutları küçült (aspect ratio korunarak)
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Canvas'a çiz
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context alınamadı'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Base64'e çevir (JPEG formatında, kalite ayarlı)
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Resim yüklenemedi'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('FileReader sonucu alınamadı'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Birden fazla resmi optimize eder
 * @param files - Yüklenecek resim dosyaları
 * @param maxWidth - Maksimum genişlik
 * @param maxHeight - Maksimum yükseklik
 * @param quality - JPEG kalitesi
 * @returns Base64 string array
 */
export async function compressImagesToBase64(
  files: File[],
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<string[]> {
  const promises = files.map(file => compressImageToBase64(file, maxWidth, maxHeight, quality));
  return Promise.all(promises);
}

