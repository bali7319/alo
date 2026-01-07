/**
 * Mevcut telefon numaralarını şifreler
 * 
 * Kullanım:
 * npx ts-node scripts/encrypt-existing-phones.ts
 * 
 * VEYA
 * 
 * node -r ts-node/register scripts/encrypt-existing-phones.ts
 */

import { PrismaClient } from '@prisma/client';
import { encryptPhone, decryptPhone } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function encryptExistingPhones() {
  try {
    console.log('Mevcut telefon numaraları şifreleniyor...');
    
    // Tüm kullanıcıları al
    const users = await prisma.user.findMany({
      where: {
        phone: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });

    console.log(`Toplam ${users.length} kullanıcı bulundu (telefon numarası olan)`);

    let encryptedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      if (!user.phone) continue;

      try {
        // Telefon numarası zaten şifrelenmiş mi kontrol et
        // Şifrelenmiş telefon numaraları ":" içerir (IV:Tag:Encrypted formatı)
        const isAlreadyEncrypted = user.phone.includes(':') && user.phone.split(':').length === 3;

        if (isAlreadyEncrypted) {
          // Zaten şifrelenmiş, çözüp tekrar şifrele (güncel anahtarla)
          try {
            const decrypted = decryptPhone(user.phone);
            const phoneData = encryptPhone(decrypted);
            
            await prisma.user.update({
              where: { id: user.id },
              data: { phone: phoneData.encrypted },
            });
            
            encryptedCount++;
            console.log(`✓ ${user.email}: Telefon numarası yeniden şifrelendi`);
          } catch (error) {
            // Şifre çözülemiyorsa, yeni şifrele
            const phoneData = encryptPhone(user.phone);
            
            await prisma.user.update({
              where: { id: user.id },
              data: { phone: phoneData.encrypted },
            });
            
            encryptedCount++;
            console.log(`✓ ${user.email}: Telefon numarası şifrelendi (eski format)`);
          }
        } else {
          // Düz metin, şifrele
          const phoneData = encryptPhone(user.phone);
          
          await prisma.user.update({
            where: { id: user.id },
            data: { phone: phoneData.encrypted },
          });
          
          encryptedCount++;
          console.log(`✓ ${user.email}: Telefon numarası şifrelendi`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ ${user.email}: Hata -`, error);
      }
    }

    console.log('\n========================================');
    console.log('Şifreleme işlemi tamamlandı!');
    console.log(`✓ Şifrelenen: ${encryptedCount}`);
    console.log(`✗ Hata: ${errorCount}`);
    console.log('========================================');
  } catch (error) {
    console.error('Genel hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
encryptExistingPhones();

