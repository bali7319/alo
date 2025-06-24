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

export async function generateStaticParams() {
  // Örnek olarak ilk 10 ilanı statik olarak oluştur
  const listings = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' }
  ];
  
  return listings.map((listing) => ({
    id: listing.id,
  }));
}

export default async function IlanYorumlarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: listingId } = await params;
  
  // Server-side data fetching
  let comments: ListingComments | null = null;
  
  try {
    // Mock veri - gerçek uygulamada API'den gelecek
    comments = {
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
  } catch (error) {
    console.error('Yorum yükleme hatası:', error);
  }

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

  if (!comments) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Yorumlar bulunamadı</h1>
            <p className="text-gray-600">Bu ilan için henüz yorum bulunmuyor.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Yorumlar ve Değerlendirmeler</h1>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{comments.title}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(comments.averageRating))}
                <span className="text-lg font-semibold text-gray-800 ml-2">
                  {comments.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">({comments.totalComments} yorum)</span>
            </div>
          </div>
        </div>

        {/* Yorumlar Listesi */}
        <div className="space-y-6">
          {comments.comments.map((comment) => (
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
                      <h3 className="font-semibold text-gray-800">{comment.userName}</h3>
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
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{comment.createdAt.toLocaleDateString('tr-TR')}</span>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{comment.dislikes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                        <Flag className="w-4 h-4" />
                        <span>Bildir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Yorum Ekleme Formu */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yorum Ekle</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puanınız
              </label>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-gray-300 cursor-pointer hover:text-yellow-400"
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-alo-orange focus:border-transparent"
                rows={4}
                placeholder="Deneyiminizi paylaşın..."
              />
            </div>
            
            <div className="flex justify-end">
              <button className="flex items-center space-x-2 bg-alo-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
                <Send className="w-4 h-4" />
                <span>Yorum Gönder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 