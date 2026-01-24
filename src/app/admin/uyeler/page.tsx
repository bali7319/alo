'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff, AlertCircle, Trash2, UserX, UserCheck, Crown, Users, Edit2, Check, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  fallbackPhone?: string | null;
  location: string;
  role: string;
  createdAt: string;
  isActive?: boolean;
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
  const [showArmy, setShowArmy] = useState(false);
  const [armyUsers, setArmyUsers] = useState<User[]>([]);
  const [editingPhoneUserId, setEditingPhoneUserId] = useState<string | null>(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState<string>('');
  const [editingNameUserId, setEditingNameUserId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

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
      
      // Arma listesini de güncelle
      if (showArmy) {
        fetchArmyUsers();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      console.error('Rol güncelleme hatası:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setUpdatingUserId(userId);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kullanıcı silinirken bir hata oluştu');
      }

      // Kullanıcıyı listeden kaldır
      setUsers(users.filter(user => user.id !== userId));
      
      if (showArmy) {
        setArmyUsers(armyUsers.filter(user => user.id !== userId));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      console.error('Kullanıcı silme hatası:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setUpdatingUserId(userId);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kullanıcı durumu güncellenirken bir hata oluştu');
      }

      // Kullanıcı listesini güncelle
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !isActive } : user
      ));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      console.error('Kullanıcı durum güncelleme hatası:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleEditPhone = (user: User) => {
    setEditingPhoneUserId(user.id);
    setEditingPhoneValue(user.phone || '');
  };

  const handleCancelEditPhone = () => {
    setEditingPhoneUserId(null);
    setEditingPhoneValue('');
  };

  const handleEditName = (user: User) => {
    setEditingNameUserId(user.id);
    setEditingNameValue(user.name || '');
  };

  const handleCancelEditName = () => {
    setEditingNameUserId(null);
    setEditingNameValue('');
  };

  const handleSavePhone = async (userId: string) => {
    setUpdatingUserId(userId);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: editingPhoneValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Telefon numarası güncellenirken bir hata oluştu');
      }

      // Kullanıcı listesini güncelle
      setUsers(users.map(user => 
        user.id === userId ? { ...user, phone: editingPhoneValue } : user
      ));
      
      setEditingPhoneUserId(null);
      setEditingPhoneValue('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      console.error('Telefon numarası güncelleme hatası:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSaveName = async (userId: string) => {
    const newName = editingNameValue.trim();
    if (newName.length > 100) {
      setError('İsim en fazla 100 karakter olabilir');
      return;
    }

    setUpdatingUserId(userId);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İsim güncellenirken bir hata oluştu');
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, name: newName } : user
      ));
      
      if (showArmy) {
        setArmyUsers(armyUsers.map(user =>
          user.id === userId ? { ...user, name: newName } : user
        ));
      }

      setEditingNameUserId(null);
      setEditingNameValue('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      console.error('İsim güncelleme hatası:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const fetchArmyUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?role=moderator,admin&limit=100');
      const data = await response.json();
      
      if (response.ok) {
        setArmyUsers((data.users || []).filter((user: User) => 
          user.role === 'moderator' || user.role === 'admin'
        ));
      }
    } catch (error) {
      console.error('Arma kullanıcıları yükleme hatası:', error);
    }
  };

  useEffect(() => {
    if (showArmy) {
      fetchArmyUsers();
    }
  }, [showArmy]);

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        <Button
          onClick={() => {
            setShowArmy(!showArmy);
            if (!showArmy) {
              fetchArmyUsers();
            }
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          {showArmy ? 'Tüm Kullanıcılar' : 'Arma (Moderatör/Admin)'}
        </Button>
      </div>
      
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

      {/* Arma Ekranı */}
      {showArmy && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Arma - Moderatör ve Admin Listesi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {armyUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' ? (
                      <Crown className="w-5 h-5 text-red-500" />
                    ) : (
                      <Shield className="w-5 h-5 text-purple-500" />
                    )}
                    <span className="font-semibold">{user.name}</span>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{user.email}</div>
                  {user.phone && <div>{user.phone}</div>}
                  <div className="text-xs text-gray-500">
                    {user._count.listings} ilan • {user._count.sentMessages + user._count.receivedMessages} mesaj
                  </div>
                </div>
              </div>
            ))}
          </div>
          {armyUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Henüz moderatör veya admin bulunmuyor.
            </div>
          )}
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
                <td className="p-3 border-b font-medium">
                  {editingNameUserId === user.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ad Soyad"
                        disabled={updatingUserId === user.id}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveName(user.id)}
                        disabled={updatingUserId === user.id}
                        className="text-xs px-2 py-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Kaydet"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditName}
                        disabled={updatingUserId === user.id}
                        className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="İptal"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{user.name || '-'}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditName(user)}
                        disabled={
                          updatingUserId === user.id ||
                          editingPhoneUserId === user.id ||
                          user.email === 'admin@alo17.tr'
                        }
                        className="text-xs px-1 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="İsim düzenle"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </td>
                <td className="p-3 border-b">{user.email}</td>
                <td className="p-3 border-b">
                  {editingPhoneUserId === user.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={editingPhoneValue}
                        onChange={(e) => setEditingPhoneValue(e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Telefon numarası"
                        disabled={updatingUserId === user.id}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSavePhone(user.id)}
                        disabled={updatingUserId === user.id}
                        className="text-xs px-2 py-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditPhone}
                        disabled={updatingUserId === user.id}
                        className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col leading-tight">
                        <span>{user.phone || user.fallbackPhone || '-'}</span>
                        {!user.phone && user.fallbackPhone && (
                          <span className="text-[11px] text-gray-500">(son ilan)</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPhone(user)}
                        disabled={updatingUserId === user.id || editingNameUserId === user.id || user.email === 'admin@alo17.tr'}
                        className="text-xs px-1 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </td>
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
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {/* Rol Değiştirme Dropdown */}
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updatingUserId === user.id || user.email === 'admin@alo17.tr'}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      title={user.email === 'admin@alo17.tr' ? 'Bu kullanıcı sistem kullanıcısıdır ve korumalıdır' : ''}
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="moderator">Moderatör</option>
                      <option value="admin">Admin</option>
                    </select>
                    
                    {/* İşlem Butonları */}
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(user.id, user.isActive !== false)}
                        disabled={updatingUserId === user.id || user.email === 'admin@alo17.tr'}
                        className="text-xs px-2 py-1"
                        title={user.email === 'admin@alo17.tr' ? 'Bu kullanıcı sistem kullanıcısıdır ve korumalıdır' : (user.isActive !== false ? 'Pasife Al' : 'Aktif Et')}
                      >
                        {user.isActive !== false ? (
                          <UserX className="w-3 h-3" />
                        ) : (
                          <UserCheck className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={updatingUserId === user.id || user.role === 'admin' || user.email === 'admin@alo17.tr'}
                        className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title={user.email === 'admin@alo17.tr' ? 'Bu kullanıcı sistem kullanıcısıdır ve korumalıdır' : 'Sil'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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
