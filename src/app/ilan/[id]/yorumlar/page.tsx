'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Star, MessageCircle, ThumbsUp, ThumbsDown, Flag, Send } from 'lucide-react';
import Link from 'next/link';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  isVerified: boolean;
}

interface ListingComments {
  id: string;
  title: string;
  averageRating: number;
  totalComments: number;
  comments: Comment[];
}

export default function IlanYorumlarPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [comments, setComments] = useState<ListingComments | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const listingId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  useEffect(() => {
    const fetchComments = async () => {
      if (!listingId) return;
      
      try {
        setLoading(true);
        // Mock veri - gerçek uygulamada API'den gelecek
        const mockComments: ListingComments = {
          id: listingId,
          title: 'iPhone 14 Pro Max',
          averageRating: 4.2,
          totalComments: 15,
          comments: [
            {
              id: '1',
              userId: 'user1',
              userName: 'Ahmet Yılmaz',
              userAvatar: 'https://i.pravatar.cc/150?img=1',
              rating: 5,
              comment: 'Harika bir ürün! Satıcı çok güvenilir ve ürün tam olarak açıklandığı gibi. Kesinlikle tavsiye ederim.',
              createdAt: new Date('2024-01-20'),
              likes: 12,
              dislikes: 0,
              isVerified: true,
            },
            {
              id: '2',
              userId: 'user2',
              userName: 'Ayşe Demir',
              userAvatar: 'https://i.pravatar.cc/150?img=2',
              rating: 4,
              comment: 'Ürün iyi durumda ama biraz daha detaylı fotoğraf olsaydı daha iyi olurdu. Genel olarak memnunum.',
              createdAt: new Date('2024-01-19'),
              likes: 8,
              dislikes: 1,
              isVerified: true,
            },
            {
              id: '3',
              userId: 'user3',
              userName: 'Mehmet Kaya',
              userAvatar: 'https://i.pravatar.cc/150?img=3',
              rating: 3,
              comment: 'Ürün beklediğim gibi değildi. Satıcı ile iletişim kurmaya çalıştım ama cevap alamadım.',
              createdAt: new Date('2024-01-18'),
              likes: 3,
              dislikes: 5,
              isVerified: false,
            },
          ],
        };
        
        setComments(mockComments);
      } catch (error) {
        console.error('Yorum yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [listingId]);

  const handleSubmitComment = () => {
    if (!newComment.trim() || !session) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      userId: session.user.id,
      userName: session.user.name || 'Anonim',
      userAvatar: 'https://i.pravatar.cc/150?img=4',
      rating,
      comment: newComment,
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      isVerified: true,
    };

    setComments(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [newCommentObj, ...prev.comments],
        totalComments: prev.totalComments + 1,
      };
    });

    setNewComment('');
    setRating(5);
  };

  const handleLike = (commentId: string) => {
    setComments(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: prev.comments.map(comment =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        ),
      };
    });
  };

  const handleDislike = (commentId: string) => {
    setComments(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: prev.comments.map(comment =>
          comment.id === commentId
            ? { ...comment, dislikes: comment.dislikes + 1 }
            : comment
        ),
      };
    });
  };

  const getSortedComments = () => {
    if (!comments) return [];
    
    return [...comments.comments].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yorumlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!comments) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Yorum bulunamadı</h1>
            <p className="text-gray-600 mb-4">Bu ilan için henüz yorum yapılmamış.</p>
            <Link 
              href={`/ilan/${listingId}`}
              className="inline-block bg-alo-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
            >
              İlana Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/ilan/${listingId}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-alo-orange transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>İlana Dön</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">İlan Yorumları</h1>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{comments.title}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(comments.averageRating))}
                <span className="ml-2 text-gray-600">{comments.averageRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{comments.totalComments} yorum</span>
            </div>
          </div>
        </div>

        {/* Yorum Yazma Formu */}
        {session && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Yorum Yaz</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puanınız</label>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yorumunuz</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                  rows={4}
                  placeholder="Deneyiminizi paylaşın..."
                />
              </div>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="bg-alo-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Yorum Gönder</span>
              </button>
            </div>
          </div>
        )}

        {/* Sıralama */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="rating">En Yüksek Puan</option>
            </select>
          </div>
        </div>

        {/* Yorumlar Listesi */}
        <div className="space-y-6">
          {getSortedComments().map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{comment.userName}</h4>
                      {comment.isVerified && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Doğrulanmış
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(comment.rating)}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{comment.comment}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{comment.createdAt.toLocaleDateString('tr-TR')}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{comment.likes}</span>
                        </button>
                        <button
                          onClick={() => handleDislike(comment.id)}
                          className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>{comment.dislikes}</span>
                        </button>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {comments.comments.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz yorum yapılmamış</h3>
            <p className="text-gray-500">Bu ilan için ilk yorumu siz yapın!</p>
          </div>
        )}
      </div>
    </div>
  );
} 