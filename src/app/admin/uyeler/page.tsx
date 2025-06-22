'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } else {
        console.error('Hata:', data.error);
      }
    } catch (error) {
      console.error('API hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Üye Yönetimi</h1>
      
      {/* Üyeler Tablosu */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">Ad Soyad</th>
              <th className="p-3 border-b">E-posta</th>
              <th className="p-3 border-b">Telefon</th>
              <th className="p-3 border-b">Konum</th>
              <th className="p-3 border-b">İlan Sayısı</th>
              <th className="p-3 border-b">Mesaj Sayısı</th>
              <th className="p-3 border-b">Kayıt Tarihi</th>
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
          Henüz üye bulunmuyor.
        </div>
      )}
    </div>
  );
} 
