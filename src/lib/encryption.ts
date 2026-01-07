import crypto from 'crypto';

// Şifreleme anahtarı - .env dosyasından alınmalı
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Anahtarı buffer'a çevir
function getKey(): Buffer {
  // ENCRYPTION_KEY 64 karakter hex string olmalı (32 byte = 256 bit)
  const key = ENCRYPTION_KEY.length === 64 
    ? Buffer.from(ENCRYPTION_KEY, 'hex')
    : crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  return key;
}

/**
 * Hassas veriyi şifreler
 * @param text Şifrelenecek metin
 * @returns Şifrelenmiş metin (base64 formatında)
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    // IV + Tag + Encrypted data
    const result = iv.toString('base64') + ':' + tag.toString('base64') + ':' + encrypted;
    
    return result;
  } catch (error) {
    console.error('Şifreleme hatası:', error);
    throw new Error('Veri şifrelenemedi');
  }
}

/**
 * Şifrelenmiş veriyi çözer
 * @param encryptedText Şifrelenmiş metin (base64 formatında)
 * @returns Çözülmüş metin
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    const key = getKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Geçersiz şifrelenmiş veri formatı');
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Şifre çözme hatası:', error);
    // Eğer şifre çözülemezse, muhtemelen düz metin (eski veri)
    // Bu durumda orijinal değeri döndür
    return encryptedText;
  }
}

/**
 * Telefon numarasını şifreler (arama için hash de tutulur)
 * @param phone Telefon numarası
 * @returns { encrypted: string, hash: string } Şifrelenmiş telefon ve hash
 */
export function encryptPhone(phone: string): { encrypted: string; hash: string } {
  if (!phone) return { encrypted: '', hash: '' };
  
  const encrypted = encrypt(phone);
  // Arama için hash (kısmi eşleşme için)
  const hash = crypto.createHash('sha256').update(phone).digest('hex').substring(0, 16);
  
  return { encrypted, hash };
}

/**
 * Şifrelenmiş telefon numarasını çözer
 * @param encrypted Şifrelenmiş telefon
 * @returns Çözülmüş telefon numarası veya null (hata durumunda)
 */
export function decryptPhone(encrypted: string): string | null {
  if (!encrypted) return null;
  
  try {
    const decrypted = decrypt(encrypted);
    
    // decrypt hata olursa orijinal değeri döndürür, bu durumda null döndür
    if (decrypted === encrypted) {
      // Şifre çözme başarısız (orijinal değer döndü)
      return null;
    }
    
    return decrypted;
  } catch (error) {
    console.error('decryptPhone hatası:', error);
    return null;
  }
}

/**
 * Email için hash oluşturur (arama için)
 * Email şifrelenmez çünkü unique constraint ve arama için gerekli
 * Ancak hash ile kısmi eşleşme yapılabilir
 */
export function hashEmail(email: string): string {
  if (!email) return '';
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
}

