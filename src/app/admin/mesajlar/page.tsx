'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminMesajlarPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      const response = await fetch(`/api/admin/messages?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages);
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
    fetchMessages();
  }, [page]);

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mesaj Yönetimi</h1>
      
      {/* Mesajlar Tablosu */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">Gönderen</th>
              <th className="p-3 border-b">Alıcı</th>
              <th className="p-3 border-b">Mesaj</th>
              <th className="p-3 border-b">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">
                  <div>
                    <div className="font-medium">{message.sender.name}</div>
                    <div className="text-sm text-gray-500">{message.sender.email}</div>
                  </div>
                </td>
                <td className="p-3 border-b">
                  <div>
                    <div className="font-medium">{message.receiver.name}</div>
                    <div className="text-sm text-gray-500">{message.receiver.email}</div>
                  </div>
                </td>
                <td className="p-3 border-b">
                  <div className="max-w-md">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </td>
                <td className="p-3 border-b">
                  {new Date(message.createdAt).toLocaleString('tr-TR')}
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

      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz mesaj bulunmuyor.
        </div>
      )}
    </div>
  );
} 
