'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  createdAt: string;
  _count: {
    listings: number;
    sentMessages: number;
    receivedMessages: number;
  };
}

export default function AdminUyelerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [fetchError, setFetchError] = useState<string>('');

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      
      // Content-Type kontrolü
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('JSON olmayan response:', text.substring(0, 200));
        return;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        setUsers((data.users || []).map((user: User) => ({
          ...user,
          role: user.role || 'user', // Varsayılan rol
        })));
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        const errorMsg = data.error || data.message || 'Kullanıcılar yüklenirken bir hata oluştu';
        console.error('Hata:', errorMsg);
        setFetchError(errorMsg);
        if (data.message) {
          console.error('Detay:', data.message);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'API hatası oluştu';
      console.error('API hatası:', error);
      setFetchError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rol güncellenirken bir hata oluştu');
      }

      // Kullanıcı listesini güncelle
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      console.error('Rol güncelleme hatası:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Admin</span>;
      case 'moderator':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Moderatör</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Kullanıcı</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h1>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <div>
            <span className="font-medium">Kullanıcılar yüklenemedi:</span>
            <span className="ml-2">{fetchError}</span>
            {fetchError.includes('migration') && (
              <div className="mt-2 text-sm">
                <p>Lütfen terminalde şu komutu çalıştırın:</p>
                <code className="bg-gray-100 px-2 py-1 rounded">npx prisma generate</code>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Kullanıcılar Tablosu */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">Ad Soyad</th>
              <th className="p-3 border-b">E-posta</th>
              <th className="p-3 border-b">Telefon</th>
              <th className="p-3 border-b">Konum</th>
              <th className="p-3 border-b">Rol</th>
              <th className="p-3 border-b">İlan Sayısı</th>
              <th className="p-3 border-b">Mesaj Sayısı</th>
              <th className="p-3 border-b">Kayıt Tarihi</th>
              <th className="p-3 border-b">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-3 border-b font-medium">{user.name}</td>
                <td className="p-3 border-b">{user.email}</td>
                <td className="p-3 border-b">{user.phone || '-'}</td>
                <td className="p-3 border-b">{user.location || '-'}</td>
                <td className="p-3 border-b">
                  {getRoleBadge(user.role || 'user')}
                </td>
                <td className="p-3 border-b">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {user._count.listings}
                  </span>
                </td>
                <td className="p-3 border-b">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {user._count.sentMessages + user._count.receivedMessages}
                  </span>
                </td>
                <td className="p-3 border-b">
                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="p-3 border-b">
                  <div className="flex gap-2">
                    {user.role !== 'moderator' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(user.id, 'moderator')}
                        disabled={updatingUserId === user.id || user.role === 'admin'}
                        className="text-xs"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Moderatör Yap
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(user.id, 'user')}
                        disabled={updatingUserId === user.id || (user.role as string) === 'admin'}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <ShieldOff className="w-3 h-3 mr-1" />
                        Moderatörlükten Çıkar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Önceki
          </Button>
          <span className="px-4 py-2">
            Sayfa {page} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz kullanıcı bulunmuyor.
        </div>
      )}
    </div>
  );
} 
