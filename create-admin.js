const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Admin kullanıcısı oluşturuluyor...');

    // Admin kullanıcısının var olup olmadığını kontrol et
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' }
    });

    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:', existingAdmin.email);
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await hash('123456', 12);

    // Admin kullanıcısını oluştur
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@alo17.tr',
        password: hashedPassword,
        phone: '0541 404 2 404',
        location: 'İstanbul'
      }
    });

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Şifre: 123456');
    console.log('👤 Ad:', admin.name);

  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 