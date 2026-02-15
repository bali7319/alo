/**
 * Çanakkale ilçeleri ve yerel SEO sablonları.
 * Kategori ağacı + 17 plaka ile uyumlu yapı.
 */

export const CANAKKALE_ILCELER = [
  { name: 'Merkez', slug: 'merkez', postalCode: '17100' },
  { name: 'Biga', slug: 'biga', postalCode: '17200' },
  { name: 'Çan', slug: 'can', postalCode: '17400' },
  { name: 'Gelibolu', slug: 'gelibolu', postalCode: '17500' },
  { name: 'Lapseki', slug: 'lapseki', postalCode: '17800' },
  { name: 'Yenice', slug: 'yenice', postalCode: '17810' },
  { name: 'Ayvacık', slug: 'ayvacik', postalCode: '17860' },
  { name: 'Ezine', slug: 'ezine', postalCode: '17600' },
  { name: 'Bayramiç', slug: 'bayramic', postalCode: '17700' },
  { name: 'Eceabat', slug: 'eceabat', postalCode: '17900' },
  { name: 'Gökçeada', slug: 'gokceada', postalCode: '17760' },
  { name: 'Bozcaada', slug: 'bozcaada', postalCode: '17680' },
] as const;

export type IlceSlug = (typeof CANAKKALE_ILCELER)[number]['slug'];

/**
 * Çanakkale Merkez ilçesi resmi mahalleleri (TÜİK / nüfus kayıtları).
 * SEO ve içerikte lokasyon sinyali için kullanılır.
 */
export const MERKEZ_MAHALLELER = [
  'Barbaros',
  'Esenler',
  'Cevatpaşa',
  'İsmetpaşa',
  'Cumhuriyet',
  'Boğazkent',
  'Hamidiye',
  'Fevzipaşa',
  'Kemalpaşa',
  'Namık Kemal',
  'Güzelyalı', // yaygın semt
  'Kepez',     // yaygın semt
] as const;

/** Merkez ilçe semtleri: içerik ve SEO'da lokasyon sinyali (kullanım alanı ile) */
export const MERKEZ_SEMTLER = [
  { name: 'Kepez', kullanım: 'Sağlık ve konaklama hizmetleri' },
  { name: 'Esenler', kullanım: 'Eğitim ve ev hizmetleri' },
  { name: 'Barbaros', kullanım: 'Yemek ve eğlence' },
  { name: 'Güzelyalı', kullanım: 'Yemek ve eğlence' },
] as const;

/**
 * Tüm Çanakkale lokasyonları: 12 ilçe + Merkez mahalleleri.
 * Meta keywords, içerik ve filtreleme için tek liste.
 */
export const CANAKKALE_TUM_LOKASYONLAR: string[] = [
  ...CANAKKALE_ILCELER.map((i) => i.name),
  ...MERKEZ_MAHALLELER,
];

/** Merkez mahallelerini virgülle ayrılmış metin (SEO paragrafında kullanım) */
export const MERKEZ_MAHALLELER_METIN = MERKEZ_MAHALLELER.join(', ');

/** İlçe adlarını virgülle ayrılmış metin */
export const CANAKKALE_ILCE_ADLARI_METIN = CANAKKALE_ILCELER.map((i) => i.name).join(', ');

/**
 * Footer "Popüler Çanakkale Aramaları" / Hızlı Erişim – Google'a lokasyon sinyali.
 * Emlak ve araç yok; yerel ihtiyaç odaklı aramalar.
 */
export const FOOTER_POPULAR_SEARCHES: { label: string; href: string }[] = [
  { label: 'Merkez Bebek Mağazaları', href: '/merkez/anne-bebek/bebek-giyim' },
  { label: 'Biga Bilgisayar Servisleri', href: '/biga/elektronik/bilgisayar' },
  { label: 'Çan Güzellik Salonları', href: '/can/saglik-guzellik/guzellik-merkezi' },
  { label: 'Gelibolu Ev Yemekleri', href: '/gelibolu/yemek-icecek/ozel-yemekler' },
  { label: 'Lapseki Sürücü Kursları', href: '/lapseki/hizmetler/direksiyon-dersi' },
  { label: 'Ezine Mobilya Mağazaları', href: '/ezine/ev-ve-bahce/mobilya' },
];

/** İlçe odaklı özel "koleksiyon" sayfaları (SEO: gizli anahtar kelimeler) */
export const CANAKKALE_COLLECTIONS = [
  {
    slug: 'bozcaada-konaklama',
    title: 'Bozcaada Konaklama ve Butik Oteller',
    description: "Bozcaada'da konaklama, butik otel ve pansiyon ilanları. Turizm & Konaklama kategorisinden 17 plakalı fırsatlar.",
    ilceName: 'Bozcaada',
    ilceSlug: 'bozcaada' as IlceSlug,
    categorySlug: 'turizm-konaklama',
    subSlug: 'konaklama',
  },
  {
    slug: 'gokceada-el-sanatlari',
    title: 'Gökçeada El Sanatları ve Hediyelik Eşya',
    description: "Gökçeada'da el sanatları, hediyelik eşya ve sanat atölyeleri. Sanat & Hobi kategorisinden ilanlar.",
    ilceName: 'Gökçeada',
    ilceSlug: 'gokceada' as IlceSlug,
    categorySlug: 'sanat-hobi',
    subSlug: 'el-sanatlari',
  },
  {
    slug: 'bayramic-koy-urunleri',
    title: 'Bayramiç Köy Ürünleri ve Ticaret',
    description: "Bayramiç köy ürünleri, yerel ticaret ve catering. Catering & Ticaret kategorisinden ilanlar.",
    ilceName: 'Bayramiç',
    ilceSlug: 'bayramic' as IlceSlug,
    categorySlug: 'catering-ticaret',
    subSlug: 'ticaret',
  },
] as const;

/** Marka sloganı: meta açıklamalarında kullanılır. */
export const BRAND_SLOGAN_SEO =
  "Çanakkale'nin emlak ve araç dışındaki tüm yerel ihtiyaçları, esnafı ve hizmetleri burada.";

/** Niche Authority: "Çanakkale'nin Yerel Hizmet ve Yaşam Uzmanı" konumlandırması */
export const NICHE_AUTHORITY_TAGLINE = "Çanakkale'nin Yerel Hizmet ve Yaşam Uzmanı";

/**
 * Long-tail anahtar kelime örnekleri – kategori sayfalarına yedirilecek kalıplar.
 * Ev Hizmetleri, Tamir/Bakım, Yerel Ticaret.
 */
export const LONG_TAIL_KEYWORD_EXAMPLES = {
  evHizmetleri: [
    'Çanakkale Merkez evden eve nakliyat',
    'Biga boya badana ustası',
    'Çan anahtarcı ve çilingir',
  ],
  tamirBakim: [
    'Lapseki kombi servisi',
    'Ezine beyaz eşya tamiri',
    'Gelibolu telefon ekran değişimi',
  ],
  yerelTicaret: [
    'Bozcaada hediyelik eşya dükkanları',
    'Gökçeada yöresel ürün satış noktaları',
  ],
} as const;

/**
 * İlçe landing sayfası: her ilçenin odak kategorisi ve hedeflenen kelime.
 */
export const ILCE_LANDING_CONFIG: Record<
  string,
  { focusCategorySlug: string; focusCategoryName: string; targetTitle: string; targetDescription: string }
> = {
  biga: {
    focusCategorySlug: 'elektronik',
    focusCategoryName: 'Elektronik & Sanayi',
    targetTitle: 'Biga 2. El Laptop ve Bilgisayar Parçaları',
    targetDescription: "Biga'da ikinci el laptop, bilgisayar parçaları ve teknik servis ilanları. Elektronik ve sanayi ihtiyaçları için 17 plakalı fırsatlar.",
  },
  merkez: {
    focusCategorySlug: 'egitim-kurslar',
    focusCategoryName: 'Eğitim & Sağlık',
    targetTitle: 'Çanakkale Özel Ders Verenler ve Kurslar',
    targetDescription: "Çanakkale Merkez'de özel ders, kurslar, sağlık ve kişisel bakım hizmetleri. ÇOMÜ öğrencileri ve yerel halk için güncel ilanlar.",
  },
  gokceada: {
    focusCategorySlug: 'yemek-icecek',
    focusCategoryName: 'Yemek & Tatil Hizmetleri',
    targetTitle: 'Gökçeada Paket Servis ve Restoran Rehberi',
    targetDescription: "Gökçeada'da paket servis, restoran ve tatil hizmetleri. Yemek ve konaklama rehberi.",
  },
  can: {
    focusCategorySlug: 'saglik-guzellik',
    focusCategoryName: 'Sağlık & Güzellik',
    targetTitle: 'Çan En İyi Bayan Kuaförleri ve Salonları',
    targetDescription: "Çan'da bayan kuaför, güzellik salonu ve kişisel bakım hizmetleri. Tavsiye ve randevu bilgileri.",
  },
};

/**
 * Semantik SEO: kategoriye göre "komşu" kelimeler – sayfa kalitesi sinyali.
 */
export const SEMANTIC_KEYWORDS_BY_CATEGORY: Record<string, string[]> = {
  'saglik-guzellik': ['randevu', 'uzman', 'tavsiye', 'klinik', 'merkezi', 'salon'],
  elektronik: ['garantili', 'tamir', 'orijinal parça', 'servis', 'ikinci el'],
  'anne-bebek': ['yeni doğan', 'organik', 'bebek giyim', 'mağazası', 'fiyatları'],
  'egitim-kurslar': ['özel ders', 'kurs', 'ÇOMÜ', 'eğitmen', 'fiyat'],
  'yemek-icecek': ['restoran', 'paket servis', 'rehber', 'tavsiye'],
  hizmetler: ['usta', 'servis', 'tamir', 'nakliyat', 'hizmet'],
};

/** Kategori slug -> SEO title tipi (şablonda kullanılacak) */
const CATEGORY_TITLE_TEMPLATE: Record<
  string,
  'elektronik' | 'anne-bebek' | 'egitim' | 'yemek' | 'saglik' | 'sanat' | 'hizmet' | 'genel'
> = {
  'elektronik': 'elektronik',
  'anne-bebek': 'anne-bebek',
  'egitim-kurslar': 'egitim',
  'yemek-icecek': 'yemek',
  'saglik-guzellik': 'saglik',
  'sanat-hobi': 'sanat',
  'hizmetler': 'hizmet',
  'turizm-konaklama': 'genel',
  'catering-ticaret': 'genel',
  'giyim': 'genel',
  'moda-stil': 'genel',
  'ev-ve-bahce': 'genel',
  'is': 'genel',
  'sporlar-oyunlar-eglenceler': 'genel',
  'cocuk-dunyasi': 'genel',
  'ucretsiz-gel-al': 'genel',
};

/**
 * Hizmetler kategorisi alt/alt-alt slug → SEO başlık ifadesi.
 * Örn: "Biga İnşaat Sonrası Temizlik Şirketleri", "Gelibolu Klima Servisi ve Kombi Bakımı"
 */
const HIZMET_SEO_PHRASE: Record<string, string> = {
  'insaat-sonrasi-temizlik': 'İnşaat Sonrası Temizlik Şirketleri',
  'ev-temizligi': 'Ev Temizliği Hizmetleri',
  'koltuk-hali-yikama': 'Koltuk ve Halı Yıkama',
  'boya-badana': 'Mutfak Tezgahı ve Boya Badana Ustaları',
  'alcipan': 'Alçıpan ve Tadilat Ustaları',
  'anahtar-teslim-tadilat': 'Anahtar Teslim Tadilat',
  'tadilat-dekorasyon': 'Tadilat ve Boya Badana Ustaları',
  'klima-servisi': 'Klima Servisi ve Kombi Bakımı',
  'kombi-bakimi': 'Klima Servisi ve Kombi Bakımı',
  'isitma-sogutma-servis': 'Klima Servisi ve Kombi Bakımı',
  'oto-tamir-bakim': 'Oto Lastikçi ve Rot Balans Servisleri',
  'oto-detay-pasta-cila': 'Detaylı İç Temizlik ve Pasta Cila',
  'yol-yardim-cekici': 'Çekici ve Oto Kurtarma Hizmetleri',
  'evden-eve-nakliyat': 'Evden Eve Nakliyat ve Taşıma',
  'asansorlu-nakliyat': 'Asansörlü Nakliyat',
  'nakliyat': 'Nakliyat ve Taşıma Hizmetleri',
};

/**
 * İlçe ticari kimlik: belirli ilçe+kategori+alt için özel başlık ifadesi.
 * Biga: sanayi/elektronik/beyaz eşya. Merkez: eğitim/sağlık. Gelibolu/Lapseki: yemek/catering.
 */
const ILCE_CATEGORY_TITLE_OVERRIDE: Record<string, string> = {
  'biga:ev-ve-bahce:beyaz-esya': 'Beyaz Eşya Yetkili Servisleri',
  'biga:hizmetler:beyaz-esya-servisi': 'Beyaz Eşya Yetkili Servisleri',
  'biga:ev-ve-bahce:mutfak-gerecleri': 'Sanayi Tipi Mutfak Gereçleri',
  'merkez:egitim-kurslar:akademik-kurslar': 'KPSS Kursları ve Özel Ders Fiyatları',
  'merkez:saglik-guzellik:bayan-kuafor': 'Bayan Kuaförü Tavsiye',
  'gelibolu:yemek-icecek:fast-food': 'Paket Servis Restoranları',
  'gelibolu:yemek-icecek:restoranlar': 'Paket Servis Restoranları',
  'lapseki:hizmetler:dugun-etkinlik': 'Düğün Organizasyon ve Yemek Hizmetleri',
};

/**
 * Genel (ilçesiz) sayfa için SEO title.
 * Şablonlar: Elektronik -> "Çanakkale [Alt Kategori] Fiyatları ve İlanları"
 *           Anne & Bebek -> "[Alt Kategori] Mağazaları" (ilçe yoksa Çanakkale)
 *           Eğitim -> "Çanakkale [Alt Kategori] ve Özel Ders İlanları"
 *           Yemek -> "En İyi Çanakkale [Alt Kategori] Yerleri"
 *           Sağlık -> "Çanakkale [Alt Kategori] ve Güzellik Merkezleri"
 *           Sanat -> "Çanakkale [Alt Kategori] Kursları ve Malzemeleri"
 *           Genel -> "Çanakkale [Kategori] [Alt Kategori] İlanları"
 */
export function getCategorySeoTitle(params: {
  categorySlug: string;
  categoryName: string;
  subCategoryName?: string;
  subCategorySlug?: string;
  ilceName?: string;
  ilceSlug?: string;
}): string {
  const { categorySlug, categoryName, subCategoryName, subCategorySlug, ilceName } = params;
  const alt = subCategoryName || categoryName;
  const ilce = ilceName || 'Çanakkale';
  const templateType = CATEGORY_TITLE_TEMPLATE[categorySlug] || 'genel';

  // Ana kategori sayfası (alt kategori yok): niş otorite başlıkları – tıklanabilir, Google dostu
  if (!subCategoryName && !params.ilceSlug) {
    if (categorySlug === 'hizmetler') {
      return "Çanakkale Hizmet İlanları ve Yetkili Servisler | alo17.tr";
    }
    if (categorySlug === 'elektronik') {
      return 'Çanakkale Elektronik İlanları ve Teknik Servisler | alo17.tr';
    }
    if (categorySlug === 'egitim-kurslar') {
      return 'Çanakkale Özel Ders Verenler ve Kurslar | alo17.tr';
    }
    if (categorySlug === 'saglik-guzellik') {
      return 'Çanakkale Sağlık ve Güzellik Salonları Rehberi | alo17.tr';
    }
  }

  // İlçe ticari kimlik: Biga/Merkez/Gelibolu/Lapseki özel ifadeleri (isteğe bağlı override)
  const overrideKey =
    params.ilceSlug && subCategorySlug ? `${params.ilceSlug}:${categorySlug}:${subCategorySlug}` : '';
  const ilceOverride = overrideKey ? ILCE_CATEGORY_TITLE_OVERRIDE[overrideKey] : null;
  if (ilceOverride && params.ilceSlug && ilceName) {
    return `${ilce} ${ilceOverride} | alo17.tr`;
  }

  // Tüm alt kategori sayfaları: [İlçe] [Alt Kategori] - En İyi [Ana Kategori] Firmaları | alo17.tr
  if (subCategoryName) {
    return `${ilce} ${alt} - En İyi ${categoryName} Firmaları | alo17.tr`;
  }

  // Ana kategori (alt yok) – ilçe sayfası nadir; yine de fallback
  const hizmetPhrase =
    templateType === 'hizmet' && subCategorySlug && HIZMET_SEO_PHRASE[subCategorySlug]
      ? HIZMET_SEO_PHRASE[subCategorySlug]
      : templateType === 'hizmet'
        ? `${alt} Hizmetleri`
        : null;

  if (params.ilceSlug && ilceName) {
    if (hizmetPhrase) {
      return `${ilce} ${hizmetPhrase} | alo17.tr`;
    }
    return `${ilce} ${categoryName} - En İyi Firmalar ve İlanlar | alo17.tr`;
  }

  if (hizmetPhrase) {
    return `Çanakkale ${hizmetPhrase} | alo17.tr`;
  }
  return `${categoryName} İlanları - Çanakkale | alo17.tr`;
}

/**
 * Kategori sayfaları için meta description: 17 plaka + slogan.
 * Eğitim/Sağlık/Elektronik için ÇOMÜ, diyetisyen, telefon tamiri vb. lokasyon ipuçları eklenir.
 */
export function getCategorySeoDescription(params: {
  subCategoryName?: string;
  categoryName?: string;
  categorySlug?: string;
  includeSlogan?: boolean;
}): string {
  const { subCategoryName, categoryName, categorySlug, includeSlogan = true } = params;
  const part = subCategoryName
    ? `Çanakkale'de ${subCategoryName}${categoryName ? ` (${categoryName})` : ''} ilanları ve hizmetler. `
    : categoryName
      ? `Çanakkale ${categoryName} kategorisinde ilanlar. `
      : '';
  const rest = 'Ücretsiz ilan ver, 17 plakalı şehrimize özel fırsatları keşfedin.';
  let keywordHint = '';
  if (categorySlug === 'egitim-kurslar') {
    keywordHint = ' Bilgisayar kursu, yazılım eğitimi ve ÇOMÜ öğrenci ihtiyaçları için güncel ilanlar.';
  } else if (categorySlug === 'saglik-guzellik') {
    keywordHint = ' Diyetisyen, psikolog ve kişisel bakım hizmetleri Çanakkale ilçelerinde.';
  } else if (categorySlug === 'elektronik') {
    keywordHint = ' Telefon ekran değişimi, laptop tamiri ve ikinci el alım satım.';
  } else if (categorySlug === 'hizmetler') {
    keywordHint = ' Çanakkale Merkez evden eve nakliyat, Biga boya badana ustası, Lapseki kombi servisi, Ezine beyaz eşya tamiri.';
  } else if (categorySlug === 'ev-ve-bahce') {
    keywordHint = ' Beyaz eşya tamiri, tadilat ve yerel hizmet ilanları.';
  } else if (categorySlug === 'sanat-hobi' || categorySlug === 'turizm-konaklama') {
    keywordHint = ' Bozcaada hediyelik eşya, Gökçeada yöresel ürün satış noktaları.';
  }
  const slogan = includeSlogan ? ` ${BRAND_SLOGAN_SEO}` : '';
  return `${part}${rest}${keywordHint}${slogan}`;
}

/**
 * Ana kategori sayfası (/kategori/[slug]) için özel meta description.
 * Tıklanabilir, Google dostu açıklamalar – override yoksa null döner.
 */
export const MAIN_CATEGORY_PAGE_DESCRIPTION_OVERRIDE: Partial<Record<string, string>> = {
  hizmetler:
    "Çanakkale Merkez ve ilçelerindeki en iyi teknik servis, temizlik, nakliyat ve usta ilanları alo17.tr'de. Aradığınız hizmete hemen ulaşın, esnafla doğrudan görüşün.",
};

export function getMainCategoryPageDescription(
  categorySlug: string,
  fallbackDescription: string
): string {
  return MAIN_CATEGORY_PAGE_DESCRIPTION_OVERRIDE[categorySlug] ?? fallbackDescription;
}

/**
 * Hizmetler ana kategori sayfası için sayfa içi semantik içerik (200–300 kelime).
 * Anahtar kelimeler: Çanakkale esnaf rehberi, 17 plakalı şehrin ilan sitesi, en yakın teknik servis, [ilçe] hizmet ilanları.
 */
export function getHizmetlerSemanticContent(): { title: string; paragraphs: string[] } {
  const ilcelerMetin = CANAKKALE_ILCE_ADLARI_METIN;
  return {
    title: 'Çanakkale Yerel Hizmet Rehberi',
    paragraphs: [
      `Çanakkale esnaf rehberi olarak 17 plakalı şehrin ilan sitesi alo17.tr, hem Merkez hem de tüm ilçelerdeki hizmet sağlayıcıları tek çatı altında topluyor. Evden eve nakliyat, tadilat, klima ve kombi servisi, temizlik, elektrik ve tesisat işleri gibi ihtiyaçlarınız için en güncel ilanlara buradan ulaşabilirsiniz. 17 plakalı şehrin ilan sitesi ile aradığınız ustayı veya servisi hızlıca bulmanız mümkün.`,
      `En yakın teknik servis arayanlar için ${ilcelerMetin} hizmet ilanları sayfamızda listeleniyor. Beyaz eşya tamiri, elektronik onarım, oto tamir ve bakım, çekici ve yol yardımı gibi teknik hizmetlerin yanı sıra ev temizliği, boya badana, alçıpan ve anahtar teslim tadilat ilanlarına da yerel esnaf bilgileriyle ulaşabilirsiniz. ${ilcelerMetin} hizmet ilanları güncel tutulmaktadır.`,
      `Çanakkale esnaf rehberi niteliğindeki bu sayfa, 17 plakalı şehrin ilan sitesi alo17.tr bünyesinde yer alır. İster en yakın teknik servis ister nakliyeci ya da tadilat ustası arayın; ilçenize göre filtreleyerek doğrudan esnafla iletişime geçebilirsiniz. Ücretsiz ilan vererek kendi hizmetinizi de ekleyebilir, Çanakkale'deki yerel hizmet ağına dahil olabilirsiniz.`,
    ],
  };
}

/**
 * Tüm ana kategori sayfaları için sayfa içi semantik içerik (200–300 kelime).
 * Başlık: "Çanakkale Yerel [Kategori] Rehberi". İçerikte: Çanakkale esnaf rehberi, 17 plakalı şehrin ilan sitesi, [ilçe] hizmet/ilan.
 */
export function getCategorySemanticContent(
  categorySlug: string,
  categoryName: string
): { title: string; paragraphs: string[] } {
  if (categorySlug === 'hizmetler') {
    return getHizmetlerSemanticContent();
  }

  const ilcelerMetin = CANAKKALE_ILCE_ADLARI_METIN;
  const kategoriKucuk = categoryName.toLowerCase();

  return {
    title: `Çanakkale Yerel ${categoryName} Rehberi`,
    paragraphs: [
      `Çanakkale esnaf rehberi olarak 17 plakalı şehrin ilan sitesi alo17.tr, ${categoryName} kategorisinde Merkez ve tüm ilçelerdeki ilanları tek sayfada topluyor. ${categoryName} ile ilgili en güncel teklifler, hizmetler ve ürün ilanlarına buradan ulaşabilirsiniz. 17 plakalı şehrin ilan sitesi sayesinde Çanakkale'de ${kategoriKucuk} arayanlar doğru ilanlara hızlıca ulaşıyor. Emlak ve araç dışındaki yerel ihtiyaçlarınız için güvenilir ilan ve esnaf bilgisi bu kategoride bir arada.`,
      `${ilcelerMetin} ilçelerinde ${kategoriKucuk} ilanları düzenli olarak güncellenmektedir. İster Merkez ister Biga, Gelibolu, Çan, Lapseki, Yenice, Ezine, Bayramiç, Ayvacık, Eceabat, Gökçeada veya Bozcaada'da olun; ${categoryName} kategorisindeki yerel esnaf ve ilan verenlerle doğrudan iletişime geçebilirsiniz. ${ilcelerMetin} hizmet ilanları ve ${kategoriKucuk} rehberi alo17.tr'de. Sayfamızdaki alt kategorilerden ihtiyacınıza en uygun başlığı seçerek ilanları inceleyebilirsiniz.`,
      `Bu sayfa, Çanakkale yerel ${categoryName} rehberi niteliğindedir ve 17 plakalı şehrin ilan sitesi alo17.tr bünyesinde yer alır. ${categoryName} kategorisinde ilan arayanlar ilçe bazlı filtrelerle aradıklarına kolayca ulaşabilir. Ücretsiz ilan vererek kendi ${kategoriKucuk} teklifinizi de ekleyebilir, Çanakkale'deki yerel ağa dahil olabilirsiniz. Çanakkale esnaf rehberi ve ilan platformu olarak tüm kategorilerde güncel içerik sunuyoruz.`,
    ],
  };
}

/**
 * Sayfa altı on-page SEO metni: "[İlçe] [Alt Kategori] Rehberi" + açıklama.
 * Merkez için semt sinyali; categorySlug verilirse semantik (komşu) kelimeler eklenir.
 */
export function getCategorySeoContentBlock(params: {
  ilceName?: string;
  subCategoryName: string;
  categoryName: string;
  categorySlug?: string;
}): { heading: string; paragraph: string } {
  const ilce = params.ilceName || 'Çanakkale';
  const baseParagraph = `Çanakkale ${ilce} bölgesinde ${params.subCategoryName} arayanlar için en güncel ilanları ve işletme bilgilerini bir araya getirdik. ${params.subCategoryName} kategorisinde 17 plakalı şehrimize özel fırsatları keşfedin.`;
  const isMerkez = ilce === 'Merkez' || ilce === 'Çanakkale';
  const semtSentence = isMerkez
    ? ` ${MERKEZ_MAHALLELER_METIN} gibi Çanakkale Merkez mahallelerinden de ilanlara ulaşabilirsiniz.`
    : '';
  const ilceSentence = ` ${CANAKKALE_ILCE_ADLARI_METIN} ilçelerinde de bu kategoride ilanlara ulaşabilirsiniz.`;
  const semanticWords = params.categorySlug ? SEMANTIC_KEYWORDS_BY_CATEGORY[params.categorySlug] : null;
  const semanticSentence =
    semanticWords && semanticWords.length > 0
      ? ` ${semanticWords.slice(0, 4).join(', ')} ve Çanakkale ${ilce} merkezi aramalarında bu sayfadan ulaşabilirsiniz.`
      : '';
  return {
    heading: `${ilce} ${params.subCategoryName} Rehberi`,
    paragraph: baseParagraph + semtSentence + ilceSentence + semanticSentence,
  };
}

/**
 * İç linkleme: "Bu hizmeti diğer ilçelerde de arayın" – aynı kategori/alt için diğer ilçe sayfaları.
 */
export function getOtherIlcelerLinks(params: {
  categorySlug: string;
  altSlug: string;
  currentIlceSlug?: string;
}): { ilceName: string; ilceSlug: string; href: string }[] {
  return CANAKKALE_ILCELER.filter((i) => i.slug !== params.currentIlceSlug).map((ilce) => ({
    ilceName: ilce.name,
    ilceSlug: ilce.slug,
    href: `/${ilce.slug}/${params.categorySlug}/${params.altSlug}`,
  }));
}

/**
 * Featured Snippets (Sıfırıncı Sıra) için SSS – kategorilere göre en çok aranan soru kalıpları.
 * İlçe isimleri sorulara gömülü (yerellik sinyali). Google FAQPage şeması ile kullanılır.
 */
export type FaqItem = { name: string; acceptedAnswer: string };

export const CATEGORY_FAQ_ITEMS: Record<string, FaqItem[]> = {
  'egitim-kurslar': [
    {
      name: "Çanakkale'de en iyi sürücü kursu hangisi?",
      acceptedAnswer:
        "Çanakkale Merkez ve ilçelerindeki sürücü kursları, direksiyon dersi ve ehliyet eğitimi ilanlarını alo17.tr Eğitim & Kurslar kategorisinde inceleyebilirsiniz. Güncel ilanlar ve iletişim bilgileriyle size en uygun kursa ulaşabilirsiniz.",
    },
    {
      name: "Biga'da üniversite öğrencileri için uygun fiyatlı bilgisayar kursları var mı?",
      acceptedAnswer:
        "Biga bölgesinde öğrencilere yönelik bilgisayar ve yazılım kursu ilanlarını alo17.tr Eğitim kategorisinde bulabilirsiniz. ÇOMÜ ve diğer öğrenciler için uygun fiyatlı seçenekler düzenli olarak yayınlanmaktadır.",
    },
    {
      name: "Çanakkale Merkez'de İngilizce özel ders saat ücretleri ne kadar?",
      acceptedAnswer:
        "Çanakkale Merkez'de İngilizce ve yabancı dil özel ders veren eğitmenlerin ilanları alo17.tr üzerinde yer alır. Saat ücretleri ilana göre değişir; ilan detaylarından veya satıcıyla iletişime geçerek güncel fiyatları öğrenebilirsiniz.",
    },
  ],
  'saglik-guzellik': [
    {
      name: "Çan'da tavsiye edilen bayan kuaförleri hangileri?",
      acceptedAnswer:
        "Çan ilçesindeki bayan kuaför ve güzellik salonu ilanlarını alo17.tr Sağlık & Güzellik kategorisinde bulabilirsiniz. Kullanıcı ilanları ve işletme bilgileriyle size en uygun salonu seçebilirsiniz.",
    },
    {
      name: "Lapseki'de lazer epilasyon fiyatları ne kadar?",
      acceptedAnswer:
        "Lapseki ve Çanakkale ilçelerindeki güzellik merkezleri, lazer epilasyon ve cilt bakımı hizmeti veren işletmelerin ilanları alo17.tr'de yayınlanmaktadır. Fiyat bilgisi için ilanları inceleyebilir veya işletmeyle iletişime geçebilirsiniz.",
    },
    {
      name: "Çanakkale'de en iyi diyet / güzellik merkezi nerede?",
      acceptedAnswer:
        "Çanakkale Merkez ve tüm ilçelerdeki diyetisyen, güzellik merkezi ve kişisel bakım hizmeti ilanlarını alo17.tr Sağlık & Güzellik kategorisinde kategorilere göre filtreleyerek bulabilirsiniz.",
    },
    {
      name: "Gelibolu'da pazar günleri açık olan kuaför var mı?",
      acceptedAnswer:
        "Gelibolu'daki kuaför ve güzellik salonlarının çalışma saatleri ilan açıklamalarında veya işletme ile iletişimde belirtilir. alo17.tr Sağlık & Güzellik kategorisinden Gelibolu ilanlarına göz atarak pazar açık hizmet verenleri bulabilirsiniz.",
    },
  ],
  elektronik: [
    {
      name: "Çanakkale'de güvenilir iPhone / telefon tamiri yapan yerler neresi?",
      acceptedAnswer:
        "Çanakkale Merkez ve ilçelerindeki telefon, iPhone ve elektronik tamir servisi ilanlarını alo17.tr Elektronik kategorisinde bulabilirsiniz. Yetkili servis ve yerel tamirci ilanları güncel olarak listelenmektedir.",
    },
    {
      name: "Biga'da ikinci el laptop alırken nelere dikkat edilmeli?",
      acceptedAnswer:
        "Biga'da ikinci el laptop alırken garantili ve orijinal parça kullanan satıcıları tercih edin. alo17.tr Elektronik kategorisindeki ilanlarda ürün durumu ve satıcı bilgileri yer alır; iletişime geçerek detay alabilirsiniz.",
    },
    {
      name: "Ezine'de beyaz eşya yetkili servisi telefon numaraları nelerdir?",
      acceptedAnswer:
        "Ezine ve Çanakkale ilçelerindeki beyaz eşya yetkili servis ilanları alo17.tr Hizmetler ve Ev & Bahçe kategorilerinde yayınlanmaktadır. İlan detaylarından veya satıcıyla iletişime geçerek güncel telefon numaralarına ulaşabilirsiniz.",
    },
  ],
  hizmetler: [
    {
      name: "Çanakkale ve ilçelerinde aradığım hizmete nasıl kolayca ulaşırım?",
      acceptedAnswer:
        "alo17.tr üzerinden Çanakkale Merkez, Biga, Çan ve diğer tüm ilçelerdeki esnaf, teknik servis ve kurs ilanlarını kategorilere göre filtreleyerek saniyeler içinde bulabilirsiniz.",
    },
    {
      name: "Çanakkale'de evden eve nakliyat fiyatları nasıl?",
      acceptedAnswer:
        "Çanakkale ve ilçelerindeki evden eve nakliyat, asansörlü nakliyat hizmeti veren firmaların ilanları alo17.tr Hizmetler kategorisinde yer alır. Fiyat için ilan sahibiyle iletişime geçebilirsiniz.",
    },
  ],
};

/** Genel site SSS – ana sayfa veya SSS sayfası için FAQPage şeması. */
export const GENERAL_FAQ_ITEMS: FaqItem[] = [
  {
    name: "Çanakkale ve ilçelerinde aradığım hizmete nasıl kolayca ulaşırım?",
    acceptedAnswer:
      "alo17.tr üzerinden Çanakkale Merkez, Biga, Çan ve diğer tüm ilçelerdeki esnaf, teknik servis ve kurs ilanlarını kategorilere göre filtreleyerek saniyeler içinde bulabilirsiniz.",
  },
  {
    name: "Biga'da güvenilir ikinci el elektronik eşya nereden alınır?",
    acceptedAnswer:
      "Biga bölgesindeki en güncel ve onaylı ikinci el bilgisayar, telefon ve beyaz eşya ilanlarını alo17.tr Elektronik kategorisinde bulabilir, satıcıyla doğrudan iletişime geçebilirsiniz.",
  },
  {
    name: "Çanakkale'de özel ders ve kurs ilanları ücretsiz mi?",
    acceptedAnswer:
      "alo17.tr'de eğitim kategorisindeki ilanları incelemek tamamen ücretsizdir. Kendi ilanınızı oluşturmak veya özel ders verenlere ulaşmak için sitemizi ziyaret edebilirsiniz.",
  },
];

export function getCategoryFaqItems(categorySlug: string): FaqItem[] {
  return CATEGORY_FAQ_ITEMS[categorySlug] ?? [];
}

/**
 * Google FAQPage JSON-LD – Featured Snippets (Sıfırıncı Sıra) için.
 */
export function getCategoryFaqJsonLd(items: FaqItem[]) {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.acceptedAnswer,
      },
    })),
  };
}

/** JSON-LD LocalBusiness / areaServed için ilçe bilgisi */
export function getAreaServedJsonLd(ilceSlug?: string) {
  const base = {
    '@type': 'City' as const,
    name: 'Çanakkale',
    addressCountry: 'TR',
    addressRegion: 'Çanakkale',
  };
  if (ilceSlug) {
    const ilce = CANAKKALE_ILCELER.find((i) => i.slug === ilceSlug);
    if (ilce) {
      return {
        ...base,
        name: `${ilce.name}, Çanakkale`,
        postalCode: ilce.postalCode,
      };
    }
  }
  return base;
}

/** JSON-LD: WebSite + areaServed (Çanakkale / ilçe). Local Business işaretlemesi için. */
export function getCanakkaleLocalBusinessJsonLd(ilceSlug?: string) {
  const areaServed = getAreaServedJsonLd(ilceSlug);
  const ilce = ilceSlug ? CANAKKALE_ILCELER.find((i) => i.slug === ilceSlug) : null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Alo17',
    url: 'https://alo17.tr',
    description: "Çanakkale'nin yerel ilan ve rehber sitesi.",
    areaServed: areaServed,
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Çanakkale',
      addressCountry: 'TR',
      ...(ilce ? { addressLocality: ilce.name, postalCode: ilce.postalCode } : {}),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://alo17.tr/ilanlar?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Rich Snippets: LocalBusiness JSON-LD – telefon, adres, çalışma saati.
 * Arama sonuçlarında iletişim bilgisi ve adres gösterimi için.
 */
export function getAlo17LocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Alo17',
    description: "Çanakkale'nin Yerel Hizmet ve Yaşam Uzmanı. Emlak ve araç dışındaki tüm yerel ihtiyaçlar, esnaf ve hizmet ilanları.",
    url: 'https://alo17.tr',
    telephone: '+905414042404',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Cevatpaşa Mahallesi, Bayrak Sokak No:4',
      addressLocality: 'Çanakkale',
      addressRegion: 'Çanakkale',
      postalCode: '17100',
      addressCountry: 'TR',
    },
    areaServed: {
      '@type': 'State',
      name: 'Çanakkale',
      addressCountry: 'TR',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  };
}

/** Görsel alt metni: "Çanakkale [ilçe] [kategori/ilan] ilanları" */
export function getListingImageAlt(params: {
  title: string;
  category?: string;
  location?: string;
  ilceName?: string;
}): string {
  const loc = params.ilceName || (params.location && params.location.split(/[,\s]/)[0]) || 'Merkez';
  return `Çanakkale ${loc} ${params.title} ilanları`;
}
