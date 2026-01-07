import { NextAuthOptions, User, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { isAdminEmail } from './admin';
import { safeLog, safeError } from './logger';

// Debug mode: sadece development veya DEBUG_AUTH env variable ile aktif
const DEBUG_AUTH = process.env.NODE_ENV === 'development' || process.env.DEBUG_AUTH === 'true';

// Providers array'ini dinamik oluştur
const providers: (ReturnType<typeof CredentialsProvider> | ReturnType<typeof GoogleProvider>)[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        if (DEBUG_AUTH) {
          safeLog('[AUTH] Missing credentials', { hasEmail: !!credentials?.email, hasPassword: !!credentials?.password });
        }
        throw new Error('Email ve şifre gerekli');
      }

      const startTime = DEBUG_AUTH ? Date.now() : 0;
      const emailLower = credentials.email.toLowerCase().trim();

      try {
        if (DEBUG_AUTH) {
          safeLog('[AUTH] Login attempt', { email: emailLower }, ['email']);
        }
        
        // Veritabanından kullanıcıyı bul (email case-insensitive)
        const user = await prisma.user.findUnique({
          where: { email: emailLower },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            phone: true,
            location: true,
            image: true,
          },
        });

        if (!user) {
          if (DEBUG_AUTH) {
            safeLog('[AUTH] User not found', { email: emailLower }, ['email']);
          }
          // Güvenlik: Kullanıcı bulunamadı ve şifre yanlış aynı mesajı döndür
          throw new Error('Geçersiz email veya şifre');
        }

        if (!user.password) {
          if (DEBUG_AUTH) {
            safeLog('[AUTH] User has no password (OAuth user?)', { userId: user.id }, ['email']);
          }
          throw new Error('Geçersiz email veya şifre');
        }

        // Password hash format validation (memory efficient - sadece prefix kontrolü)
        const hashPrefix = user.password.substring(0, 4);
        if (!hashPrefix.startsWith('$2')) {
          safeError('[AUTH] Invalid password hash format', { 
            userId: user.id, 
            hashPrefix,
            hashLength: user.password.length 
          }, ['email']);
          throw new Error('Geçersiz email veya şifre');
        }

        // Şifreyi kontrol et (bcrypt compare - CPU intensive, await ile optimize)
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          if (DEBUG_AUTH) {
            const duration = Date.now() - startTime;
            safeLog('[AUTH] Password mismatch', { 
              userId: user.id, 
              duration: `${duration}ms` 
            }, ['email']);
          }
          throw new Error('Geçersiz email veya şifre');
        }

        if (DEBUG_AUTH) {
          const duration = Date.now() - startTime;
          safeLog('[AUTH] Login successful', { 
            userId: user.id, 
            role: user.role || 'user',
            duration: `${duration}ms` 
          }, ['email']);
        }

        // Role field'ından rolü al (varsayılan: 'user')
        const userRole = user.role || (isAdminEmail(credentials.email) ? 'admin' : 'user');

        // Telefon numarasını çöz (şifrelenmişse) - lazy import ile memory optimize
        let decryptedPhone: string | undefined = user.phone || undefined;
        if (decryptedPhone && decryptedPhone.includes(':')) {
          // Şifrelenmiş telefon numaraları "IV:Tag:Encrypted" formatında (3 parça)
          const parts = decryptedPhone.split(':');
          if (parts.length === 3) {
            try {
              // Lazy import - sadece gerektiğinde yükle
              const { decryptPhone } = await import('./encryption');
              const decrypted = decryptPhone(decryptedPhone);
              decryptedPhone = decrypted || undefined;
            } catch (error) {
              // Şifre çözme başarısız - sessizce devam et (kritik değil)
              if (DEBUG_AUTH) {
                safeWarn('[AUTH] Phone decryption failed', { userId: user.id }, ['email']);
              }
              decryptedPhone = undefined;
            }
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || 'Kullanıcı',
          role: userRole,
          phone: decryptedPhone,
          location: user.location || undefined,
          image: user.image || undefined,
        };
      } catch (error: unknown) {
        // Structured error logging (hassas bilgiler maskelenmiş)
        if (error instanceof Error) {
          if (error.message.includes('Geçersiz')) {
            // Beklenen auth hataları - sadece debug mode'da logla
            if (DEBUG_AUTH) {
              safeError('[AUTH] Authentication failed', { 
                error: error.message,
                email: emailLower 
              }, ['email']);
            }
            throw new Error(error.message);
          }
          // Beklenmeyen hatalar - her zaman logla
          safeError('[AUTH] Unexpected error', { 
            error: error.message,
            stack: error.stack?.substring(0, 200) // Stack trace'in sadece ilk 200 karakteri
          }, ['email']);
        } else {
          safeError('[AUTH] Unknown error', { error: String(error) }, ['email']);
        }
        throw new Error('Geçersiz email veya şifre');
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
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  );
  if (DEBUG_AUTH) {
    safeLog('Google OAuth provider eklendi');
  }
} else {
  if (DEBUG_AUTH) {
    safeLog('Google OAuth provider eklenmedi - GOOGLE_CLIENT_ID veya GOOGLE_CLIENT_SECRET eksik');
  }
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
    updateAge: 24 * 60 * 60, // 24 saatte bir güncelle
  },
  pages: {
    signIn: '/giris',
    signOut: '/',
    error: '/giris',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS'de secure cookie
        maxAge: 30 * 24 * 60 * 60, // 30 gün
        domain: process.env.NODE_ENV === 'production' ? '.alo17.tr' : undefined, // 🔴 NOKTA ŞART - subdomain'leri de kapsar
      },
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Eğer callbackUrl varsa (korunan sayfadan geldiyse) oraya yönlendir
      // Yoksa ana sayfaya yönlendir
      if (url.startsWith(baseUrl)) {
        // Giriş sayfasına yönlendirmeyi engelle
        if (url === `${baseUrl}/giris` || url === `${baseUrl}/giris?error=`) {
          return baseUrl;
        }
        return url;
      }
      // Dış URL'lere izin verme, ana sayfaya yönlendir
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      // Google ile giriş yapıldığında
      if (account?.provider === 'google') {
        try {
          if (DEBUG_AUTH) {
            safeLog('Google signIn callback başladı', { 
              email: user.email, 
              name: user.name,
              accountProvider: account?.provider 
            });
          }
          
          // Email kontrolü
          if (!user.email) {
            safeError('Google sign in error: Email bulunamadı', { user, profile });
            return false;
          }

          if (DEBUG_AUTH) {
            safeLog('Google sign in başladı', { email: user.email, name: user.name });
          }

          // Kullanıcıyı veritabanında ara
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // Kullanıcı yoksa oluştur
          if (!dbUser) {
            console.log('Yeni kullanıcı oluşturuluyor:', user.email);
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || (profile?.name as string | undefined) || 'Kullanıcı',
                password: '', // Google ile giriş yapanların şifresi yok
                phone: null,
                location: null,
                image: user.image || ((profile as any)?.picture as string | undefined) || null,
              },
            });
            if (DEBUG_AUTH) {
              safeLog('Kullanıcı oluşturuldu', { userId: dbUser.id });
            }
          } else {
            // Kullanıcı varsa bilgilerini güncelle (isim ve resim)
            if (DEBUG_AUTH) {
              safeLog('Kullanıcı güncelleniyor', { userId: dbUser.id });
            }
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || dbUser.name || (profile?.name as string | undefined) || 'Kullanıcı',
                image: user.image || ((profile as any)?.picture as string | undefined) || dbUser.image,
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
          (user as User & { role?: string }).role = dbUser.role || (isAdminEmail(dbUser.email) ? 'admin' : 'user');
          
          console.log('Google sign in başarılı:', { userId: dbUser.id, email: dbUser.email });
        } catch (error: unknown) {
          safeError('Google sign in error', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : undefined;
          if (DEBUG_AUTH) {
            safeLog('Error details', {
              message: errorMessage,
              stack: errorStack,
              email: user?.email,
            });
          }
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: User & { role?: string; phone?: string; location?: string } }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.phone = (user as any).phone;
        token.location = (user as any).location;
        token.picture = (user as any).image;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.email) {
        // Performans için token'dan bilgileri al (database sorgusu yapmadan)
        // Token zaten JWT callback'inde güncelleniyor
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | undefined;
        session.user.role = token.role as string;
        (session.user as Session['user'] & { phone?: string; location?: string }).phone = token.phone as string | undefined;
        (session.user as Session['user'] & { phone?: string; location?: string }).location = token.location as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here-change-in-production',
}; 