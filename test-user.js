const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Önce mevcut kullanıcıyı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: 'destek@alo17.tr' }
    });

    if (existingUser) {
      console.log('Destek kullanıcısı zaten mevcut:', existingUser.email);
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash('123456', 12);

    // Destek kullanıcısını oluştur
    const user = await prisma.user.create({
      data: {
        name: 'Destek Kullanıcı',
        email: 'destek@alo17.tr',
        password: hashedPassword,
        phone: '0541 404 2 404',
        location: 'Çanakkale'
      }
    });

    console.log('Destek kullanıcısı başarıyla oluşturuldu:');
    console.log('Email:', user.email);
    console.log('Şifre: 123456');
    console.log('Ad:', user.name);
    console.log('Telefon:', user.phone);
    console.log('Konum:', user.location);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 