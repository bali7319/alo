'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw, Pencil, Save, X } from 'lucide-react';

type FormState = {
  mode: 'character' | 'alo17_ad_grok';
  outputEnglish: boolean;
  preset: 'elif' | 'ahmet' | 'can' | 'ayse' | 'iyi_geceler' | 'custom';
  characterName: string;
  platform: 'Leonardo.ai' | 'Midjourney' | 'Stable Diffusion' | 'Other';
  age: string;
  gender: string;
  hair: string;
  eyes: string;
  facialDetails: string;
  outfit: string;
  pose: string;
  scene: string;
  action: string;
  camera: string;
  style: string;
  lighting: string;
  quality: string;
  ar: string;
  useCase: string;

  voiceTone: string;
  catchphrases: string;
  hashtags: string;
  postingPlan: string;
  storageFolder: string;

  // Single prompt (custom)
  useSinglePrompt: boolean;
  singlePrompt: string;
  singlePromptTotalSeconds: string; // optional override
  lockCharacters: boolean;
  lockedCast: string; // character bible / cast sheet (plain text)
  selectedCharacters: string[]; // selectable cast items (used when lockedCast is empty)

  // Alo17 ad storyboard (Grok)
  adScene1: string;
  adScene2: string;
  adScene3: string;
  adScene4: string;
  adScene5: string;
  adScene6: string;
};

const DEFAULTS: FormState = {
  mode: 'character',
  outputEnglish: true,
  preset: 'elif',
  characterName: 'Elara',
  platform: 'Leonardo.ai',
  age: '25',
  gender: 'woman',
  hair: 'black wavy shoulder-length hair',
  eyes: 'green eyes',
  facialDetails: 'freckles',
  outfit: 'eco-friendly linen dress',
  pose: 'confident pose',
  scene: 'urban park',
  action: 'Walking while checking listings on a smartphone.',
  camera: 'Start wide, then quick push-in to face, then zoom-in to phone screen.',
  style: 'photorealistic',
  lighting: 'natural daylight, cinematic lighting, shallow depth of field',
  quality: 'high detail, sharp focus, high resolution',
  ar: '--ar 9:16',
  useCase: 'Both buyer and seller on a local marketplace (private lessons, selling home items).',
  voiceTone: 'motivational, witty',
  catchphrases: '“Hey eco-friends!”\n“Let’s green it up!”',
  hashtags: '#AIInfluencer #Sustainable #EcoLife',
  postingPlan: 'Haftada 3 post (Pzt-Çrş-Cuma) + haftada 2 story',
  storageFolder: 'Google Drive: Elara_Images (001-010)',

  useSinglePrompt: false,
  singlePrompt: '',
  singlePromptTotalSeconds: '',
  lockCharacters: false,
  lockedCast: '',
  selectedCharacters: [],

  adScene1:
    "Cinematic wide shot, Çanakkale Kordon at late afternoon. A stylish young woman (Elif, 28) walks past old, cluttered newspaper classifieds pinned to a worn-out board. She looks slightly frustrated, then her eyes shift to her modern smartphone. In the background, the iconic Çanakkale Clock Tower and sea. Golden hour lighting, photorealistic, 8k, detailed urban texture.",
  adScene2:
    "Close-up shot of a smartphone screen displaying the 'Alo17.tr' app. Clean white interface with vibrant blue and orange category icons: 'Elektronik', 'Mobilya', 'Yerel Hizmetler', 'Özel Ders'. A female finger (Elif's) smoothly scrolls and taps on 'Mobilya'. Soft studio lighting, sharp UI details, motion graphics style, 4k render.",
  adScene3:
    "Medium shot, a warm-lit traditional Çanakkale furniture shop. Ahmet Usta (45, kind-faced, wearing an apron) takes a photo of a handcrafted wooden chair with his smartphone using the 'Alo17.tr' app. The screen shows the 'Add Photo' (Fotoğraf Ekle) step. Then a quick cut to his finger typing '1.200 TL' and a brief description. Realistic, soft focus, high detail on textures, commercial photography.",
  adScene4:
    "Close-up of a young male student (Can, 22) sitting in a modern university library/cafe. He is browsing 'Özel Ders' (Private Lesson) listings on 'Alo17.tr'. He taps 'Mesaj Gönder' (Send Message). A notification pops up on his screen. He looks up and smiles genuinely. Bright, natural lighting, student life atmosphere, realistic facial expressions.",
  adScene5:
    "Medium shot, a cozy and clean living room. Ayşe Hanım (50, warm smile) is comfortably sitting, browsing 'Yerel Hizmetler' (Local Services) on the 'Alo17.tr' app. She finds what she needs and taps a prominent 'Ara' (Call) button. Soft, warm home lighting, authentic moment, commercial lifestyle photography.",
  adScene6:
    "Dynamic montage of four individuals (Elif, Ahmet Usta, Can, Ayşe Hanım) each looking contentedly at their smartphones, smiling at the camera. Quick cuts between them. Final shot: A breathtaking panoramic drone view of Çanakkale city skyline and the Dardanelles at a vibrant sunset. The 'Alo17.tr' logo and tagline 'Şehrin İlan Portalı' appear smoothly over the cityscape. Epic, high-contrast, cinematic, 8k resolution.",
};

type PresetKey = FormState['preset'];
type Preset = { key: PresetKey; label: string; description: string; apply: (s: FormState) => FormState };

type CharacterItem = { id: string; label: string; content: string };

const DEFAULT_LOCKED_CAST_BY_PRESET: Partial<Record<PresetKey, string>> = {
  elif: `{
  "subject": {
    "name": "Elif",
    "age": 28,
    "gender": "young woman",
    "personality": "Modern, energetic",
    "roles": ["buyer", "seller"],
    "scenarios": ["private tutoring", "household items exchange"],
    "appearance": {
      "hair": "long wavy blonde hair falling over her shoulders, natural volume, slight tousle",
      "face_expression": "teasing confident expression, raised eyebrows, subtle pout, looking directly at the camera",
      "makeup_skin": "light natural makeup, luminous skin, sharp facial details, expressive eyes"
    }
  },
  "style": {
    "mood": "dynamic, confident",
    "setting": "contemporary urban environment",
    "attire": "casual-smart, trendy outfits",
    "expression": "friendly, approachable"
  },
  "environment": {
    "locations": ["home office", "cozy living room", "local marketplace"],
    "lighting": "soft indoor daylight, warm tones (highlights golden hair tones and facial features)",
    "props": ["books, laptop, household items"]
  },
  "camera": {
    "shot_type": "mid-shot, candid",
    "focus": "subject clear, background slightly blurred",
    "angle": "eye-level"
  },
  "output": {
    "format": "photo-realistic",
    "resolution": "high",
    "style_detail": "photorealistic, cinematic depth of field, modern lifestyle, energetic atmosphere"
  }
}`,

  ahmet: `{
  "prompt_type": "Portre ve Yaşam Tarzı",
  "subject": {
    "name": "Ahmet Usta",
    "age": 45,
    "profession": "Geleneksel Çanakkale esnafı (mobilyacı/tamirci)",
    "appearance": {
      "expression": "Güvenilir, samimi",
      "giyim": "Tahıl tonlarında günlük, iş kıyafeti; önlük veya iş tulumu",
      "detaylar": "El işi izleri, hafif yorgun ama dostane yüz ifadesi"
    }
  },
  "environment": {
    "setting": "Çanakkale'de geleneksel atölye veya küçük dükkan",
    "özellikler": [
      "Ahşap mobilyalar, tamir aletleri",
      "Esnaf atmosferi, doğal ışık",
      "Dükkan detayları: el yapımı ürünler, el aletleri"
    ]
  },
  "style": {
    "realism": "Yüksek gerçekçilik",
    "atmosphere": "Sıcak, samimi, nostaljik",
    "color_palette": "Toprak tonları, doğal ışık"
  },
  "camera": {
    "angle": "Orta çekim, karşıdan",
    "focus": "Yüz ve eller üzerine odaklı",
    "lens": "50mm standart lens",
    "depth_of_field": "Orta",
    "composition": "Konuyu merkezde, ortam detayları belirgin"
  }
}`,

  can: `CAN_22: 22-year-old Turkish male student (ÇOMÜ vibe), short textured hair, hazel eyes, youthful face, upbeat expression, casual student outfit with backpack.

ELIF_28: 28-year-old Turkish woman, modern energetic vibe, shoulder-length dark brown straight hair, brown eyes, friendly smile, casual modern outfit, smartphone in hand.

AYSE_HANIM_50: 50-year-old Turkish woman, warm mother/aunt vibe, kind face, gentle smile, simple comfortable clothing, consistent look.

BABA_MEHMET_55: 55-year-old Turkish man, father figure, mustache, casual clothing, consistent look.

AUNTIE_1: Turkish auntie ~55-65, headscarf, expressive gesture, natural wrinkles/skin texture.

AHMET_USTA_45: 45-year-old Turkish man, trusted esnaf vibe, workshop clothes (apron optional).`,

  ayse: `AYSE_HANIM_50: 50-year-old Turkish woman, warm mother figure, kind face, gentle smile, short dark hair, brown eyes, simple comfortable clothing, consistent look.

ELIF_28: 28-year-old Turkish woman, modern energetic vibe, shoulder-length dark brown straight hair, brown eyes, friendly smile, casual modern outfit, smartphone in hand.

BABA_MEHMET_55: 55-year-old Turkish man, father figure, mustache, casual clothing, consistent look.

AUNTIE_1: Turkish auntie ~55-65, headscarf, expressive gesture, natural wrinkles/skin texture.

AUNTIE_2: Turkish auntie ~50-60, tired eyes, consistent outfit.

AHMET_USTA_45: 45-year-old Turkish man, trusted esnaf vibe, workshop clothes (apron optional).`,

  iyi_geceler: `{
  "character_lock": {
    "character_id": "AYLIN_FIT_V1",
    "age": 19,
    "status": "üniversite öğrencisi",
    "ethnicity": "akdeniz",
    "skin_tone": "açık, pürüzsüz, doğal sıcak alt ton",
    "face_signature": {
      "face_shape": "yumuşak oval",
      "eyes": "büyük badem şekilli koyu kahverengi",
      "eyebrows": "orta kalınlıkta doğal kavisli",
      "nose": "küçük-düz burun",
      "lips": "orta dolgunlukta, net konturlu",
      "jawline": "ince ve feminen",
      "expression_default": "hafif nötr, kendinden emin"
    },
    "hair_signature": {
      "color": "doğal siyah",
      "texture": "hafif dalgalı",
      "length": "uzun",
      "style": "yüksek at kuyruğu, yüzü çerçeveleyen gevşek tutamlar"
    },
    "body_signature": {
      "height": "ortalama",
      "body_type": "atletik kum saati",
      "shoulders": "orantılı",
      "waist": "ince",
      "hips": "belirgin",
      "legs": "fit ve tonlu"
    }
  },
  "details": {
    "makeup": "doğal makyaj, belirgin eyeliner, uzun kirpikler, hafif kontur, parlak dudaklar",
    "nails": "nötr ton manikür",
    "phone": "iPhone, siyah zemin üzerine beyaz soyut desenli kılıf",
    "pose_consistency": "her çekimde aynı duruş, aynı açı, aynı ağırlık dağılımı"
  },
  "lighting_and_atmosphere": "büyük pencerelerden gelen yumuşak gece ışığıyla dengeli iç mekan aydınlatması. Cilt, saç ve kumaş üzerinde doğal parlama. Kıyafetlerin canlı rengi korunur.",
  "camera_and_tech": {
    "camera_type": "full-frame DSLR",
    "lens": "35mm",
    "aperture": "f/2.8",
    "iso": 400,
    "shutter_speed": "1/125",
    "focus": "yüz ve vücut keskin, arka plan hafif bokeh",
    "resolution": "8K ultra realistic",
    "style": "professional mirror selfie photography"
  },
  "consistency_settings": {
    "seed": 742913,
    "sampler": "DPM++ SDE Karras",
    "steps": 35,
    "cfg_scale": 7.5,
    "face_restoration": false,
    "enable_character_consistency": true
  },
  "supporting_cast": [
    {
      "character_id": "AUNTIE_1",
      "age_range": "55-65",
      "description": "başörtülü, TV'ye tamamen odaklı, el kol hareketleri belirgin (hafif motion blur), doğal kırışıklık"
    },
    {
      "character_id": "AUNTIE_2",
      "age_range": "50-60",
      "description": "yorgun bakış, fısıldayan yorumlar, tutarlı kıyafet"
    },
    {
      "character_id": "UNCLE_1",
      "age_range": "55-70",
      "description": "bıyıklı, uyukluyor (ağız hafif açık), tutarlı kıyafet"
    },
    {
      "character_id": "RELATIVE_1",
      "age_range": "60+",
      "description": "yaşlı akraba, nötr ifade, tutarlı kıyafet"
    },
    {
      "character_id": "AHMET_USTA_45",
      "age": 45,
      "description": "Çanakkale esnafı (mobilyacı/tamirci), güvenilir ve samimi yüz ifadesi"
    }
  ],
  "negative_prompt": "bulanık, düşük çözünürlük, deformasyon, fazla uzuv, asimetrik yüz, yanlış ayna yansıması, ekranı görünen telefon, aşırı pozlama, karikatür, anime, metin, filigran, başka insanlar, doğal olmayan oranlar"
}`,
};

const CHARACTER_LIBRARY: CharacterItem[] = [
  { id: 'ELIF_PROFILE_V1', label: 'Elif (28) — profil', content: (DEFAULT_LOCKED_CAST_BY_PRESET.elif || '').trim() },
  { id: 'AHMET_PROFILE_V1', label: 'Ahmet Usta (45) — profil', content: (DEFAULT_LOCKED_CAST_BY_PRESET.ahmet || '').trim() },
  { id: 'AYLIN_FIT_V1', label: 'Aylin (19) — AYLİN_FIT_V1', content: (DEFAULT_LOCKED_CAST_BY_PRESET.iyi_geceler || '').trim() },
  {
    id: 'AUNTIE_1',
    label: 'Auntie 1 (55–65)',
    content:
      "AUNTIE_1: Turkish auntie ~55-65, headscarf, totally focused on TV, expressive hand gesture (slight motion blur), natural wrinkles/skin texture.",
  },
  {
    id: 'AUNTIE_2',
    label: 'Auntie 2 (50–60)',
    content: 'AUNTIE_2: Turkish auntie ~50-60, tired eyes, sometimes whispering comments, consistent outfit.',
  },
  {
    id: 'UNCLE_1',
    label: 'Uncle 1 (55–70)',
    content: 'UNCLE_1: Turkish uncle ~55-70, mustache, dozing off with mouth slightly open, consistent outfit.',
  },
  {
    id: 'RELATIVE_1',
    label: 'Relative 1 (60+)',
    content: 'RELATIVE_1: older Turkish relative ~60+, seated nearby, neutral expression, consistent outfit.',
  },
  {
    id: 'AHMET_USTA_LINE',
    label: 'Ahmet Usta (45) — kısa tanım',
    content:
      'AHMET_USTA_45: 45-year-old Turkish man, traditional Çanakkale esnaf (mobilyacı/tamirci), trusted and friendly expression, workshop clothes.',
  },
];

const DEFAULT_SELECTED_CHARACTERS_BY_PRESET: Partial<Record<PresetKey, string[]>> = {
  elif: ['ELIF_PROFILE_V1'],
  ahmet: ['AHMET_PROFILE_V1'],
  can: ['AUNTIE_1', 'AHMET_USTA_LINE'], // light default; editable by user
  ayse: ['AUNTIE_1', 'AUNTIE_2', 'AHMET_USTA_LINE'],
  iyi_geceler: ['AYLIN_FIT_V1', 'AUNTIE_1', 'AUNTIE_2', 'UNCLE_1', 'RELATIVE_1', 'AHMET_USTA_LINE'],
};

function buildLockedCastText(opts: Pick<FormState, 'preset' | 'lockedCast' | 'selectedCharacters'>): string {
  const manual = (opts.lockedCast || '').trim();
  if (manual) return manual;
  const ids = Array.isArray(opts.selectedCharacters) ? opts.selectedCharacters : [];
  if (ids.length) {
    const parts = ids
      .map((id) => CHARACTER_LIBRARY.find((c) => c.id === id)?.content)
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim());
    if (parts.length) return parts.join('\n\n');
  }
  return getDefaultLockedCastForPreset(opts.preset);
}

function getDefaultLockedCastForPreset(preset: PresetKey): string {
  return (DEFAULT_LOCKED_CAST_BY_PRESET[preset] || '').trim();
}

const PRESETS: Preset[] = [
  {
    key: 'elif',
    label: 'Elif (28) – Genç Kadın',
    description: 'Modern, enerjik; hem alıcı hem satıcı (özel ders/ev eşyası).',
    apply: (s) => ({
      ...s,
      preset: 'elif',
      characterName: 'Elif',
      age: '28',
      gender: 'woman',
      hair: 'dark brown straight hair, shoulder-length',
      eyes: 'brown eyes',
      facialDetails: 'friendly smile',
      outfit: 'casual modern outfit (hoodie or blazer), smartphone in hand',
      pose: "walking on Çanakkale Kordon, relaxed but focused",
      scene: "Çanakkale Kordon near the Trojan Horse and Clock Tower",
      action:
        "Elif walks along the Kordon, glancing at messy old newspaper classifieds and worn-out listing boards, looking slightly tired and searching. Then she looks at her modern smartphone.",
      camera: "Start with a wide shot, then a quick zoom-in to Elif's face, then a fast zoom-in to the phone screen.",
      style: 'photorealistic',
      lighting: 'natural daylight, clean modern look',
      quality: 'high detail, sharp focus, high resolution',
      ar: '--ar 9:16',
      useCase: 'Modern young woman using Alo17 as both buyer and seller (private lessons, selling home items).',
      voiceTone: 'energetic, friendly, motivating',
      catchphrases: '“Çanakkale’de aradığını bul!”\n“Satmak da almak da çok kolay!”',
      hashtags: '#Alo17 #Çanakkale #AlSat #İlan',
    }),
  },
  {
    key: 'ahmet',
    label: 'Ahmet Usta (45) – Esnaf',
    description: 'Geleneksel Çanakkale esnafı (mobilyacı/tamirci); güvenilir, samimi.',
    apply: (s) => ({
      ...s,
      preset: 'ahmet',
      characterName: 'Ahmet Usta',
      age: '45',
      gender: 'man',
      hair: 'short dark hair with slight gray',
      eyes: 'brown eyes',
      facialDetails: 'warm smile, slight beard stubble',
      outfit: 'work apron, workshop clothes',
      pose: 'showing a finished repair and taking a call',
      scene: 'small local workshop in Çanakkale',
      style: 'photorealistic',
      lighting: 'warm indoor lighting, cozy atmosphere',
      quality: 'high detail, sharp focus, high resolution',
      ar: '--ar 9:16',
      useCase: 'Trusted local tradesman offering services on Alo17 (furniture, repair, handyman).',
      voiceTone: 'warm, trustworthy, straightforward',
      catchphrases: '“Usta işi hizmet burada!”\n“Alo17 ile güvenle buluş.”',
      hashtags: '#Alo17 #ÇanakkaleEsnafı #Hizmet #Tamir',
    }),
  },
  {
    key: 'can',
    label: 'Can (22) – Öğrenci',
    description: 'ÇOMÜ öğrencisi; hızlı çözüm arar (kiralık ev/ders).',
    apply: (s) => ({
      ...s,
      preset: 'can',
      characterName: 'Can',
      age: '22',
      gender: 'man',
      hair: 'short textured hair',
      eyes: 'hazel eyes',
      facialDetails: 'youthful face, upbeat expression',
      outfit: 'casual student outfit, backpack',
      pose: 'sitting at campus bench scrolling fast',
      scene: 'ÇOMÜ campus, outdoor',
      style: 'photorealistic',
      lighting: 'natural daylight, vibrant colors',
      quality: 'high detail, sharp focus, high resolution',
      ar: '--ar 9:16',
      useCase: 'University student using Alo17 to find rentals, roommates, and private lessons quickly.',
      voiceTone: 'fast, upbeat, practical',
      catchphrases: '“Kiralık mı arıyorsun?”\n“Dakikada ilan bul!”',
      hashtags: '#Alo17 #ÇOMÜ #Kiralık #ÖzelDers',
    }),
  },
  {
    key: 'ayse',
    label: 'Ayşe Hanım (50) – Aile',
    description: 'Yerel hizmet arayan anne figürü (temizlikçi/bakıcı).',
    apply: (s) => ({
      ...s,
      preset: 'ayse',
      characterName: 'Ayşe Hanım',
      age: '50',
      gender: 'woman',
      hair: 'short dark hair',
      eyes: 'brown eyes',
      facialDetails: 'kind face, gentle smile',
      outfit: 'simple comfortable clothing',
      pose: 'at home, looking relieved while making a call',
      scene: 'cozy home interior in Çanakkale',
      style: 'photorealistic',
      lighting: 'soft warm indoor lighting',
      quality: 'high detail, sharp focus, high resolution',
      ar: '--ar 9:16',
      useCase: 'Mother looking for local services on Alo17 (cleaning, babysitter, caregiver).',
      voiceTone: 'warm, reassuring, family-friendly',
      catchphrases: '“Güvenilir hizmet arıyorsan…”\n“Alo17 yanında.”',
      hashtags: '#Alo17 #Çanakkale #Hizmet #Bakıcı #Temizlik',
    }),
  },
  {
    key: 'custom',
    label: 'Özel (Custom)',
    description: 'Kendin doldur.',
    apply: (s) => ({ ...s, preset: 'custom' }),
  },
  {
    key: 'iyi_geceler',
    label: '“İyi Geceler” Ankara — Aylin & Aile (Sabit Kadro)',
    description: 'Verdiğin Ankara salonu sahnesi + LOCKED CAST sabitleme.',
    apply: (s) => ({
      ...s,
      preset: 'iyi_geceler',
      mode: 'character',
      outputEnglish: true,
      platform: 'Midjourney',
      characterName: 'Aylin',
      age: '27',
      gender: 'woman',
      hair: 'blonde hair (slightly messy, shoulder-length)',
      eyes: 'brown eyes',
      facialDetails: 'slightly ironic expression, natural skin texture, small imperfections, no beauty retouching',
      outfit:
        'oversized cheap cartoon t-shirt as a nightdress (Powerpuff Girls vibe, faded print) and fluffy house slippers',
      pose: 'half lying, half sitting on an old patterned couch, blanket over legs, phone in one hand, thumb hovering',
      scene:
        'Interior of a modest Ankara lower-middle-class living room at night; patterned carpet, lace curtains, wall calendar with a mosque photo, framed religious calligraphy, cheap landscape painting; blurred Ankara apartment blocks through the window with a faint Migros sign; Turkcell-branded modem blinking on a shelf; messy cozy vibe with cables and remotes visible',
      action:
        'She is about to post an “iyi geceler” tweet while older relatives and neighborhood aunties/uncles watch a soap opera on a slightly outdated flat-screen TV; one auntie gestures toward the TV (slight motion blur); one relative dozes off with mouth slightly open; samovar/çaydanlık on low table with many Turkish tea glasses, sugar cubes, sunflower seed shells, bowl with Ülker and Eti snack wrappers; plate with leftover börek on the coffee table',
      camera:
        'vertical framing like a phone snapshot (9:16), low and slightly crooked doorway angle, no studio gloss, slight digital noise in dark corners',
      style: 'ultra-realistic Turkish TV series still, slightly comedic, natural and authentic',
      lighting: 'warm yellow light from a single ceiling fixture and an old lamp; warm natural colors',
      quality: 'high detail, natural skin texture, slight motion blur on gesture, realistic noise, no watermark, no text',
      ar: '--ar 9:16',
      useCase: 'Static still image prompt (phone-photo feeling) with consistent cast across generations.',
      voiceTone: 'slightly ironic, cozy, comedic',
      catchphrases: '“iyi geceler”',
      hashtags: '#iyiGeceler',
      lockCharacters: true,
      // keep empty => show "silik" default as placeholder, but still used in output unless user edits
      lockedCast: '',
      useSinglePrompt: true,
      singlePrompt:
        'Ultra-realistic, slightly comedic Turkish TV series still, vertical framing like a phone snapshot. Interior of a modest Ankara living room at night. Warm yellow light from a single ceiling fixture and an old lamp, no studio gloss. In the center, a 27-year-old Turkish-looking curvy woman with blonde hair, soft chubby figure, wearing an oversized cheap cartoon t-shirt as a nightdress (Powerpuff Girls vibe) and fluffy house slippers. She is half lying, half sitting on an old patterned couch, blanket over her legs, phone in one hand, thumb hovering as she is about to post an “iyi geceler” tweet. Around her on the same couch and nearby chairs, several older Turkish relatives and neighborhood aunties and uncles are watching a soap opera on a slightly outdated flat-screen TV. Among them sits Ahmet Usta (45), a warm, trustworthy traditional esnaf (mobilyacı/tamirci) vibe as a neighbor guest. On the TV, a melodramatic scene is frozen mid-cry. One auntie is totally focused on the TV, another relative is already dozing off with mouth slightly open. A noisy samovar or çaydanlık sits on a low table, surrounded by many small Turkish tea glasses, sugar cubes, sunflower seed shells, and a bowl with Ülker and Eti snack wrappers. The living room decor is unmistakably Turkish lower-middle-class: patterned carpet on the floor, lace curtains on the window, a wall calendar with a mosque photo, a framed religious calligraphy piece and a cheap landscape painting. Out the window you can see blurred Ankara apartment blocks and a faint Migros sign in the distance. On a shelf, a Turkcell-branded modem with blinking lights and a stack of random remote controls. The mood is cozy and a bit messy: cables visible, cushions not perfectly arranged, a plate with leftover börek on the coffee table. The woman’s expression is slightly ironic, like she’s tweeting “iyi geceler” while the house is still loud. The camera angle is low and a bit crooked, as if someone took it quickly while standing in the doorway. Slight motion blur on one auntie gesturing toward the TV, natural skin texture and small imperfections on everyone, no beauty retouching. Colors are warm and natural, with visible digital noise in the darker corners to keep the phone-photo feeling.',
      singlePromptTotalSeconds: '8',
    }),
  },
];

const EDITABLE_PRESET_KEYS = ['elif', 'ahmet', 'can', 'ayse'] as const;
type EditablePresetKey = (typeof EDITABLE_PRESET_KEYS)[number];
function isEditablePresetKey(k: PresetKey): k is EditablePresetKey {
  return (EDITABLE_PRESET_KEYS as readonly string[]).includes(k);
}

const PRESET_STORAGE_KEY = 'alo17_ai_sablon_presets_v1';
const SINGLE_PROMPT_STORAGE_KEY = 'alo17_ai_sablon_single_prompt_v1';
const SINGLE_PROMPT_SECONDS_STORAGE_KEY = 'alo17_ai_sablon_single_prompt_seconds_v1';
const LOCKED_CAST_STORAGE_KEY = 'alo17_ai_sablon_locked_cast_v1';
const LOCKED_CAST_ENABLED_STORAGE_KEY = 'alo17_ai_sablon_locked_cast_enabled_v1';
const LOCKED_CAST_MAP_STORAGE_KEY = 'alo17_ai_sablon_locked_cast_map_v1';
const LOCKED_CAST_ENABLED_MAP_STORAGE_KEY = 'alo17_ai_sablon_locked_cast_enabled_map_v1';
const LOCKED_CAST_SELECTED_MAP_STORAGE_KEY = 'alo17_ai_sablon_locked_cast_selected_map_v1';
type PresetOverrides = Partial<
  Pick<
    FormState,
    | 'characterName'
    | 'age'
    | 'gender'
    | 'hair'
    | 'eyes'
    | 'facialDetails'
    | 'outfit'
    | 'pose'
    | 'scene'
    | 'action'
    | 'camera'
    | 'style'
    | 'lighting'
    | 'quality'
    | 'ar'
    | 'useCase'
    | 'voiceTone'
    | 'catchphrases'
    | 'hashtags'
  >
>;

function getDefaultPresetValues(key: EditablePresetKey): PresetOverrides {
  // Derive defaults from PRESETS.apply to keep single source of truth
  const base = { ...DEFAULTS, preset: 'custom' as const };
  const preset = PRESETS.find((p) => p.key === key);
  if (!preset) return {};
  const applied = preset.apply(base as FormState);
  const picked: PresetOverrides = {
    characterName: applied.characterName,
    age: applied.age,
    gender: applied.gender,
    hair: applied.hair,
    eyes: applied.eyes,
    facialDetails: applied.facialDetails,
    outfit: applied.outfit,
    pose: applied.pose,
    scene: applied.scene,
    action: applied.action,
    camera: applied.camera,
    style: applied.style,
    lighting: applied.lighting,
    quality: applied.quality,
    ar: applied.ar,
    useCase: applied.useCase,
    voiceTone: applied.voiceTone,
    catchphrases: applied.catchphrases,
    hashtags: applied.hashtags,
  };
  return picked;
}

function loadPresetOverrides(): Record<EditablePresetKey, PresetOverrides> {
  const keys: EditablePresetKey[] = [...EDITABLE_PRESET_KEYS];
  const defaults: Record<EditablePresetKey, PresetOverrides> = {
    elif: getDefaultPresetValues('elif'),
    ahmet: getDefaultPresetValues('ahmet'),
    can: getDefaultPresetValues('can'),
    ayse: getDefaultPresetValues('ayse'),
  };

  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as any;
    const out = { ...defaults } as Record<EditablePresetKey, PresetOverrides>;
    for (const k of keys) {
      if (parsed && typeof parsed === 'object' && parsed[k] && typeof parsed[k] === 'object') {
        out[k] = { ...out[k], ...parsed[k] };
      }
    }
    return out;
  } catch {
    return defaults;
  }
}

function savePresetOverrides(v: Record<EditablePresetKey, PresetOverrides>) {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(v));
}

function loadLockedCastMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCKED_CAST_MAP_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as any) : null;
    if (parsed && typeof parsed === 'object') return parsed as Record<string, string>;
  } catch {
    // ignore
  }
  return {};
}

function saveLockedCastMap(map: Record<string, string>) {
  try {
    localStorage.setItem(LOCKED_CAST_MAP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function loadLockedCastEnabledMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LOCKED_CAST_ENABLED_MAP_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as any) : null;
    if (parsed && typeof parsed === 'object') return parsed as Record<string, boolean>;
  } catch {
    // ignore
  }
  return {};
}

function saveLockedCastEnabledMap(map: Record<string, boolean>) {
  try {
    localStorage.setItem(LOCKED_CAST_ENABLED_MAP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function loadLockedCastSelectedMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(LOCKED_CAST_SELECTED_MAP_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as any) : null;
    if (parsed && typeof parsed === 'object') return parsed as Record<string, string[]>;
  } catch {
    // ignore
  }
  return {};
}

function saveLockedCastSelectedMap(map: Record<string, string[]>) {
  try {
    localStorage.setItem(LOCKED_CAST_SELECTED_MAP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function buildLockedCastBlock(s: Pick<FormState, 'preset' | 'lockCharacters' | 'lockedCast'>): string {
  const cast = buildLockedCastText({ preset: s.preset, lockedCast: s.lockedCast, selectedCharacters: (s as any).selectedCharacters || [] }).trim();
  if (!s.lockCharacters || !cast) return '';
  return `\n\nLOCKED CAST (must stay identical across all prompts & re-generations):\n${cast}\n\nConsistency rules: Keep the exact same people (faces, ages, body types, hairstyles, clothing) as the LOCKED CAST. Do not replace faces. Do not merge characters. Do not add new main characters.\n`;
}

function buildTemplate(s: FormState) {
  const DURATION_SECONDS = 8;
  const VOICEOVER_LANG = 'Turkish (tr-TR)';
  const lockedCastBlock = buildLockedCastBlock(s);
  if (s.mode === 'alo17_ad_grok') {
    // Enforce: each prompt block = 8 seconds
    const block1 = `8-second video prompt (0-8s). Voiceover language: ${VOICEOVER_LANG}. No text, no watermark. --ar 9:16.${lockedCastBlock}\n${s.adScene1} ${s.adScene2}`;
    const block2 = `8-second video prompt (8-16s). Voiceover language: ${VOICEOVER_LANG}. No text, no watermark. --ar 9:16.${lockedCastBlock}\n${s.adScene3} ${s.adScene4}`;
    const block3 = `8-second video prompt (16-24s). Voiceover language: ${VOICEOVER_LANG}. No text, no watermark. --ar 9:16.${lockedCastBlock}\n${s.adScene5} ${s.adScene6}`;

    return `### Alo17 Reklam (Grok) — 8 saniyelik prompt blokları

Kurallar (sabit):
- Süre: 8 saniye (her prompt)
- Seslendirme dili: Türkçe (tr-TR)
- Format: 9:16
- Kısıt: no text, no watermark

---

## Sahne Promptları (düzenlenebilir)

**SAHNE 1**
${s.adScene1}

**SAHNE 2**
${s.adScene2}

**SAHNE 3**
${s.adScene3}

**SAHNE 4**
${s.adScene4}

**SAHNE 5**
${s.adScene5}

**SAHNE 6**
${s.adScene6}

---

## Üretim için 8 saniyelik bloklar (kopyala-yapıştır)

**PROMPT A (0–8 sn)**
${block1}

**PROMPT B (8–16 sn)**
${block2}

**PROMPT C (16–24 sn)**
${block3}

---

## Türkçe VO metni (silik şablon)

**VO A (0–8 sn):**
[Çanakkale’de ilan bakmak bu kadar karışıksa…]

**VO B (8–16 sn):**
[Alo17’de aradığını hızlıca bul, kolayca ilan ver.]

**VO C (16–24 sn):**
[Elif, Ahmet Usta, Can, Ayşe Hanım… Çanakkale Alo17’de buluşuyor. Alo17.tr]
`;
  }

  if (s.mode === 'character' && s.useSinglePrompt && s.singlePrompt.trim()) {
    // Note: UI builds the split blocks and copy buttons. This fallback stays readable if needed.
    const sp = s.singlePrompt.trim();
    return `### Tek Prompt (Custom)

Kurallar (sabit): ${DURATION_SECONDS} saniye + Türkçe VO (tr-TR) + 9:16 + no text/watermark

${DURATION_SECONDS}-second video prompt. Voiceover language: ${VOICEOVER_LANG}. No subtitles, no on-screen text, no watermark. ${s.ar}${lockedCastBlock}

${sp}`;
  }

  const basePrompt = `${DURATION_SECONDS}-second video prompt: ${s.age} year old ${s.gender}, ${s.hair}, ${s.eyes}, ${s.facialDetails}, wearing ${s.outfit}. Location: ${s.scene}. Pose: ${s.pose}. Action: ${s.action}. Camera: ${s.camera}. Context: ${s.useCase}. Style: ${s.style}, ${s.lighting}, ${s.quality}. Constraints: duration ${DURATION_SECONDS} seconds, voiceover language ${VOICEOVER_LANG}, no text, no watermark. ${s.ar}${lockedCastBlock}`.trim();

  return `### Doldurulabilir Şablon (Silik Dolu) — Adım 4 → 15

Kopyala; [köşeli alanları] kendi işine göre değiştir.

---

## Adım 4: Prompt Temelleri (2 dakika)
- Prompt nedir? AI’ye talimat: “Ne üret?”
- Dil: Basit İngilizce + detay.

**Prompt Yapısı**
- Konu: [${s.characterName}]
- Detay: [age=${s.age}], [gender=${s.gender}], [hair=${s.hair}], [eyes=${s.eyes}], [facial=${s.facialDetails}], [outfit=${s.outfit}]
- Ortam: [${s.scene}] + [${s.lighting}]
- Aksiyon: [${s.action}]
- Kamera: [${s.camera}]
- Stil: [${s.style}]
- Kalite: [${s.quality}]
- Süre: [8 saniye] (sabit)
- Seslendirme dili: [Türkçe / tr-TR] (sabit)
- Aspect Ratio: [${s.ar}]
- Bağlam/Kullanım: [${s.useCase}]

**Örnek Prompt (silik)**
${basePrompt}

**Hata önleme**
- Vague olma: “güzel kız” yerine ölçülebilir detay yaz.
- Tutarlılık: her prompt’ta saç/göz/yüz detaylarını tekrar et.

---

## Adım 5: İlk Görüntü Üret (3 dakika)
- Platform: [${s.platform}]
- Hedef: [1 ana görsel + 1 yedek]

**Ana Prompt**
${basePrompt}

Sonuç: Beğenmezsen upscale/variation yap.

---

## Adım 6: Tutarlılık Sağla (2 dakika)
Sorun: Her üretimde yüz değişir.
Çözüm: Seed / referans / aynı temel prompt.

- Seed: [--seed 1234] (örnek)
- Referans: [--sref image_url] (Midjourney) / “Image Guidance” (Leonardo)
${s.lockCharacters && (s.lockedCast || '').trim() ? `\n- LOCKED CAST: Açık (kadro sabit)` : ''}

---

## Adım 7: Seri Üretim (3 dakika)
Hedef: 5–10 görüntü stoğu.

Senaryo fikirleri:
1) Günlük hayat
2) Promo
3) Hikaye
4) Eğitim
5) Çağrı

---

## Adım 8: Tutarlılık Mimariği Kur (3 dakika)
Style guide (sabit):
- Stil: ${s.style}
- Renk/ton: earth tones
- Işık: ${s.lighting}
- Not: no text, no watermark

---

## Adım 9: Kalite Kontrol (2 dakika)
Kontrol:
- Yüz aynı mı?
- Saç/göz tutarlı mı?
- Eller/objeler bozuk mu?

Depolama: ${s.storageFolder}

---

## Adım 10: Kişilik Dijitalleştir (2 dakika)
Karakter: ${s.characterName}
Ton: ${s.voiceTone}
Catchphrase:
${s.catchphrases}

ChatGPT prompt:
“Write as ${s.characterName}. Language: Turkish (tr-TR). Topic: [topic]. Tone: ${s.voiceTone}. Length: 100 words. Include: emoji + hashtags.”

Seslendirme (VO) notu:
- Dil: Turkish (tr-TR) (sabit)
- Metin: [15 saniyelik VO metnini buraya yaz]

---

## Adım 11: İçerik Oluştur (3 dakika)
Caption şablonu:
- Hook: “[Bugün ____ yaptım!]”
- Değer: “[Sen de ____ ile başlayabilirsin.]”
- CTA: “[Yorumlara ____ yaz!]”
- Hashtag: ${s.hashtags}

---

## Adım 12: Sosyal Medya Kurulumu (3 dakika)
Paylaş planı: ${s.postingPlan}
Hukuk/etik: Bio’da “AI-generated” belirt.

---

## Adım 13: Ölçekleme (3 dakika)
Hacim: haftalık daha fazla üret → batch + liste.
Monetizasyon: affiliate/sponsor (yavaş başla).

---

## Adım 14: Hataları Önle (3 dakika)
1) Tutarsızlık → seed/ref + style guide
2) Düşük kalite → upscale/variation
3) Yasal → AI etiketi
4) Yavaş üretim → batch

---

## Adım 15: Tam Mimari Oturt (2 dakika)
Akış: Konsept → Özellikler → Prompt → Üretim → Tutarlılık → Kişilik → İçerik → Paylaş → Ölçek
`;
}

export default function AdminAiSablonPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as any)?.role === 'admin';

  const [s, setS] = useState<FormState>(() => PRESETS[0].apply(DEFAULTS));
  const [copied, setCopied] = useState(false);
  const [presetOverrides, setPresetOverrides] = useState<Record<EditablePresetKey, PresetOverrides> | null>(null);
  const [editingPreset, setEditingPreset] = useState<EditablePresetKey | null>(null);
  const [translatedSinglePrompt, setTranslatedSinglePrompt] = useState<string>('');
  const [isTranslatingSingle, setIsTranslatingSingle] = useState(false);
  const [translateErrorSingle, setTranslateErrorSingle] = useState<string | null>(null);
  const [translatedFields, setTranslatedFields] = useState<Partial<FormState>>({});
  const [isTranslatingFields, setIsTranslatingFields] = useState(false);
  const [translateErrorFields, setTranslateErrorFields] = useState<string | null>(null);

  useEffect(() => {
    setPresetOverrides(loadPresetOverrides());
    try {
      const raw = localStorage.getItem(SINGLE_PROMPT_STORAGE_KEY);
      if (raw) setS((prev) => ({ ...prev, singlePrompt: raw }));
    } catch {
      // ignore
    }
    try {
      const rawSec = localStorage.getItem(SINGLE_PROMPT_SECONDS_STORAGE_KEY);
      if (rawSec) setS((prev) => ({ ...prev, singlePromptTotalSeconds: rawSec }));
    } catch {
      // ignore
    }
    // Migration (v1 global -> per-preset map)
    try {
      const map = loadLockedCastMap();
      const enabledMap = loadLockedCastEnabledMap();
      const legacyCast = localStorage.getItem(LOCKED_CAST_STORAGE_KEY) || '';
      const legacyEnabled = localStorage.getItem(LOCKED_CAST_ENABLED_STORAGE_KEY) || '';
      if (legacyCast && !map['custom']) {
        map['custom'] = legacyCast;
        saveLockedCastMap(map);
      }
      if (legacyEnabled && enabledMap['custom'] === undefined) {
        enabledMap['custom'] = legacyEnabled === '1';
        saveLockedCastEnabledMap(enabledMap);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SINGLE_PROMPT_STORAGE_KEY, s.singlePrompt || '');
    } catch {
      // ignore
    }
  }, [s.singlePrompt]);

  useEffect(() => {
    try {
      localStorage.setItem(SINGLE_PROMPT_SECONDS_STORAGE_KEY, s.singlePromptTotalSeconds || '');
    } catch {
      // ignore
    }
  }, [s.singlePromptTotalSeconds]);

  // Persist per preset
  useEffect(() => {
    const key = s.preset || 'custom';
    const map = loadLockedCastMap();
    map[key] = s.lockedCast || '';
    saveLockedCastMap(map);
  }, [s.preset, s.lockedCast]);

  useEffect(() => {
    const key = s.preset || 'custom';
    const map = loadLockedCastEnabledMap();
    map[key] = !!s.lockCharacters;
    saveLockedCastEnabledMap(map);
  }, [s.preset, s.lockCharacters]);

  useEffect(() => {
    const key = s.preset || 'custom';
    const map = loadLockedCastSelectedMap();
    map[key] = Array.isArray(s.selectedCharacters) ? s.selectedCharacters : [];
    saveLockedCastSelectedMap(map);
  }, [s.preset, s.selectedCharacters]);

  // Load per preset when preset changes
  useEffect(() => {
    const key = s.preset || 'custom';
    const castMap = loadLockedCastMap();
    const enabledMap = loadLockedCastEnabledMap();
    const nextCast = typeof castMap[key] === 'string' ? castMap[key] : '';
    const nextEnabled =
      typeof enabledMap[key] === 'boolean'
        ? enabledMap[key]
        : key === 'custom'
          ? false
          : true; // defaults: keep cast locked for built-in presets
    const selectedMap = loadLockedCastSelectedMap();
    const nextSelected =
      Array.isArray(selectedMap[key]) && selectedMap[key].length
        ? selectedMap[key]
        : (DEFAULT_SELECTED_CHARACTERS_BY_PRESET[key as PresetKey] || []);
    setS((prev) => {
      if (prev.preset !== key) return prev;
      const same =
        prev.lockedCast === nextCast &&
        prev.lockCharacters === nextEnabled &&
        JSON.stringify(prev.selectedCharacters || []) === JSON.stringify(nextSelected || []);
      if (same) return prev;
      return { ...prev, lockedCast: nextCast, lockCharacters: nextEnabled, selectedCharacters: nextSelected };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.preset]);

  const looksTurkishSinglePrompt = useMemo(() => {
    const t = (s.singlePrompt || '').trim();
    if (!t) return false;
    if (/[ğüşöçıİĞÜŞÖÇ]/.test(t)) return true;
    const lower = t.toLowerCase();
    const hits = [' ve ', ' bir ', ' için ', ' ama ', ' gibi ', ' değil ', ' ile ', ' çünkü '].reduce(
      (acc, w) => acc + (lower.includes(w) ? 1 : 0),
      0
    );
    return hits >= 2;
  }, [s.singlePrompt]);

  useEffect(() => {
    // Auto-translate only in Tek Prompt mode.
    if (s.mode !== 'character' || !s.useSinglePrompt) return;
    const raw = (s.singlePrompt || '').trim();
    if (!raw) {
      setTranslatedSinglePrompt('');
      setTranslateErrorSingle(null);
      setIsTranslatingSingle(false);
      return;
    }
    if (!looksTurkishSinglePrompt) {
      setTranslatedSinglePrompt('');
      setTranslateErrorSingle(null);
      setIsTranslatingSingle(false);
      return;
    }

    setIsTranslatingSingle(true);
    setTranslateErrorSingle(null);
    const ctrl = new AbortController();
    const tmr = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: raw, from: 'tr', to: 'en' }),
          signal: ctrl.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Çeviri başarısız');
        setTranslatedSinglePrompt(typeof data?.translatedText === 'string' ? data.translatedText : '');
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setTranslatedSinglePrompt('');
        setTranslateErrorSingle(e?.message || 'Çeviri başarısız');
      } finally {
        setIsTranslatingSingle(false);
      }
    }, 450);

    return () => {
      clearTimeout(tmr);
      ctrl.abort();
    };
  }, [s.mode, s.useSinglePrompt, s.singlePrompt, looksTurkishSinglePrompt]);

  const looksTurkishCharacter = useMemo(() => {
    if (s.mode !== 'character' || s.useSinglePrompt === true) return false;
    const joined = [
      s.gender,
      s.hair,
      s.eyes,
      s.facialDetails,
      s.outfit,
      s.pose,
      s.scene,
      s.action,
      s.camera,
      s.style,
      s.lighting,
      s.quality,
      s.useCase,
      s.voiceTone,
      s.catchphrases,
      s.postingPlan,
      s.storageFolder,
    ]
      .filter(Boolean)
      .join(' ');
    if (!joined.trim()) return false;
    if (/[ğüşöçıİĞÜŞÖÇ]/.test(joined)) return true;
    const lower = joined.toLowerCase();
    const hits = [' ve ', ' bir ', ' için ', ' ama ', ' gibi ', ' değil ', ' ile ', ' çünkü '].reduce(
      (acc, w) => acc + (lower.includes(w) ? 1 : 0),
      0
    );
    return hits >= 2;
  }, [
    s.mode,
    s.useSinglePrompt,
    s.gender,
    s.hair,
    s.eyes,
    s.facialDetails,
    s.outfit,
    s.pose,
    s.scene,
    s.action,
    s.camera,
    s.style,
    s.lighting,
    s.quality,
    s.useCase,
    s.voiceTone,
    s.catchphrases,
    s.postingPlan,
    s.storageFolder,
  ]);

  useEffect(() => {
    // Auto translate all fields for right panel when enabled.
    if (s.mode !== 'character' || s.useSinglePrompt) return;
    if (!s.outputEnglish) {
      setTranslatedFields({});
      setIsTranslatingFields(false);
      setTranslateErrorFields(null);
      return;
    }
    if (!looksTurkishCharacter) {
      setTranslatedFields({});
      setIsTranslatingFields(false);
      setTranslateErrorFields(null);
      return;
    }

    const keys: Array<keyof FormState> = [
      'gender',
      'hair',
      'eyes',
      'facialDetails',
      'outfit',
      'pose',
      'scene',
      'action',
      'camera',
      'style',
      'lighting',
      'quality',
      'useCase',
      'voiceTone',
      'catchphrases',
      'postingPlan',
      'storageFolder',
    ];
    const texts = keys.map((k) => (s[k] ?? '').toString());

    setIsTranslatingFields(true);
    setTranslateErrorFields(null);
    const ctrl = new AbortController();
    const tmr = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, from: 'tr', to: 'en' }),
          signal: ctrl.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Çeviri başarısız');
        const arr = Array.isArray(data?.translatedTexts) ? data.translatedTexts : null;
        if (!arr || arr.length !== keys.length) throw new Error('Çeviri sonucu eksik');
        const patch: Partial<FormState> = {};
        keys.forEach((k, idx) => {
          const v = arr[idx];
          if (typeof v === 'string' && v.trim()) (patch as any)[k] = v;
        });
        setTranslatedFields(patch);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setTranslatedFields({});
        setTranslateErrorFields(e?.message || 'Çeviri başarısız');
      } finally {
        setIsTranslatingFields(false);
      }
    }, 500);

    return () => {
      clearTimeout(tmr);
      ctrl.abort();
    };
  }, [
    s.mode,
    s.useSinglePrompt,
    s.outputEnglish,
    looksTurkishCharacter,
    s.gender,
    s.hair,
    s.eyes,
    s.facialDetails,
    s.outfit,
    s.pose,
    s.scene,
    s.action,
    s.camera,
    s.style,
    s.lighting,
    s.quality,
    s.useCase,
    s.voiceTone,
    s.catchphrases,
    s.postingPlan,
    s.storageFolder,
    s.ar,
  ]);

  const applyEditablePreset = (key: Exclude<PresetKey, 'custom'>) => {
    setS((prev) => {
      const base = PRESETS.find((p) => p.key === key)?.apply(prev) ?? prev;
      const ov = isEditablePresetKey(key) ? presetOverrides?.[key] ?? {} : {};
      return { ...base, ...ov, preset: key };
    });
  };

  const sForOutput = useMemo(() => {
    if (s.mode === 'character' && !s.useSinglePrompt && s.outputEnglish && looksTurkishCharacter) {
      return { ...s, ...translatedFields };
    }
    return s;
  }, [s, translatedFields, looksTurkishCharacter]);

  const out = useMemo(() => buildTemplate(sForOutput), [sForOutput]);

  const singlePromptBlocks = useMemo(() => {
    const DURATION_SECONDS = 8;
    const VOICEOVER_LANG = 'Turkish (tr-TR)';
    if (s.mode !== 'character') return [];
    if (!s.useSinglePrompt) return [];
    const raw = (looksTurkishSinglePrompt && translatedSinglePrompt.trim() ? translatedSinglePrompt : s.singlePrompt).trim();
    if (!raw) return [];

    const lockedCastBlock = buildLockedCastBlock(s);

    const parseSecondsFromText = (t: string): number | null => {
      // matches: "24 seconds", "24 second", "24 saniye", "24 sn"
      const re = /(\d{1,3})\s*(seconds?|saniye|sn)\b/gi;
      let m: RegExpExecArray | null;
      let best: number | null = null;
      while ((m = re.exec(t)) !== null) {
        const n = parseInt(m[1], 10);
        if (!Number.isFinite(n)) continue;
        if (best === null || n > best) best = n;
      }
      return best;
    };

    const override = parseInt((s.singlePromptTotalSeconds || '').trim(), 10);
    const detected = parseSecondsFromText(raw);
    const totalSeconds = Number.isFinite(override) && override > 0 ? override : detected ?? DURATION_SECONDS;

    const desiredBlocks = Math.ceil(Math.max(totalSeconds, DURATION_SECONDS) / DURATION_SECONDS);
    const blocksCount = Math.min(Math.max(desiredBlocks, 1), 5);

    const splitIntoN = (t: string, n: number): string[] => {
      const cleaned = t.replace(/\r/g, '').trim();
      // 1) paragraph split
      const paras = cleaned.split(/\n\s*\n+/).map((x) => x.trim()).filter(Boolean);
      if (paras.length >= n) {
        // merge extras into last
        const out: string[] = [];
        for (let i = 0; i < n; i++) out.push(paras[i]);
        if (paras.length > n) out[n - 1] = [out[n - 1], ...paras.slice(n)].join('\n\n');
        return out;
      }
      // 2) sentence split
      const sentences = cleaned.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
      if (sentences.length >= n) {
        const out: string[] = Array.from({ length: n }, () => '');
        for (let i = 0; i < sentences.length; i++) {
          out[i % n] += (out[i % n] ? ' ' : '') + sentences[i];
        }
        return out.map((x) => x.trim()).filter(Boolean);
      }
      // 3) char split
      const len = cleaned.length;
      const chunk = Math.ceil(len / n);
      const out: string[] = [];
      for (let i = 0; i < n; i++) {
        const part = cleaned.slice(i * chunk, (i + 1) * chunk).trim();
        if (part) out.push(part);
      }
      return out.length ? out : [cleaned];
    };

    const parts = blocksCount > 1 ? splitIntoN(raw, blocksCount) : [raw];
    const makeBlock = (idx: number, txt: string) => {
      const start = idx * DURATION_SECONDS;
      const end = start + DURATION_SECONDS;
      return `PROMPT ${idx + 1}/${parts.length} (${start}–${end} sn)\n${DURATION_SECONDS}-second video prompt. Voiceover language: ${VOICEOVER_LANG}. No subtitles, no on-screen text, no watermark. ${s.ar}${lockedCastBlock}\n\n${txt}`.trim();
    };

    return parts.map((p, i) => makeBlock(i, p));
  }, [
    s.mode,
    s.useSinglePrompt,
    s.singlePrompt,
    s.singlePromptTotalSeconds,
    s.ar,
    s.lockCharacters,
    s.lockedCast,
    looksTurkishSinglePrompt,
    translatedSinglePrompt,
  ]);

  const finalOutput = useMemo(() => {
    if (s.mode === 'character' && s.useSinglePrompt && singlePromptBlocks.length) {
      return singlePromptBlocks.join('\n\n---\n\n');
    }
    return out;
  }, [out, s.mode, s.useSinglePrompt, singlePromptBlocks]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !isAdmin) {
      router.push(`/giris?callbackUrl=${encodeURIComponent('/admin/ai-sablon')}`);
    }
  }, [status, session, isAdmin, router]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      const el = document.getElementById('ai-sablon-output') as HTMLTextAreaElement | null;
      if (el) {
        el.focus();
        el.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Admin yetkisi gerekli...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Şablon (Adım 4–15)</h1>
            <p className="text-sm text-gray-600 mt-2">
              Alanları düzenle → sağdaki şablon otomatik güncellenir → “Kopyala” ile tek metin al.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setS(DEFAULTS)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Sıfırla
            </Button>
            <Button onClick={onCopy}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
            <div className="text-sm font-semibold text-gray-900 mb-4">Ayarlar</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectField
                label="Mod"
                value={s.mode}
                options={['character', 'alo17_ad_grok']}
                onChange={(v) => setS({ ...s, mode: v as any })}
              />
              <SelectField
                label="Platform"
                value={s.platform}
                options={['Leonardo.ai', 'Midjourney', 'Stable Diffusion', 'Other']}
                onChange={(v) => setS({ ...s, platform: v as any })}
              />
            </div>

            {s.mode === 'character' && !s.useSinglePrompt && (
              <div className="mb-4 rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Sağ panel dili</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Alanları Türkçe yazsan bile sağ tarafta İngilizce prompt üretir.
                      <div className="mt-1">
                        {looksTurkishCharacter ? (
                          <span className="text-gray-700">
                            Durum: <strong>TR→EN</strong>
                            {isTranslatingFields ? <span className="text-gray-500"> • Çevriliyor…</span> : null}
                            {translateErrorFields ? <span className="text-red-600"> • {translateErrorFields}</span> : null}
                          </span>
                        ) : (
                          <span className="text-gray-600">Durum: Metin İngilizce gibi görünüyor.</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={s.outputEnglish}
                      onChange={(e) => setS({ ...s, outputEnglish: e.target.checked })}
                    />
                    İngilizce üret
                  </label>
                </div>
              </div>
            )}

            {s.mode === 'alo17_ad_grok' ? (
              <>
                <div className="text-sm font-semibold text-gray-900 mb-2">Alo17 Reklam — Grok sahneleri</div>
                <div className="text-xs text-gray-600 mb-3">
                  Sahneleri düzenleyebilirsin. Çıktı otomatik olarak 8 saniyelik 3 prompt bloğuna bölünür.
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <TextAreaField label="SAHNE 1 (Grok prompt)" value={s.adScene1} onChange={(v) => setS({ ...s, adScene1: v })} />
                  <TextAreaField label="SAHNE 2 (Grok prompt)" value={s.adScene2} onChange={(v) => setS({ ...s, adScene2: v })} />
                  <TextAreaField label="SAHNE 3 (Grok prompt)" value={s.adScene3} onChange={(v) => setS({ ...s, adScene3: v })} />
                  <TextAreaField label="SAHNE 4 (Grok prompt)" value={s.adScene4} onChange={(v) => setS({ ...s, adScene4: v })} />
                  <TextAreaField label="SAHNE 5 (Grok prompt)" value={s.adScene5} onChange={(v) => setS({ ...s, adScene5: v })} />
                  <TextAreaField label="SAHNE 6 (Grok prompt)" value={s.adScene6} onChange={(v) => setS({ ...s, adScene6: v })} />
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-gray-900 mb-4">Karakter / Prompt</div>

                <div className="mb-5 rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Karakterleri sabitle (LOCKED CAST)</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Aktif edince şablonda her prompt’a “LOCKED CAST” eklenir. Böylece karakterler (yüz, saç, kıyafet) her üretimde daha
                        tutarlı kalır.
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 select-none">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={s.lockCharacters}
                        onChange={(e) => setS({ ...s, lockCharacters: e.target.checked })}
                      />
                      Sabitle
                    </label>
                  </div>

                  <div className="mt-3">
                    <TextAreaField
                      label="LOCKED CAST (Karakter kartları)"
                      value={s.lockedCast}
                      placeholder={buildLockedCastText({ preset: s.preset, lockedCast: '', selectedCharacters: s.selectedCharacters })}
                      onChange={(v) => setS({ ...s, lockedCast: v })}
                    />
                    <div className="mt-1 text-xs text-gray-600">
                      Örnek:
                      <span className="font-mono">
                        {' '}
                        AYLİN_27: Turkish woman, blonde hair, curvy/soft chubby, oversized cheap cartoon t-shirt nightdress, fluffy slippers
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-800 mb-2">Karakter seç (checkbox)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CHARACTER_LIBRARY.map((c) => {
                        const checked = (s.selectedCharacters || []).includes(c.id);
                        return (
                          <label key={c.id} className="flex items-start gap-2 text-xs text-gray-700 border rounded px-2 py-2 bg-white">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4"
                              checked={checked}
                              onChange={(e) => {
                                const on = e.target.checked;
                                const prev = s.selectedCharacters || [];
                                const next = on ? Array.from(new Set([...prev, c.id])) : prev.filter((x) => x !== c.id);
                                setS({ ...s, selectedCharacters: next });
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900">{c.label}</div>
                              <div className="text-[11px] text-gray-500 truncate">
                                {c.content ? c.content.split('\n')[0].slice(0, 120) : ''}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                        onClick={() => setS({ ...s, selectedCharacters: [] })}
                      >
                        Seçimi temizle
                      </button>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                        onClick={() => setS({ ...s, lockedCast: '' })}
                        title="Elle yazdığın kadroyu temizle; seçim/varsayılan devreye girsin"
                      >
                        LOCKED CAST’i temizle
                      </button>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-600">
                      Not: <strong>LOCKED CAST alanı boşsa</strong> ve “Sabitle” açıksa, seçtiğin karakterler prompt’a otomatik eklenir.
                    </div>
                  </div>
                </div>

                <div className="mb-5 rounded-lg border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Tek Prompt (Custom)</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Buraya tek parça prompt’u yapıştır. Etkinleştirince sağdaki çıktı <strong>doğrudan bu prompt</strong> olur ve
                        sabit kurallar otomatik eklenir: <strong>8 saniye</strong> + <strong>Türkçe VO (tr-TR)</strong> +{' '}
                        <strong>no text/watermark</strong>.
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 select-none">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={s.useSinglePrompt}
                        onChange={(e) => setS({ ...s, useSinglePrompt: e.target.checked })}
                      />
                      Tek prompt modu
                    </label>
                  </div>

                  <div className="mt-3">
                    <TextAreaField
                      label="Tek Prompt"
                      value={s.singlePrompt}
                      onChange={(v) => setS({ ...s, singlePrompt: v })}
                    />
                  </div>

                  {s.useSinglePrompt && (
                    <div className="mt-2 text-xs">
                      {looksTurkishSinglePrompt ? (
                        <div className="text-gray-700">
                          Sağdaki çıktı: <strong>İngilizce</strong> (otomatik TR→EN çeviri)
                          {isTranslatingSingle ? <span className="text-gray-500"> • Çevriliyor…</span> : null}
                          {translateErrorSingle ? <span className="text-red-600"> • {translateErrorSingle}</span> : null}
                        </div>
                      ) : (
                        <div className="text-gray-600">Metin İngilizce görünüyor; sağ tarafta aynı metin kullanılır.</div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Toplam süre (sn) (opsiyonel)"
                      value={s.singlePromptTotalSeconds}
                      onChange={(v) => setS({ ...s, singlePromptTotalSeconds: v })}
                    />
                    <div className="text-xs text-gray-600 self-end">
                      Süre boşsa prompt içinden (örn. “24 seconds”) otomatik yakalanır. 8’i aşarsa otomatik bölünür (max 5).
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
                    <div className="text-xs text-gray-600">
                      {singlePromptBlocks.length > 1
                        ? `Bu prompt ${singlePromptBlocks.length} parçaya bölündü. Her biri 8 saniye.`
                        : 'İpucu: “Profil = custom” seçip tek prompt modunu açabilirsin.'}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setS({ ...s, singlePrompt: '' })}
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                      >
                        Temizle
                      </button>
                      <button
                        type="button"
                        onClick={() => setS({ ...s, preset: 'custom', useSinglePrompt: true })}
                        className="text-xs px-2 py-1 rounded border bg-blue-50 border-blue-200 hover:bg-blue-100"
                      >
                        Custom + Tek Prompt
                      </button>
                      {singlePromptBlocks.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(singlePromptBlocks[i]);
                            } catch {
                              // ignore
                            }
                          }}
                          className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                          title={`PROMPT ${i + 1} kopyala`}
                        >
                          Kopyala {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-5 rounded-lg border bg-gray-50 p-4">
              <div className="text-xs font-semibold text-gray-700 mb-2">Hazır karakter profilleri (Alo17)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.filter((p) => p.key !== 'custom').map((p) => (
                      <div key={p.key} className="rounded-md border bg-white">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => applyEditablePreset(p.key as any)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              applyEditablePreset(p.key as any);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 transition-colors rounded-md ${
                            s.preset === p.key ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{p.label}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{p.description}</div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isEditablePresetKey(p.key)) setEditingPreset(p.key);
                              }}
                              className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-white bg-gray-50"
                              title="Profili düzenle"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Düzenle
                            </button>
                          </div>
                        </div>

                        {isEditablePresetKey(p.key) && editingPreset === p.key && presetOverrides && (
                          <div className="px-3 pb-3 pt-2 border-t bg-white">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="text-xs font-semibold text-gray-700">Profil ayarları</div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const k = p.key as EditablePresetKey;
                                    const next = { ...presetOverrides, [k]: getDefaultPresetValues(k) };
                                    setPresetOverrides(next);
                                    savePresetOverrides(next);
                                  }}
                                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                                  title="Varsayılanlara dön"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 inline mr-1" />
                                  Varsayılan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPreset(null)}
                                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                                >
                                  <X className="h-3.5 w-3.5 inline mr-1" />
                                  Kapat
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Field
                                label="Karakter adı"
                                value={presetOverrides[p.key as EditablePresetKey]?.characterName || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = {
                                    ...presetOverrides,
                                    [k]: { ...presetOverrides[k], characterName: v },
                                  };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                              <Field
                                label="Yaş"
                                value={presetOverrides[p.key as EditablePresetKey]?.age || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], age: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                              <Field
                                label="Cinsiyet"
                                value={presetOverrides[p.key as EditablePresetKey]?.gender || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], gender: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                              <Field
                                label="Sahne"
                                value={presetOverrides[p.key as EditablePresetKey]?.scene || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], scene: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                              <Field
                                label="Aksiyon"
                                value={presetOverrides[p.key as EditablePresetKey]?.action || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], action: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                              <Field
                                label="Kamera"
                                value={presetOverrides[p.key as EditablePresetKey]?.camera || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], camera: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                              <Field
                                label="Use case"
                                value={presetOverrides[p.key as EditablePresetKey]?.useCase || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], useCase: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                              <Field
                                label="Voice tone"
                                value={presetOverrides[p.key as EditablePresetKey]?.voiceTone || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], voiceTone: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-3">
                              <TextAreaField
                                label="Catchphrases"
                                value={presetOverrides[p.key as EditablePresetKey]?.catchphrases || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], catchphrases: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                              <Field
                                label="Hashtag seti"
                                value={presetOverrides[p.key as EditablePresetKey]?.hashtags || ''}
                                onChange={(v) => {
                                  const k = p.key as EditablePresetKey;
                                  const next = { ...presetOverrides, [k]: { ...presetOverrides[k], hashtags: v } };
                                  setPresetOverrides(next);
                                  savePresetOverrides(next);
                                }}
                              />
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="text-xs text-gray-600">Değişiklikler otomatik kaydedilir.</div>
                              <div className="inline-flex items-center text-xs text-green-700">
                                <Save className="h-3.5 w-3.5 mr-1" />
                                Kaydedildi
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600">
                İstersen “Özel” seçip tüm alanları elle düzenleyebilirsin.
              </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Profil"
                value={s.preset}
                options={['elif', 'ahmet', 'can', 'ayse', 'iyi_geceler', 'custom']}
                onChange={(v) => {
                  const p = PRESETS.find((x) => x.key === (v as PresetKey));
                  if (p) setS((prev) => p.apply(prev));
                }}
              />
              <Field label="Karakter adı" value={s.characterName} onChange={(v) => setS({ ...s, characterName: v })} />
              <Field label="Yaş" value={s.age} onChange={(v) => setS({ ...s, age: v })} />
              <Field label="Cinsiyet" value={s.gender} onChange={(v) => setS({ ...s, gender: v })} />
              <Field label="Saç" value={s.hair} onChange={(v) => setS({ ...s, hair: v })} />
              <Field label="Göz" value={s.eyes} onChange={(v) => setS({ ...s, eyes: v })} />
              <Field label="Yüz detayları" value={s.facialDetails} onChange={(v) => setS({ ...s, facialDetails: v })} />
              <Field label="Kıyafet" value={s.outfit} onChange={(v) => setS({ ...s, outfit: v })} />
              <Field label="Poz" value={s.pose} onChange={(v) => setS({ ...s, pose: v })} />
              <Field label="Sahne" value={s.scene} onChange={(v) => setS({ ...s, scene: v })} />
              <Field label="Aksiyon" value={s.action} onChange={(v) => setS({ ...s, action: v })} />
              <Field label="Kamera" value={s.camera} onChange={(v) => setS({ ...s, camera: v })} />
              <Field label="Stil" value={s.style} onChange={(v) => setS({ ...s, style: v })} />
              <Field label="Işık" value={s.lighting} onChange={(v) => setS({ ...s, lighting: v })} />
              <Field label="Kalite" value={s.quality} onChange={(v) => setS({ ...s, quality: v })} />
              <Field label="Aspect ratio" value={s.ar} onChange={(v) => setS({ ...s, ar: v })} />
              <Field label="Bağlam/Kullanım (Use case)" value={s.useCase} onChange={(v) => setS({ ...s, useCase: v })} />
                </div>

                <div className="mt-6 text-sm font-semibold text-gray-900">Kişilik / İçerik</div>
                <div className="mt-3 grid grid-cols-1 gap-4">
                  <Field label="Voice tone" value={s.voiceTone} onChange={(v) => setS({ ...s, voiceTone: v })} />
                  <TextAreaField label="Catchphrases (satır satır)" value={s.catchphrases} onChange={(v) => setS({ ...s, catchphrases: v })} />
                  <Field label="Hashtag seti" value={s.hashtags} onChange={(v) => setS({ ...s, hashtags: v })} />
                  <Field label="Paylaş planı" value={s.postingPlan} onChange={(v) => setS({ ...s, postingPlan: v })} />
                  <Field label="Depolama klasörü" value={s.storageFolder} onChange={(v) => setS({ ...s, storageFolder: v })} />
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow border p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-gray-900">Çıktı (kopyalanabilir)</div>
              <div className="text-xs text-gray-500">Otomatik güncellenir</div>
            </div>

            <textarea
              id="ai-sablon-output"
              className="mt-3 w-full min-h-[680px] font-mono text-xs leading-relaxed border rounded-md p-3 bg-gray-50"
              value={finalOutput}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

