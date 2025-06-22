import { LucideIcon } from "lucide-react"
import { 
  Smartphone, 
  Home, 
  Shirt, 
  Baby, 
  Dumbbell, 
  Heart, 
  GraduationCap,
  Utensils,
  Palette,
  Gift,
  MoreHorizontal,
  Hotel,
  Laptop,
  Camera,
  Tv,
  Headphones,
  Gamepad2,
  Printer,
  Watch,
  Radio,
  Speaker,
  Sofa,
  BedDouble,
  Bath,
  ChefHat,
  Flower2,
  TreePine,
  Hammer,
  Wrench,
  Paintbrush,
  Lightbulb,
  Fan,
  Refrigerator,
  WashingMachine,
  Microwave,
  ShirtIcon,
  BaggageClaim,
  Glasses,
  Scissors,
  Circle,
  Trophy,
  Target,
  Gamepad,
  Music2,
  Theater,
  PartyPopper,
  Tent,
  BikeIcon,
  Store,
  Briefcase
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
      {
        name: "Garson / Komi",
        slug: "garson-komi",
        icon: "🍽️"
      },
      {
        name: "Şoför / Kurye",
        slug: "sofor-kurye",
        icon: "🚗"
      },
      {
        name: "Temizlik Personeli",
        slug: "temizlik-personeli",
        icon: "🧹"
      },
      {
        name: "Satış Danışmanı",
        slug: "satis-danismani",
        icon: "💼"
      },
      {
        name: "Güvenlik Görevlisi",
        slug: "guvenlik-gorevlisi",
        icon: "👮"
      },
      {
        name: "Sekreter / Ofis Elemanı",
        slug: "sekreter-ofis-elemani",
        icon: "📋"
      },
      {
        name: "Çağrı Merkezi Elemanı",
        slug: "cagri-merkezi-elemani",
        icon: "📞"
      },
      {
        name: "İnşaat Ustası / İşçisi",
        slug: "insaat-ustasi-iscisi",
        icon: "🏗️"
      },
      {
        name: "Öğretmen / Eğitmen",
        slug: "ogretmen-egitmen",
        icon: "👨‍🏫"
      },
      {
        name: "Sağlık Personeli",
        slug: "saglik-personeli",
        icon: "🏥"
      },
      {
        name: "Yazılım / Bilişim Uzmanı",
        slug: "yazilim-bilisim-uzmani",
        icon: "💻"
      },
      {
        name: "Muhasebeci / Finans Elemanı",
        slug: "muhasebeci-finans-elemani",
        icon: "💰"
      },
      {
        name: "Tekniker / Mühendis",
        slug: "tekniker-muhendis",
        icon: "⚙️"
      },
      {
        name: "Pazarlama / Reklam Uzmanı",
        slug: "pazarlama-reklam-uzmani",
        icon: "📢"
      }
    ]
  },
  {
    name: "Hizmetler",
    icon: Wrench,
    slug: "hizmetler",
    subcategories: [
      {
        name: "Temizlik",
        slug: "temizlik",
        icon: "🧹",
        subcategories: [
          {
            name: "Ev Temizliği",
            slug: "ev-temizligi",
            icon: "🏠"
          },
          {
            name: "Ofis Temizliği",
            slug: "ofis-temizligi",
            icon: "🏢"
          },
          {
            name: "Endüstriyel Temizlik",
            slug: "endustriyel-temizlik",
            icon: "🏭"
          }
        ]
      },
      {
        name: "Teknik Servis",
        slug: "teknik-servis",
        icon: "🔧",
        subcategories: [
          {
            name: "Elektrik",
            slug: "elektrik",
            icon: "⚡"
          },
          {
            name: "Su Tesisatı",
            slug: "su-tesisati",
            icon: "🚰"
          },
          {
            name: "Klima",
            slug: "klima",
            icon: "❄️"
          },
          {
            name: "Beyaz Eşya",
            slug: "beyaz-esya",
            icon: "🏠"
          }
        ]
      },
      {
        name: "Nakliyat",
        slug: "nakliyat",
        icon: "🚚",
        subcategories: [
          {
            name: "Evden Eve",
            slug: "evden-eve",
            icon: "🏠"
          },
          {
            name: "Şehirler Arası",
            slug: "sehirler-arasi",
            icon: "🚛"
          },
          {
            name: "Ofis Taşıma",
            slug: "ofis-tasima",
            icon: "🏢"
          }
        ]
      },
      {
        name: "Güvenlik",
        slug: "guvenlik",
        icon: "🔒",
        subcategories: [
          {
            name: "Alarm Sistemleri",
            slug: "alarm-sistemleri",
            icon: "🚨"
          },
          {
            name: "Kamera Sistemleri",
            slug: "kamera-sistemleri",
            icon: "📹"
          },
          {
            name: "Güvenlik Görevlisi",
            slug: "guvenlik-gorevlisi",
            icon: "👮"
          }
        ]
      },
      {
        name: "Tasarım",
        slug: "tasarim",
        icon: "🎨",
        subcategories: [
          {
            name: "Grafik Tasarım",
            slug: "grafik-tasarim",
            icon: "🎨"
          },
          {
            name: "Logo Tasarımı",
            slug: "logo-tasarimi",
            icon: "🖼️"
          },
          {
            name: "Web Tasarımı",
            slug: "web-tasarimi",
            icon: "💻"
          },
          {
            name: "Sosyal Medya",
            slug: "sosyal-medya",
            icon: "📱"
          }
        ]
      }
    ]
  },
  {
    name: "Elektronik",
    icon: Smartphone,
    slug: "elektronik",
    subcategories: [
      {
        name: "Telefon & Tablet",
        slug: "telefon",
        icon: "📱",
        subcategories: [
          {
            name: "Apple",
            slug: "apple",
            icon: "🍎"
          },
          {
            name: "Samsung",
            slug: "samsung",
            icon: "📱"
          },
          {
            name: "Xiaomi",
            slug: "xiaomi",
            icon: "📱"
          },
          {
            name: "Huawei",
            slug: "huawei",
            icon: "📱"
          },
          {
            name: "Diğer",
            slug: "diger",
            icon: "📱"
          }
        ]
      },
      {
        name: "Bilgisayar",
        slug: "bilgisayar",
        icon: "💻",
        subcategories: [
          {
            name: "Dizüstü",
            slug: "dizustu",
            icon: "💻"
          },
          {
            name: "Masaüstü",
            slug: "masaustu",
            icon: "🖥️"
          },
          {
            name: "Tablet",
            slug: "tablet",
            icon: "📱"
          },
          {
            name: "Monitör",
            slug: "monitor",
            icon: "🖥️"
          },
          {
            name: "Yazıcı",
            slug: "yazici",
            icon: "🖨️"
          }
        ]
      },
      {
        name: "Televizyon",
        slug: "televizyon",
        icon: "📺",
        subcategories: [
          {
            name: "Smart TV",
            slug: "smart-tv",
            icon: "📺"
          },
          {
            name: "LED TV",
            slug: "led-tv",
            icon: "📺"
          },
          {
            name: "OLED TV",
            slug: "oled-tv",
            icon: "📺"
          },
          {
            name: "4K TV",
            slug: "4k-tv",
            icon: "📺"
          }
        ]
      },
      {
        name: "Kamera ve Fotoğraf",
        slug: "kamera",
        icon: "📸",
        subcategories: [
          {
            name: "DSLR",
            slug: "dslr",
            icon: "📷"
          },
          {
            name: "Aynasız",
            slug: "mirrorless",
            icon: "📷"
          },
          {
            name: "Aksesuarlar",
            slug: "aksesuarlar",
            icon: "🔧"
          }
        ]
      },
      {
        name: "Ses Sistemleri",
        slug: "ses-sistemleri",
        icon: "🔊",
        subcategories: [
          {
            name: "Hoparlör",
            slug: "hoparlor",
            icon: "🔊"
          },
          {
            name: "Kulaklık",
            slug: "kulaklik",
            icon: "🎧"
          },
          {
            name: "Mikrofon",
            slug: "mikrofon",
            icon: "🎤"
          }
        ]
      },
      {
        name: "Oyun Konsolları",
        slug: "oyun-konsollari",
        icon: "🎮",
        subcategories: [
          {
            name: "PlayStation",
            slug: "playstation",
            icon: "🎮"
          },
          {
            name: "Xbox",
            slug: "xbox",
            icon: "🎮"
          },
          {
            name: "Nintendo",
            slug: "nintendo",
            icon: "🎮"
          }
        ]
      },
      {
        name: "Akıllı Saat",
        slug: "akilli-saat",
        icon: "⌚",
        subcategories: [
          {
            name: "Apple Watch",
            slug: "apple-watch",
            icon: "⌚"
          },
          {
            name: "Samsung",
            slug: "samsung-watch",
            icon: "⌚"
          },
          {
            name: "Diğer",
            slug: "diger-saat",
            icon: "⌚"
          }
        ]
      },
      {
        name: "Diğer",
        slug: "diger",
        icon: "🔌",
        subcategories: [
          {
            name: "Aksesuarlar",
            slug: "aksesuarlar",
            icon: "🔌"
          },
          {
            name: "Yedek Parça",
            slug: "yedek-parca",
            icon: "🔧"
          }
        ]
      }
    ]
  },
  {
    name: "Ev & Bahçe",
    icon: Home,
    slug: "ev-ve-bahce",
    subcategories: [
      {
        name: "Mobilya",
        slug: "mobilya",
        icon: "🪑",
        subcategories: [
          {
            name: "Koltuk",
            slug: "koltuk",
            icon: "🛋️"
          },
          {
            name: "Yatak Odası",
            slug: "yatak-odasi",
            icon: "🛏️"
          },
          {
            name: "Masa Sandalye",
            slug: "masa-sandalye",
            icon: "🍽️"
          },
          {
            name: "Dolap",
            slug: "dolap",
            icon: "🗄️"
          },
          {
            name: "Sehpa",
            slug: "sehpa",
            icon: "🪑"
          },
          {
            name: "Gardrop",
            slug: "gardrop",
            icon: "👔"
          },
          {
            name: "Kitaplık",
            slug: "kitaplik",
            icon: "📚"
          },
          {
            name: "TV Ünitesi",
            slug: "tv-unitesi",
            icon: "📺"
          }
        ]
      },
      {
        name: "Beyaz Eşya",
        slug: "beyaz-esya",
        icon: "🍽️",
        subcategories: [
          {
            name: "Buzdolabı",
            slug: "buzdolabi",
            icon: "❄️"
          },
          {
            name: "Çamaşır Makinesi",
            slug: "camasir-makinesi",
            icon: "🧺"
          },
          {
            name: "Bulaşık Makinesi",
            slug: "bulasik-makinesi",
            icon: "🍽️"
          },
          {
            name: "Fırın",
            slug: "firin",
            icon: "🔥"
          },
          {
            name: "Ocak",
            slug: "ocak",
            icon: "🔥"
          },
          {
            name: "Mikrodalga",
            slug: "mikrodalga",
            icon: "⚡"
          },
          {
            name: "Kurutucu",
            slug: "kurutucu",
            icon: "🌬️"
          },
          {
            name: "Dondurucu",
            slug: "dondurucu",
            icon: "🧊"
          }
        ]
      },
      {
        name: "Mutfak Gereçleri",
        slug: "mutfak-gerecleri",
        icon: "🍳",
        subcategories: [
          {
            name: "Tencere",
            slug: "tencere",
            icon: "🍲"
          },
          {
            name: "Tava",
            slug: "tava",
            icon: "🍳"
          },
          {
            name: "Mutfak Aletleri",
            slug: "mutfak-aletleri",
            icon: "🔪"
          },
          {
            name: "Kahve Makinesi",
            slug: "kahve-makinesi",
            icon: "☕"
          },
          {
            name: "Blender",
            slug: "blender",
            icon: "🥤"
          },
          {
            name: "Mikser",
            slug: "mikser",
            icon: "🍰"
          },
          {
            name: "Tost Makinesi",
            slug: "tost-makinesi",
            icon: "🥪"
          },
          {
            name: "Su Isıtıcısı",
            slug: "su-isitici",
            icon: "♨️"
          }
        ]
      },
      {
        name: "Bahçe & Dış Mekan",
        slug: "bahce-dis-mekan",
        icon: "🌳",
        subcategories: [
          {
            name: "Bahçe Mobilyası",
            slug: "bahce-mobilyasi",
            icon: "🪑"
          },
          {
            name: "Şezlong",
            slug: "sezlong",
            icon: "🏖️"
          },
          {
            name: "Masa Sandalye",
            slug: "dis-masa-sandalye",
            icon: "🍽️"
          },
          {
            name: "Şemsiye",
            slug: "semsiye",
            icon: "☂️"
          },
          {
            name: "Barbekü",
            slug: "barbeku",
            icon: "🔥"
          },
          {
            name: "Havuz",
            slug: "havuz",
            icon: "🏊"
          },
          {
            name: "Çocuk Oyun Parkı",
            slug: "cocuk-oyun-parki",
            icon: "🎠"
          }
        ]
      },
      {
        name: "Bahçe Aletleri",
        slug: "bahce-aletleri",
        icon: "🌱",
        subcategories: [
          {
            name: "Çim Biçme Makinesi",
            slug: "cim-bicme-makinesi",
            icon: "✂️"
          },
          {
            name: "Tırmık",
            slug: "tirmik",
            icon: "🌿"
          },
          {
            name: "Kürek",
            slug: "kurek",
            icon: "⛏️"
          },
          {
            name: "Bahçe Hortumu",
            slug: "bahce-hortumu",
            icon: "💧"
          },
          {
            name: "Sulama Sistemi",
            slug: "sulama-sistemi",
            icon: "🚿"
          },
          {
            name: "Budama Makası",
            slug: "budama-makasi",
            icon: "✂️"
          },
          {
            name: "Gübre",
            slug: "gubre",
            icon: "🌱"
          }
        ]
      },
      {
        name: "Dekorasyon",
        slug: "dekorasyon",
        icon: "🎨",
        subcategories: [
          {
            name: "Tablo",
            slug: "tablo",
            icon: "🖼️"
          },
          {
            name: "Vazo",
            slug: "vazo",
            icon: "🏺"
          },
          {
            name: "Mum",
            slug: "mum",
            icon: "🕯️"
          },
          {
            name: "Halı",
            slug: "hali",
            icon: "🟫"
          },
          {
            name: "Perde",
            slug: "perde",
            icon: "🪟"
          },
          {
            name: "Yastık",
            slug: "yastik",
            icon: "🛏️"
          },
          {
            name: "Battaniye",
            slug: "battaniye",
            icon: "🛏️"
          },
          {
            name: "Ayna",
            slug: "ayna",
            icon: "🪞"
          }
        ]
      },
      {
        name: "Aydınlatma",
        slug: "aydinlatma",
        icon: "💡",
        subcategories: [
          {
            name: "Avize",
            slug: "avize",
            icon: "💡"
          },
          {
            name: "Lambader",
            slug: "lambader",
            icon: "🕯️"
          },
          {
            name: "Masa Lambası",
            slug: "masa-lambasi",
            icon: "💡"
          },
          {
            name: "Tavan Lambası",
            slug: "tavan-lambasi",
            icon: "💡"
          },
          {
            name: "Bahçe Lambası",
            slug: "bahce-lambasi",
            icon: "💡"
          },
          {
            name: "LED Şerit",
            slug: "led-serit",
            icon: "✨"
          },
          {
            name: "Ampul",
            slug: "ampul",
            icon: "💡"
          }
        ]
      },
      {
        name: "Temizlik",
        slug: "temizlik",
        icon: "🧹",
        subcategories: [
          {
            name: "Elektrikli Süpürge",
            slug: "elektrikli-supurge",
            icon: "🧹"
          },
          {
            name: "Robot Süpürge",
            slug: "robot-supurge",
            icon: "🤖"
          },
          {
            name: "Paspas",
            slug: "paspas",
            icon: "🧹"
          },
          {
            name: "Bez",
            slug: "bez",
            icon: "🧽"
          },
          {
            name: "Temizlik Malzemeleri",
            slug: "temizlik-malzemeleri",
            icon: "🧴"
          },
          {
            name: "Çöp Kovası",
            slug: "cop-kovasi",
            icon: "🗑️"
          },
          {
            name: "Çamaşır Sepeti",
            slug: "camasir-sepeti",
            icon: "🧺"
          }
        ]
      },
      {
        name: "Güvenlik",
        slug: "guvenlik",
        icon: "🔒",
        subcategories: [
          {
            name: "Kilit",
            slug: "kilit",
            icon: "🔒"
          },
          {
            name: "Alarm Sistemi",
            slug: "alarm-sistemi",
            icon: "🚨"
          },
          {
            name: "Kamera",
            slug: "guvenlik-kamera",
            icon: "📹"
          },
          {
            name: "Sensör",
            slug: "sensor",
            icon: "📡"
          },
          {
            name: "Yangın Alarmı",
            slug: "yangin-alarmi",
            icon: "🔥"
          },
          {
            name: "Kasa",
            slug: "kasa",
            icon: "💰"
          }
        ]
      },
      {
        name: "Isıtma & Soğutma",
        slug: "isitma-sogutma",
        icon: "🌡️",
        subcategories: [
          {
            name: "Klima",
            slug: "klima",
            icon: "❄️"
          },
          {
            name: "Soba",
            slug: "soba",
            icon: "🔥"
          },
          {
            name: "Şömine",
            slug: "somine",
            icon: "🔥"
          },
          {
            name: "Vantilatör",
            slug: "vantilator",
            icon: "💨"
          },
          {
            name: "Isıtıcı",
            slug: "isitici",
            icon: "🔥"
          },
          {
            name: "Nem Alma Cihazı",
            slug: "nem-alma-cihazi",
            icon: "💧"
          },
          {
            name: "Hava Temizleyici",
            slug: "hava-temizleyici",
            icon: "🌬️"
          }
        ]
      }
    ]
  },
  {
    name: "Giyim",
    icon: Shirt,
    slug: "giyim",
    subcategories: [
      {
        name: "Kadın Giyim",
        slug: "kadin-giyim",
        icon: "👗",
        subcategories: [
          {
            name: "Elbise",
            slug: "elbise",
            icon: "👗"
          },
          {
            name: "Pantolon",
            slug: "pantolon",
            icon: "👖"
          },
          {
            name: "Gömlek",
            slug: "gomlek",
            icon: "👔"
          },
          {
            name: "Bluz",
            slug: "bluz",
            icon: "👚"
          },
          {
            name: "Etek",
            slug: "etek",
            icon: "👗"
          },
          {
            name: "Mont",
            slug: "mont",
            icon: "🧥"
          },
          {
            name: "Kazak",
            slug: "kazak",
            icon: "🧶"
          }
        ]
      },
      {
        name: "Erkek Giyim",
        slug: "erkek-giyim",
        icon: "👔",
        subcategories: [
          {
            name: "Pantolon",
            slug: "pantolon",
            icon: "👖"
          },
          {
            name: "Gömlek",
            slug: "gomlek",
            icon: "👔"
          },
          {
            name: "Ceket",
            slug: "ceket",
            icon: "🧥"
          },
          {
            name: "Mont",
            slug: "mont",
            icon: "🧥"
          },
          {
            name: "Kazak",
            slug: "kazak",
            icon: "🧶"
          },
          {
            name: "Takım Elbise",
            slug: "takim-elbise",
            icon: "👔"
          }
        ]
      },
      {
        name: "Çocuk Giyim",
        slug: "cocuk-giyim",
        icon: "👶",
        subcategories: [
          {
            name: "0-12 Ay",
            slug: "0-12-ay",
            icon: "👶"
          },
          {
            name: "1-3 Yaş",
            slug: "1-3-yas",
            icon: "👶"
          },
          {
            name: "4-6 Yaş",
            slug: "4-6-yas",
            icon: "👶"
          },
          {
            name: "7-12 Yaş",
            slug: "7-12-yas",
            icon: "👶"
          },
          {
            name: "13-16 Yaş",
            slug: "13-16-yas",
            icon: "👶"
          }
        ]
      },
      {
        name: "Ayakkabı",
        slug: "ayakkabi",
        icon: "👞",
        subcategories: [
          {
            name: "Kadın Ayakkabı",
            slug: "kadin-ayakkabi",
            icon: "👠"
          },
          {
            name: "Erkek Ayakkabı",
            slug: "erkek-ayakkabi",
            icon: "👞"
          },
          {
            name: "Çocuk Ayakkabı",
            slug: "cocuk-ayakkabi",
            icon: "👟"
          },
          {
            name: "Spor Ayakkabı",
            slug: "spor-ayakkabi",
            icon: "👟"
          }
        ]
      },
      {
        name: "Çanta",
        slug: "canta",
        icon: "👜",
        subcategories: [
          {
            name: "El Çantası",
            slug: "el-cantasi",
            icon: "👜"
          },
          {
            name: "Sırt Çantası",
            slug: "sirt-cantasi",
            icon: "🎒"
          },
          {
            name: "Laptop Çantası",
            slug: "laptop-cantasi",
            icon: "💼"
          },
          {
            name: "Spor Çanta",
            slug: "spor-canta",
            icon: "🎒"
          }
        ]
      },
      {
        name: "Aksesuar",
        slug: "aksesuar",
        icon: "💍",
        subcategories: [
          {
            name: "Takı",
            slug: "taki",
            icon: "💍"
          },
          {
            name: "Saat",
            slug: "saat",
            icon: "⌚"
          },
          {
            name: "Gözlük",
            slug: "gozluk",
            icon: "👓"
          },
          {
            name: "Kemer",
            slug: "kemer",
            icon: "👔"
          },
          {
            name: "Şal",
            slug: "sal",
            icon: "🧣"
          }
        ]
      },
      {
        name: "İç Giyim",
        slug: "ic-giyim",
        icon: "👙",
        subcategories: [
          {
            name: "İç Çamaşırı",
            slug: "ic-camasiri",
            icon: "👙"
          },
          {
            name: "Pijama",
            slug: "pijama",
            icon: "🛏️"
          },
          {
            name: "Gece Gömleği",
            slug: "gece-gomlegi",
            icon: "👗"
          }
        ]
      }
    ]
  },
  {
    name: "Moda & Stil",
    icon: ShirtIcon,
    slug: "moda-stil",
    subcategories: [
      {
        name: "Erkek",
        slug: "erkek",
        icon: "👔",
        subcategories: [
          {
            name: "Gömlek",
            slug: "gomlek",
            icon: "👔"
          },
          {
            name: "Pantolon",
            slug: "pantolon",
            icon: "👖"
          },
          {
            name: "Ceket",
            slug: "ceket",
            icon: "🧥"
          },
          {
            name: "Mont",
            slug: "mont",
            icon: "🧥"
          },
          {
            name: "Kazak",
            slug: "kazak",
            icon: "🧶"
          },
          {
            name: "Tişört",
            slug: "tisort",
            icon: "👕"
          }
        ]
      },
      {
        name: "Kadın",
        slug: "kadin",
        icon: "👗",
        subcategories: [
          {
            name: "Elbise",
            slug: "elbise",
            icon: "👗"
          },
          {
            name: "Pantolon",
            slug: "pantolon",
            icon: "👖"
          },
          {
            name: "Gömlek",
            slug: "gomlek",
            icon: "👔"
          },
          {
            name: "Bluz",
            slug: "bluz",
            icon: "👚"
          },
          {
            name: "Etek",
            slug: "etek",
            icon: "👗"
          },
          {
            name: "Mont",
            slug: "mont",
            icon: "🧥"
          },
          {
            name: "Kazak",
            slug: "kazak",
            icon: "🧶"
          }
        ]
      },
      {
        name: "Çocuk",
        slug: "cocuk",
        icon: "👶",
        subcategories: [
          {
            name: "Kız Çocuk",
            slug: "kiz-cocuk",
            icon: "👧"
          },
          {
            name: "Erkek Çocuk",
            slug: "erkek-cocuk",
            icon: "👦"
          },
          {
            name: "Bebek",
            slug: "bebek",
            icon: "👶"
          }
        ]
      },
      {
        name: "Ayakkabı",
        slug: "ayakkabi",
        icon: "👠",
        subcategories: [
          {
            name: "Erkek Ayakkabı",
            slug: "erkek-ayakkabi",
            icon: "👞"
          },
          {
            name: "Kadın Ayakkabı",
            slug: "kadin-ayakkabi",
            icon: "👠"
          },
          {
            name: "Spor Ayakkabı",
            slug: "spor-ayakkabi",
            icon: "👟"
          },
          {
            name: "Çocuk Ayakkabı",
            slug: "cocuk-ayakkabi",
            icon: "👟"
          }
        ]
      },
      {
        name: "Aksesuar",
        slug: "aksesuar",
        icon: "👜",
        subcategories: [
          {
            name: "Çanta",
            slug: "canta",
            icon: "👜"
          },
          {
            name: "Takı",
            slug: "taki",
            icon: "💍"
          },
          {
            name: "Saat",
            slug: "saat",
            icon: "⌚"
          },
          {
            name: "Gözlük",
            slug: "gozluk",
            icon: "👓"
          },
          {
            name: "Kemer",
            slug: "kemer",
            icon: "👔"
          }
        ]
      }
    ]
  },
  {
    name: "Sporlar, Oyunlar ve Eğlenceler",
    slug: "sporlar-oyunlar-eglenceler",
    icon: Trophy,
    subcategories: [
      {
        name: "Spor Ekipmanları",
        slug: "spor-ekipmanlari",
        icon: Dumbbell,
        subcategories: [
          {
            name: "Fitness Ekipmanları",
            slug: "fitness-ekipmanlari",
            icon: Dumbbell
          },
          {
            name: "Bisiklet",
            slug: "bisiklet",
            icon: BikeIcon
          },
          {
            name: "Kamp Malzemeleri",
            slug: "kamp-malzemeleri",
            icon: Tent
          }
        ]
      },
      {
        name: "Takım Sporları",
        slug: "takim-sporlari",
        icon: Trophy,
        subcategories: [
          {
            name: "Futbol",
            slug: "futbol",
            icon: Circle
          },
          {
            name: "Basketbol",
            slug: "basketbol",
            icon: Circle
          },
          {
            name: "Voleybol",
            slug: "voleybol",
            icon: Circle
          }
        ]
      },
      {
        name: "Bireysel Sporlar",
        slug: "bireysel-sporlar",
        icon: Target,
        subcategories: [
          {
            name: "Yüzme",
            slug: "yuzme",
            icon: Bath
          },
          {
            name: "Tenis",
            slug: "tenis",
            icon: Circle
          },
          {
            name: "Golf",
            slug: "golf",
            icon: Circle
          }
        ]
      },
      {
        name: "Eğlence",
        slug: "eglence",
        icon: PartyPopper,
        subcategories: [
          {
            name: "Müzik Aletleri",
            slug: "muzik-aletleri",
            icon: Music2
          },
          {
            name: "Tiyatro",
            slug: "tiyatro",
            icon: Theater
          },
          {
            name: "Parti Malzemeleri",
            slug: "parti-malzemeleri",
            icon: PartyPopper
          }
        ]
      }
    ]
  },
  {
    name: "Anne & Bebek",
    icon: Baby,
    slug: "anne-bebek",
    subcategories: [
      {
        name: "Bebek Giyim",
        slug: "bebek-giyim",
        icon: "👶"
      },
      {
        name: "Bebek Bakım",
        slug: "bebek-bakim",
        icon: "🛏️"
      },
      {
        name: "Bebek Arabası",
        slug: "bebek-arabasi",
        icon: "🚗"
      },
      {
        name: "Diğer",
        slug: "diger",
        icon: "📱"
      }
    ]
  },
  {
    name: "Çocuk Dünyası",
    icon: Baby,
    slug: "cocuk-dunyasi",
    subcategories: [
      {
        name: "Çocuk Giyim",
        slug: "cocuk-giyim",
        icon: "👕",
        subcategories: [
          {
            name: "Kız Çocuk",
            slug: "kiz-cocuk",
            icon: "👧"
          },
          {
            name: "Erkek Çocuk",
            slug: "erkek-cocuk",
            icon: "👦"
          },
          {
            name: "Bebek",
            slug: "bebek",
            icon: "👶"
          }
        ]
      },
      {
        name: "Çocuk Odası",
        slug: "cocuk-odasi",
        icon: "🛏️",
        subcategories: [
          {
            name: "Yatak",
            slug: "yatak",
            icon: "🛏️"
          },
          {
            name: "Dolap",
            slug: "dolap",
            icon: "🗄️"
          },
          {
            name: "Masa Sandalye",
            slug: "masa-sandalye",
            icon: "🪑"
          }
        ]
      },
      {
        name: "Çocuk Oyuncakları",
        slug: "cocuk-oyuncaklari",
        icon: "🧸",
        subcategories: [
          {
            name: "Eğitici Oyuncaklar",
            slug: "egitici-oyuncaklar",
            icon: "🧩"
          },
          {
            name: "Peluş Oyuncaklar",
            slug: "pelus-oyuncaklar",
            icon: "🧸"
          },
          {
            name: "Araç Oyuncakları",
            slug: "arac-oyuncaklari",
            icon: "🚗"
          }
        ]
      },
      {
        name: "Çocuk Ayakkabı",
        slug: "cocuk-ayakkabi",
        icon: "👟",
        subcategories: [
          {
            name: "Spor Ayakkabı",
            slug: "spor-ayakkabi",
            icon: "👟"
          },
          {
            name: "Günlük Ayakkabı",
            slug: "gunluk-ayakkabi",
            icon: "👞"
          },
          {
            name: "Sandalet",
            slug: "sandalet",
            icon: "🩴"
          }
        ]
      },
      {
        name: "Çocuk Aksesuar",
        slug: "cocuk-aksesuar",
        icon: "🎒",
        subcategories: [
          {
            name: "Çanta",
            slug: "canta",
            icon: "🎒"
          },
          {
            name: "Şapka",
            slug: "sapka",
            icon: "🧢"
          },
          {
            name: "Takı",
            slug: "taki",
            icon: "💍"
          }
        ]
      },
      {
        name: "Çocuk Spor",
        slug: "cocuk-spor",
        icon: "⚽",
        subcategories: [
          {
            name: "Futbol",
            slug: "futbol",
            icon: "⚽"
          },
          {
            name: "Basketbol",
            slug: "basketbol",
            icon: "🏀"
          },
          {
            name: "Yüzme",
            slug: "yuzme",
            icon: "🏊"
          }
        ]
      },
      {
        name: "Çocuk Kitapları",
        slug: "cocuk-kitaplari",
        icon: "📚",
        subcategories: [
          {
            name: "Hikaye Kitapları",
            slug: "hikaye-kitaplari",
            icon: "📖"
          },
          {
            name: "Eğitici Kitaplar",
            slug: "egitici-kitaplar",
            icon: "📚"
          },
          {
            name: "Boyama Kitapları",
            slug: "boyama-kitaplari",
            icon: "🎨"
          }
        ]
      },
      {
        name: "Çocuk Bisikleti",
        slug: "cocuk-bisikleti",
        icon: "🚲",
        subcategories: [
          {
            name: "3 Tekerlekli",
            slug: "3-tekerlekli",
            icon: "🚲"
          },
          {
            name: "2 Tekerlekli",
            slug: "2-tekerlekli",
            icon: "🚲"
          },
          {
            name: "Denge Bisikleti",
            slug: "denge-bisikleti",
            icon: "🚲"
          }
        ]
      },
      {
        name: "Çocuk Müzik Aletleri",
        slug: "cocuk-muzik-aletleri",
        icon: "🎵",
        subcategories: [
          {
            name: "Piyano",
            slug: "piyano",
            icon: "🎹"
          },
          {
            name: "Gitar",
            slug: "gitar",
            icon: "🎸"
          },
          {
            name: "Flüt",
            slug: "flut",
            icon: "🎺"
          }
        ]
      }
    ]
  },
  {
    name: "Eğitim & Kurslar",
    icon: GraduationCap,
    slug: "egitim-kurslar",
    subcategories: [
      {
        name: "Yabancı Dil",
        slug: "yabanci-dil",
        icon: "🌍",
        subcategories: [
          {
            name: "İngilizce",
            slug: "ingilizce",
            icon: "🇬🇧"
          },
          {
            name: "Almanca",
            slug: "almanca",
            icon: "🇩🇪"
          },
          {
            name: "Fransızca",
            slug: "fransizca",
            icon: "🇫🇷"
          },
          {
            name: "İspanyolca",
            slug: "ispanyolca",
            icon: "🇪🇸"
          },
          {
            name: "Arapça",
            slug: "arapca",
            icon: "🇸🇦"
          }
        ]
      },
      {
        name: "Müzik",
        slug: "muzik",
        icon: "🎸",
        subcategories: [
          {
            name: "Gitar",
            slug: "gitar-kursu",
            icon: "🎸"
          },
          {
            name: "Piyano",
            slug: "piyano-kursu",
            icon: "🎹"
          },
          {
            name: "Keman",
            slug: "keman-kursu",
            icon: "🎻"
          },
          {
            name: "Şan",
            slug: "san",
            icon: "🎤"
          }
        ]
      },
      {
        name: "Spor",
        slug: "spor",
        icon: "🏋️",
        subcategories: [
          {
            name: "Fitness",
            slug: "fitness-kursu",
            icon: "💪"
          },
          {
            name: "Yoga",
            slug: "yoga-kursu",
            icon: "🧘"
          },
          {
            name: "Yüzme",
            slug: "yuzme-kursu",
            icon: "🏊"
          },
          {
            name: "Tenis",
            slug: "tenis-kursu",
            icon: "🎾"
          }
        ]
      },
      {
        name: "Dans",
        slug: "dans",
        icon: "💃",
        subcategories: [
          {
            name: "Latin Dansları",
            slug: "latin-danslari",
            icon: "💃"
          },
          {
            name: "Bale",
            slug: "bale",
            icon: "🩰"
          },
          {
            name: "Hip Hop",
            slug: "hip-hop",
            icon: "🎵"
          },
          {
            name: "Halk Dansları",
            slug: "halk-danslari",
            icon: "👯"
          }
        ]
      },
      {
        name: "Bilgisayar",
        slug: "bilgisayar",
        icon: "💻",
        subcategories: [
          {
            name: "Yazılım",
            slug: "yazilim",
            icon: "💻"
          },
          {
            name: "Web Tasarım",
            slug: "web-tasarim",
            icon: "🌐"
          },
          {
            name: "Grafik Tasarım",
            slug: "grafik-tasarim",
            icon: "🎨"
          },
          {
            name: "Ofis Programları",
            slug: "ofis-programlari",
            icon: "📊"
          }
        ]
      },
      {
        name: "Akademik",
        slug: "akademik",
        icon: "📚",
        subcategories: [
          {
            name: "Matematik",
            slug: "matematik",
            icon: "📐"
          },
          {
            name: "Fizik",
            slug: "fizik",
            icon: "⚡"
          },
          {
            name: "Kimya",
            slug: "kimya",
            icon: "🧪"
          },
          {
            name: "Biyoloji",
            slug: "biyoloji",
            icon: "🧬"
          }
        ]
      },
      {
        name: "Mesleki",
        slug: "mesleki",
        icon: "👨‍💼",
        subcategories: [
          {
            name: "Sürücü Kursu",
            slug: "surucu-kursu",
            icon: "🚗"
          },
          {
            name: "Dikiş",
            slug: "dikis-kursu",
            icon: "🧵"
          },
          {
            name: "Makyaj",
            slug: "makyaj-kursu",
            icon: "💄"
          },
          {
            name: "Aşçılık",
            slug: "ascilik",
            icon: "👨‍🍳"
          }
        ]
      },
      {
        name: "Okul & Kreş",
        slug: "okul-kres",
        icon: "🏫",
        subcategories: [
          {
            name: "Anaokulu",
            slug: "anaokulu",
            icon: "🎨"
          },
          {
            name: "İlkokul",
            slug: "ilkokul",
            icon: "📚"
          },
          {
            name: "Ortaokul",
            slug: "ortaokul",
            icon: "🎒"
          },
          {
            name: "Lise",
            slug: "lise",
            icon: "🎓"
          },
          {
            name: "Kreş",
            slug: "kres",
            icon: "👶"
          }
        ]
      },
      {
        name: "Diğer",
        slug: "diger",
        icon: "📱",
        subcategories: [
          {
            name: "Kişisel Gelişim",
            slug: "kisisel-gelisim",
            icon: "🧠"
          },
          {
            name: "Diksiyon",
            slug: "diksiyon",
            icon: "🗣️"
          },
          {
            name: "Fotoğrafçılık",
            slug: "fotografcilik-kursu",
            icon: "📸"
          },
          {
            name: "El Sanatları",
            slug: "el-sanatlari-kursu",
            icon: "🎨"
          }
        ]
      }
    ]
  },
  {
    name: "Yemek & İçecek",
    icon: Utensils,
    slug: "yemek-icecek",
    subcategories: [
      {
        name: "Tatlı",
        slug: "tatli",
        icon: "🍯"
      },
      {
        name: "Kahvaltılık",
        slug: "kahvaltilik",
        icon: "🍯"
      },
      {
        name: "İçecek",
        slug: "icecek",
        icon: "☕"
      },
      {
        name: "Kuruyemiş",
        slug: "kuruyemis",
        icon: "🥜"
      },
      {
        name: "Diğer",
        slug: "diger",
        icon: "🍽️"
      }
    ]
  },
  {
    name: "Catering & Ticaret",
    icon: Store,
    slug: "catering-ticaret",
    subcategories: [
      {
        name: "Catering Hizmetleri",
        slug: "catering-hizmetleri",
        icon: "🍽️",
        subcategories: [
          {
            name: "Düğün Catering",
            slug: "dugun-catering",
            icon: "💒"
          },
          {
            name: "Kurumsal Catering",
            slug: "kurumsal-catering",
            icon: "🏢"
          },
          {
            name: "Özel Etkinlik",
            slug: "ozel-etkinlik",
            icon: "🎉"
          }
        ]
      },
      {
        name: "Ticaret",
        slug: "ticaret",
        icon: "🏪",
        subcategories: [
          {
            name: "Gıda Ticareti",
            slug: "gida-ticareti",
            icon: "🥘"
          },
          {
            name: "İçecek Ticareti",
            slug: "icecek-ticareti",
            icon: "🥤"
          },
          {
            name: "Toptan Satış",
            slug: "toptan-satis",
            icon: "📦"
          }
        ]
      },
      {
        name: "Ekipman",
        slug: "ekipman",
        icon: "🔧",
        subcategories: [
          {
            name: "Mutfak Ekipmanları",
            slug: "mutfak-ekipmanlari",
            icon: "🍳"
          },
          {
            name: "Servis Ekipmanları",
            slug: "servis-ekipmanlari",
            icon: "🍽️"
          },
          {
            name: "Soğutma Sistemleri",
            slug: "sogutma-sistemleri",
            icon: "❄️"
          }
        ]
      },
      {
        name: "Restaurant",
        slug: "restaurant",
        icon: "🍽️",
        subcategories: [
          {
            name: "Lüks Restaurant",
            slug: "luks-restaurant",
            icon: "🍷"
          },
          {
            name: "Günlük Restaurant",
            slug: "gunluk-restaurant",
            icon: "🍕"
          },
          {
            name: "Hızlı Yemek",
            slug: "hizli-yemek",
            icon: "🍔"
          },
          {
            name: "Açık Büfe",
            slug: "acik-bufe",
            icon: "🥘"
          }
        ]
      },
      {
        name: "Lokanta",
        slug: "lokanta",
        icon: "🍜",
        subcategories: [
          {
            name: "Türk Mutfağı",
            slug: "turk-mutfagi",
            icon: "🥙"
          },
          {
            name: "Kebapçı",
            slug: "kebapci",
            icon: "🍖"
          },
          {
            name: "Pideci",
            slug: "pideci",
            icon: "🥟"
          },
          {
            name: "Çorba Evi",
            slug: "corba-evi",
            icon: "🍲"
          }
        ]
      },
      {
        name: "Sokak Lezzetleri",
        slug: "sokak-lezzetleri",
        icon: "🌭",
        subcategories: [
          {
            name: "Döner",
            slug: "doner",
            icon: "🥙"
          },
          {
            name: "Balık Ekmek",
            slug: "balik-ekmek",
            icon: "🐟"
          },
          {
            name: "Kokoreç",
            slug: "kokorec",
            icon: "🥖"
          },
          {
            name: "Simit",
            slug: "simit",
            icon: "🥨"
          },
          {
            name: "Midye",
            slug: "midye",
            icon: "🦪"
          }
        ]
      }
    ]
  },
  {
    name: "Turizm & Konaklama",
    icon: Hotel,
    slug: "turizm-konaklama",
    subcategories: [
      {
        name: "Konaklama",
        slug: "konaklama",
        icon: "🏨",
        subcategories: [
          {
            name: "Otel",
            slug: "otel",
            icon: "🏨"
          },
          {
            name: "Pansiyon",
            slug: "pansiyon",
            icon: "🏠"
          },
          {
            name: "Apart",
            slug: "apart",
            icon: "🏢"
          },
          {
            name: "Tatil Köyü",
            slug: "tatil-koyu",
            icon: "🏖️"
          },
          {
            name: "Butik Otel",
            slug: "butik-otel",
            icon: "🏰"
          }
        ]
      },
      {
        name: "Turlar",
        slug: "turlar",
        icon: "🗺️",
        subcategories: [
          {
            name: "Şehir Turu",
            slug: "sehir-turu",
            icon: "🏛️"
          },
          {
            name: "Günübirlik Tur",
            slug: "gunubirlik-tur",
            icon: "🌅"
          },
          {
            name: "Yurt Dışı Tur",
            slug: "yurtdisi-tur",
            icon: "✈️"
          },
          {
            name: "Tekne Turu",
            slug: "tekne-turu",
            icon: "🚢"
          }
        ]
      },
      {
        name: "Uçak Bileti",
        slug: "ucak-bileti",
        icon: "✈️",
        subcategories: [
          {
            name: "Yurt İçi",
            slug: "yurt-ici",
            icon: "🛩️"
          },
          {
            name: "Yurt Dışı",
            slug: "yurtdisi",
            icon: "🌍"
          },
          {
            name: "Charter",
            slug: "charter",
            icon: "🛫"
          }
        ]
      },
      {
        name: "Araç Kiralama",
        slug: "arac-kiralama",
        icon: "🚗",
        subcategories: [
          {
            name: "Otomobil",
            slug: "otomobil",
            icon: "🚙"
          },
          {
            name: "SUV",
            slug: "suv",
            icon: "🚐"
          },
          {
            name: "Minibüs",
            slug: "minibus",
            icon: "🚌"
          },
          {
            name: "Motosiklet",
            slug: "motosiklet",
            icon: "🏍️"
          }
        ]
      }
    ]
  },
  {
    name: "Sağlık & Güzellik",
    icon: Heart,
    slug: "saglik-guzellik",
    subcategories: [
      {
        name: "Cilt Bakımı",
        slug: "cilt-bakimi",
        icon: "✨",
        subcategories: [
          {
            name: "Yüz Bakımı",
            slug: "yuz-bakimi",
            icon: "✨"
          },
          {
            name: "Vücut Bakımı",
            slug: "vucut-bakimi",
            icon: "💆"
          },
          {
            name: "Anti-Aging",
            slug: "anti-aging",
            icon: "🧴"
          },
          {
            name: "Akne Tedavisi",
            slug: "akne-tedavisi",
            icon: "🔬"
          },
          {
            name: "Leke Tedavisi",
            slug: "leke-tedavisi",
            icon: "🔬"
          },
          {
            name: "Güneş Bakımı",
            slug: "gunes-bakimi",
            icon: "☀️"
          },
          {
            name: "Nemlendirici",
            slug: "nemlendirici",
            icon: "💧"
          },
          {
            name: "Temizlik Ürünleri",
            slug: "temizlik-urunleri",
            icon: "🧼"
          }
        ]
      },
      {
        name: "Masaj",
        slug: "masaj",
        icon: "💆",
        subcategories: [
          {
            name: "Thai Masaj",
            slug: "thai-masaj",
            icon: "💆"
          },
          {
            name: "Aromaterapi",
            slug: "aromaterapi",
            icon: "🌸"
          },
          {
            name: "Spor Masajı",
            slug: "spor-masaji",
            icon: "🏃"
          },
          {
            name: "Refleksoloji",
            slug: "refleksoloji",
            icon: "🦶"
          },
          {
            name: "Swedish Masaj",
            slug: "swedish-masaj",
            icon: "💆"
          },
          {
            name: "Deep Tissue",
            slug: "deep-tissue",
            icon: "💪"
          },
          {
            name: "Hot Stone",
            slug: "hot-stone",
            icon: "🪨"
          },
          {
            name: "Shiatsu",
            slug: "shiatsu",
            icon: "👐"
          }
        ]
      },
      {
        name: "Saç Bakımı",
        slug: "sac-bakimi",
        icon: "💇",
        subcategories: [
          {
            name: "Saç Kesimi",
            slug: "sac-kesimi",
            icon: "✂️"
          },
          {
            name: "Saç Boyama",
            slug: "sac-boyama",
            icon: "🎨"
          },
          {
            name: "Saç Bakımı",
            slug: "sac-bakimi-hizmet",
            icon: "💇"
          },
          {
            name: "Peruk",
            slug: "peruk",
            icon: "👩"
          },
          {
            name: "Saç Uzatma",
            slug: "sac-uzatma",
            icon: "👩"
          },
          {
            name: "Saç Düzleştirme",
            slug: "sac-duzlestirme",
            icon: "🔌"
          },
          {
            name: "Saç Kıvırma",
            slug: "sac-kivirma",
            icon: "🌀"
          },
          {
            name: "Saç Bakım Ürünleri",
            slug: "sac-bakim-urunleri",
            icon: "🧴"
          }
        ]
      },
      {
        name: "Spor & Fitness",
        slug: "spor-fitness",
        icon: "🏋️",
        subcategories: [
          {
            name: "Fitness",
            slug: "fitness",
            icon: "💪"
          },
          {
            name: "Yoga",
            slug: "yoga",
            icon: "🧘"
          },
          {
            name: "Pilates",
            slug: "pilates",
            icon: "🤸"
          },
          {
            name: "Dans",
            slug: "dans",
            icon: "💃"
          },
          {
            name: "Koşu",
            slug: "kosu",
            icon: "🏃"
          },
          {
            name: "Yüzme",
            slug: "yuzme",
            icon: "🏊"
          },
          {
            name: "Bisiklet",
            slug: "bisiklet",
            icon: "🚴"
          },
          {
            name: "Ağırlık Kaldırma",
            slug: "agirlik-kaldirma",
            icon: "🏋️"
          }
        ]
      },
      {
        name: "Kozmetik",
        slug: "kozmetik",
        icon: "💄",
        subcategories: [
          {
            name: "Makyaj",
            slug: "makyaj",
            icon: "💄"
          },
          {
            name: "Parfüm",
            slug: "parfum",
            icon: "🌸"
          },
          {
            name: "Tırnak Bakımı",
            slug: "tirnak-bakimi",
            icon: "💅"
          },
          {
            name: "Dövme",
            slug: "dovme",
            icon: "🎨"
          },
          {
            name: "Kaş & Kirpik",
            slug: "kas-kirpik",
            icon: "👁️"
          },
          {
            name: "Dudak Bakımı",
            slug: "dudak-bakimi",
            icon: "💋"
          },
          {
            name: "Göz Makyajı",
            slug: "goz-makyaji",
            icon: "👁️"
          },
          {
            name: "Yüz Makyajı",
            slug: "yuz-makyaji",
            icon: "✨"
          }
        ]
      },
      {
        name: "Kişisel Bakım",
        slug: "kisisel-bakim",
        icon: "🧴",
        subcategories: [
          {
            name: "Duş & Banyo",
            slug: "dus-banyo",
            icon: "🚿"
          },
          {
            name: "Deodorant",
            slug: "deodorant",
            icon: "🌸"
          },
          {
            name: "Diş Bakımı",
            slug: "dis-bakimi",
            icon: "🦷"
          },
          {
            name: "Ağız Bakımı",
            slug: "agiz-bakimi",
            icon: "🦷"
          },
          {
            name: "Göz Bakımı",
            slug: "goz-bakimi",
            icon: "👁️"
          },
          {
            name: "Kulak Bakımı",
            slug: "kulak-bakimi",
            icon: "👂"
          },
          {
            name: "Burun Bakımı",
            slug: "burun-bakimi",
            icon: "👃"
          }
        ]
      },
      {
        name: "Estetik & Güzellik",
        slug: "estetik-guzellik",
        icon: "👩‍⚕️",
        subcategories: [
          {
            name: "Botoks",
            slug: "botoks",
            icon: "💉"
          },
          {
            name: "Dolgu",
            slug: "dolgu",
            icon: "💉"
          },
          {
            name: "Lazer Epilasyon",
            slug: "lazer-epilasyon",
            icon: "⚡"
          },
          {
            name: "Cilt Yenileme",
            slug: "cilt-yenileme",
            icon: "✨"
          },
          {
            name: "Burun Estetiği",
            slug: "burun-estetigi",
            icon: "👃"
          },
          {
            name: "Göz Estetiği",
            slug: "goz-estetigi",
            icon: "👁️"
          },
          {
            name: "Dudak Estetiği",
            slug: "dudak-estetigi",
            icon: "💋"
          },
          {
            name: "Çene Estetiği",
            slug: "cene-estetigi",
            icon: "🦷"
          }
        ]
      },
      {
        name: "Sağlık Ürünleri",
        slug: "saglik-urunleri",
        icon: "💊",
        subcategories: [
          {
            name: "Vitaminler",
            slug: "vitaminler",
            icon: "💊"
          },
          {
            name: "Mineraller",
            slug: "mineraller",
            icon: "💊"
          },
          {
            name: "Probiyotikler",
            slug: "probiyotikler",
            icon: "🦠"
          },
          {
            name: "Omega-3",
            slug: "omega-3",
            icon: "🐟"
          },
          {
            name: "Protein Tozları",
            slug: "protein-tozlari",
            icon: "🥤"
          },
          {
            name: "Bitkisel Takviyeler",
            slug: "bitkisel-takviyeler",
            icon: "🌿"
          },
          {
            name: "Ağrı Kesiciler",
            slug: "agri-kesiciler",
            icon: "💊"
          },
          {
            name: "Soğuk Algınlığı",
            slug: "soguk-alginligi",
            icon: "🤧"
          }
        ]
      },
      {
        name: "Aromaterapi",
        slug: "aromaterapi-urunleri",
        icon: "🌸",
        subcategories: [
          {
            name: "Uçucu Yağlar",
            slug: "ucucu-yaglar",
            icon: "🫗"
          },
          {
            name: "Mumlar",
            slug: "mumlar",
            icon: "🕯️"
          },
          {
            name: "Tütsüler",
            slug: "tutsuler",
            icon: "🕯️"
          },
          {
            name: "Difüzörler",
            slug: "difuzorler",
            icon: "💨"
          },
          {
            name: "Masaj Yağları",
            slug: "masaj-yaglari",
            icon: "🫗"
          },
          {
            name: "Banyo Tuzları",
            slug: "banyo-tuzlari",
            icon: "🧂"
          },
          {
            name: "Yastık Spreyleri",
            slug: "yastik-spreyleri",
            icon: "💨"
          }
        ]
      },
      {
        name: "Diğer",
        slug: "diger",
        icon: "💅",
        subcategories: [
          {
            name: "Estetik",
            slug: "estetik",
            icon: "👩‍⚕️"
          },
          {
            name: "Diş Bakımı",
            slug: "dis-bakimi",
            icon: "🦷"
          },
          {
            name: "Göz Bakımı",
            slug: "goz-bakimi",
            icon: "👁️"
          },
          {
            name: "Podoloji",
            slug: "podoloji",
            icon: "🦶"
          },
          {
            name: "Ortodonti",
            slug: "ortodonti",
            icon: "🦷"
          },
          {
            name: "Dermatoloji",
            slug: "dermatoloji",
            icon: "🔬"
          }
        ]
      },
      {
        name: "Erkek Kuaför",
        slug: "erkek-kuafor",
        icon: "✂️",
        subcategories: [
          {
            name: "Saç Kesimi",
            slug: "sac-kesimi-erkek",
            icon: "✂️"
          },
          {
            name: "Sakal Tıraşı",
            slug: "sakal-tirasi",
            icon: "🪒"
          },
          {
            name: "Saç Boyama",
            slug: "sac-boyama-erkek",
            icon: "🎨"
          },
          {
            name: "Saç Şekillendirme",
            slug: "sac-sekillendirme",
            icon: "💇‍♂️"
          },
          {
            name: "Cilt Bakımı",
            slug: "cilt-bakimi-erkek",
            icon: "🧴"
          },
          {
            name: "Manikür",
            slug: "manikur-erkek",
            icon: "💅"
          }
        ]
      },
      {
        name: "Güzellik Merkezi",
        slug: "guzellik-merkezi",
        icon: "💄",
        subcategories: [
          {
            name: "Cilt Bakımı",
            slug: "cilt-bakimi-merkez",
            icon: "✨"
          },
          {
            name: "Makyaj",
            slug: "makyaj-merkez",
            icon: "💄"
          },
          {
            name: "Kaş & Kirpik",
            slug: "kas-kirpik-merkez",
            icon: "👁️"
          },
          {
            name: "Tırnak Bakımı",
            slug: "tirnak-bakimi-merkez",
            icon: "💅"
          },
          {
            name: "Epilasyon",
            slug: "epilasyon-merkez",
            icon: "⚡"
          },
          {
            name: "Masaj",
            slug: "masaj-merkez",
            icon: "💆"
          },
          {
            name: "Saç Bakımı",
            slug: "sac-bakimi-merkez",
            icon: "💇"
          },
          {
            name: "Estetik",
            slug: "estetik-merkez",
            icon: "👩‍⚕️"
          }
        ]
      },
      {
        name: "Bayan Kuaför",
        slug: "bayan-kuafor",
        icon: "💇‍♀️",
        subcategories: [
          {
            name: "Saç Kesimi",
            slug: "sac-kesimi-bayan",
            icon: "✂️"
          },
          {
            name: "Saç Boyama",
            slug: "sac-boyama-bayan",
            icon: "🎨"
          },
          {
            name: "Saç Uzatma",
            slug: "sac-uzatma-bayan",
            icon: "👩"
          },
          {
            name: "Saç Düzleştirme",
            slug: "sac-duzlestirme-bayan",
            icon: "🔌"
          },
          {
            name: "Saç Kıvırma",
            slug: "sac-kivirma-bayan",
            icon: "🌀"
          },
          {
            name: "Peruk",
            slug: "peruk-bayan",
            icon: "👩"
          },
          {
            name: "Makyaj",
            slug: "makyaj-bayan",
            icon: "💄"
          },
          {
            name: "Manikür & Pedikür",
            slug: "manikur-pedikur",
            icon: "💅"
          }
        ]
      },
      {
        name: "Diğer",
        slug: "diger",
        icon: "💅",
        subcategories: [
          {
            name: "Estetik",
            slug: "estetik",
            icon: "👩‍⚕️"
          },
          {
            name: "Diş Bakımı",
            slug: "dis-bakimi",
            icon: "🦷"
          },
          {
            name: "Göz Bakımı",
            slug: "goz-bakimi",
            icon: "👁️"
          },
          {
            name: "Podoloji",
            slug: "podoloji",
            icon: "🦶"
          },
          {
            name: "Ortodonti",
            slug: "ortodonti",
            icon: "🦷"
          },
          {
            name: "Dermatoloji",
            slug: "dermatoloji",
            icon: "🔬"
          }
        ]
      }
    ]
  },
  {
    name: "Sanat & Hobi",
    icon: Palette,
    slug: "sanat-hobi",
    subcategories: [
      {
        name: "Resim",
        slug: "resim",
        icon: "🎨",
        subcategories: [
          {
            name: "Yağlı Boya",
            slug: "yagli-boya",
            icon: "🎨"
          },
          {
            name: "Suluboya",
            slug: "suluboya",
            icon: "🎨"
          },
          {
            name: "Akrilik",
            slug: "akrilik",
            icon: "🎨"
          },
          {
            name: "Karakalem",
            slug: "karakalem",
            icon: "✏️"
          }
        ]
      },
      {
        name: "Müzik",
        slug: "muzik",
        icon: "🎵",
        subcategories: [
          {
            name: "Gitar",
            slug: "gitar",
            icon: "🎸"
          },
          {
            name: "Piyano",
            slug: "piyano",
            icon: "🎹"
          },
          {
            name: "Keman",
            slug: "keman",
            icon: "🎻"
          },
          {
            name: "Davul",
            slug: "davul",
            icon: "🥁"
          }
        ]
      },
      {
        name: "Seramik",
        slug: "seramik",
        icon: "🏺",
        subcategories: [
          {
            name: "Çömlek",
            slug: "comlek",
            icon: "🏺"
          },
          {
            name: "Vazo",
            slug: "vazo",
            icon: "🏺"
          },
          {
            name: "Tabak",
            slug: "tabak",
            icon: "🍽️"
          },
          {
            name: "Süs Eşyası",
            slug: "sus-esyasi",
            icon: "🏺"
          }
        ]
      },
      {
        name: "Fotoğrafçılık",
        slug: "fotografcilik",
        icon: "📸",
        subcategories: [
          {
            name: "DSLR",
            slug: "dslr",
            icon: "📷"
          },
          {
            name: "Aynasız",
            slug: "mirrorless",
            icon: "📷"
          },
          {
            name: "Aksesuarlar",
            slug: "aksesuarlar",
            icon: "🔧"
          },
          {
            name: "Drone",
            slug: "drone",
            icon: "🚁"
          }
        ]
      },
      {
        name: "El Sanatları",
        slug: "el-sanatlari",
        icon: "🧶",
        subcategories: [
          {
            name: "Örgü",
            slug: "orgu",
            icon: "🧶"
          },
          {
            name: "Dikiş",
            slug: "dikis",
            icon: "🧵"
          },
          {
            name: "Takı",
            slug: "taki",
            icon: "💍"
          },
          {
            name: "Ahşap",
            slug: "ahsap",
            icon: "🪵"
          }
        ]
      },
      {
        name: "Koleksiyon",
        slug: "koleksiyon",
        icon: "📦",
        subcategories: [
          {
            name: "Pul",
            slug: "pul",
            icon: "📮"
          },
          {
            name: "Para",
            slug: "para",
            icon: "💰"
          },
          {
            name: "Oyuncak",
            slug: "oyuncak-koleksiyon",
            icon: "🧸"
          },
          {
            name: "Kart",
            slug: "kart",
            icon: "🃏"
          }
        ]
      },
      {
        name: "Diğer",
        slug: "diger",
        icon: "🎭",
        subcategories: [
          {
            name: "Bahçe",
            slug: "bahce",
            icon: "🌱"
          },
          {
            name: "Balıkçılık",
            slug: "balikcilik",
            icon: "🎣"
          },
          {
            name: "Spor",
            slug: "spor-hobi",
            icon: "⚽"
          },
          {
            name: "Kitap",
            slug: "kitap",
            icon: "📚"
          }
        ]
      }
    ]
  },
  {
    name: "Ücretsiz Gel Al",
    icon: Gift,
    slug: "ucretsiz-gel-al",
    subcategories: [
      {
        name: "Mobilya",
        slug: "mobilya",
        icon: "🪑"
      },
      {
        name: "Oyuncak",
        slug: "oyuncak",
        icon: "🧸"
      },
      {
        name: "Kitap",
        slug: "kitap",
        icon: "📚"
      },
      {
        name: "Giyim",
        slug: "giyim",
        icon: "👕"
      },
      {
        name: "Diğer",
        slug: "diger",
        icon: "🎁"
      }
    ]
  },
  {
    name: "Diğer",
    icon: MoreHorizontal,
    slug: "diger",
    subcategories: [
      {
        name: "Diğer",
        slug: "diger",
        icon: "📱"
      }
    ]
  }
] 