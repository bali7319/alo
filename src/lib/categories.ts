import { LucideIcon } from "lucide-react"
import { 
  Briefcase,
  Wrench,
  Smartphone,
  Home,
  Shirt,
  Baby,
  Dumbbell,
  GraduationCap,
  Utensils,
  Hotel,
  Heart,
  Palette,
  Gift,
  MoreHorizontal
} from "lucide-react"

export interface Category {
  name: string
  icon: LucideIcon | string
  slug: string
  subcategories?: Category[]
}

export const categories: Category[] = [
  {
    name: "İş",
    icon: Briefcase,
    slug: "is",
    subcategories: [
      { name: "Garson/Komi", icon: "🍽️", slug: "garson-komi" },
      { name: "Güvenlik Görevlisi", icon: "🛡️", slug: "guvenlik-gorevlisi" },
      { name: "Muhasebeci/Finans Elemanı", icon: "💰", slug: "muhasebeci-finans-elemani" },
      { name: "Nakliyat", icon: "🚚", slug: "nakliyat" },
      { name: "Öğretmen/Eğitmen", icon: "📚", slug: "ogretmen-egitmen" },
      { name: "Pazarlama/Reklam Uzmanı", icon: "📢", slug: "pazarlama-reklam-uzmani" },
      { name: "Sağlık Personeli", icon: "🏥", slug: "saglik-personeli" },
      { name: "Satış Danışmanı", icon: "💼", slug: "satis-danismani" },
      { name: "Sekreter/Ofis Elemanı", icon: "📋", slug: "sekreter-ofis-elemani" },
      { name: "Şoför/Kurye", icon: "🚗", slug: "sofor-kurye" },
      { name: "Teknik Servis", icon: "🔧", slug: "teknik-servis" },
      { name: "Tekniker/Mühendis", icon: "⚙️", slug: "tekniker-muhendis" },
      { name: "Temizlik Personeli", icon: "🧹", slug: "temizlik-personeli" },
      { name: "Yazılım/Bilişim Uzmanı", icon: "💻", slug: "yazilim-bilisim-uzmani" }
    ]
  },
  {
    name: "Hizmetler",
    icon: Wrench,
    slug: "hizmetler",
    subcategories: [
      { 
        name: "Güvenlik", 
        icon: "🔒", 
        slug: "guvenlik",
        subcategories: [
          { name: "Güvenlik Görevlisi", icon: "🛡️", slug: "guvenlik-gorevlisi" },
          { name: "Güvenlik Sistemi", icon: "📹", slug: "guvenlik-sistemi" },
          { name: "Kamera Sistemleri", icon: "📷", slug: "kamera-sistemleri" },
          { name: "Alarm Sistemleri", icon: "🚨", slug: "alarm-sistemleri" },
          { name: "Kartlı Geçiş", icon: "💳", slug: "kartli-gecis" },
          { name: "Parmak İzi Sistemleri", icon: "👆", slug: "parmak-izi-sistemleri" }
        ]
      },
      { name: "Nakliyat", icon: "🚚", slug: "nakliyat" },
      { name: "Tasarım", icon: "🎨", slug: "tasarim" },
      { name: "Teknik Servis", icon: "🔧", slug: "teknik-servis" },
      { name: "Temizlik", icon: "🧹", slug: "temizlik" }
    ]
  },
  {
    name: "Elektronik",
    icon: Smartphone,
    slug: "elektronik",
    subcategories: [
      { name: "Bilgisayar", icon: "💻", slug: "bilgisayar" },
      { name: "Kamera", icon: "📷", slug: "kamera" },
      { name: "Kulaklık", icon: "🎧", slug: "kulaklik" },
      { name: "Network", icon: "🌐", slug: "network" },
      { name: "Oyun Konsolu", icon: "🎮", slug: "oyun-konsolu" },
      { name: "Tablet", icon: "📱", slug: "tablet" },
      { name: "Telefon", icon: "📞", slug: "telefon" },
      { name: "Televizyon", icon: "📺", slug: "televizyon" },
      { name: "Yazıcı", icon: "🖨️", slug: "yazici" }
    ]
  },
  {
    name: "Ev & Bahçe",
    icon: Home,
    slug: "ev-ve-bahce",
    subcategories: [
      { name: "Aydınlatma", icon: "💡", slug: "aydinlatma" },
      { name: "Bahçe Aletleri", icon: "🌱", slug: "bahce-aletleri" },
      { 
        name: "Beyaz Eşya", 
        icon: "🏠", 
        slug: "beyaz-esya",
        subcategories: [
          { name: "Buzdolabı & Dondurucu", icon: "🧊", slug: "buzdolabi-dondurucu" },
          { name: "Çamaşır & Kurutma", icon: "👕", slug: "camasir-kurutma" },
          { name: "Bulaşık Makinesi", icon: "🍽️", slug: "bulasik-makinesi" },
          { name: "Fırın & Ocak", icon: "🔥", slug: "firin-ocak" },
          { name: "Mikrodalga", icon: "⚡", slug: "mikrodalga" }
        ]
      },
      { name: "Dekorasyon", icon: "🖼️", slug: "dekorasyon" },
      { name: "Güvenlik", icon: "🔒", slug: "guvenlik" },
      { 
        name: "Isıtma/Soğutma", 
        icon: "❄️", 
        slug: "isitma-sogutma",
        subcategories: [
          { name: "Klima & Isıtıcı", icon: "🌡️", slug: "klima-isitici" },
          { name: "Soğutma Sistemleri", icon: "❄️", slug: "sogutma-sistemleri" }
        ]
      },
      { name: "Mobilya", icon: "🪑", slug: "mobilya" },
      { name: "Mutfak Gereçleri", icon: "🍳", slug: "mutfak-gerecleri" },
      { name: "Temizlik", icon: "🧹", slug: "temizlik" }
    ]
  },
  {
    name: "Giyim",
    icon: Shirt,
    slug: "giyim",
    subcategories: [
      { name: "Aksesuar", icon: "💍", slug: "aksesuar" },
      { name: "Ayakkabı", icon: "👟", slug: "ayakkabi" },
      { name: "Ayakkabı & Çanta", icon: "👜", slug: "ayakkabi-canta" },
      { name: "Bayan Giyim", icon: "👗", slug: "bayan-giyim" },
      { name: "Çocuk Giyim", icon: "👶", slug: "cocuk-giyim" },
      { name: "Erkek Giyim", icon: "👔", slug: "erkek-giyim" }
    ]
  },
  {
    name: "Moda & Stil",
    icon: Shirt,
    slug: "moda-stil",
    subcategories: [
      { name: "Aksesuar", icon: "💍", slug: "aksesuar" },
      { name: "Ayakkabı", icon: "👟", slug: "ayakkabi" },
      { name: "Çocuk", icon: "👶", slug: "cocuk" },
      { name: "Erkek", icon: "👨", slug: "erkek" }
    ]
  },
  {
    name: "Sporlar, Oyunlar ve Eğlenceler",
    icon: Dumbbell,
    slug: "sporlar-oyunlar-eglenceler",
    subcategories: [
      { name: "Spor Aktiviteleri", icon: "🏃", slug: "spor-aktiviteleri" },
      { name: "Spor Dalları", icon: "⚽", slug: "spor-dallari" },
      { name: "Video Oyunları", icon: "🎮", slug: "video-oyunlari" }
    ]
  },
  {
    name: "Anne & Bebek",
    icon: Baby,
    slug: "anne-bebek",
    subcategories: [
      { name: "Bebek Giyim", icon: "👶", slug: "bebek-giyim" },
      { name: "Bebek Odası", icon: "🛏️", slug: "bebek-odasi" },
      { name: "Bebek Oyuncakları", icon: "🧸", slug: "bebek-oyuncaklari" },
      { name: "Bebek Bakım", icon: "🍼", slug: "bebek-bakim" },
      { name: "Hamilelik", icon: "🤱", slug: "hamilelik" }
    ]
  },
  {
    name: "Çocuk Dünyası",
    icon: Baby,
    slug: "cocuk-dunyasi",
    subcategories: [
      { name: "Çocuk Aksesuar", icon: "🎒", slug: "cocuk-aksesuar" },
      { name: "Çocuk Ayakkabı", icon: "👟", slug: "cocuk-ayakkabi" },
      { name: "Çocuk Bisikleti", icon: "🚲", slug: "cocuk-bisikleti" },
      { name: "Çocuk Giyim", icon: "👕", slug: "cocuk-giyim" },
      { name: "Çocuk Kitapları", icon: "📚", slug: "cocuk-kitaplari" },
      { name: "Çocuk Müzik Aletleri", icon: "🎵", slug: "cocuk-muzik-aletleri" },
      { name: "Çocuk Odası", icon: "🛏️", slug: "cocuk-odasi" },
      { name: "Çocuk Oyuncakları", icon: "🧸", slug: "cocuk-oyuncaklari" },
      { name: "Çocuk Spor", icon: "⚽", slug: "cocuk-spor" }
    ]
  },
  {
    name: "Eğitim & Kurslar",
    icon: GraduationCap,
    slug: "egitim-kurslar",
    subcategories: [
      { name: "Akademik Kurslar", icon: "📚", slug: "akademik-kurslar" },
      { name: "Bilgisayar", icon: "💻", slug: "bilgisayar" },
      { name: "Dans", icon: "💃", slug: "dans" },
      { name: "Diğer", icon: "📖", slug: "diger" },
      { name: "Mesleki", icon: "🔧", slug: "mesleki" },
      { name: "Müzik Kursları", icon: "🎵", slug: "muzik-kurslari" },
      { name: "Okul/Kreş", icon: "🏫", slug: "okul-kres" },
      { name: "Sanat Kursları", icon: "🎨", slug: "sanat-kurslari" },
      { name: "Spor Kursları", icon: "🏃", slug: "spor-kurslari" },
      { name: "Yabancı Dil Kursları", icon: "🌍", slug: "yabanci-dil-kurslari" }
    ]
  },
  {
    name: "Yemek & İçecek",
    icon: Utensils,
    slug: "yemek-icecek",
    subcategories: [
      { name: "Fast Food", icon: "🍔", slug: "fast-food" },
      { name: "Kafeler", icon: "☕", slug: "kafeler" },
      { name: "Özel Yemekler", icon: "🍽️", slug: "ozel-yemekler" },
      { name: "Restoranlar", icon: "🍴", slug: "restoranlar" },
      { name: "Tatlı/Pastane", icon: "🍰", slug: "tatli-pastane" }
    ]
  },
  {
    name: "Catering & Ticaret",
    icon: Utensils,
    slug: "catering-ticaret",
    subcategories: [
      { name: "Catering", icon: "🍽️", slug: "catering" },
      { name: "Ticaret", icon: "🏪", slug: "ticaret" },
      { name: "Toplu Yemek", icon: "🍲", slug: "toplu-yemek" }
    ]
  },
  {
    name: "Turizm & Konaklama",
    icon: Hotel,
    slug: "turizm-konaklama",
    subcategories: [
      { name: "Araç Kiralama", icon: "🚗", slug: "arac-kiralama" },
      { name: "Konaklama", icon: "🏨", slug: "konaklama" },
      { name: "Turlar", icon: "🗺️", slug: "turlar" },
      { name: "Uçak Bileti", icon: "✈️", slug: "ucak-bileti" }
    ]
  },
  {
    name: "Sağlık & Güzellik",
    icon: Heart,
    slug: "saglik-guzellik",
    subcategories: [
      { name: "Bayan Kuaför", icon: "💇‍♀️", slug: "bayan-kuafor" },
      { name: "Diyet ve Beslenme", icon: "🥗", slug: "diyet-ve-beslenme" },
      { name: "Erkek Kuaför", icon: "💇‍♂️", slug: "erkek-kuafor" },
      { name: "Güzellik Merkezi", icon: "💄", slug: "guzellik-merkezi" },
      { name: "Kişisel Bakım", icon: "🧴", slug: "kisisel-bakim" },
      { name: "Kozmetik", icon: "💋", slug: "kozmetik" },
      { name: "Sağlık Ürünleri", icon: "💊", slug: "saglik-urunleri" },
      { name: "Spa Merkezi", icon: "🧖‍♀️", slug: "spa-merkezi" }
    ]
  },
  {
    name: "Sanat & Hobi",
    icon: Palette,
    slug: "sanat-hobi",
    subcategories: [
      { name: "El İşi Malzemeleri", icon: "🧶", slug: "el-isi-malzemeleri" },
      { name: "El Sanatları", icon: "🎨", slug: "el-sanatlari" },
      { name: "Hobi Kursları", icon: "📚", slug: "hobi-kurslari" },
      { name: "Koleksiyon", icon: "🏆", slug: "koleksiyon" },
      { name: "Müzik Aletleri", icon: "🎸", slug: "muzik-aletleri" },
      { name: "Resim Malzemeleri", icon: "🖌️", slug: "resim-malzemeleri" }
    ]
  },
  {
    name: "Ücretsiz Gel Al",
    icon: Gift,
    slug: "ucretsiz-gel-al",
    subcategories: [
      { name: "Eşya", icon: "📦", slug: "esya" },
      { name: "Giyim", icon: "👕", slug: "giyim" },
      { name: "Kitap", icon: "📚", slug: "kitap" },
      { name: "Mobilya", icon: "🪑", slug: "mobilya" },
      { name: "Oyuncak", icon: "🧸", slug: "oyuncak" }
    ]
  }
] 