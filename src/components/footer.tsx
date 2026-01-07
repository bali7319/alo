import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Shield, AlertTriangle } from "lucide-react"
import { FooterSubscription } from "./footer-subscription"

export default function Footer() {
  return (
    <>
      {/* Güvenlik Uyarısı */}
      <div className="bg-yellow-50 border-t border-yellow-200 print:hidden">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-yellow-800">
              <p className="font-medium mb-2">⚠️ Güvenlik Uyarısı</p>
              <p className="mb-2">
                Siz de kendi güvenliğiniz ve diğer kullanıcıların daha sağlıklı alışveriş yapabilmeleri için, 
                satın almak istediğiniz ürünü teslim almadan ön ödeme yapmamaya, avans ya da kapora ödememeye özen gösteriniz.
              </p>
              <p className="mb-2">
                İlan sahiplerinin ilanlarda belirttiği herhangi bir bilgi ya da görselin gerçeği yansıtmadığını düşünüyorsanız 
                veya ilan sahiplerinin hesap profillerindeki bilgilerin doğru olmadığını düşünüyorsanız, lütfen ilanı bildiriniz.
              </p>
              <p className="text-xs text-yellow-700">
                ALO17.TR'de yer alan kullanıcıların oluşturduğu tüm içerik, görüş ve bilgilerin doğruluğu, eksiksiz ve değişmez olduğu, 
                yayınlanması ile ilgili yasal yükümlülükler içeriği oluşturan kullanıcıya aittir. Bu içeriğin, görüş ve bilgilerin 
                yanlışlık, eksiklik veya yasalarla düzenlenmiş kurallara aykırılığından ALO17.TR hiçbir şekilde sorumlu değildir. 
                Sorularınız için ilan sahibi ile irtibata geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white print:hidden">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Hakkımızda */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hakkımızda</h3>
              <p className="text-gray-400">
                Çanakkale'nin en büyük ilan sitesi olarak, kullanıcılarımıza en iyi hizmeti sunmayı hedefliyoruz.
              </p>
            </div>

            {/* Hızlı Linkler */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <Link href="/kategoriler" className="text-gray-400 hover:text-white transition-colors">
                    Kategoriler
                  </Link>
                </li>
                <li>
                  <Link href="/ilan-ver" className="text-gray-400 hover:text-white transition-colors">
                    İlan Ver
                  </Link>
                </li>
                <li>
                  <Link href="/iletisim" className="text-gray-400 hover:text-white transition-colors">
                    İletişim
                  </Link>
                </li>
                <li>
                  <Link href="/kariyer" className="text-gray-400 hover:text-white transition-colors">
                    Kariyer
                  </Link>
                </li>
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-5 w-5" />
                  <span>Cevatpaşa Mahallesi, Bayrak Sokak No:4, Çanakkale</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-5 w-5" />
                  <span>0541 404 2 404</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-5 w-5" />
                  <span>destek@alo17.tr</span>
                </li>
              </ul>
            </div>

            {/* Yasal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Yasal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/kvkk" className="text-gray-400 hover:text-white transition-colors">
                    KVKK
                  </Link>
                </li>
                <li>
                  <Link href="/cerez-politikasi" className="text-gray-400 hover:text-white transition-colors">
                    Çerez Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/kullanim-kosullari" className="text-gray-400 hover:text-white transition-colors">
                    Kullanım Koşulları
                  </Link>
                </li>
              </ul>
            </div>

            {/* Haberdar Ol */}
            <div>
              <FooterSubscription />
            </div>

            {/* Sosyal Medya */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sosyal Medya</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/alo17tr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a 
                  href="https://www.instagram.com/alo17tr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a 
                  href="https://twitter.com/alo17tr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Alt Bilgi */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Alo17. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </>
  )
} 
