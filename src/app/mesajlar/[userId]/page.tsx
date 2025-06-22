'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  isRead: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export default function MesajlarPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const userId = params?.userId as string;
  const ilanId = searchParams?.get('ilan');

  useEffect(() => {
    if (!session?.user?.id || !userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Diğer kullanıcı bilgilerini getir
        const userResponse = await fetch(`/api/user/${userId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setOtherUser(userData);
        }

        // İlan bilgilerini getir (eğer ilan ID varsa)
        if (ilanId) {
          const listingResponse = await fetch(`/api/listings/${ilanId}`);
          if (listingResponse.ok) {
            const listingData = await listingResponse.json();
            setListing(listingData);
          }
        }

        // Mesajları getir
        const messagesResponse = await fetch(`/api/messages?userId=${userId}`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id, userId, ilanId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id || !userId) return;

    try {
      setSending(true);
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: userId,
          listingId: ilanId,
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Giriş Yapmanız Gerekli</h1>
          <p className="text-gray-600 mb-4">Mesajlaşmak için lütfen giriş yapın.</p>
          <Link 
            href="/giris" 
            className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-alo-orange transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Geri Dön</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {otherUser?.name || 'Kullanıcı'}
                </h1>
                <p className="text-sm text-gray-500">Mesajlaşma</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Kolon - İlan Bilgileri */}
        {listing && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">İlan Hakkında</h2>
              <div className="space-y-4">
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <Image
                    src={listing.images[0] || '/images/placeholder.jpg'}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">{listing.title}</h3>
                  <p className="text-lg font-bold text-blue-600">{listing.price} TL</p>
                </div>
                <Link 
                  href={`/ilan/${listing.id}`}
                  className="block text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  İlanı Görüntüle
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sağ Kolon - Mesajlaşma */}
        <div className={`${listing ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Mesaj Listesi */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz mesaj yok</p>
                  <p className="text-sm text-gray-400">İlk mesajı siz gönderin!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === session.user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === session.user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === session.user.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mesaj Gönderme */}
            <div className="border-t p-4">
              <div className="flex space-x-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>Gönder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 