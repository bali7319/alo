'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, User, Calendar, ArrowRight, AlertTriangle, Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  listingId: string | null;
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
  listing?: {
    id: string;
    title: string;
    images: string;
  };
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  listing?: {
    id: string;
    title: string;
    images: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      const currentPath = window.location.pathname;
      router.push(`/giris?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Kullanıcı bilgilerini al
      const userResponse = await fetch('/api/user/profile');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUser(userData);
      }
      
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const messages = data.messages || [];
      
      // Mesajları konuşmalara grupla
      const conversationMap = new Map<string, Conversation>();
      
      messages.forEach((message: Message) => {
        const currentUserId = currentUser?.id;
        if (!currentUserId) return;
        
        const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
        const otherUser = message.senderId === currentUserId ? message.receiver : message.sender;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            otherUser,
            listing: message.listing,
            lastMessage: {
              content: message.content,
              createdAt: message.createdAt,
              senderId: message.senderId,
            },
            unreadCount: 0,
          });
        } else {
          const conversation = conversationMap.get(otherUserId)!;
          if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
            conversation.lastMessage = {
              content: message.content,
              createdAt: message.createdAt,
              senderId: message.senderId,
            };
          }
        }
      });
      
      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
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
    } else if (diffInHours < 168) { // 7 gün
      return date.toLocaleDateString('tr-TR', { 
        weekday: 'short'
      });
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit'
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
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
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Mesajlar</h1>
                  <p className="text-sm text-gray-500">
                    {conversations.length} konuşma
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="divide-y divide-gray-200">
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz mesajınız yok
                </h3>
                <p className="text-gray-600 mb-6">
                  İlanlarda mesaj göndererek satıcılarla iletişime geçin
                </p>
                <Link
                  href="/ilanlar"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  İlanları Keşfet
                </Link>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isOwnMessage = conversation.lastMessage.senderId === currentUser?.id;
                return (
                  <Link
                    key={conversation.id}
                    href={`/mesajlar/${conversation.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-3">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center relative overflow-hidden">
                            {conversation.otherUser.image ? (
                              <Image
                                src={conversation.otherUser.image}
                                alt={conversation.otherUser.name}
                                fill
                                sizes="48px"
                                className="object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-blue-600 font-medium text-sm">
                                {getInitials(conversation.otherUser.name || conversation.otherUser.email)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Conversation Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.otherUser.name || conversation.otherUser.email}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatDate(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">
                              {isOwnMessage && 'Sen: '}
                              {conversation.lastMessage.content}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="flex-shrink-0 ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>

                          {conversation.listing && (
                            <div className="mt-1">
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                {conversation.listing.title}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 