import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

// Providers array'ini dinamik oluştur
const providers: any[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email ve şifre gerekli');
      }

      try {
        // Veritabanından kullanıcıyı bul
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Geçersiz email veya şifre');
        }

        // Şifreyi kontrol et
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Geçersiz email veya şifre');
        }

        // Role field'ından rolü al (varsayılan: 'user')
        const userRole = user.role || (credentials.email === 'admin@alo17.tr' ? 'admin' : 'user');

        return {
          id: user.id,
          email: user.email,
          name: user.name || 'Kullanıcı',
          role: userRole,
        };
      } catch (error: any) {
        console.error('Auth error:', error);
        // Daha detaylı hata mesajı
        if (error.message && error.message.includes('Geçersiz')) {
          throw new Error(error.message);
        }
        throw new Error('Geçersiz email veya şifre');
      } finally {
        // Prisma bağlantısını kapatma (NextAuth otomatik yönetir)
      }
    },
  }),
];

// Google OAuth sadece client ID ve secret varsa ekle
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/giris',
    signOut: '/',
    error: '/giris',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google ile giriş yapıldığında
      if (account?.provider === 'google') {
        try {
          // Kullanıcıyı veritabanında ara
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // Kullanıcı yoksa oluştur
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || (profile as any)?.name || 'Kullanıcı',
                password: '', // Google ile giriş yapanların şifresi yok
                phone: null,
                location: null,
                image: user.image || (profile as any)?.picture || null,
              },
            });
          } else {
            // Kullanıcı varsa bilgilerini güncelle (isim ve resim)
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || dbUser.name || (profile as any)?.name || 'Kullanıcı',
                image: user.image || (profile as any)?.picture || dbUser.image,
              },
            });
          }

          // Account kaydını kontrol et ve oluştur/güncelle
          if (account && account.providerAccountId) {
            try {
              const existingAccount = await prisma.account.findUnique({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
              });

              if (!existingAccount) {
                // Account kaydı yoksa oluştur
                await prisma.account.create({
                  data: {
                    userId: dbUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    refresh_token: account.refresh_token || null,
                    access_token: account.access_token || null,
                    expires_at: account.expires_at || null,
                    token_type: account.token_type || null,
                    scope: account.scope || null,
                    id_token: account.id_token || null,
                    session_state: account.session_state || null,
                  },
                });
              } else {
                // Account kaydı varsa güncelle
                await prisma.account.update({
                  where: {
                    provider_providerAccountId: {
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                    },
                  },
                  data: {
                    refresh_token: account.refresh_token || existingAccount.refresh_token,
                    access_token: account.access_token || existingAccount.access_token,
                    expires_at: account.expires_at || existingAccount.expires_at,
                    token_type: account.token_type || existingAccount.token_type,
                    scope: account.scope || existingAccount.scope,
                    id_token: account.id_token || existingAccount.id_token,
                    session_state: account.session_state || existingAccount.session_state,
                  },
                });
              }
            } catch (accountError) {
              // Account kaydı başarısız olsa bile kullanıcı giriş yapabilir
              console.error('Account kayıt hatası (devam ediliyor):', accountError);
            }
          }

          // Kullanıcı bilgilerini güncelle
          user.id = dbUser.id;
          (user as any).role = dbUser.role || (dbUser.email === 'admin@alo17.tr' ? 'admin' : 'user');
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user && token.email) {
        // Veritabanından güncel kullanıcı bilgilerini çek
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              location: true,
              image: true,
              role: true,
            },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.email = dbUser.email;
            session.user.name = dbUser.name;
            session.user.image = dbUser.image;
            (session.user as any).role = dbUser.role || (dbUser.email === 'admin@alo17.tr' ? 'admin' : 'user');
            (session.user as any).phone = dbUser.phone;
            (session.user as any).location = dbUser.location;
          } else {
            // Fallback: token'dan bilgileri al
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            (session.user as any).role = token.role as string;
          }
        } catch (error) {
          console.error('Session callback error:', error);
          // Hata durumunda token'dan bilgileri al
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          (session.user as any).role = token.role as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here-change-in-production',
}; 