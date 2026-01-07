/**
 * Client-side Admin Helper Functions
 * 
 * Client-side'da process.env kullanılamadığı için,
 * session'daki role field'ını kullanır veya email pattern kontrolü yapar.
 */

/**
 * Session'dan admin kontrolü yapar
 * @param session - NextAuth session object
 * @returns true if user is admin
 */
export function isAdmin(session: { user?: { role?: string; email?: string | null } } | null): boolean {
  if (!session?.user) return false;
  
  // Önce role field'ını kontrol et (en güvenilir)
  if (session.user.role === 'admin') {
    return true;
  }
  
  // Fallback: Email pattern kontrolü (backward compatibility)
  const email = session.user.email;
  if (!email) return false;
  
  // Admin email pattern'leri
  return email === 'admin@alo17.tr' ||
         email === 'admin@alo17.com' ||
         email === 'destek@alo17.tr' ||
         email === 'destek@alo17.com' ||
         email.endsWith('@alo17.com') ||
         email.endsWith('@alo17.tr');
}

