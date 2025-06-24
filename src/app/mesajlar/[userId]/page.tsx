'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Send, User, Clock } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function MesajlarPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      try {
        const { userId: id } = await params;
        setUserId(id);
      } catch (err) {
        console.error('Error getting params:', err);
        setError('Sayfa parametreleri alınamadı');
      }
    };

    getParams();
  }, [params]);

  useEffect(() => {
    if (status === 'loading' || !userId) return;

    if (!session?.user?.email) {
      router.push('/giris');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Kullanıcı bilgilerini al
        const userResponse = await fetch(`/api/user/profile`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        // Mesajları al
        await fetchMessages();
      } catch (err) {
        setError('Veriler yüklenirken hata oluştu');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, userId, router]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        // Bu kullanıcı ile olan mesajları filtrele
        const filteredMessages = data.messages.filter((msg: Message) => 
          (msg.senderId === userId && msg.receiverId === user?.id) ||
          (msg.senderId === user?.id && msg.receiverId === userId)
        );
        setMessages(filteredMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: userId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [data.data, ...prev]);
        setNewMessage('');
        // Mesajları yenile
        await fetchMessages();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Mesaj gönderilemedi');
      }
    } catch (err) {
      setError('Mesaj gönderilirken hata oluştu');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MessageCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/mesajlar"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Mesajlara Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href="/mesajlar"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Kullanıcı {userId}
                    </h1>
                    <p className="text-sm text-gray-500">
                      Mesajlaşma
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-96 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz mesaj yok
                </h3>
                <p className="text-gray-600">
                  Bu kullanıcı ile mesajlaşmaya başlayın
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center mt-1 text-xs ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 