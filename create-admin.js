const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@alo17.tr';
    const password = 'Admin2025!'; // Bu şifreyi değiştirebilirsiniz
    const name = 'Admin';

    // Kullanıcı var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Admin kullanıcısı zaten mevcut!');
      console.log('Email:', existingUser.email);
      console.log('Rol:', existingUser.role);
      
      // Şifreyi güncelle
      const hashedPassword = await hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'admin',
        },
      });
      console.log('Şifre güncellendi!');
      console.log('Yeni şifre:', password);
    } else {
      // Yeni admin kullanıcısı oluştur
      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'admin',
        },
      });
      console.log('Admin kullanıcısı oluşturuldu!');
      console.log('Email:', user.email);
      console.log('Şifre:', password);
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

