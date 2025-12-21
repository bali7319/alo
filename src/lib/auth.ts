import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
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

          // Admin kontrolü (email'e göre)
          const isAdmin = credentials.email === 'admin@alo17.tr';

          return {
            id: user.id,
            email: user.email,
            name: user.name || 'Kullanıcı',
            role: isAdmin ? 'admin' : 'user',
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Geçersiz email veya şifre');
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
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
                name: user.name || profile?.name || 'Kullanıcı',
                password: '', // Google ile giriş yapanların şifresi yok
                phone: null,
                location: null,
              },
            });
          }

          // Kullanıcı bilgilerini güncelle
          user.id = dbUser.id;
          user.role = dbUser.email === 'admin@alo17.tr' ? 'admin' : 'user';
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here-change-in-production',
}; 