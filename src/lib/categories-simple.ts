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
    subcategories: []
  },
  {
    name: "Hizmetler",
    icon: Wrench,
    slug: "hizmetler",
    subcategories: []
  },
  {
    name: "Elektronik",
    icon: Smartphone,
    slug: "elektronik",
    subcategories: []
  },
  {
    name: "Ev & Bahçe",
    icon: Home,
    slug: "ev-ve-bahce",
    subcategories: []
  },
  {
    name: "Giyim",
    icon: Shirt,
    slug: "giyim",
    subcategories: []
  },
  {
    name: "Moda & Stil",
    icon: Shirt,
    slug: "moda-stil",
    subcategories: []
  },
  {
    name: "Sporlar, Oyunlar ve Eğlenceler",
    icon: Dumbbell,
    slug: "sporlar-oyunlar-eglenceler",
    subcategories: []
  },
  {
    name: "Anne & Bebek",
    icon: Baby,
    slug: "anne-bebek",
    subcategories: []
  },
  {
    name: "Çocuk Dünyası",
    icon: Baby,
    slug: "cocuk-dunyasi",
    subcategories: []
  },
  {
    name: "Eğitim & Kurslar",
    icon: GraduationCap,
    slug: "egitim-kurslar",
    subcategories: []
  },
  {
    name: "Yemek & İçecek",
    icon: Utensils,
    slug: "yemek-icecek",
    subcategories: []
  },
  {
    name: "Catering & Ticaret",
    icon: Utensils,
    slug: "catering-ticaret",
    subcategories: []
  },
  {
    name: "Turizm & Konaklama",
    icon: Hotel,
    slug: "turizm-konaklama",
    subcategories: []
  },
  {
    name: "Sağlık & Güzellik",
    icon: Heart,
    slug: "saglik-guzellik",
    subcategories: []
  },
  {
    name: "Sanat & Hobi",
    icon: Palette,
    slug: "sanat-hobi",
    subcategories: []
  },
  {
    name: "Ücretsiz Gel Al",
    icon: Gift,
    slug: "ucretsiz-gel-al",
    subcategories: []
  },
  {
    name: "Diğer",
    icon: MoreHorizontal,
    slug: "diger",
    subcategories: []
  }
] 