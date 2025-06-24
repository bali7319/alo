const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    // Test kullanıcısını oluştur
    const user = await prisma.user.create({
      data: {
        name: 'Test Kullanıcı',
        email: 'test@alo17.tr',
        password: hashedPassword,
        phone: '0555 123 45 67',
        location: 'İstanbul'
      }
    });
    
    console.log('Test kullanıcısı başarıyla oluşturuldu:', user);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Bu email adresi zaten kullanımda. Test kullanıcısı mevcut.');
    } else {
      console.error('Hata:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 