import React from 'react';

// Türkiye Cumhuriyeti hukuk sistemine uygun, güncel dilekçe template'leri

export interface ContractFormData {
  [key: string]: any;
}

export interface ContractTemplate {
  getFormFields: (formData: ContractFormData, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void) => React.ReactNode;
  renderPreview: (formData: ContractFormData) => React.ReactNode;
  getDefaultFormData: () => ContractFormData;
}

// Yardımcı fonksiyonlar
export const formatCurrency = (value: string) => {
  if (!value) return '0,00 ₺';
  const num = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
  if (isNaN(num)) return '0,00 ₺';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(num);
};

export const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const numberToTurkishOrdinal = (num: string | number): string => {
  const numStr = String(num);
  const numValue = parseInt(numStr);
  if (isNaN(numValue)) return numStr;

  const ordinals: { [key: number]: string } = {
    1: 'Birinci', 2: 'İkinci', 3: 'Üçüncü', 4: 'Dördüncü', 5: 'Beşinci',
    6: 'Altıncı', 7: 'Yedinci', 8: 'Sekizinci', 9: 'Dokuzuncu', 10: 'Onuncu',
    11: 'On Birinci', 12: 'On İkinci', 13: 'On Üçüncü', 14: 'On Dördüncü', 15: 'On Beşinci',
    16: 'On Altıncı', 17: 'On Yedinci', 18: 'On Sekizinci', 19: 'On Dokuzuncu', 20: 'Yirminci',
    21: 'Yirmi Birinci', 22: 'Yirmi İkinci', 23: 'Yirmi Üçüncü', 24: 'Yirmi Dördüncü', 25: 'Yirmi Beşinci',
    26: 'Yirmi Altıncı', 27: 'Yirmi Yedinci', 28: 'Yirmi Sekizinci', 29: 'Yirmi Dokuzuncu', 30: 'Otuzuncu',
    31: 'Otuz Birinci'
  };

  return ordinals[numValue] || `${numValue}.`;
};

// Preview Components (JSX ayrı component'lerde - SWC parser güvenliği için)
const JustifiedTerminationReceivablesPreview = ({
  formData,
}: {
  formData: ContractFormData;
}) => {
  const isBaslangic = formData.isBaslangicTarihi ? formatDate(formData.isBaslangicTarihi) : '___________________';
  const isBitis = formData.isBitisTarihi ? formatDate(formData.isBitisTarihi) : '___________________';
  const fesihTarihi = formData.fesihTarihi ? formatDate(formData.fesihTarihi) : '___________________';

  return (
    <div className="p-8 space-y-6 text-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{formData.mahkemeAdi ? `${formData.mahkemeAdi.toUpperCase()} İŞ MAHKEMESİ'NE` : "İŞ MAHKEMESİ'NE"}</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="font-bold mb-2">DAVACI :</p>
          <p>Ad Soyad: <strong>{formData.davaciAd || '___________________'}</strong></p>
          <p>T.C. Kimlik No: {formData.davaciTC || '___________________'}</p>
          <p>Adres: {formData.davaciAdres || '___________________'}</p>
        </div>
        
        <div>
          <p className="font-bold mb-2">DAVALI :</p>
          <p>Şirket Ünvanı: <strong>{formData.davaliUnvan || '___________________'}</strong></p>
          <p>Adres: {formData.davaliAdres || '___________________'}</p>
        </div>
        
        <div>
          <p className="font-bold mb-2">DAVA KONUSU :</p>
          <p>İş sözleşmesinin işçi tarafından haklı nedenle feshi sonucu doğan kıdem tazminatı, ücret, fazla mesai, yıllık izin, ulusal bayram ve genel tatil alacaklarının tahsili talebidir.</p>
        </div>
        
        <div>
          <p className="font-bold mb-2">DAVA DEĞERİ :</p>
          <p>Şimdilik {formData.davaDegeri || '___________________'} TL (Fazlaya ilişkin haklarımız saklıdır.)</p>
        </div>
        
        <div>
          <p className="font-bold mb-2">AÇIKLAMALAR</p>
          <p className="mb-2">
            Davacı, davalı şirkete ait işyerinde {isBaslangic} tarihinden {isBitis} tarihine kadar {formData.pozisyon || '___________________'} pozisyonunda, aylık {formData.aylikUcret || '___________________'} TL ücretle çalışmıştır.
          </p>
          <p className="mb-2">
            Davalı işveren, çalışma süresi boyunca ücretleri süresinde ve eksiksiz ödememiş, davacıya ait fazla mesai, yıllık izin ve diğer işçilik alacaklarını da ödemekten imtina etmiştir.
          </p>
          <p className="mb-2">
            Ücretlerin zamanında ödenmemesi, işçinin en temel hakkı olup 4857 sayılı İş Kanunu'nun 24/II-e maddesi uyarınca işçi açısından haklı fesih sebebidir.
          </p>
          <p className="mb-2">
            Davacı, yaşanan bu hukuka aykırı uygulamalar nedeniyle iş sözleşmesini {fesihTarihi} tarihinde haklı nedenle feshetmiştir. Fesih sonrası davalıya yapılan sözlü ve yazılı taleplere rağmen alacaklar ödenmemiştir.
          </p>
          <p className="mb-2">
            Davacı, iş sözleşmesini haklı nedenle feshettiğinden kıdem tazminatına hak kazanmıştır. Ayrıca ödenmeyen işçilik alacaklarının da tahsili gerekmektedir.
          </p>
        </div>
        
        <div>
          <p className="font-bold mb-2">HUKUKİ NEDENLER</p>
          <ul className="list-disc list-inside space-y-1">
            <li>4857 sayılı İş Kanunu</li>
            <li>6098 sayılı Türk Borçlar Kanunu</li>
            <li>7036 sayılı İş Mahkemeleri Kanunu</li>
            <li>6100 sayılı HMK ve ilgili mevzuat</li>
          </ul>
        </div>
        
        <div>
          <p className="font-bold mb-2">DELİLLER</p>
          <ul className="list-disc list-inside space-y-1">
            <li>İş sözleşmesi</li>
            <li>SGK hizmet dökümü</li>
            <li>Ücret bordroları</li>
            <li>Banka kayıtları</li>
            <li>Tanık beyanları</li>
            <li>Noter ihtarnamesi (varsa)</li>
            <li>Bilirkişi incelemesi</li>
            <li>Her türlü yasal delil</li>
          </ul>
        </div>
        
        {(formData.tanik1Ad || formData.tanik2Ad) && (
          <div>
            <p className="font-bold mb-2">TANIK LİSTESİ</p>
            {formData.tanik1Ad && (
              <div className="mb-4">
                <p className="font-semibold mb-1">Tanık 1</p>
                <p>Ad Soyad: {formData.tanik1Ad}</p>
                <p>Çalıştığı/çalışmış olduğu yer: {formData.tanik1CalistigiYer || '___________________'}</p>
                <p className="mt-1">Bildiği hususlar:</p>
                <ul className="list-disc list-inside ml-4">
                  {formData.tanik1UcretOdenmemesi && <li>Ücret ödenmemesi</li>}
                  {formData.tanik1SigortasizCalisma && <li>Sigortasız çalışma</li>}
                  {formData.tanik1Mobbing && <li>Mobbing</li>}
                  {formData.tanik1FazlaMesai && <li>Fazla mesai</li>}
                </ul>
              </div>
            )}
            {formData.tanik2Ad && (
              <div>
                <p className="font-semibold mb-1">Tanık 2</p>
                <p>Ad Soyad: {formData.tanik2Ad}</p>
                <p>Çalıştığı/çalışmış olduğu yer: {formData.tanik2CalistigiYer || '___________________'}</p>
                {formData.tanik2BildigiHususlar && (
                  <p>Bildiği hususlar: {formData.tanik2BildigiHususlar}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {(formData.sgkHicSigortaYok || formData.sgkEksikGunVar || formData.sgkDusukUcretBildirimi || formData.sgkTamAmaGecBildirim || formData.sgkGirisTarihi || formData.sgkCikisTarihi) && (
          <div>
            <p className="font-bold mb-2">e-DEVLET SGK DÖKÜMÜNE GÖRE UYARLAMA</p>
            <p className="mb-2">Aşağıdakilerden hangisi doğruysa işaretle veya yaz:</p>
            <ul className="list-none space-y-1 mb-2">
              {formData.sgkHicSigortaYok && <li>☑ Hiç sigorta yok</li>}
              {formData.sgkEksikGunVar && <li>☑ Eksik gün var</li>}
              {formData.sgkDusukUcretBildirimi && <li>☑ Düşük ücret bildirimi var</li>}
              {formData.sgkTamAmaGecBildirim && <li>☑ Tam ama geç bildirim var</li>}
            </ul>
            {(formData.sgkGirisTarihi || formData.sgkCikisTarihi) && (
              <div className="mt-2">
                <p>SGK'da görünen işe giriş tarihi: {formData.sgkGirisTarihi ? formatDate(formData.sgkGirisTarihi) : '___________________'}</p>
                <p>SGK'da görünen işten çıkış tarihi: {formData.sgkCikisTarihi ? formatDate(formData.sgkCikisTarihi) : '___________________'}</p>
              </div>
            )}
          </div>
        )}
        
        <div>
          <p className="font-bold mb-2">SONUÇ VE İSTEM</p>
          <p className="mb-2">Yukarıda arz ve izah edilen nedenlerle;</p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li>Davacının iş sözleşmesini haklı nedenle feshettiğinin tespitine,</li>
            <li>Kıdem tazminatı,</li>
            <li>Ödenmeyen ücret alacakları,</li>
            <li>Fazla mesai,</li>
            <li>Yıllık izin ücreti,</li>
            <li>Ulusal bayram ve genel tatil alacaklarının,</li>
            <li>Yasal faizleriyle birlikte davalıdan tahsiline,</li>
            <li>Yargılama giderleri ve vekâlet ücretinin davalıya yükletilmesine</li>
          </ul>
          <p>karar verilmesini saygıyla arz ve talep ederim.</p>
        </div>
        
        <div className="mt-8 space-y-2">
          <p>Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
          <div className="mt-4">
            <p className="font-bold">Davacı</p>
            <p className="mt-2">{formData.davaciAd || '___________________'}</p>
            <div className="mt-4">
              <p className="border-t pt-2 inline-block">İmza</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UnjustTerminationCompensationPreview = ({
  formData,
}: {
  formData: ContractFormData;
}) => {
  const iseGiris = formData.iseGirisTarihi ? formatDate(formData.iseGirisTarihi) : '___________________';
  const istenCikarilma = formData.istenCikarilmaTarihi ? formatDate(formData.istenCikarilmaTarihi) : '___________________';
  const fesihTarihi = formData.fesihTarihi ? formatDate(formData.fesihTarihi) : '___________________';
  const arabuluculukBasvuru = formData.arabuluculukBasvuruTarihi ? formatDate(formData.arabuluculukBasvuruTarihi) : '___________________';
  const sonTutanak = formData.sonTutanakTarihi ? formatDate(formData.sonTutanakTarihi) : '___________________';
  
  return (
    <div className="p-8 space-y-6 text-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{formData.mahkemeAdi ? `${formData.mahkemeAdi.toUpperCase()} İŞ MAHKEMESİ'NE` : "İŞ MAHKEMESİ'NE"}</h2>
        <p className="text-lg font-semibold mt-2">(ARABULUCULUK SONRASI)</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="font-bold mb-2">DAVACI :</p>
          <p>Ad Soyad : {formData.davaciAd || '___________________'}</p>
          <p>T.C. Kimlik No : {formData.davaciTC || '___________________'}</p>
          <p>Adres : {formData.davaciAdres || '___________________'}</p>
        </div>
        
        <div>
          <p className="font-bold mb-2">DAVALI :</p>
          <p>Unvan : {formData.davaliUnvan || '___________________'}</p>
          <p>Adres : {formData.davaliAdres || '___________________'}</p>
        </div>
        
        {formData.arabulucuAd && (
          <div>
            <p className="font-bold mb-2">ARABULUCU :</p>
            <p>Ad Soyad / Sicil No : {formData.arabulucuAd}</p>
          </div>
        )}
        
        <div>
          <p className="font-bold mb-2">ARABULUCULUK BAŞVURU TARİHİ : {arabuluculukBasvuru}</p>
          <p className="font-bold mb-2">SON TUTANAK TARİHİ : {sonTutanak}</p>
          <p className="font-bold mb-2">ANLAŞMAMA HALİ : Evet</p>
        </div>
        
        <div>
          <p className="font-bold mb-2">DAVA KONUSU :</p>
          <p className="mb-2">İş sözleşmesinin işveren tarafından haksız ve geçersiz şekilde feshedilmesi nedeniyle;</p>
          <ul className="list-none space-y-1 ml-4">
            {formData.kidemTazminati && <li>☑ Kıdem tazminatı</li>}
            {formData.ihbarTazminati && <li>☑ İhbar tazminatı</li>}
            {formData.odenmeyenUcretAlacaklari && <li>☑ Ödenmeyen ücret alacakları</li>}
          </ul>
          <p className="mt-2">(alacakların yasal faiziyle birlikte) tahsili istemidir.</p>
        </div>
        
        <div>
          <p className="font-bold mb-2">AÇIKLAMALAR</p>
          <div className="space-y-3">
            <div>
              <p className="font-semibold mb-1">1. ÇALIŞMA BİLGİLERİ</p>
              <p className="mb-2">Davacı, davalıya ait işyerinde;</p>
              <p>İşe giriş tarihi: {iseGiris}</p>
              <p>İşten çıkarılma tarihi: {istenCikarilma}</p>
              <p>Görevi: {formData.gorev || '___________________'}</p>
              <p>Aylık brüt ücreti: {formData.aylikBrutUcret || '___________________'} TL</p>
              <p>şeklinde çalışmıştır.</p>
            </div>
            
            <div>
              <p className="font-semibold mb-1">2. FESİH OLAYI</p>
              <p className="mb-2">Davacının iş sözleşmesi;</p>
              <ul className="list-none space-y-1 ml-4">
                {formData.yaziliBildirimYapilmadan && <li>☐ Yazılı bildirim yapılmadan</li>}
                {formData.gecerliSebepGosterilmeden && <li>☐ Geçerli bir sebep gösterilmeden</li>}
                {formData.savunmasiAlinmadan && <li>☐ Savunması alınmadan</li>}
              </ul>
              <p className="mt-2">{fesihTarihi} tarihinde işveren tarafından tek taraflı olarak feshedilmiştir.</p>
              <p>Fesih bildirimi gerekçesiz / soyut / gerçeğe aykırıdır.</p>
            </div>
            
            {formData.fesihGerekcesi && (
              <div>
                <p className="font-semibold mb-1">3. FESHİN HAKSIZ VE GEÇERSİZ OLMASI</p>
                <p className="mb-2">Davalı işveren tarafından ileri sürülen fesih gerekçesi:</p>
                <p className="mb-2 italic">{formData.fesihGerekcesi}</p>
                <p className="mb-2">Ancak bu gerekçe;</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Gerçeği yansıtmamaktadır</li>
                  <li>Somut delile dayanmamaktadır</li>
                  <li>İş Kanunu'na aykırıdır</li>
                </ul>
                <p className="mt-2">Bu nedenle fesih haksızdır.</p>
              </div>
            )}
            
            <div>
              <p className="font-semibold mb-1">4. TAZMİNAT HAKLARI</p>
              {formData.kidemTazminati && (
                <div className="mb-2">
                  <p className="font-medium">🔹 KIDEM TAZMİNATI</p>
                  <p>Davacı, {formData.calismaYili || '___'} yıl {formData.calismaAyi || '___'} ay çalışmış olup, haklı bir sebep olmaksızın işten çıkarıldığından kıdem tazminatına hak kazanmıştır.</p>
                </div>
              )}
              {formData.ihbarTazminati && (
                <div className="mb-2">
                  <p className="font-medium">🔹 İHBAR TAZMİNATI</p>
                  <p>Davacıya ihbar süresi {formData.ihbarSuresiTaninmamis ? 'tanınmamış' : formData.ihbarSuresiEksikTaninmis ? 'eksik tanınmıştır' : 'tanınmamış'} / eksik tanınmıştır.</p>
                  <p>Bu nedenle ihbar tazminatı talep edilmektedir.</p>
                </div>
              )}
              {formData.odenmeyenUcretAlacaklari && (
                <div className="mb-2">
                  <p className="font-medium">🔹 ÜCRET ALACAKLARI</p>
                  <p>Davacıya ait;</p>
                  {formData.odenmeyenUcretAylari ? (
                    <p>{formData.odenmeyenUcretAylari} ayına ait ücret ödenmemiştir.</p>
                  ) : (
                    <>
                      <p>___________________ ayına ait ücret</p>
                      <p>___________________ ayına ait ücret</p>
                      <p>ödenmemiştir.</p>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <p className="font-semibold mb-1">5. ARABULUCULUK SÜRECİ</p>
              <p>Davacı, dava şartı olan zorunlu arabuluculuğa başvurmuş, ancak anlaşma sağlanamamıştır.</p>
            </div>
          </div>
        </div>
        
        <div>
          <p className="font-bold mb-2">HUKUKİ NEDENLER</p>
          <ul className="list-disc list-inside space-y-1">
            <li>4857 sayılı İş Kanunu</li>
            <li>6098 sayılı Türk Borçlar Kanunu</li>
            <li>7036 sayılı İş Mahkemeleri Kanunu</li>
            <li>6100 sayılı HMK</li>
            <li>Yargıtay içtihatları ve ilgili mevzuat</li>
          </ul>
        </div>
        
        <div>
          <p className="font-bold mb-2">DELİLLER</p>
          <ul className="list-disc list-inside space-y-1">
            <li>İş sözleşmesi</li>
            <li>SGK hizmet dökümü</li>
            <li>Ücret bordroları</li>
            <li>Banka kayıtları</li>
            <li>WhatsApp / e-posta yazışmaları</li>
            <li>Tanık beyanları</li>
            <li>Arabuluculuk son tutanağı</li>
            <li>Bilirkişi incelemesi</li>
            <li>Her türlü yasal delil</li>
          </ul>
        </div>
        
        {(formData.tanik1Ad || formData.tanik2Ad) && (
          <div>
            <p className="font-bold mb-2">TANIK LİSTESİ</p>
            {formData.tanik1Ad && (
              <div className="mb-4">
                <p className="font-semibold mb-1">Tanık 1</p>
                <p>Ad Soyad: {formData.tanik1Ad}</p>
                <p>Çalıştığı/çalışmış olduğu yer: {formData.tanik1CalistigiYer || '___________________'}</p>
                <p className="mt-1">Bildiği hususlar:</p>
                <ul className="list-disc list-inside ml-4">
                  {formData.tanik1UcretOdenmemesi && <li>Ücret ödenmemesi</li>}
                  {formData.tanik1SigortasizCalisma && <li>Sigortasız çalışma</li>}
                  {formData.tanik1Mobbing && <li>Mobbing</li>}
                  {formData.tanik1FazlaMesai && <li>Fazla mesai</li>}
                </ul>
              </div>
            )}
            {formData.tanik2Ad && (
              <div>
                <p className="font-semibold mb-1">Tanık 2</p>
                <p>Ad Soyad: {formData.tanik2Ad}</p>
                <p>Çalıştığı/çalışmış olduğu yer: {formData.tanik2CalistigiYer || '___________________'}</p>
                {formData.tanik2BildigiHususlar && (
                  <p>Bildiği hususlar: {formData.tanik2BildigiHususlar}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {(formData.sgkHicSigortaYok || formData.sgkEksikGunVar || formData.sgkDusukUcretBildirimi || formData.sgkTamAmaGecBildirim || formData.sgkGirisTarihi || formData.sgkCikisTarihi) && (
          <div>
            <p className="font-bold mb-2">e-DEVLET SGK DÖKÜMÜNE GÖRE UYARLAMA</p>
            <p className="mb-2">Aşağıdakilerden hangisi doğruysa işaretle veya yaz:</p>
            <ul className="list-none space-y-1 mb-2">
              {formData.sgkHicSigortaYok && <li>☑ Hiç sigorta yok</li>}
              {formData.sgkEksikGunVar && <li>☑ Eksik gün var</li>}
              {formData.sgkDusukUcretBildirimi && <li>☑ Düşük ücret bildirimi var</li>}
              {formData.sgkTamAmaGecBildirim && <li>☑ Tam ama geç bildirim var</li>}
            </ul>
            {(formData.sgkGirisTarihi || formData.sgkCikisTarihi) && (
              <div className="mt-2">
                <p>SGK'da görünen işe giriş tarihi: {formData.sgkGirisTarihi ? formatDate(formData.sgkGirisTarihi) : '___________________'}</p>
                <p>SGK'da görünen işten çıkış tarihi: {formData.sgkCikisTarihi ? formatDate(formData.sgkCikisTarihi) : '___________________'}</p>
              </div>
            )}
          </div>
        )}
        
        <div>
          <p className="font-bold mb-2">SONUÇ VE İSTEM</p>
          <p className="mb-2">Yukarıda arz edilen nedenlerle;</p>
          <ul className="list-disc list-inside space-y-1 mb-2">
            <li>İş sözleşmesinin işveren tarafından haksız şekilde feshedildiğinin tespitine,</li>
            <li>Davacının kıdem tazminatının,</li>
            <li>İhbar tazminatının,</li>
            <li>Ödenmeyen ücret alacaklarının,</li>
            <li>Tüm alacakların fesih tarihinden itibaren yasal faiziyle,</li>
            <li>Yargılama giderleri ve vekâlet ücretinin davalıya yükletilmesine</li>
          </ul>
          <p>karar verilmesini saygıyla arz ve talep ederim.</p>
        </div>
        
        <div className="mt-8 space-y-2">
          <p>Tarih : {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
          <div className="mt-4">
            <p className="font-bold">Davacı</p>
            <p className="mt-2">{formData.davaciAd || '___________________'}</p>
            <div className="mt-4">
              <p className="border-t pt-2 inline-block">İmza</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HousingTransferPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KONUT KİRA SÖZLEŞMESİ DEVİR PROTOKOLÜ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>ESKİ KİRACI:</strong> {formData.eskiKiracıAd || '___________________'}</p>
      {formData.eskiKiracıTC && <p className="text-sm">TC: {formData.eskiKiracıTC}</p>}
      {formData.eskiKiracıAdres && <p className="text-sm">Adres: {formData.eskiKiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>YENİ KİRACI:</strong> {formData.yeniKiracıAd || '___________________'}</p>
      {formData.yeniKiracıTC && <p className="text-sm">TC: {formData.yeniKiracıTC}</p>}
      {formData.yeniKiracıAdres && <p className="text-sm">Adres: {formData.yeniKiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KONUT ADRESİ:</strong> {formData.konutAdresi || '___________________'}</p>
      {formData.daireNo && <p className="text-sm">Daire No: {formData.daireNo}</p>}
    </div>
    <div className="mb-6">
      <p><strong>Devir Tarihi:</strong> {formData.devirTarihi ? formatDate(formData.devirTarihi) : '___________________'}</p>
      <p><strong>Eski Kira Sözleşmesi Tarihi:</strong> {formData.eskiKiraSozlesmesiTarihi ? formatDate(formData.eskiKiraSozlesmesiTarihi) : '___________________'}</p>
      <p><strong>Aylık Kira Bedeli:</strong> {formData.aylikKiraBedeli ? formatCurrency(formData.aylikKiraBedeli) : '___________________'}</p>
      <p><strong>Depozito:</strong> {formData.depozito ? formatCurrency(formData.depozito) : '___________________'}</p>
    </div>
    <div className="mt-8 grid grid-cols-3 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">ESKİ KİRACI</p>
        <p className="mb-8">{formData.eskiKiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">YENİ KİRACI</p>
        <p className="mb-8">{formData.yeniKiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
        <p className="mb-8">{formData.kirayaVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const SubleaseApprovalPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">EV SAHİBİNİN ALT KİRA SÖZLEŞMESİNİ ONAY MEKTUBU</h1>
    </div>
    <div className="mb-6">
      <p className="mb-4">Sayın {formData.kiracıAd || '___________________'},</p>
      <p className="mb-4">
        {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'} tarihli kira sözleşmemiz kapsamında, sizin tarafınızdan {formData.altKiracıAd || '___________________'} adlı kişiye yapılan alt kira sözleşmesini onaylıyorum.
      </p>
      <p className="mb-4">
        Bu onay, Türk Borçlar Kanunu'nun 347. maddesi uyarınca verilmekte olup, alt kira sözleşmesinin geçerliliği için gereklidir.
      </p>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>ALT KİRACI:</strong> {formData.altKiracıAd || '___________________'}</p>
      {formData.altKiracıTC && <p className="text-sm">TC: {formData.altKiracıTC}</p>}
    </div>
    <div className="mb-6">
      <p><strong>Konut Adresi:</strong> {formData.konutAdresi || '___________________'}</p>
      <p><strong>Aylık Kira Bedeli:</strong> {formData.aylikKiraBedeli ? formatCurrency(formData.aylikKiraBedeli) : '___________________'}</p>
      <p><strong>Alt Kira Bedeli:</strong> {formData.altKiraBedeli ? formatCurrency(formData.altKiraBedeli) : '___________________'}</p>
    </div>
    <div className="mt-8">
      <p className="mb-4">Saygılarımla,</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kirayaVerenAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const EvictionPetitionPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">TAHLİYE DAVA DİLEKÇESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>DAVACI:</strong> {formData.davacıAd || '___________________'}</p>
      {formData.davacıTC && <p className="text-sm">TC: {formData.davacıTC}</p>}
      {formData.davacıAdres && <p className="text-sm">Adres: {formData.davacıAdres}</p>}
      {formData.davacıVekilAd && <p className="text-sm">Vekil: {formData.davacıVekilAd} {formData.davacıVekilBaroNo && `(Baro Sicil No: ${formData.davacıVekilBaroNo})`}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>DAVALI:</strong> {formData.davalıAd || '___________________'}</p>
      {formData.davalıTC && <p className="text-sm">TC: {formData.davalıTC}</p>}
      {formData.davalıAdres && <p className="text-sm">Adres: {formData.davalıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KONUT ADRESİ:</strong> {formData.konutAdresi || '___________________'}</p>
      <p className="text-sm">Kira Sözleşmesi Tarihi: {formData.kiraSozlesmesiTarihi ? formatDate(formData.kiraSozlesmesiTarihi) : '___________________'}</p>
      <p className="text-sm">Aylık Kira Bedeli: {formData.aylikKiraBedeli ? formatCurrency(formData.aylikKiraBedeli) : '___________________'}</p>
    </div>
    <div className="mb-6">
      <p className="mb-4"><strong>İSTEM:</strong></p>
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı davalının {formData.konutAdresi || '___________________'} adresindeki konuttan tahliyesine karar verilmesini talep ederim.
      </p>
      <p className="mb-4"><strong>SEBEP:</strong></p>
      <p className="mb-4">
        {formData.tahliyeSebebi === 'ihtiyaç' && 'Davalı ile aramızda mevcut kira sözleşmesi kapsamında, yukarıda adresi belirtilen konuta kendi ihtiyacım için ihtiyaç duymaktayım. Türk Borçlar Kanunu\'nun 350. maddesi uyarınca, konutun tahliyesi için dava açma hakkım doğmuştur.'}
        {formData.tahliyeSebebi === 'bakım' && 'Davalı ile aramızda mevcut kira sözleşmesi kapsamında, yukarıda adresi belirtilen konutun bakım ve onarımı için tahliye edilmesi gerekmektedir. Türk Borçlar Kanunu\'nun 350. maddesi uyarınca, konutun tahliyesi için dava açma hakkım doğmuştur.'}
        {formData.tahliyeSebebi === 'sözleşme ihlali' && 'Davalı, kira sözleşmesinin şartlarını ihlal etmiş, sözleşmeye aykırı davranışlarda bulunmuştur. Bu nedenle, Türk Borçlar Kanunu\'nun 350. maddesi uyarınca, konutun tahliyesi için dava açma hakkım doğmuştur.'}
        {formData.tahliyeSebebi === 'kira ödememe' && 'Davalı, kira bedelini ödememiş, sözleşme şartlarını yerine getirmemiştir. Bu nedenle, Türk Borçlar Kanunu\'nun 350. maddesi uyarınca, konutun tahliyesi için dava açma hakkım doğmuştur.'}
      </p>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>HUKUKİ DAYANAK:</strong></p>
      <p className="text-sm mb-2">- Türk Borçlar Kanunu Madde 350</p>
      <p className="text-sm mb-2">- İcra ve İflas Kanunu</p>
      <p className="text-sm">- İlgili Yargıtay içtihatları</p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>MAHKEME:</strong> {formData.mahkemeAdı || '___________________'}</p>
      <p className="mb-4"><strong>TARİH:</strong> {formData.davaTarihi ? formatDate(formData.davaTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.davacıAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const RentDeterminationPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KİRA BEDELİNİN TESPİTİNE İLİŞKİN DAVA DİLEKÇESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>DAVACI:</strong> {formData.davacıAd || '___________________'}</p>
      {formData.davacıTC && <p className="text-sm">TC: {formData.davacıTC}</p>}
      {formData.davacıAdres && <p className="text-sm">Adres: {formData.davacıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>DAVALI:</strong> {formData.davalıAd || '___________________'}</p>
      {formData.davalıTC && <p className="text-sm">TC: {formData.davalıTC}</p>}
      {formData.davalıAdres && <p className="text-sm">Adres: {formData.davalıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4"><strong>İSTEM:</strong></p>
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı davalı ile aramızda mevcut kira sözleşmesi kapsamında, {formData.konutAdresi || '___________________'} adresindeki konutun kira bedelinin {formData.talepEdilenKiraBedeli ? formatCurrency(formData.talepEdilenKiraBedeli) : '___________________'} olarak tespit edilmesine karar verilmesini talep ederim.
      </p>
      <p className="mb-4"><strong>SEBEP:</strong></p>
      <p className="mb-4">
        Davalı ile aramızda {formData.kiraSozlesmesiTarihi ? formatDate(formData.kiraSozlesmesiTarihi) : '___________________'} tarihli kira sözleşmesi mevcuttur. Mevcut kira bedeli {formData.mevcutKiraBedeli ? formatCurrency(formData.mevcutKiraBedeli) : '___________________'} olup, piyasa koşulları ve konutun özellikleri dikkate alındığında, kira bedelinin {formData.talepEdilenKiraBedeli ? formatCurrency(formData.talepEdilenKiraBedeli) : '___________________'} olarak tespit edilmesi gerekmektedir.
      </p>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>HUKUKİ DAYANAK:</strong></p>
      <p className="text-sm mb-2">- Türk Borçlar Kanunu Madde 344</p>
      <p className="text-sm mb-2">- İlgili Yargıtay içtihatları</p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>MAHKEME:</strong> {formData.mahkemeAdı || '___________________'}</p>
      <p className="mb-4"><strong>TARİH:</strong> {formData.davaTarihi ? formatDate(formData.davaTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.davacıAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const EvictionNoticePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">TAHLİYE İHTARNAMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Sayın {formData.kiracıAd || '___________________'},
      </p>
      <p className="mb-4">
        {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin {formData.kiraSozlesmesiTarihi ? formatDate(formData.kiraSozlesmesiTarihi) : '___________________'} tarihli kira sözleşmemiz kapsamında, aşağıdaki sebeplerle konutun tahliyesini talep etmekteyim:
      </p>
      <p className="mb-4">
        {formData.tahliyeSebebi === 'ihtiyaç' && 'Konuta kendi ihtiyacım için ihtiyaç duymaktayım. Türk Borçlar Kanunu\'nun 350. maddesi uyarınca, konutun tahliyesi için ihtarname gönderme hakkım doğmuştur.'}
        {formData.tahliyeSebebi === 'bakım' && 'Konutun bakım ve onarımı için tahliye edilmesi gerekmektedir. Türk Borçlar Kanunu\'nun 350. maddesi uyarınca, konutun tahliyesi için ihtarname gönderme hakkım doğmuştur.'}
        {formData.tahliyeSebebi === 'sözleşme ihlali' && 'Kira sözleşmesinin şartlarını ihlal etmiş, sözleşmeye aykırı davranışlarda bulunmuşsunuz. Bu nedenle, Türk Borçlar Kanunu\'nun 350. maddesi uyarınca, konutun tahliyesi için ihtarname gönderme hakkım doğmuştur.'}
        {formData.tahliyeSebebi === 'kira ödememe' && 'Kira bedelini ödememiş, sözleşme şartlarını yerine getirmemişsiniz. Bu nedenle, Türk Borçlar Kanunu\'nun 350. maddesi uyarınca, konutun tahliyesi için ihtarname gönderme hakkım doğmuştur.'}
      </p>
      <p className="mb-4">
        Bu ihtarname ile, {formData.tahliyeTarihi ? formatDate(formData.tahliyeTarihi) : '15 (on beş) gün içinde'} konutun tahliyesini talep ediyorum. Aksi takdirde, yasal yollara başvurma hakkımı saklı tutarım.
      </p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>TARİH:</strong> {formData.ihtarnameTarihi ? formatDate(formData.ihtarnameTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kirayaVerenAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const RentIncreaseNoticePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KİRA BEDELİNİN ARTIRILMASI İÇİN İHTARNAME</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Sayın {formData.kiracıAd || '___________________'},
      </p>
      <p className="mb-4">
        {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin kira sözleşmemiz kapsamında, kira bedelinin artırılması gerekmektedir.
      </p>
      <p className="mb-4">
        Mevcut kira bedeli {formData.mevcutKiraBedeli ? formatCurrency(formData.mevcutKiraBedeli) : '___________________'} olup, {formData.artisSebebi === 'TÜFE' ? 'TÜFE artışı' : formData.artisSebebi === 'piyasa' ? 'piyasa koşulları' : 'sözleşme şartları'} dikkate alındığında, yeni kira bedeli {formData.yeniKiraBedeli ? formatCurrency(formData.yeniKiraBedeli) : '___________________'} olarak belirlenmiştir.
      </p>
      {formData.artisOrani && <p className="mb-4">Artış oranı: %{formData.artisOrani}</p>}
      <p className="mb-4">
        Bu ihtarname ile, {formData.gecerlilikTarihi ? formatDate(formData.gecerlilikTarihi) : 'gelecek ay başından itibaren'} yeni kira bedelinin geçerli olacağını bildiririm.
      </p>
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 344. maddesi uyarınca, kira bedelinin artırılması için ihtarname gönderme hakkım doğmuştur.
      </p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>TARİH:</strong> {formData.ihtarnameTarihi ? formatDate(formData.ihtarnameTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kirayaVerenAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const RentReceiptPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KİRA ÖDEME BELGESİ</h1>
      {formData.belgeNo && <p className="text-sm">Belge No: {formData.belgeNo}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KONUT ADRESİ:</strong> {formData.konutAdresi || '___________________'}</p>
    </div>
    <div className="mb-6 border-t pt-4">
      <p className="mb-2"><strong>ÖDEME BİLGİLERİ:</strong></p>
      <p className="mb-2">Ödeme Tarihi: {formData.odemeTarihi ? formatDate(formData.odemeTarihi) : '___________________'}</p>
      <p className="mb-2">Ödeme Tutarı: {formData.odemeTutari ? formatCurrency(formData.odemeTutari) : '___________________'}</p>
      <p className="mb-2">Ödeme Şekli: {formData.odemeSekli || '___________________'}</p>
      {formData.donem && <p className="mb-2">Dönem: {formData.donem}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda belirtilen tutar, {formData.donem || 'belirtilen dönem'} için kira bedeli olarak {formData.odemeSekli || '___________________'} yoluyla ödenmiştir.
      </p>
      <p className="mb-4">
        Bu belge, ödemenin yapıldığını teyit eder.
      </p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>TARİH:</strong> {formData.odemeTarihi ? formatDate(formData.odemeTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kirayaVerenAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const RentDelayNoticePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KİRA GECİKMESİ İÇİN İHTARNAME</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Sayın {formData.kiracıAd || '___________________'},
      </p>
      <p className="mb-4">
        {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin kira sözleşmemiz kapsamında, kira bedelinin ödenmesinde gecikme meydana gelmiştir.
      </p>
      <p className="mb-4">
        Gecikmiş kira tutarı: {formData.gecikmisKiraTutari ? formatCurrency(formData.gecikmisKiraTutari) : '___________________'}
        {formData.gecikmisDonemler && ` (${formData.gecikmisDonemler})`}
      </p>
      <p className="mb-4">
        Bu ihtarname ile, {formData.odemeSuresi || '7'} gün içinde gecikmiş kira bedelinin ödenmesini talep ediyorum. Aksi takdirde, yasal yollara başvurma hakkımı saklı tutarım.
      </p>
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 350. maddesi uyarınca, kira ödemesinde gecikme halinde ihtarname gönderme hakkım doğmuştur.
      </p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>TARİH:</strong> {formData.ihtarnameTarihi ? formatDate(formData.ihtarnameTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kirayaVerenAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const DepositRefundPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KİRA DEPOZİTOSU İADE TALEBİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Sayın {formData.kirayaVerenAd || '___________________'},
      </p>
      <p className="mb-4">
        {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin kira sözleşmemiz kapsamında, {formData.depozitoTarihi ? formatDate(formData.depozitoTarihi) : '___________________'} tarihinde {formData.depozitoTutari ? formatCurrency(formData.depozitoTutari) : '___________________'} tutarında depozito ödemiş bulunmaktayım.
      </p>
      <p className="mb-4">
        {formData.tahliyeTarihi ? formatDate(formData.tahliyeTarihi) : 'Konutun tahliyesi'} sonrasında, depozito tutarının iadesini talep etmekteyim.
      </p>
      {formData.kesintiVarsa && (
        <p className="mb-4">
          Depozito tutarından {formData.kesintiTutari ? formatCurrency(formData.kesintiTutari) : '___________________'} tutarında kesinti yapılması gerektiğini kabul ediyorum. Kesinti sebebi: {formData.kesintiSebebi || '___________________'}
        </p>
      )}
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 346. maddesi uyarınca, depozito tutarının iadesi gerekmektedir.
      </p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>TARİH:</strong> {formData.talepTarihi ? formatDate(formData.talepTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kiracıAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const TenantTerminationPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KİRACI TARAFINDAN KİRA SÖZLEŞMESİNİN SONLANDIRILMASI BİLDİRİMİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Sayın {formData.kirayaVerenAd || '___________________'},
      </p>
      <p className="mb-4">
        {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin {formData.kiraSozlesmesiTarihi ? formatDate(formData.kiraSozlesmesiTarihi) : '___________________'} tarihli kira sözleşmemizi sonlandırmak istediğimi bildiririm.
      </p>
      {formData.fesihSebebi && (
        <p className="mb-4">
          <strong>Fesih Sebebi:</strong> {formData.fesihSebebi}
        </p>
      )}
      <p className="mb-4">
        {formData.fesihTarihi ? formatDate(formData.fesihTarihi) : 'Belirtilen tarih'} itibariyle kira sözleşmesinin feshedildiğini kabul ediyorum. {formData.tahliyeTarihi ? formatDate(formData.tahliyeTarihi) : 'Uygun bir tarihte'} konutun tahliyesini gerçekleştireceğim.
      </p>
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 347. maddesi uyarınca, kiracı tarafından kira sözleşmesinin feshi için bildirim yapma hakkım doğmuştur.
      </p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>TARİH:</strong> {formData.bildirimTarihi ? formatDate(formData.bildirimTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kiracıAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const RentTerminationPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KONUT KİRA SÖZLEŞMESİ FESİH PROTOKOLÜ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KONUT ADRESİ:</strong> {formData.konutAdresi || '___________________'}</p>
      <p className="text-sm">Kira Sözleşmesi Tarihi: {formData.kiraSozlesmesiTarihi ? formatDate(formData.kiraSozlesmesiTarihi) : '___________________'}</p>
      <p className="text-sm">Fesih Tarihi: {formData.fesihTarihi ? formatDate(formData.fesihTarihi) : '___________________'}</p>
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin {formData.kiraSozlesmesiTarihi ? formatDate(formData.kiraSozlesmesiTarihi) : '___________________'} tarihli kira sözleşmesini {formData.fesihTarihi ? formatDate(formData.fesihTarihi) : '___________________'} tarihi itibariyle karşılıklı olarak feshetmişlerdir.
      </p>
      {formData.fesihSebebi && (
        <p className="mb-4">
          <strong>Fesih Sebebi:</strong> {formData.fesihSebebi}
        </p>
      )}
      {formData.kalanKiraBedeli && (
        <p className="mb-4">
          Kalan kira bedeli: {formatCurrency(formData.kalanKiraBedeli)}
        </p>
      )}
      {formData.depozitoDurumu && (
        <p className="mb-4">
          Depozito durumu: {formData.depozitoDurumu}
        </p>
      )}
    </div>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
        <p className="mb-8">{formData.kirayaVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRACI</p>
        <p className="mb-8">{formData.kiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const RentRenewalPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KİRA YENİLEME SÖZLEŞMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KONUT ADRESİ:</strong> {formData.konutAdresi || '___________________'}</p>
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin {formData.eskiSozlesmeTarihi ? formatDate(formData.eskiSozlesmeTarihi) : '___________________'} tarihli kira sözleşmesini yenilemek istediklerini beyan ederler.
      </p>
      <p className="mb-4">
        <strong>YENİ SÖZLEŞME ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Yeni sözleşme tarihi: {formData.yeniSozlesmeTarihi ? formatDate(formData.yeniSozlesmeTarihi) : '___________________'}</p>
      <p className="mb-2">- Yeni kira bedeli: {formData.yeniKiraBedeli ? formatCurrency(formData.yeniKiraBedeli) : '___________________'}</p>
      {formData.yeniSozlesmeSuresi && <p className="mb-2">- Sözleşme süresi: {formData.yeniSozlesmeSuresi}</p>}
      <p className="mb-4">
        Eski sözleşmenin diğer şartları aynen geçerlidir.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
        <p className="mb-8">{formData.kirayaVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRACI</p>
        <p className="mb-8">{formData.kiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const SubleasePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">ALT KİRA ANLAŞMASI</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>ALT KİRACI:</strong> {formData.altKiracıAd || '___________________'}</p>
      {formData.altKiracıTC && <p className="text-sm">TC: {formData.altKiracıTC}</p>}
      {formData.altKiracıAdres && <p className="text-sm">Adres: {formData.altKiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KONUT ADRESİ:</strong> {formData.konutAdresi || '___________________'}</p>
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin alt kira anlaşması yapmışlardır.
      </p>
      <p className="mb-4">
        <strong>ANLAŞMA ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
      <p className="mb-2">- Alt kira bedeli: {formData.altKiraBedeli ? formatCurrency(formData.altKiraBedeli) : '___________________'}</p>
      {formData.sozlesmeSuresi && <p className="mb-2">- Sözleşme süresi: {formData.sozlesmeSuresi}</p>}
      <p className="mb-4">
        Bu anlaşma, Türk Borçlar Kanunu'nun 347. maddesi uyarınca, kiraya verenin onayı ile yapılmıştır.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-3 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
        <p className="mb-8">{formData.kirayaVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRACI</p>
        <p className="mb-8">{formData.kiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">ALT KİRACI</p>
        <p className="mb-8">{formData.altKiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const RentIncreaseObjectionPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">HAKSIZ KİRA ARTIRAN EV SAHİBİNE İTİRAZ MEKTUBU</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Sayın {formData.kirayaVerenAd || '___________________'},
      </p>
      <p className="mb-4">
        {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin kira sözleşmemiz kapsamında, kira bedelinin {formData.mevcutKiraBedeli ? formatCurrency(formData.mevcutKiraBedeli) : '___________________'} tutarından {formData.talepEdilenKiraBedeli ? formatCurrency(formData.talepEdilenKiraBedeli) : '___________________'} tutarına artırılması talebinize itiraz etmekteyim.
      </p>
      <p className="mb-4">
        <strong>İTİRAZ SEBEBİ:</strong>
      </p>
      <p className="mb-4">
        {formData.itirazSebebi || '___________________'}
      </p>
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 344. maddesi uyarınca, kira bedelinin artırılması için makul bir sebep bulunmamaktadır. Bu nedenle, kira artış talebinizi kabul etmiyorum.
      </p>
      <p className="mb-4">
        Aksi takdirde, yasal yollara başvurma hakkımı saklı tutarım.
      </p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>TARİH:</strong> {formData.itirazTarihi ? formatDate(formData.itirazTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kiracıAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const RenovationRequestPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KİRACININ KİRALANAN KONUTTA YENİLİK VEYA DEĞİŞİKLİK YAPILMASI TALEBİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Sayın {formData.kirayaVerenAd || '___________________'},
      </p>
      <p className="mb-4">
        {formData.konutAdresi || '___________________'} adresindeki konutumuza ilişkin kira sözleşmemiz kapsamında, aşağıda belirtilen tadilatın yapılmasını talep etmekteyim.
      </p>
      <p className="mb-4">
        <strong>TADİLAT KONUSU:</strong>
      </p>
      <p className="mb-4">
        {formData.tadilatKonusu || '___________________'}
      </p>
      <p className="mb-4">
        <strong>TADİLAT SEBEBİ:</strong>
      </p>
      <p className="mb-4">
        {formData.tadilatSebebi || '___________________'}
      </p>
      {formData.tahminiMaliyet && (
        <p className="mb-4">
          Tahmini maliyet: {formatCurrency(formData.tahminiMaliyet)}
        </p>
      )}
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 345. maddesi uyarınca, kiracının kiralanan konutta yenilik veya değişiklik yapılması için kiraya verenin izni gerekmektedir.
      </p>
    </div>
    <div className="mt-8">
      <p className="mb-2"><strong>TARİH:</strong> {formData.talepTarihi ? formatDate(formData.talepTarihi) : '___________________'}</p>
      <p className="font-semibold mb-8 border-t pt-2">{formData.kiracıAd || '___________________'}</p>
      <p className="text-xs border-t pt-2">İmza</p>
    </div>
  </div>
);

const FurnishedHousingPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">EŞYALI KONUT KİRA SÖZLEŞMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KONUT ADRESİ:</strong> {formData.konutAdresi || '___________________'}</p>
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, {formData.konutAdresi || '___________________'} adresindeki eşyalı konutumuza ilişkin kira sözleşmesi yapmışlardır.
      </p>
      <p className="mb-4">
        <strong>SÖZLEŞME ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
      <p className="mb-2">- Aylık kira bedeli: {formData.aylikKiraBedeli ? formatCurrency(formData.aylikKiraBedeli) : '___________________'}</p>
      {formData.depozito && <p className="mb-2">- Depozito: {formatCurrency(formData.depozito)}</p>}
      {formData.sozlesmeSuresi && <p className="mb-2">- Sözleşme süresi: {formData.sozlesmeSuresi}</p>}
      <p className="mb-4">
        <strong>KONUTTA BULUNAN EŞYALAR:</strong>
      </p>
      <p className="mb-4 whitespace-pre-line">{formData.esyalarListesi || '___________________'}</p>
      <p className="mb-4">
        Kiracı, eşyaları özenle kullanacak ve zarar görmesi halinde tazmin edecektir.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
        <p className="mb-8">{formData.kirayaVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRACI</p>
        <p className="mb-8">{formData.kiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const ConstructionAgreementPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">KAT KARŞILIĞI BİNA YAPIM SÖZLEŞMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>ARSA SAHİBİ:</strong> {formData.arsaSahibiAd || '___________________'}</p>
      {formData.arsaSahibiTC && <p className="text-sm">TC: {formData.arsaSahibiTC}</p>}
      {formData.arsaSahibiAdres && <p className="text-sm">Adres: {formData.arsaSahibiAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>YAPIMCI:</strong> {formData.yapimciAd || '___________________'}</p>
      {formData.yapimciTC && <p className="text-sm">TC/Vergi No: {formData.yapimciTC}</p>}
      {formData.yapimciAdres && <p className="text-sm">Adres: {formData.yapimciAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>ARSA ADRESİ:</strong> {formData.arsaAdresi || '___________________'}</p>
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, {formData.arsaAdresi || '___________________'} adresindeki arsa üzerinde kat karşılığı bina yapım sözleşmesi yapmışlardır.
      </p>
      <p className="mb-4">
        <strong>SÖZLEŞME ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
      {formData.bitisTarihi && <p className="mb-2">- Bitiş tarihi: {formatDate(formData.bitisTarihi)}</p>}
      {formData.katSayisi && <p className="mb-2">- Kat sayısı: {formData.katSayisi}</p>}
      {formData.daireSayisi && <p className="mb-2">- Daire sayısı: {formData.daireSayisi}</p>}
      {formData.arsaSahibineVerilecekKat && <p className="mb-2">- Arsa sahibine verilecek kat: {formData.arsaSahibineVerilecekKat}</p>}
      {formData.yapimciyaVerilecekKat && <p className="mb-2">- Yapımcıya verilecek kat: {formData.yapimciyaVerilecekKat}</p>}
      {formData.tahminiMaliyet && <p className="mb-2">- Tahmini maliyet: {formatCurrency(formData.tahminiMaliyet)}</p>}
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 480-520. maddeleri uyarınca, kat karşılığı bina yapım sözleşmesi yapılmıştır.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">ARSA SAHİBİ</p>
        <p className="mb-8">{formData.arsaSahibiAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">YAPIMCI</p>
        <p className="mb-8">{formData.yapimciAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const CommercialPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
        <p className="mb-8">{formData.kirayaVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRACI</p>
        <p className="mb-8">{formData.kiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const VehiclePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">ARAÇ KİRALAMA SÖZLEŞMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>ARAÇ BİLGİLERİ:</strong></p>
      <p className="text-sm">Marka: {formData.aracMarka || '___________________'}</p>
      {formData.aracModel && <p className="text-sm">Model: {formData.aracModel}</p>}
      <p className="text-sm">Plaka: {formData.aracPlaka || '___________________'}</p>
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, yukarıda belirtilen araç için kira sözleşmesi yapmışlardır.
      </p>
      <p className="mb-4">
        <strong>SÖZLEŞME ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
      <p className="mb-2">- Günlük kira bedeli: {formData.gunlukKiraBedeli ? formatCurrency(formData.gunlukKiraBedeli) : '___________________'}</p>
      {formData.depozito && <p className="mb-2">- Depozito: {formatCurrency(formData.depozito)}</p>}
      {formData.sozlesmeSuresi && <p className="mb-2">- Sözleşme süresi: {formData.sozlesmeSuresi}</p>}
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 306-350. maddeleri uyarınca, araç kiralama sözleşmesi yapılmıştır.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
        <p className="mb-8">{formData.kirayaVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRACI</p>
        <p className="mb-8">{formData.kiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const WarehousePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">DEPO KİRALAMA SÖZLEŞMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}</p>
      {formData.kirayaVerenTC && <p className="text-sm">TC/Vergi No: {formData.kirayaVerenTC}</p>}
      {formData.kirayaVerenAdres && <p className="text-sm">Adres: {formData.kirayaVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}</p>
      {formData.kiracıTC && <p className="text-sm">TC/Vergi No: {formData.kiracıTC}</p>}
      {formData.kiracıAdres && <p className="text-sm">Adres: {formData.kiracıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>DEPO ADRESİ:</strong> {formData.depoAdresi || '___________________'}</p>
      {formData.depoMetrekare && <p className="text-sm">Metrekare: {formData.depoMetrekare}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, {formData.depoAdresi || '___________________'} adresindeki depoya ilişkin kira sözleşmesi yapmışlardır.
      </p>
      <p className="mb-4">
        <strong>SÖZLEŞME ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
      <p className="mb-2">- Aylık kira bedeli: {formData.aylikKiraBedeli ? formatCurrency(formData.aylikKiraBedeli) : '___________________'}</p>
      {formData.depozito && <p className="mb-2">- Depozito: {formatCurrency(formData.depozito)}</p>}
      {formData.sozlesmeSuresi && <p className="mb-2">- Sözleşme süresi: {formData.sozlesmeSuresi}</p>}
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 306-350. maddeleri uyarınca, depo kiralama sözleşmesi yapılmıştır.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
        <p className="mb-8">{formData.kirayaVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">KİRACI</p>
        <p className="mb-8">{formData.kiracıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const SalePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">SATIŞ SÖZLEŞMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>SATICI:</strong> {formData.satıcıAd || '___________________'}</p>
      {formData.satıcıTC && <p className="text-sm">TC/Vergi No: {formData.satıcıTC}</p>}
      {formData.satıcıAdres && <p className="text-sm">Adres: {formData.satıcıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>ALICI:</strong> {formData.alıcıAd || '___________________'}</p>
      {formData.alıcıTC && <p className="text-sm">TC/Vergi No: {formData.alıcıTC}</p>}
      {formData.alıcıAdres && <p className="text-sm">Adres: {formData.alıcıAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>SATILAN MAL/GAYRİMENKUL:</strong> {formData.malAdresi || '___________________'}</p>
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, yukarıda belirtilen mal/gayrimenkulün satışı için sözleşme yapmışlardır.
      </p>
      <p className="mb-4">
        <strong>SÖZLEŞME ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
      <p className="mb-2">- Satış bedeli: {formData.satisBedeli ? formatCurrency(formData.satisBedeli) : '___________________'}</p>
      {formData.peşinTutar && <p className="mb-2">- Peşin tutar: {formatCurrency(formData.peşinTutar)}</p>}
      {formData.kalanTutar && <p className="mb-2">- Kalan tutar: {formatCurrency(formData.kalanTutar)}</p>}
      {formData.teslimTarihi && <p className="mb-2">- Teslim tarihi: {formatDate(formData.teslimTarihi)}</p>}
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 207-232. maddeleri uyarınca, satış sözleşmesi yapılmıştır.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">SATICI</p>
        <p className="mb-8">{formData.satıcıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">ALICI</p>
        <p className="mb-8">{formData.alıcıAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const ServicePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">HİZMET SÖZLEŞMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>HİZMET VEREN:</strong> {formData.hizmetVerenAd || '___________________'}</p>
      {formData.hizmetVerenTC && <p className="text-sm">TC/Vergi No: {formData.hizmetVerenTC}</p>}
      {formData.hizmetVerenAdres && <p className="text-sm">Adres: {formData.hizmetVerenAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>HİZMET ALAN:</strong> {formData.hizmetAlanAd || '___________________'}</p>
      {formData.hizmetAlanTC && <p className="text-sm">TC/Vergi No: {formData.hizmetAlanTC}</p>}
      {formData.hizmetAlanAdres && <p className="text-sm">Adres: {formData.hizmetAlanAdres}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, aşağıda belirtilen hizmet için sözleşme yapmışlardır.
      </p>
      <p className="mb-4">
        <strong>HİZMET KONUSU:</strong>
      </p>
      <p className="mb-4">
        {formData.hizmetKonusu || '___________________'}
      </p>
      <p className="mb-4">
        <strong>SÖZLEŞME ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
      <p className="mb-2">- Hizmet bedeli: {formData.hizmetBedeli ? formatCurrency(formData.hizmetBedeli) : '___________________'}</p>
      {formData.sozlesmeSuresi && <p className="mb-2">- Sözleşme süresi: {formData.sozlesmeSuresi}</p>}
      {formData.teslimTarihi && <p className="mb-2">- Teslim tarihi: {formatDate(formData.teslimTarihi)}</p>}
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 393-433. maddeleri uyarınca, hizmet sözleşmesi yapılmıştır.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">HİZMET VEREN</p>
        <p className="mb-8">{formData.hizmetVerenAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">HİZMET ALAN</p>
        <p className="mb-8">{formData.hizmetAlanAd || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
    </div>
  </div>
);

const PartnershipPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold uppercase mb-2">ORTAKLIK SÖZLEŞMESİ</h1>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>1. ORTAK:</strong> {formData.ortak1Ad || '___________________'}</p>
      {formData.ortak1TC && <p className="text-sm">TC/Vergi No: {formData.ortak1TC}</p>}
      {formData.ortak1Adres && <p className="text-sm">Adres: {formData.ortak1Adres}</p>}
      {formData.ortak1Sermaye && <p className="text-sm">Sermaye Payı: {formData.ortak1Sermaye}</p>}
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>2. ORTAK:</strong> {formData.ortak2Ad || '___________________'}</p>
      {formData.ortak2TC && <p className="text-sm">TC/Vergi No: {formData.ortak2TC}</p>}
      {formData.ortak2Adres && <p className="text-sm">Adres: {formData.ortak2Adres}</p>}
      {formData.ortak2Sermaye && <p className="text-sm">Sermaye Payı: {formData.ortak2Sermaye}</p>}
    </div>
    {formData.ortak3Ad && (
      <div className="mb-6">
        <p className="mb-2"><strong>3. ORTAK:</strong> {formData.ortak3Ad}</p>
        {formData.ortak3TC && <p className="text-sm">TC/Vergi No: {formData.ortak3TC}</p>}
        {formData.ortak3Adres && <p className="text-sm">Adres: {formData.ortak3Adres}</p>}
        {formData.ortak3Sermaye && <p className="text-sm">Sermaye Payı: {formData.ortak3Sermaye}</p>}
      </div>
    )}
    <div className="mb-6">
      <p className="mb-4">
        Yukarıda kimlik bilgileri yazılı taraflar, aşağıda belirtilen konuda ortaklık sözleşmesi yapmışlardır.
      </p>
      <p className="mb-4">
        <strong>ORTAKLIK KONUSU:</strong>
      </p>
      <p className="mb-4">
        {formData.ortaklikKonusu || '___________________'}
      </p>
      <p className="mb-4">
        <strong>SÖZLEŞME ŞARTLARI:</strong>
      </p>
      <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
      {formData.karPaylasimi && <p className="mb-2">- Kar paylaşımı: {formData.karPaylasimi}</p>}
      <p className="mb-4">
        Türk Borçlar Kanunu'nun 620-644. maddeleri uyarınca, ortaklık sözleşmesi yapılmıştır.
      </p>
    </div>
    <div className="mt-8 grid grid-cols-3 gap-8">
      <div>
        <p className="font-semibold mb-4 border-t pt-2">1. ORTAK</p>
        <p className="mb-8">{formData.ortak1Ad || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      <div>
        <p className="font-semibold mb-4 border-t pt-2">2. ORTAK</p>
        <p className="mb-8">{formData.ortak2Ad || '___________________'}</p>
        <p className="text-xs border-t pt-2">İmza</p>
      </div>
      {formData.ortak3Ad && (
        <div>
          <p className="font-semibold mb-4 border-t pt-2">3. ORTAK</p>
          <p className="mb-8">{formData.ortak3Ad}</p>
          <p className="text-xs border-t pt-2">İmza</p>
        </div>
      )}
    </div>
  </div>
);

const ParentConsentPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="p-8 text-sm leading-relaxed">
    <h1 className="text-xl font-bold text-center mb-6">VELİ İZİN BELGESİ</h1>
    <p className="mb-4">Ben, aşağıda kimlik bilgileri belirtilen veli,</p>
    <div className="mb-4 pl-4 border-l-2">
      <p><strong>Ad Soyad:</strong> {formData.veliAd || '___________________'}</p>
      {formData.veliTC && <p><strong>TC Kimlik No:</strong> {formData.veliTC}</p>}
      {formData.veliAdres && <p><strong>Adres:</strong> {formData.veliAdres}</p>}
    </div>
    <p className="mb-4">Çocuğum/vasisi olduğum,</p>
    <div className="mb-4 pl-4 border-l-2">
      <p><strong>Öğrenci Ad Soyad:</strong> {formData.ogrenciAd || '___________________'}</p>
      {formData.ogrenciTC && <p><strong>TC Kimlik No:</strong> {formData.ogrenciTC}</p>}
      {formData.okulAdi && <p><strong>Okul:</strong> {formData.okulAdi}</p>}
    </div>
    <p className="mb-4">hakkında aşağıdaki konuda izin veriyorum:</p>
    <div className="mb-6 p-4 bg-gray-50 rounded">
      <p>{formData.izinKonusu || '___________________'}</p>
    </div>
    <p className="mb-4">Bu izin belgesi {formData.izinTarihi ? formatDate(formData.izinTarihi) : '___________________'} tarihinde düzenlenmiştir.</p>
    <div className="mt-8 text-right">
      <p className="mb-2">Veli</p>
      <p className="border-t pt-2 inline-block">{formData.veliAd || '___________________'}</p>
    </div>
  </div>
);

const DivorceAgreementPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="p-8 text-sm leading-relaxed">
    <h1 className="text-xl font-bold text-center mb-6">ANLAŞMALI BOŞANMA SÖZLEŞMESİ</h1>
    <p className="mb-4">Bu sözleşme, aşağıda kimlik bilgileri belirtilen taraflar arasında düzenlenmiştir:</p>
    <div className="mb-6 space-y-4">
      <div className="pl-4 border-l-2">
        <p className="font-semibold mb-2">EŞ 1:</p>
        <p><strong>Ad Soyad:</strong> {formData.esAd || '___________________'}</p>
        {formData.esTC && <p><strong>TC Kimlik No:</strong> {formData.esTC}</p>}
        {formData.esAdres && <p><strong>Adres:</strong> {formData.esAdres}</p>}
      </div>
      <div className="pl-4 border-l-2">
        <p className="font-semibold mb-2">EŞ 2:</p>
        <p><strong>Ad Soyad:</strong> {formData.es2Ad || '___________________'}</p>
        {formData.es2TC && <p><strong>TC Kimlik No:</strong> {formData.es2TC}</p>}
        {formData.es2Adres && <p><strong>Adres:</strong> {formData.es2Adres}</p>}
      </div>
    </div>
    <div className="mb-6">
      <p className="mb-2"><strong>Evlilik Tarihi:</strong> {formData.evlilikTarihi ? formatDate(formData.evlilikTarihi) : '___________________'}</p>
      <p className="mb-2"><strong>Boşanma Tarihi:</strong> {formData.bosanmaTarihi ? formatDate(formData.bosanmaTarihi) : '___________________'}</p>
    </div>
    {formData.velayet && (
      <div className="mb-6">
        <h3 className="font-semibold mb-2">VELAYET DÜZENLEMESİ</h3>
        <p className="pl-4 border-l-2">{formData.velayet}</p>
      </div>
    )}
    {formData.nafaka && (
      <div className="mb-6">
        <h3 className="font-semibold mb-2">NAFAKA DÜZENLEMESİ</h3>
        <p className="pl-4 border-l-2">{formData.nafaka}</p>
      </div>
    )}
    {formData.malPaylasimi && (
      <div className="mb-6">
        <h3 className="font-semibold mb-2">MAL PAYLAŞIMI</h3>
        <p className="pl-4 border-l-2">{formData.malPaylasimi}</p>
      </div>
    )}
    <div className="mt-8 grid grid-cols-2 gap-8">
      <div className="text-center">
        <p className="mb-2">Eş 1</p>
        <p className="border-t pt-2">{formData.esAd || '___________________'}</p>
      </div>
      <div className="text-center">
        <p className="mb-2">Eş 2</p>
        <p className="border-t pt-2">{formData.es2Ad || '___________________'}</p>
      </div>
    </div>
  </div>
);

const PostBirthHalfDayUnpaidLeavePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="p-8 space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold mb-2">Doğum Sonrası Yarım Gün Ücretsiz İzin Talebi Mektubu</h2>
    </div>
    
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Sayın <strong>{formData.yetkiliAd || '___________________'}</strong>,
      </p>
      
      <p className="mb-4">
        4857 sayılı İş Kanunu'nun 74. maddesi uyarınca, doğum sonrası analık iznimin bitimini takiben, çocuğumun bakımı ve sağlıklı gelişimi amacıyla tarafıma tanınan <strong>yarım gün ücretsiz izin hakkımı</strong> kullanmak istiyorum.
      </p>
      
      <p className="mb-4">
        Bu kapsamda, <strong>{formData.yarimGunBaslangic ? formatDate(formData.yarimGunBaslangic) : '___________________'}</strong> tarihinden itibaren yasal süre boyunca yarım gün ücretsiz izinli sayılmam hususunda gereğini arz ederim.
      </p>
      
      <p className="mb-4">
        Bilgilerinize sunar, gereğini rica ederim.
      </p>
      
      <p className="mb-8">
        Saygılarımla,
      </p>
    </div>
    
    <div className="mt-12 space-y-2">
      <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
      {formData.gorev && <p className="text-sm">{formData.gorev}</p>}
      {formData.departman && <p className="text-sm">{formData.departman}</p>}
      <div className="mt-4">
        <p className="text-sm border-t pt-2 inline-block">İmza</p>
      </div>
      <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
    </div>
  </div>
);

const PostBirthSixMonthUnpaidLeavePreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="p-8 space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold mb-2">Doğum Sonrası Altı Aylık Ücretsiz İzin Talebi Dilekçesi</h2>
    </div>
    
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Sayın <strong>{formData.yetkiliAd || '___________________'}</strong>,
      </p>
      
      <p className="mb-4">
        4857 sayılı İş Kanunu'nun 74. maddesi kapsamında, doğum sonrası kullanmış olduğum analık iznimin bitimini takiben, çocuğumun bakımı ve gelişimi amacıyla tarafıma tanınan <strong>altı aylık ücretsiz izin hakkımı</strong> kullanmak istiyorum.
      </p>
      
      <p className="mb-4">
        Bu doğrultuda, <strong>{formData.analikIzninBitisTarihi ? formatDate(formData.analikIzninBitisTarihi) : '___________________'}</strong> tarihinden itibaren <strong>6 (altı) ay süreyle ücretsiz izinli</strong> sayılmam hususunda gereğini arz ederim.
      </p>
      
      <p className="mb-4">
        Bilgilerinize sunar, gereğini rica ederim.
      </p>
      
      <p className="mb-8">
        Saygılarımla,
      </p>
    </div>
    
    <div className="mt-12 space-y-2">
      <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
      {formData.calisanTC && <p className="text-sm">T.C. Kimlik No: {formData.calisanTC}</p>}
      {formData.gorev && <p className="text-sm">{formData.gorev}</p>}
      {formData.departman && <p className="text-sm">{formData.departman}</p>}
      <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
      <div className="mt-4">
        <p className="text-sm border-t pt-2 inline-block">İmza</p>
      </div>
    </div>
  </div>
);

const AnnualPaidLeaveRequestPreview = ({ formData }: { formData: ContractFormData }) => {
  const izinBaslangic = formData.izinBaslangic ? formatDate(formData.izinBaslangic) : '___________________';
  const izinBitis = formData.izinBitis ? formatDate(formData.izinBitis) : '___________________';
  const toplamGun = formData.toplamGun || '___________________';
  
  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Senelik Ücretli İzin Dilekçesi</h2>
      </div>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Sayın <strong>{formData.yetkiliAd || '___________________'}</strong>,
        </p>
        
        <p className="mb-4">
          4857 sayılı İş Kanunu'nun 53. maddesi uyarınca hak etmiş olduğum <strong>yıllık ücretli iznimi</strong>, <strong>{izinBaslangic} – {izinBitis}</strong> tarihleri arasında (<strong>{toplamGun} gün</strong>) kullanmak istiyorum.
        </p>
        
        <p className="mb-4">
          İzin sürem boyunca işlerimin devri tarafımdan yapılacaktır.
        </p>
        
        <p className="mb-4">
          Gereğini bilgilerinize arz ederim.
        </p>
        
        <p className="mb-8">
          Saygılarımla,
        </p>
      </div>
      
      <div className="mt-12 space-y-2">
        <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
        {formData.gorev && <p className="text-sm">{formData.gorev}</p>}
        {formData.departman && <p className="text-sm">{formData.departman}</p>}
        <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
        <div className="mt-4">
          <p className="text-sm border-t pt-2 inline-block">İmza</p>
        </div>
      </div>
    </div>
  );
};

const MaternityLeaveRequestPreview = ({ formData }: { formData: ContractFormData }) => (
  <div className="p-8 space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold mb-2">Analık (Doğum) İzni Dilekçesi</h2>
    </div>
    
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Sayın <strong>{formData.yetkiliAd || '___________________'}</strong>,
      </p>
      
      <p className="mb-4">
        4857 sayılı İş Kanunu'nun 74. maddesi uyarınca, beklenen doğum tarihim <strong>{formData.tahminiDogumTarihi ? formatDate(formData.tahminiDogumTarihi) : '___________________'}</strong> olup, doğumdan önceki <strong>8 (sekiz) haftalık</strong> analık iznimin <strong>{formData.izinBaslangic ? formatDate(formData.izinBaslangic) : '___________________'}</strong> itibarıyla başlatılmasını arz ederim.
      </p>
      
      <p className="mb-4">
        Doğumun gerçekleşmesi halinde, doğum sonrası <strong>8 (sekiz) haftalık</strong> analık iznimin de yasal süreler çerçevesinde kullandırılmasını talep ederim.
      </p>
      
      <p className="mb-4">
        Gereğini bilgilerinize arz ederim.
      </p>
      
      <p className="mb-8">
        Saygılarımla,
      </p>
    </div>
    
    <div className="mt-12 space-y-2">
      <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
      {formData.calisanTC && <p className="text-sm">T.C. Kimlik No: {formData.calisanTC}</p>}
      {formData.gorev && <p className="text-sm">{formData.gorev}</p>}
      {formData.departman && <p className="text-sm">{formData.departman}</p>}
      <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
      <div className="mt-4">
        <p className="text-sm border-t pt-2 inline-block">İmza</p>
      </div>
    </div>
  </div>
);

const PaternityLeaveRequestPreview = ({ formData }: { formData: ContractFormData }) => {
  const izinBaslangic = formData.izinBaslangic ? formatDate(formData.izinBaslangic) : '___________________';
  const izinBitis = formData.izinBitis ? formatDate(formData.izinBitis) : '___________________';
  const toplamGun = formData.toplamGun || '___________________';
  
  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Babalık İzni Dilekçesi</h2>
      </div>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Sayın <strong>{formData.yetkiliAd || '___________________'}</strong>,
        </p>
        
        <p className="mb-4">
          Eşimin <strong>{formData.dogumTarihi ? formatDate(formData.dogumTarihi) : '___________________'}</strong> tarihinde doğum yapmış olması nedeniyle, 4857 sayılı İş Kanunu ve ilgili mevzuat uyarınca tarafıma tanınan <strong>babalık izni hakkımı</strong> kullanmak istiyorum.
        </p>
        
        <p className="mb-4">
          Bu kapsamda, <strong>{izinBaslangic} – {izinBitis}</strong> tarihleri arasında (<strong>{toplamGun} gün</strong>) babalık izni kullanmam hususunda gereğini arz ederim.
        </p>
        
        <p className="mb-4">
          Bilgilerinize sunar, gereğini rica ederim.
        </p>
        
        <p className="mb-8">
          Saygılarımla,
        </p>
      </div>
      
      <div className="mt-12 space-y-2">
        <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
        {formData.calisanTC && <p className="text-sm">T.C. Kimlik No: {formData.calisanTC}</p>}
        {formData.gorev && <p className="text-sm">{formData.gorev}</p>}
        {formData.departman && <p className="text-sm">{formData.departman}</p>}
        <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
        <div className="mt-4">
          <p className="text-sm border-t pt-2 inline-block">İmza</p>
        </div>
      </div>
    </div>
  );
};

const EmployeeUnpaidLeaveRequestPreview = ({ formData }: { formData: ContractFormData }) => {
  const izinBaslangic = formData.izinBaslangic ? formatDate(formData.izinBaslangic) : '___________________';
  const izinBitis = formData.izinBitis ? formatDate(formData.izinBitis) : '___________________';
  const toplamGunAy = formData.toplamGunAy || '___________________';
  
  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Çalışanın İşverenden Ücretsiz İzin Talebi Dilekçesi</h2>
      </div>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Sayın <strong>{formData.yetkiliAd || '___________________'}</strong>,
        </p>
        
        <p className="mb-4">
          Özel nedenlerim nedeniyle, <strong>{izinBaslangic} – {izinBitis}</strong> tarihleri arasında (<strong>{toplamGunAy}</strong>) <strong>ücretsiz izin</strong> kullanmak istiyorum.
        </p>
        
        <p className="mb-4">
          İzin sürem boyunca işlerimin devri tarafımdan yapılacaktır.
        </p>
        
        <p className="mb-4">
          Gereğini bilgilerinize arz ederim.
        </p>
        
        <p className="mb-8">
          Saygılarımla,
        </p>
      </div>
      
      <div className="mt-12 space-y-2">
        <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
        {formData.calisanTC && <p className="text-sm">T.C. Kimlik No: {formData.calisanTC}</p>}
        {formData.gorev && <p className="text-sm">{formData.gorev}</p>}
        {formData.departman && <p className="text-sm">{formData.departman}</p>}
        <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
        <div className="mt-4">
          <p className="text-sm border-t pt-2 inline-block">İmza</p>
        </div>
      </div>
    </div>
  );
};

const AdoptionUnpaidLeaveRequestPreview = ({ formData }: { formData: ContractFormData }) => {
  const evlatEdinmeTarihi = formData.evlatEdinmeTarihi ? formatDate(formData.evlatEdinmeTarihi) : '___________________';
  const izinBaslangic = formData.izinBaslangic ? formatDate(formData.izinBaslangic) : '___________________';
  const talepEdilenSure = formData.talepEdilenSure || '___________________';
  
  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Evlat Edinme Sonrası Ücretsiz İzin Talebi Dilekçesi</h2>
      </div>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Sayın <strong>{formData.yetkiliAd || '___________________'}</strong>,
        </p>
        
        <p className="mb-4">
          4857 sayılı İş Kanunu'nun 74. maddesi uyarınca, <strong>{evlatEdinmeTarihi}</strong> tarihinde evlat edinmiş olduğum çocuğumun bakımı ve uyum süreci amacıyla tarafıma tanınan <strong>ücretsiz izin hakkımı</strong> kullanmak istiyorum.
        </p>
        
        <p className="mb-4">
          Bu kapsamda, <strong>{izinBaslangic}</strong> tarihinden itibaren <strong>{talepEdilenSure}</strong> süreyle ücretsiz izinli sayılmam hususunda gereğini arz ederim.
        </p>
        
        <p className="mb-4">
          Bilgilerinize sunar, gereğini rica ederim.
        </p>
        
        <p className="mb-4">
          <strong>Ek:</strong> Evlat Edinme Belgesi / e-Devlet Çıktısı
        </p>
        
        <p className="mb-8">
          Saygılarımla,
        </p>
      </div>
      
      <div className="mt-12 space-y-2">
        <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
        {formData.calisanTC && <p className="text-sm">T.C. Kimlik No: {formData.calisanTC}</p>}
        {formData.gorev && <p className="text-sm">{formData.gorev}</p>}
        {formData.departman && <p className="text-sm">{formData.departman}</p>}
        <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
        <div className="mt-4">
          <p className="text-sm border-t pt-2 inline-block">İmza</p>
        </div>
      </div>
    </div>
  );
};

const PostBirthPartialWorkRequestPreview = ({ formData }: { formData: ContractFormData }) => {
  const baslangicTarihi = formData.baslangicTarihi ? formatDate(formData.baslangicTarihi) : '___________________';
  const haftalikCalismaSuresi = formData.haftalikCalismaSuresi || '___________________';
  
  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Doğum Sonrası Kısmi Çalışma Talebi Mektubu</h2>
      </div>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Sayın <strong>{formData.yetkiliAd || '___________________'}</strong>,
        </p>
        
        <p className="mb-4">
          4857 sayılı İş Kanunu'nun 13 ve 74. maddeleri uyarınca, doğum sonrası analık iznimin / ücretsiz izin süremim bitimini takiben, çocuğumun bakımı ve sağlıklı gelişimi amacıyla <strong>kısmi süreli (yarım zamanlı) çalışma hakkımı</strong> kullanmak istiyorum.
        </p>
        
        <p className="mb-4">
          Bu kapsamda, <strong>{baslangicTarihi}</strong> tarihinden itibaren, haftalık çalışma sürem <strong>{haftalikCalismaSuresi}</strong> olacak şekilde kısmi süreli çalışmaya geçmem hususunda gereğini arz ederim.
        </p>
        
        <p className="mb-4">
          Bilgilerinize sunar, gereğini rica ederim.
        </p>
        
        <p className="mb-8">
          Saygılarımla,
        </p>
      </div>
      
      <div className="mt-12 space-y-2">
        <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
        {formData.calisanTC && <p className="text-sm">T.C. Kimlik No: {formData.calisanTC}</p>}
        {formData.gorev && <p className="text-sm">{formData.gorev}</p>}
        {formData.departman && <p className="text-sm">{formData.departman}</p>}
        <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
        <div className="mt-4">
          <p className="text-sm border-t pt-2 inline-block">İmza</p>
        </div>
      </div>
    </div>
  );
};

// Template'ler
export const contractTemplates: { [key: string]: ContractTemplate } = {
  'housing-transfer': {
    getDefaultFormData: () => ({
      eskiKiracıAd: '',
      eskiKiracıTC: '',
      eskiKiracıAdres: '',
      yeniKiracıAd: '',
      yeniKiracıTC: '',
      yeniKiracıAdres: '',
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      konutAdresi: '',
      daireNo: '',
      devirTarihi: new Date().toISOString().split('T')[0],
      eskiKiraSozlesmesiTarihi: '',
      aylikKiraBedeli: '',
      depozito: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Eski Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="eskiKiracıAd" value={formData.eskiKiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="eskiKiracıTC" value={formData.eskiKiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="eskiKiracıAdres" value={formData.eskiKiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Yeni Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="yeniKiracıAd" value={formData.yeniKiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="yeniKiracıTC" value={formData.yeniKiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="yeniKiracıAdres" value={formData.yeniKiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Konut Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Daire No</label>
              <input type="text" name="daireNo" value={formData.daireNo} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Devir Tarihi *</label>
                <input type="date" name="devirTarihi" value={formData.devirTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Eski Sözleşme Tarihi</label>
                <input type="date" name="eskiKiraSozlesmesiTarihi" value={formData.eskiKiraSozlesmesiTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Depozito</label>
                <input type="text" name="depozito" value={formData.depozito} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <HousingTransferPreview formData={formData} />
    ),
  },
  
  // EV SAHİBİNİN ALT KİRA SÖZLEŞMESİNİ ONAY MEKTUBU
  'sublease-approval': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      altKiracıAd: '',
      altKiracıTC: '',
      altKiracıAdres: '',
      konutAdresi: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      aylikKiraBedeli: '',
      altKiraBedeli: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Alt Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="altKiracıAd" value={formData.altKiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="altKiracıTC" value={formData.altKiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="altKiracıAdres" value={formData.altKiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Konut ve Kira Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alt Kira Bedeli</label>
              <input type="text" name="altKiraBedeli" value={formData.altKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <SubleaseApprovalPreview formData={formData} />
    ),
  },
  
  // TAHLİYE DAVA DİLEKÇESİ
  'eviction-petition': {
    getDefaultFormData: () => ({
      davacıAd: '',
      davacıTC: '',
      davacıAdres: '',
      davacıVekilAd: '',
      davacıVekilBaroNo: '',
      davalıAd: '',
      davalıTC: '',
      davalıAdres: '',
      konutAdresi: '',
      kiraSozlesmesiTarihi: '',
      kiraBaslangic: '',
      kiraBitis: '',
      aylikKiraBedeli: '',
      tahliyeSebebi: 'ihtiyaç',
      davaTarihi: new Date().toISOString().split('T')[0],
      mahkemeAdı: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Davacı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davacıAd" value={formData.davacıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="davacıTC" value={formData.davacıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davacıAdres" value={formData.davacıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vekil Adı</label>
                <input type="text" name="davacıVekilAd" value={formData.davacıVekilAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Baro Sicil No</label>
                <input type="text" name="davacıVekilBaroNo" value={formData.davacıVekilBaroNo} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Davalı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davalıAd" value={formData.davalıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="davalıTC" value={formData.davalıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davalıAdres" value={formData.davalıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Konut ve Kira Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kira Sözleşmesi Tarihi</label>
                <input type="date" name="kiraSozlesmesiTarihi" value={formData.kiraSozlesmesiTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kira Başlangıç Tarihi</label>
                <input type="date" name="kiraBaslangic" value={formData.kiraBaslangic} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kira Bitiş Tarihi</label>
                <input type="date" name="kiraBitis" value={formData.kiraBitis} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tahliye Sebebi *</label>
              <select name="tahliyeSebebi" value={formData.tahliyeSebebi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="ihtiyaç">Kendi İhtiyacı İçin</option>
                <option value="bakım">Bakım ve Onarım</option>
                <option value="sözleşme ihlali">Sözleşme İhlali</option>
                <option value="kira ödememe">Kira Ödememe</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Dava Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mahkeme Adı *</label>
              <input type="text" name="mahkemeAdı" value={formData.mahkemeAdı} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dava Tarihi *</label>
              <input type="date" name="davaTarihi" value={formData.davaTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <EvictionPetitionPreview formData={formData} />
    ),
  },
  
  // KİRA TESPİT DAVA DİLEKÇESİ
  'rent-determination': {
    getDefaultFormData: () => ({
      davacıAd: '',
      davacıTC: '',
      davacıAdres: '',
      davalıAd: '',
      davalıTC: '',
      davalıAdres: '',
      konutAdresi: '',
      mevcutKiraBedeli: '',
      talepEdilenKiraBedeli: '',
      kiraSozlesmesiTarihi: '',
      davaTarihi: new Date().toISOString().split('T')[0],
      mahkemeAdı: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Davacı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davacıAd" value={formData.davacıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="davacıTC" value={formData.davacıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davacıAdres" value={formData.davacıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Davalı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davalıAd" value={formData.davalıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="davalıTC" value={formData.davalıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davalıAdres" value={formData.davalıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kira Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mevcut Kira Bedeli</label>
                <input type="text" name="mevcutKiraBedeli" value={formData.mevcutKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Talep Edilen Kira Bedeli *</label>
                <input type="text" name="talepEdilenKiraBedeli" value={formData.talepEdilenKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kira Sözleşmesi Tarihi</label>
              <input type="date" name="kiraSozlesmesiTarihi" value={formData.kiraSozlesmesiTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Dava Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mahkeme Adı *</label>
              <input type="text" name="mahkemeAdı" value={formData.mahkemeAdı} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dava Tarihi *</label>
              <input type="date" name="davaTarihi" value={formData.davaTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <RentDeterminationPreview formData={formData} />
    ),
  },
  
  // TAHLİYE İHTARNAME
  'eviction-notice': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      konutAdresi: '',
      kiraSozlesmesiTarihi: '',
      tahliyeSebebi: 'ihtiyaç',
      tahliyeTarihi: '',
      ihtarnameTarihi: new Date().toISOString().split('T')[0],
      aylikKiraBedeli: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Konut ve Kira Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kira Sözleşmesi Tarihi</label>
                <input type="date" name="kiraSozlesmesiTarihi" value={formData.kiraSozlesmesiTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tahliye Sebebi *</label>
              <select name="tahliyeSebebi" value={formData.tahliyeSebebi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="ihtiyaç">Kendi İhtiyacı İçin</option>
                <option value="bakım">Bakım ve Onarım</option>
                <option value="sözleşme ihlali">Sözleşme İhlali</option>
                <option value="kira ödememe">Kira Ödememe</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">İhtarname Tarihi *</label>
                <input type="date" name="ihtarnameTarihi" value={formData.ihtarnameTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tahliye Tarihi</label>
                <input type="date" name="tahliyeTarihi" value={formData.tahliyeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <EvictionNoticePreview formData={formData} />
    ),
  },
  
  // KİRA ARTIŞ İHTARNAME
  'rent-increase-notice': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      konutAdresi: '',
      mevcutKiraBedeli: '',
      yeniKiraBedeli: '',
      artisOrani: '',
      artisSebebi: 'TÜFE',
      ihtarnameTarihi: new Date().toISOString().split('T')[0],
      gecerlilikTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kira Artış Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mevcut Kira Bedeli *</label>
                <input type="text" name="mevcutKiraBedeli" value={formData.mevcutKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yeni Kira Bedeli *</label>
                <input type="text" name="yeniKiraBedeli" value={formData.yeniKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Artış Oranı (%)</label>
                <input type="text" name="artisOrani" value={formData.artisOrani} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Artış Sebebi *</label>
                <select name="artisSebebi" value={formData.artisSebebi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="TÜFE">TÜFE</option>
                  <option value="piyasa">Piyasa Koşulları</option>
                  <option value="sözleşme">Sözleşme Şartı</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">İhtarname Tarihi *</label>
                <input type="date" name="ihtarnameTarihi" value={formData.ihtarnameTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Geçerlilik Tarihi</label>
                <input type="date" name="gecerlilikTarihi" value={formData.gecerlilikTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <RentIncreaseNoticePreview formData={formData} />
    ),
  },
  
  // KİRA ÖDEME BELGESİ
  'rent-receipt': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      konutAdresi: '',
      odemeTarihi: new Date().toISOString().split('T')[0],
      odemeTutari: '',
      odemeSekli: 'Nakit',
      donem: '',
      belgeNo: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Ödeme Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Tarihi *</label>
                <input type="date" name="odemeTarihi" value={formData.odemeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Tutarı *</label>
                <input type="text" name="odemeTutari" value={formData.odemeTutari} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Şekli *</label>
                <select name="odemeSekli" value={formData.odemeSekli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="Nakit">Nakit</option>
                  <option value="Banka">Banka Havalesi</option>
                  <option value="EFT">EFT</option>
                  <option value="Çek">Çek</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dönem</label>
                <input type="text" name="donem" value={formData.donem} onChange={onChange} placeholder="Örn: Ocak 2025" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Belge No</label>
              <input type="text" name="belgeNo" value={formData.belgeNo} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <RentReceiptPreview formData={formData} />
    ),
  },
  
  // KİRA GECİKME İHTARNAME
  'rent-delay-notice': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      konutAdresi: '',
      gecikmisKiraTutari: '',
      gecikmisDonemler: '',
      sonOdemeTarihi: '',
      ihtarnameTarihi: new Date().toISOString().split('T')[0],
      odemeSuresi: '7',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Gecikme Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gecikmiş Kira Tutarı *</label>
                <input type="text" name="gecikmisKiraTutari" value={formData.gecikmisKiraTutari} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gecikmiş Dönemler</label>
                <input type="text" name="gecikmisDonemler" value={formData.gecikmisDonemler} onChange={onChange} placeholder="Örn: Ocak, Şubat 2025" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Son Ödeme Tarihi</label>
                <input type="date" name="sonOdemeTarihi" value={formData.sonOdemeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Süresi (Gün) *</label>
                <input type="number" name="odemeSuresi" value={formData.odemeSuresi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İhtarname Tarihi *</label>
              <input type="date" name="ihtarnameTarihi" value={formData.ihtarnameTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <RentDelayNoticePreview formData={formData} />
    ),
  },
  
  // DEPOZİTO İADE TALEBİ
  'deposit-refund': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      konutAdresi: '',
      depozitoTutari: '',
      depozitoTarihi: '',
      tahliyeTarihi: '',
      talepTarihi: new Date().toISOString().split('T')[0],
      kesintiVarsa: false,
      kesintiTutari: '',
      kesintiSebebi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Depozito Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Depozito Tutarı *</label>
                <input type="text" name="depozitoTutari" value={formData.depozitoTutari} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Depozito Tarihi</label>
                <input type="date" name="depozitoTarihi" value={formData.depozitoTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tahliye Tarihi</label>
                <input type="date" name="tahliyeTarihi" value={formData.tahliyeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Talep Tarihi *</label>
                <input type="date" name="talepTarihi" value={formData.talepTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" name="kesintiVarsa" checked={formData.kesintiVarsa} onChange={onChange} className="mr-2" />
                <span className="text-sm font-medium">Kesinti Var</span>
              </label>
            </div>
            {formData.kesintiVarsa && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Kesinti Tutarı</label>
                  <input type="text" name="kesintiTutari" value={formData.kesintiTutari} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kesinti Sebebi</label>
                  <textarea name="kesintiSebebi" value={formData.kesintiSebebi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <DepositRefundPreview formData={formData} />
    ),
  },
  
  // KİRACI FESİH BİLDİRİMİ
  'tenant-termination': {
    getDefaultFormData: () => ({
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      konutAdresi: '',
      kiraSozlesmesiTarihi: '',
      fesihSebebi: '',
      fesihTarihi: '',
      bildirimTarihi: new Date().toISOString().split('T')[0],
      tahliyeTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Fesih Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kira Sözleşmesi Tarihi</label>
                <input type="date" name="kiraSozlesmesiTarihi" value={formData.kiraSozlesmesiTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bildirim Tarihi *</label>
                <input type="date" name="bildirimTarihi" value={formData.bildirimTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fesih Tarihi</label>
                <input type="date" name="fesihTarihi" value={formData.fesihTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tahliye Tarihi</label>
                <input type="date" name="tahliyeTarihi" value={formData.tahliyeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fesih Sebebi</label>
              <textarea name="fesihSebebi" value={formData.fesihSebebi} onChange={onChange} rows={3} placeholder="Fesih sebebini açıklayın..." className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <TenantTerminationPreview formData={formData} />
    ),
  },
  
  // KİRA FESİH PROTOKOLÜ
  'rent-termination': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      konutAdresi: '',
      kiraSozlesmesiTarihi: '',
      fesihTarihi: new Date().toISOString().split('T')[0],
      fesihSebebi: '',
      kalanKiraBedeli: '',
      depozitoDurumu: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Fesih Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kira Sözleşmesi Tarihi</label>
                <input type="date" name="kiraSozlesmesiTarihi" value={formData.kiraSozlesmesiTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fesih Tarihi *</label>
                <input type="date" name="fesihTarihi" value={formData.fesihTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fesih Sebebi</label>
              <textarea name="fesihSebebi" value={formData.fesihSebebi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kalan Kira Bedeli</label>
                <input type="text" name="kalanKiraBedeli" value={formData.kalanKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Depozito Durumu</label>
                <input type="text" name="depozitoDurumu" value={formData.depozitoDurumu} onChange={onChange} placeholder="Örn: İade edildi" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <RentTerminationPreview formData={formData} />
    ),
  },
  
  // KİRA YENİLEME SÖZLEŞMESİ
  'rent-renewal': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      konutAdresi: '',
      eskiSozlesmeTarihi: '',
      yeniSozlesmeTarihi: new Date().toISOString().split('T')[0],
      eskiKiraBedeli: '',
      yeniKiraBedeli: '',
      yeniSozlesmeSuresi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Yenileme Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Eski Sözleşme Tarihi</label>
                <input type="date" name="eskiSozlesmeTarihi" value={formData.eskiSozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yeni Sözleşme Tarihi *</label>
                <input type="date" name="yeniSozlesmeTarihi" value={formData.yeniSozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Eski Kira Bedeli</label>
                <input type="text" name="eskiKiraBedeli" value={formData.eskiKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yeni Kira Bedeli *</label>
                <input type="text" name="yeniKiraBedeli" value={formData.yeniKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yeni Sözleşme Süresi</label>
              <input type="text" name="yeniSozlesmeSuresi" value={formData.yeniSozlesmeSuresi} onChange={onChange} placeholder="Örn: 1 yıl" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <RentRenewalPreview formData={formData} />
    ),
  },
  
  // ALT KİRA ANLAŞMASI
  'sublease': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      altKiracıAd: '',
      altKiracıTC: '',
      altKiracıAdres: '',
      konutAdresi: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      aylikKiraBedeli: '',
      altKiraBedeli: '',
      sozlesmeSuresi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Alt Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="altKiracıAd" value={formData.altKiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="altKiracıTC" value={formData.altKiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="altKiracıAdres" value={formData.altKiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Alt Kira Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Süresi</label>
                <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi} onChange={onChange} placeholder="Örn: 1 yıl" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alt Kira Bedeli *</label>
                <input type="text" name="altKiraBedeli" value={formData.altKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <SubleasePreview formData={formData} />
    ),
  },
  
  // KİRA ARTIŞ İTİRAZ
  'rent-increase-objection': {
    getDefaultFormData: () => ({
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      konutAdresi: '',
      mevcutKiraBedeli: '',
      talepEdilenKiraBedeli: '',
      itirazSebebi: '',
      itirazTarihi: new Date().toISOString().split('T')[0],
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">İtiraz Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mevcut Kira Bedeli *</label>
                <input type="text" name="mevcutKiraBedeli" value={formData.mevcutKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Talep Edilen Kira Bedeli *</label>
                <input type="text" name="talepEdilenKiraBedeli" value={formData.talepEdilenKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İtiraz Sebebi *</label>
              <textarea name="itirazSebebi" value={formData.itirazSebebi} onChange={onChange} rows={4} placeholder="Kira artışına itiraz sebebinizi açıklayın..." className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İtiraz Tarihi *</label>
              <input type="date" name="itirazTarihi" value={formData.itirazTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <RentIncreaseObjectionPreview formData={formData} />
    ),
  },
  
  // TADİLAT TALEBİ
  'renovation-request': {
    getDefaultFormData: () => ({
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      konutAdresi: '',
      tadilatKonusu: '',
      tadilatSebebi: '',
      tahminiMaliyet: '',
      talepTarihi: new Date().toISOString().split('T')[0],
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Tadilat Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tadilat Konusu *</label>
              <textarea name="tadilatKonusu" value={formData.tadilatKonusu} onChange={onChange} rows={3} placeholder="Yapılması istenen tadilatı açıklayın..." className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tadilat Sebebi *</label>
              <textarea name="tadilatSebebi" value={formData.tadilatSebebi} onChange={onChange} rows={3} placeholder="Tadilat sebebini açıklayın..." className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tahmini Maliyet</label>
                <input type="text" name="tahminiMaliyet" value={formData.tahminiMaliyet} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Talep Tarihi *</label>
                <input type="date" name="talepTarihi" value={formData.talepTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <RenovationRequestPreview formData={formData} />
    ),
  },
  
  // EŞYALI KONUT KİRA SÖZLEŞMESİ
  'furnished-housing': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      konutAdresi: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      aylikKiraBedeli: '',
      depozito: '',
      esyalarListesi: '',
      sozlesmeSuresi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Konut ve Eşya Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Konut Adresi *</label>
              <textarea name="konutAdresi" value={formData.konutAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Eşyalar Listesi *</label>
              <textarea name="esyalarListesi" value={formData.esyalarListesi} onChange={onChange} rows={5} placeholder="Konutta bulunan eşyaları listeleyin..." className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Süresi</label>
                <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi} onChange={onChange} placeholder="Örn: 1 yıl" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli *</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Depozito</label>
                <input type="text" name="depozito" value={formData.depozito} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <FurnishedHousingPreview formData={formData} />
    ),
  },
  
  // KAT KARŞILIĞI BİNA YAPIM SÖZLEŞMESİ
  'construction-agreement': {
    getDefaultFormData: () => ({
      arsaSahibiAd: '',
      arsaSahibiTC: '',
      arsaSahibiAdres: '',
      yapimciAd: '',
      yapimciTC: '',
      yapimciAdres: '',
      arsaAdresi: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      katSayisi: '',
      daireSayisi: '',
      arsaSahibineVerilecekKat: '',
      yapimciyaVerilecekKat: '',
      tahminiMaliyet: '',
      bitisTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Arsa Sahibi Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="arsaSahibiAd" value={formData.arsaSahibiAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="arsaSahibiTC" value={formData.arsaSahibiTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="arsaSahibiAdres" value={formData.arsaSahibiAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Yapımcı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="yapimciAd" value={formData.yapimciAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="yapimciTC" value={formData.yapimciTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="yapimciAdres" value={formData.yapimciAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Yapım Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Arsa Adresi *</label>
              <textarea name="arsaAdresi" value={formData.arsaAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
                <input type="date" name="bitisTarihi" value={formData.bitisTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kat Sayısı</label>
                <input type="text" name="katSayisi" value={formData.katSayisi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Daire Sayısı</label>
                <input type="text" name="daireSayisi" value={formData.daireSayisi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Arsa Sahibine Verilecek Kat</label>
                <input type="text" name="arsaSahibineVerilecekKat" value={formData.arsaSahibineVerilecekKat} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yapımcıya Verilecek Kat</label>
                <input type="text" name="yapimciyaVerilecekKat" value={formData.yapimciyaVerilecekKat} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tahmini Maliyet</label>
              <input type="text" name="tahminiMaliyet" value={formData.tahminiMaliyet} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <ConstructionAgreementPreview formData={formData} />
    ),
  },
  
  // İŞYERİ KİRALAMA SÖZLEŞMESİ
  'commercial': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      isyeriAdresi: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      aylikKiraBedeli: '',
      depozito: '',
      sozlesmeSuresi: '',
      kullanimAmaci: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">İşyeri Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">İşyeri Adresi *</label>
              <textarea name="isyeriAdresi" value={formData.isyeriAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kullanım Amacı</label>
              <input type="text" name="kullanimAmaci" value={formData.kullanimAmaci} onChange={onChange} placeholder="Örn: Ticaret, Ofis, Depo" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Süresi</label>
                <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi} onChange={onChange} placeholder="Örn: 2 yıl" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli *</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Depozito</label>
                <input type="text" name="depozito" value={formData.depozito} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <CommercialPreview formData={formData} />
    ),
  },
  
  // ARAÇ KİRALAMA SÖZLEŞMESİ
  'vehicle': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      aracMarka: '',
      aracModel: '',
      aracPlaka: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      gunlukKiraBedeli: '',
      depozito: '',
      sozlesmeSuresi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Araç Bilgileri</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Araç Marka *</label>
                <input type="text" name="aracMarka" value={formData.aracMarka} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Araç Model</label>
                <input type="text" name="aracModel" value={formData.aracModel} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Araç Plaka *</label>
              <input type="text" name="aracPlaka" value={formData.aracPlaka} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Süresi</label>
                <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi} onChange={onChange} placeholder="Örn: 30 gün" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Günlük Kira Bedeli *</label>
                <input type="text" name="gunlukKiraBedeli" value={formData.gunlukKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Depozito</label>
                <input type="text" name="depozito" value={formData.depozito} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <VehiclePreview formData={formData} />
    ),
  },
  
  // DEPO KİRALAMA SÖZLEŞMESİ
  'warehouse': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıAdres: '',
      depoAdresi: '',
      depoMetrekare: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      aylikKiraBedeli: '',
      depozito: '',
      sozlesmeSuresi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiraya Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Kiracı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Depo Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Depo Adresi *</label>
              <textarea name="depoAdresi" value={formData.depoAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Depo Metrekare</label>
              <input type="text" name="depoMetrekare" value={formData.depoMetrekare} onChange={onChange} placeholder="Örn: 100 m²" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Süresi</label>
                <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi} onChange={onChange} placeholder="Örn: 1 yıl" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli *</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Depozito</label>
                <input type="text" name="depozito" value={formData.depozito} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <WarehousePreview formData={formData} />
    ),
  },
  
  // SATIŞ SÖZLEŞMESİ
  'sale': {
    getDefaultFormData: () => ({
      satıcıAd: '',
      satıcıTC: '',
      satıcıAdres: '',
      alıcıAd: '',
      alıcıTC: '',
      alıcıAdres: '',
      malAdresi: '',
      satisBedeli: '',
      peşinTutar: '',
      kalanTutar: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      teslimTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Satıcı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="satıcıAd" value={formData.satıcıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="satıcıTC" value={formData.satıcıTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="satıcıAdres" value={formData.satıcıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Alıcı Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="alıcıAd" value={formData.alıcıAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="alıcıTC" value={formData.alıcıTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="alıcıAdres" value={formData.alıcıAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Satış Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mal/Gayrimenkul Adresi *</label>
              <textarea name="malAdresi" value={formData.malAdresi} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teslim Tarihi</label>
                <input type="date" name="teslimTarihi" value={formData.teslimTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Satış Bedeli *</label>
              <input type="text" name="satisBedeli" value={formData.satisBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Peşin Tutar</label>
                <input type="text" name="peşinTutar" value={formData.peşinTutar} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kalan Tutar</label>
                <input type="text" name="kalanTutar" value={formData.kalanTutar} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <SalePreview formData={formData} />
    ),
  },
  
  // HİZMET SÖZLEŞMESİ
  'service': {
    getDefaultFormData: () => ({
      hizmetVerenAd: '',
      hizmetVerenTC: '',
      hizmetVerenAdres: '',
      hizmetAlanAd: '',
      hizmetAlanTC: '',
      hizmetAlanAdres: '',
      hizmetKonusu: '',
      hizmetBedeli: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      sozlesmeSuresi: '',
      teslimTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Hizmet Veren Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="hizmetVerenAd" value={formData.hizmetVerenAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="hizmetVerenTC" value={formData.hizmetVerenTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="hizmetVerenAdres" value={formData.hizmetVerenAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Hizmet Alan Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="hizmetAlanAd" value={formData.hizmetAlanAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="hizmetAlanTC" value={formData.hizmetAlanTC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="hizmetAlanAdres" value={formData.hizmetAlanAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Hizmet Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hizmet Konusu *</label>
              <textarea name="hizmetKonusu" value={formData.hizmetKonusu} onChange={onChange} rows={3} placeholder="Hizmet konusunu açıklayın..." className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teslim Tarihi</label>
                <input type="date" name="teslimTarihi" value={formData.teslimTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hizmet Bedeli *</label>
                <input type="text" name="hizmetBedeli" value={formData.hizmetBedeli} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Süresi</label>
                <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi} onChange={onChange} placeholder="Örn: 6 ay" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <ServicePreview formData={formData} />
    ),
  },
  
  // ORTAKLIK SÖZLEŞMESİ
  'partnership': {
    getDefaultFormData: () => ({
      ortak1Ad: '',
      ortak1TC: '',
      ortak1Adres: '',
      ortak1Sermaye: '',
      ortak2Ad: '',
      ortak2TC: '',
      ortak2Adres: '',
      ortak2Sermaye: '',
      ortak3Ad: '',
      ortak3TC: '',
      ortak3Adres: '',
      ortak3Sermaye: '',
      ortaklikKonusu: '',
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      karPaylasimi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">1. Ortak Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="ortak1Ad" value={formData.ortak1Ad} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="ortak1TC" value={formData.ortak1TC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="ortak1Adres" value={formData.ortak1Adres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sermaye Payı</label>
              <input type="text" name="ortak1Sermaye" value={formData.ortak1Sermaye} onChange={onChange} placeholder="Örn: %50 veya 100.000 ₺" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">2. Ortak Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="ortak2Ad" value={formData.ortak2Ad} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="ortak2TC" value={formData.ortak2TC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="ortak2Adres" value={formData.ortak2Adres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sermaye Payı</label>
              <input type="text" name="ortak2Sermaye" value={formData.ortak2Sermaye} onChange={onChange} placeholder="Örn: %50 veya 100.000 ₺" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">3. Ortak Bilgileri (Opsiyonel)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı</label>
              <input type="text" name="ortak3Ad" value={formData.ortak3Ad} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No / Vergi No</label>
              <input type="text" name="ortak3TC" value={formData.ortak3TC} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="ortak3Adres" value={formData.ortak3Adres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sermaye Payı</label>
              <input type="text" name="ortak3Sermaye" value={formData.ortak3Sermaye} onChange={onChange} placeholder="Örn: %25 veya 50.000 ₺" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Ortaklık Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ortaklık Konusu *</label>
              <textarea name="ortaklikKonusu" value={formData.ortaklikKonusu} onChange={onChange} rows={3} placeholder="Ortaklık konusunu açıklayın..." className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
                <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kar Paylaşımı</label>
                <input type="text" name="karPaylasimi" value={formData.karPaylasimi} onChange={onChange} placeholder="Örn: Eşit paylaşım" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <div className="a4-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm', fontSize: '12px', lineHeight: '1.6' }}>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase mb-2">ORTAKLIK SÖZLEŞMESİ</h1>
        </div>
        <div className="mb-6">
          <p className="mb-2"><strong>1. ORTAK:</strong> {formData.ortak1Ad || '___________________'}</p>
          {formData.ortak1TC && <p className="text-sm">TC/Vergi No: {formData.ortak1TC}</p>}
          {formData.ortak1Adres && <p className="text-sm">Adres: {formData.ortak1Adres}</p>}
          {formData.ortak1Sermaye && <p className="text-sm">Sermaye Payı: {formData.ortak1Sermaye}</p>}
        </div>
        <div className="mb-6">
          <p className="mb-2"><strong>2. ORTAK:</strong> {formData.ortak2Ad || '___________________'}</p>
          {formData.ortak2TC && <p className="text-sm">TC/Vergi No: {formData.ortak2TC}</p>}
          {formData.ortak2Adres && <p className="text-sm">Adres: {formData.ortak2Adres}</p>}
          {formData.ortak2Sermaye && <p className="text-sm">Sermaye Payı: {formData.ortak2Sermaye}</p>}
        </div>
        {formData.ortak3Ad && (
          <div className="mb-6">
            <p className="mb-2"><strong>3. ORTAK:</strong> {formData.ortak3Ad}</p>
            {formData.ortak3TC && <p className="text-sm">TC/Vergi No: {formData.ortak3TC}</p>}
            {formData.ortak3Adres && <p className="text-sm">Adres: {formData.ortak3Adres}</p>}
            {formData.ortak3Sermaye && <p className="text-sm">Sermaye Payı: {formData.ortak3Sermaye}</p>}
          </div>
        )}
        <div className="mb-6">
          <p className="mb-4">
            Yukarıda kimlik bilgileri yazılı ortaklar, aşağıda belirtilen konuda ortaklık sözleşmesi yapmışlardır.
          </p>
          <p className="mb-4">
            <strong>ORTAKLIK KONUSU:</strong>
          </p>
          <p className="mb-4">
            {formData.ortaklikKonusu || '___________________'}
          </p>
          <p className="mb-4">
            <strong>SÖZLEŞME ŞARTLARI:</strong>
          </p>
          <p className="mb-2">- Sözleşme tarihi: {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}</p>
          {formData.karPaylasimi && <p className="mb-2">- Kar paylaşımı: {formData.karPaylasimi}</p>}
          <p className="mb-4">
            Türk Borçlar Kanunu'nun 620-644. maddeleri uyarınca, ortaklık sözleşmesi yapılmıştır.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-8">
          <div>
            <p className="font-semibold mb-4 border-t pt-2">1. ORTAK</p>
            <p className="mb-8">{formData.ortak1Ad || '___________________'}</p>
            <p className="text-xs border-t pt-2">İmza</p>
          </div>
          <div>
            <p className="font-semibold mb-4 border-t pt-2">2. ORTAK</p>
            <p className="mb-8">{formData.ortak2Ad || '___________________'}</p>
            <p className="text-xs border-t pt-2">İmza</p>
          </div>
          {formData.ortak3Ad && (
            <div>
              <p className="font-semibold mb-4 border-t pt-2">3. ORTAK</p>
              <p className="mb-8">{formData.ortak3Ad}</p>
              <p className="text-xs border-t pt-2">İmza</p>
            </div>
          )}
        </div>
      </div>
    ),
  },
  
  // YENİ EKLENEN TEMPLATE'LER - Aile, evlilik, boşanma
  'parent-consent': {
    getDefaultFormData: () => ({
      veliAd: '',
      veliTC: '',
      veliAdres: '',
      ogrenciAd: '',
      ogrenciTC: '',
      okulAdi: '',
      izinKonusu: '',
      izinTarihi: new Date().toISOString().split('T')[0],
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Veli Ad Soyad *</label>
          <input type="text" name="veliAd" value={formData.veliAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Veli TC Kimlik No</label>
          <input type="text" name="veliTC" value={formData.veliTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Veli Adres</label>
          <textarea name="veliAdres" value={formData.veliAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öğrenci Ad Soyad *</label>
          <input type="text" name="ogrenciAd" value={formData.ogrenciAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öğrenci TC Kimlik No</label>
          <input type="text" name="ogrenciTC" value={formData.ogrenciTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Okul Adı</label>
          <input type="text" name="okulAdi" value={formData.okulAdi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Konusu *</label>
          <textarea name="izinKonusu" value={formData.izinKonusu} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Tarihi</label>
          <input type="date" name="izinTarihi" value={formData.izinTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <ParentConsentPreview formData={formData} />
    ),
  },
  
  'divorce-agreement': {
    getDefaultFormData: () => ({
      esAd: '',
      esTC: '',
      esAdres: '',
      es2Ad: '',
      es2TC: '',
      es2Adres: '',
      evlilikTarihi: '',
      bosanmaTarihi: new Date().toISOString().split('T')[0],
      velayet: '',
      nafaka: '',
      malPaylasimi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Eş 1 Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="esAd" value={formData.esAd} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="esTC" value={formData.esTC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="esAdres" value={formData.esAdres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Eş 2 Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="es2Ad" value={formData.es2Ad} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TC Kimlik No</label>
              <input type="text" name="es2TC" value={formData.es2TC} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="es2Adres" value={formData.es2Adres} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Evlilik Tarihi</label>
          <input type="date" name="evlilikTarihi" value={formData.evlilikTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Boşanma Tarihi</label>
          <input type="date" name="bosanmaTarihi" value={formData.bosanmaTarihi} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Velayet Düzenlemesi</label>
          <textarea name="velayet" value={formData.velayet} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Çocukların velayeti ve görüşme düzenlemesi..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nafaka Düzenlemesi</label>
          <textarea name="nafaka" value={formData.nafaka} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Nafaka miktarı ve ödeme şekli..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mal Paylaşımı</label>
          <textarea name="malPaylasimi" value={formData.malPaylasimi} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Mal paylaşımı düzenlemesi..." />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <DivorceAgreementPreview formData={formData} />
    ),
  },
  'post-birth-half-day-unpaid-leave': {
    getDefaultFormData: () => ({
      yetkiliAd: '',
      calisanAd: '',
      gorev: '',
      departman: '',
      yarimGunBaslangic: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Adı / İnsan Kaynakları Birimi *</label>
          <input type="text" name="yetkiliAd" value={formData.yetkiliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Göreviniz</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Departmanınız</label>
          <input type="text" name="departman" value={formData.departman || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
          <input type="date" name="yarimGunBaslangic" value={formData.yarimGunBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <PostBirthHalfDayUnpaidLeavePreview formData={formData} />
    )
  },
  'post-birth-six-month-unpaid-leave': {
    getDefaultFormData: () => ({
      yetkiliAd: '',
      calisanAd: '',
      calisanTC: '',
      gorev: '',
      departman: '',
      analikIzninBitisTarihi: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Adı / İnsan Kaynakları Birimi *</label>
          <input type="text" name="yetkiliAd" value={formData.yetkiliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Göreviniz</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Departmanınız</label>
          <input type="text" name="departman" value={formData.departman || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Analık İzninin Bitiş Tarihi *</label>
          <input type="date" name="analikIzninBitisTarihi" value={formData.analikIzninBitisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <PostBirthSixMonthUnpaidLeavePreview formData={formData} />
    )
  },
  'annual-paid-leave-request': {
    getDefaultFormData: () => ({
      yetkiliAd: '',
      calisanAd: '',
      gorev: '',
      departman: '',
      izinBaslangic: '',
      izinBitis: '',
      toplamGun: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Adı / İnsan Kaynakları Birimi *</label>
          <input type="text" name="yetkiliAd" value={formData.yetkiliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Göreviniz</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Departmanınız</label>
          <input type="text" name="departman" value={formData.departman || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Başlangıç Tarihi *</label>
          <input type="date" name="izinBaslangic" value={formData.izinBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Bitiş Tarihi *</label>
          <input type="date" name="izinBitis" value={formData.izinBitis || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Toplam Gün Sayısı *</label>
          <input type="number" name="toplamGun" value={formData.toplamGun || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <AnnualPaidLeaveRequestPreview formData={formData} />
    )
  },
  'maternity-leave-request': {
    getDefaultFormData: () => ({
      yetkiliAd: '',
      calisanAd: '',
      calisanTC: '',
      gorev: '',
      departman: '',
      tahminiDogumTarihi: '',
      izinBaslangic: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Adı / İnsan Kaynakları Birimi *</label>
          <input type="text" name="yetkiliAd" value={formData.yetkiliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Göreviniz</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Departmanınız</label>
          <input type="text" name="departman" value={formData.departman || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tahmini Doğum Tarihi *</label>
          <input type="date" name="tahminiDogumTarihi" value={formData.tahminiDogumTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Başlangıç Tarihi *</label>
          <input type="date" name="izinBaslangic" value={formData.izinBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <MaternityLeaveRequestPreview formData={formData} />
    )
  },
  'paternity-leave-request': {
    getDefaultFormData: () => ({
      yetkiliAd: '',
      calisanAd: '',
      calisanTC: '',
      gorev: '',
      departman: '',
      dogumTarihi: '',
      izinBaslangic: '',
      izinBitis: '',
      toplamGun: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Adı / İnsan Kaynakları Birimi *</label>
          <input type="text" name="yetkiliAd" value={formData.yetkiliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Göreviniz</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Departmanınız</label>
          <input type="text" name="departman" value={formData.departman || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Doğum Tarihi *</label>
          <input type="date" name="dogumTarihi" value={formData.dogumTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Başlangıç Tarihi *</label>
          <input type="date" name="izinBaslangic" value={formData.izinBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Bitiş Tarihi *</label>
          <input type="date" name="izinBitis" value={formData.izinBitis || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Toplam Gün Sayısı *</label>
          <input type="number" name="toplamGun" value={formData.toplamGun || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <PaternityLeaveRequestPreview formData={formData} />
    )
  },
  'employee-unpaid-leave-request': {
    getDefaultFormData: () => ({
      yetkiliAd: '',
      calisanAd: '',
      calisanTC: '',
      gorev: '',
      departman: '',
      izinBaslangic: '',
      izinBitis: '',
      toplamGunAy: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Adı / İnsan Kaynakları Birimi *</label>
          <input type="text" name="yetkiliAd" value={formData.yetkiliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Göreviniz</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Departmanınız</label>
          <input type="text" name="departman" value={formData.departman || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Başlangıç Tarihi *</label>
          <input type="date" name="izinBaslangic" value={formData.izinBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Bitiş Tarihi *</label>
          <input type="date" name="izinBitis" value={formData.izinBitis || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Toplam Gün/Ay Sayısı * (örn: 5 gün, 1 ay)</label>
          <input type="text" name="toplamGunAy" value={formData.toplamGunAy || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: 5 gün veya 1 ay" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <EmployeeUnpaidLeaveRequestPreview formData={formData} />
    )
  },
  'adoption-unpaid-leave-request': {
    getDefaultFormData: () => ({
      yetkiliAd: '',
      calisanAd: '',
      calisanTC: '',
      gorev: '',
      departman: '',
      evlatEdinmeTarihi: '',
      izinBaslangic: '',
      talepEdilenSure: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Adı / İnsan Kaynakları Birimi *</label>
          <input type="text" name="yetkiliAd" value={formData.yetkiliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Göreviniz</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Departmanınız</label>
          <input type="text" name="departman" value={formData.departman || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Çocuğun Teslim/Evlat Edinme Tarihi *</label>
          <input type="date" name="evlatEdinmeTarihi" value={formData.evlatEdinmeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İzin Başlangıç Tarihi *</label>
          <input type="date" name="izinBaslangic" value={formData.izinBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Talep Edilen Süre * (örn: 6 ay, 3 ay)</label>
          <input type="text" name="talepEdilenSure" value={formData.talepEdilenSure || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: 6 ay" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <AdoptionUnpaidLeaveRequestPreview formData={formData} />
    )
  },
  'post-birth-partial-work-request': {
    getDefaultFormData: () => ({
      yetkiliAd: '',
      calisanAd: '',
      calisanTC: '',
      gorev: '',
      departman: '',
      baslangicTarihi: '',
      haftalikCalismaSuresi: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Adı / İnsan Kaynakları Birimi *</label>
          <input type="text" name="yetkiliAd" value={formData.yetkiliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Göreviniz</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Departmanınız</label>
          <input type="text" name="departman" value={formData.departman || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
          <input type="date" name="baslangicTarihi" value={formData.baslangicTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Haftalık Çalışma Süresi * (örn: haftada 30 saat / günde 6 saat)</label>
          <input type="text" name="haftalikCalismaSuresi" value={formData.haftalikCalismaSuresi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: haftada 30 saat / günde 6 saat" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <PostBirthPartialWorkRequestPreview formData={formData} />
    )
  },
  'resignation-letter': {
    getDefaultFormData: () => ({
      calisanAd: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <div className="p-8 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">İstifa Mektubu</h2>
        </div>
        
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Sayın Yetkili,
          </p>
          
          <p className="mb-4">
            Şirketinizde yürütmekte olduğum görevimden, iş sözleşmemde belirtilen ihbar süresine uyarak, kendi isteğimle ayrılma kararı aldığımı bilgilerinize sunarım.
          </p>
          
          <p className="mb-4">
            Şirketinizde görev yaptığım süre boyunca edindiğim deneyim ve kazanımlar için teşekkür ederim. Birlikte çalıştığım tüm ekip arkadaşlarıma ve yöneticilerime destekleri için şükranlarımı sunarım.
          </p>
          
          <p className="mb-4">
            İhbar süresi boyunca görev ve sorumluluklarımı eksiksiz şekilde devretmek için gerekli tüm desteği sağlayacağımı belirtmek isterim.
          </p>
          
          <p className="mb-4">
            Gereğini bilgilerinize arz eder, şirketinize ve tüm çalışanlarına başarılar dilerim.
          </p>
          
          <p className="mb-8">
            Saygılarımla,
          </p>
        </div>
        
        <div className="mt-12 space-y-2">
          <p className="text-sm"><strong>{formData.calisanAd || '___________________'}</strong></p>
          <div className="mt-4">
            <p className="text-sm border-t pt-2 inline-block">İmza</p>
          </div>
          <p className="text-sm">Tarih: {formData.tarih ? formatDate(formData.tarih) : '___________________'}</p>
        </div>
      </div>
    )
  },
  'justified-termination-receivables-lawsuit': {
    getDefaultFormData: () => ({
      mahkemeAdi: '',
      davaciAd: '',
      davaciTC: '',
      davaciAdres: '',
      davaliUnvan: '',
      davaliAdres: '',
      isBaslangicTarihi: '',
      isBitisTarihi: '',
      pozisyon: '',
      aylikUcret: '',
      fesihTarihi: '',
      davaDegeri: '',
      tanik1Ad: '',
      tanik1CalistigiYer: '',
      tanik1UcretOdenmemesi: false,
      tanik1SigortasizCalisma: false,
      tanik1Mobbing: false,
      tanik1FazlaMesai: false,
      tanik2Ad: '',
      tanik2CalistigiYer: '',
      tanik2BildigiHususlar: '',
      sgkHicSigortaYok: false,
      sgkEksikGunVar: false,
      sgkDusukUcretBildirimi: false,
      sgkTamAmaGecBildirim: false,
      sgkGirisTarihi: '',
      sgkCikisTarihi: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Davacı Ad Soyad *</label>
          <input type="text" name="davaciAd" value={formData.davaciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davacı T.C. Kimlik No *</label>
          <input type="text" name="davaciTC" value={formData.davaciTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davacı Adres *</label>
          <textarea name="davaciAdres" value={formData.davaciAdres || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davalı Şirket Ünvanı *</label>
          <input type="text" name="davaliUnvan" value={formData.davaliUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davalı Adres *</label>
          <textarea name="davaliAdres" value={formData.davaliAdres || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İş Başlangıç Tarihi *</label>
          <input type="date" name="isBaslangicTarihi" value={formData.isBaslangicTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İş Bitiş Tarihi *</label>
          <input type="date" name="isBitisTarihi" value={formData.isBitisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pozisyon *</label>
          <input type="text" name="pozisyon" value={formData.pozisyon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Aylık Ücret *</label>
          <input type="text" name="aylikUcret" value={formData.aylikUcret || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: 15.000 TL" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fesih Tarihi *</label>
          <input type="date" name="fesihTarihi" value={formData.fesihTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dava Değeri *</label>
          <input type="text" name="davaDegeri" value={formData.davaDegeri || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: 50.000 TL" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mahkeme Adı *</label>
          <input type="text" name="mahkemeAdi" value={formData.mahkemeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: İstanbul" required />
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-4">Tanık Listesi</h3>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 1 - Ad Soyad *</label>
              <input type="text" name="tanik1Ad" value={formData.tanik1Ad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 1 - Çalıştığı/Çalışmış Olduğu Yer *</label>
              <input type="text" name="tanik1CalistigiYer" value={formData.tanik1CalistigiYer || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tanık 1 - Bildiği Hususlar:</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" name="tanik1UcretOdenmemesi" checked={formData.tanik1UcretOdenmemesi || false} onChange={(e) => {
                    const fakeEvent = { ...e, target: { ...e.target, name: 'tanik1UcretOdenmemesi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(fakeEvent);
                  }} className="mr-2" />
                  Ücret ödenmemesi
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="tanik1SigortasizCalisma" checked={formData.tanik1SigortasizCalisma || false} onChange={(e) => {
                    const fakeEvent = { ...e, target: { ...e.target, name: 'tanik1SigortasizCalisma', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(fakeEvent);
                  }} className="mr-2" />
                  Sigortasız çalışma
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="tanik1Mobbing" checked={formData.tanik1Mobbing || false} onChange={(e) => {
                    const fakeEvent = { ...e, target: { ...e.target, name: 'tanik1Mobbing', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(fakeEvent);
                  }} className="mr-2" />
                  Mobbing
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="tanik1FazlaMesai" checked={formData.tanik1FazlaMesai || false} onChange={(e) => {
                    const fakeEvent = { ...e, target: { ...e.target, name: 'tanik1FazlaMesai', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(fakeEvent);
                  }} className="mr-2" />
                  Fazla mesai
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 2 - Ad Soyad (varsa)</label>
              <input type="text" name="tanik2Ad" value={formData.tanik2Ad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 2 - Çalıştığı/Çalışmış Olduğu Yer</label>
              <input type="text" name="tanik2CalistigiYer" value={formData.tanik2CalistigiYer || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 2 - Bildiği Hususlar</label>
              <textarea name="tanik2BildigiHususlar" value={formData.tanik2BildigiHususlar || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-4">e-Devlet SGK Dökümü Bilgileri</h3>
          
          <div className="space-y-2 mb-4">
            <label className="flex items-center">
              <input type="checkbox" name="sgkHicSigortaYok" checked={formData.sgkHicSigortaYok || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'sgkHicSigortaYok', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Hiç sigorta yok
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="sgkEksikGunVar" checked={formData.sgkEksikGunVar || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'sgkEksikGunVar', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Eksik gün var
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="sgkDusukUcretBildirimi" checked={formData.sgkDusukUcretBildirimi || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'sgkDusukUcretBildirimi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Düşük ücret bildirimi var
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="sgkTamAmaGecBildirim" checked={formData.sgkTamAmaGecBildirim || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'sgkTamAmaGecBildirim', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Tam ama geç bildirim var
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SGK'da Görünen İşe Giriş Tarihi</label>
              <input type="date" name="sgkGirisTarihi" value={formData.sgkGirisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SGK'da Görünen İşten Çıkış Tarihi</label>
              <input type="date" name="sgkCikisTarihi" value={formData.sgkCikisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <JustifiedTerminationReceivablesPreview formData={formData} />
    )
  },
  'unjust-termination-compensation-lawsuit': {
    getDefaultFormData: () => ({
      mahkemeAdi: '',
      davaciAd: '',
      davaciTC: '',
      davaciAdres: '',
      davaliUnvan: '',
      davaliAdres: '',
      arabulucuAd: '',
      arabuluculukBasvuruTarihi: '',
      sonTutanakTarihi: '',
      iseGirisTarihi: '',
      istenCikarilmaTarihi: '',
      gorev: '',
      aylikBrutUcret: '',
      fesihTarihi: '',
      yaziliBildirimYapilmadan: false,
      gecerliSebepGosterilmeden: false,
      savunmasiAlinmadan: false,
      fesihGerekcesi: '',
      calismaYili: '',
      calismaAyi: '',
      ihbarSuresiTaninmamis: false,
      ihbarSuresiEksikTaninmis: false,
      odenmeyenUcretAylari: '',
      kidemTazminati: false,
      ihbarTazminati: false,
      odenmeyenUcretAlacaklari: false,
      tanik1Ad: '',
      tanik1CalistigiYer: '',
      tanik1UcretOdenmemesi: false,
      tanik1SigortasizCalisma: false,
      tanik1Mobbing: false,
      tanik1FazlaMesai: false,
      tanik2Ad: '',
      tanik2CalistigiYer: '',
      tanik2BildigiHususlar: '',
      sgkHicSigortaYok: false,
      sgkEksikGunVar: false,
      sgkDusukUcretBildirimi: false,
      sgkTamAmaGecBildirim: false,
      sgkGirisTarihi: '',
      sgkCikisTarihi: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mahkeme Adı *</label>
          <input type="text" name="mahkemeAdi" value={formData.mahkemeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: İstanbul" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davacı Ad Soyad *</label>
          <input type="text" name="davaciAd" value={formData.davaciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davacı T.C. Kimlik No *</label>
          <input type="text" name="davaciTC" value={formData.davaciTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davacı Adres *</label>
          <textarea name="davaciAdres" value={formData.davaciAdres || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davalı Unvan *</label>
          <input type="text" name="davaliUnvan" value={formData.davaliUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davalı Adres *</label>
          <textarea name="davaliAdres" value={formData.davaliAdres || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Arabulucu Ad Soyad / Sicil No</label>
          <input type="text" name="arabulucuAd" value={formData.arabulucuAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Arabuluculuk Başvuru Tarihi</label>
            <input type="date" name="arabuluculukBasvuruTarihi" value={formData.arabuluculukBasvuruTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Son Tutanak Tarihi</label>
            <input type="date" name="sonTutanakTarihi" value={formData.sonTutanakTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">İşe Giriş Tarihi *</label>
            <input type="date" name="iseGirisTarihi" value={formData.iseGirisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">İşten Çıkarılma Tarihi *</label>
            <input type="date" name="istenCikarilmaTarihi" value={formData.istenCikarilmaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Görevi *</label>
          <input type="text" name="gorev" value={formData.gorev || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Aylık Brüt Ücret *</label>
          <input type="text" name="aylikBrutUcret" value={formData.aylikBrutUcret || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: 15.000 TL" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fesih Tarihi *</label>
          <input type="date" name="fesihTarihi" value={formData.fesihTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Fesih Şekli:</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" name="yaziliBildirimYapilmadan" checked={formData.yaziliBildirimYapilmadan || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'yaziliBildirimYapilmadan', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Yazılı bildirim yapılmadan
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="gecerliSebepGosterilmeden" checked={formData.gecerliSebepGosterilmeden || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'gecerliSebepGosterilmeden', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Geçerli bir sebep gösterilmeden
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="savunmasiAlinmadan" checked={formData.savunmasiAlinmadan || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'savunmasiAlinmadan', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Savunması alınmadan
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fesih Gerekçesi</label>
          <textarea name="fesihGerekcesi" value={formData.fesihGerekcesi || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Çalışma Yılı</label>
            <input type="number" name="calismaYili" value={formData.calismaYili || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Çalışma Ayı</label>
            <input type="number" name="calismaAyi" value={formData.calismaAyi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">İhbar Süresi:</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" name="ihbarSuresiTaninmamis" checked={formData.ihbarSuresiTaninmamis || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'ihbarSuresiTaninmamis', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              İhbar süresi tanınmamış
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="ihbarSuresiEksikTaninmis" checked={formData.ihbarSuresiEksikTaninmis || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'ihbarSuresiEksikTaninmis', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              İhbar süresi eksik tanınmış
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ödenmeyen Ücret Ayları (örn: Ocak, Şubat)</label>
          <input type="text" name="odenmeyenUcretAylari" value={formData.odenmeyenUcretAylari || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="örn: Ocak, Şubat" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Dava Konusu:</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" name="kidemTazminati" checked={formData.kidemTazminati || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'kidemTazminati', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Kıdem tazminatı
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="ihbarTazminati" checked={formData.ihbarTazminati || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'ihbarTazminati', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              İhbar tazminatı
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="odenmeyenUcretAlacaklari" checked={formData.odenmeyenUcretAlacaklari || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'odenmeyenUcretAlacaklari', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Ödenmeyen ücret alacakları
            </label>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-4">Tanık Listesi</h3>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 1 - Ad Soyad *</label>
              <input type="text" name="tanik1Ad" value={formData.tanik1Ad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 1 - Çalıştığı/Çalışmış Olduğu Yer *</label>
              <input type="text" name="tanik1CalistigiYer" value={formData.tanik1CalistigiYer || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tanık 1 - Bildiği Hususlar:</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" name="tanik1UcretOdenmemesi" checked={formData.tanik1UcretOdenmemesi || false} onChange={(e) => {
                    const fakeEvent = { ...e, target: { ...e.target, name: 'tanik1UcretOdenmemesi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(fakeEvent);
                  }} className="mr-2" />
                  Ücret ödenmemesi
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="tanik1SigortasizCalisma" checked={formData.tanik1SigortasizCalisma || false} onChange={(e) => {
                    const fakeEvent = { ...e, target: { ...e.target, name: 'tanik1SigortasizCalisma', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(fakeEvent);
                  }} className="mr-2" />
                  Sigortasız çalışma
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="tanik1Mobbing" checked={formData.tanik1Mobbing || false} onChange={(e) => {
                    const fakeEvent = { ...e, target: { ...e.target, name: 'tanik1Mobbing', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(fakeEvent);
                  }} className="mr-2" />
                  Mobbing
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="tanik1FazlaMesai" checked={formData.tanik1FazlaMesai || false} onChange={(e) => {
                    const fakeEvent = { ...e, target: { ...e.target, name: 'tanik1FazlaMesai', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(fakeEvent);
                  }} className="mr-2" />
                  Fazla mesai
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 2 - Ad Soyad (varsa)</label>
              <input type="text" name="tanik2Ad" value={formData.tanik2Ad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 2 - Çalıştığı/Çalışmış Olduğu Yer</label>
              <input type="text" name="tanik2CalistigiYer" value={formData.tanik2CalistigiYer || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanık 2 - Bildiği Hususlar</label>
              <textarea name="tanik2BildigiHususlar" value={formData.tanik2BildigiHususlar || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-4">e-Devlet SGK Dökümü Bilgileri</h3>
          
          <div className="space-y-2 mb-4">
            <label className="flex items-center">
              <input type="checkbox" name="sgkHicSigortaYok" checked={formData.sgkHicSigortaYok || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'sgkHicSigortaYok', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Hiç sigorta yok
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="sgkEksikGunVar" checked={formData.sgkEksikGunVar || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'sgkEksikGunVar', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Eksik gün var
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="sgkDusukUcretBildirimi" checked={formData.sgkDusukUcretBildirimi || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'sgkDusukUcretBildirimi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Düşük ücret bildirimi var
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="sgkTamAmaGecBildirim" checked={formData.sgkTamAmaGecBildirim || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'sgkTamAmaGecBildirim', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Tam ama geç bildirim var
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SGK'da Görünen İşe Giriş Tarihi</label>
              <input type="date" name="sgkGirisTarihi" value={formData.sgkGirisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SGK'da Görünen İşten Çıkış Tarihi</label>
              <input type="date" name="sgkCikisTarihi" value={formData.sgkCikisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => (
      <UnjustTerminationCompensationPreview formData={formData} />
    )
  },
};

// Basit template generator - diğer sözleşmeler için
const createSimpleTemplate = (title: string, fields: string[]): ContractTemplate => {
  const defaultData: ContractFormData = {};
  fields.forEach(field => {
    defaultData[field] = '';
  });
  
  return {
    getDefaultFormData: () => defaultData,
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} *</label>
            {field.includes('Adres') || field.includes('Konu') || field.includes('Açıklama') || field.includes('Talep') ? (
              <textarea name={field} value={formData[field] || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
            ) : field.includes('Tarih') ? (
              <input type="date" name={field} value={formData[field] || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            ) : field.includes('Tutar') || field.includes('Miktar') || field.includes('Bedel') ? (
              <input type="number" name={field} value={formData[field] || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            ) : (
              <input type="text" name={field} value={formData[field] || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            )}
          </div>
        ))}
      </div>
    ),
    renderPreview: (formData) => (
      <div className="p-8 text-sm leading-relaxed">
        <h1 className="text-xl font-bold text-center mb-6">{title.toUpperCase()}</h1>
        <div className="space-y-4">
          {fields.map(field => (
            <div key={field} className="mb-4">
              <p><strong>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {formData[field] || '___________________'}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-right">
          <p className="border-t pt-2 inline-block">İmza</p>
        </div>
      </div>
    ),
  };
};

// Diğer sözleşmeler için basit template'ler ekleniyor
const additionalSimpleTemplates: { [key: string]: { title: string; fields: string[] } } = {
  'student-permission': { title: 'Öğrenci İzin Dilekçesi', fields: ['ogrenciAd', 'ogrenciTC', 'okulAdi', 'sinif', 'izinKonusu', 'izinTarihi'] },
  'criminal-record-statement': { title: 'Sabıka Kaydı Beyanı', fields: ['adSoyad', 'tcKimlikNo', 'adres', 'beyanTarihi'] },
  'movable-property-loan': { title: 'Taşınır Eşya Ödüncü Sözleşmesi', fields: ['oduncVerenAd', 'oduncVerenTC', 'oduncAlanAd', 'oduncAlanTC', 'esyaAciklama', 'teslimTarihi', 'iadeTarihi'] },
  'movable-rental': { title: 'Taşınır Kiralama Sözleşmesi', fields: ['kirayaVerenAd', 'kirayaVerenTC', 'kiracıAd', 'kiracıTC', 'esyaAciklama', 'aylikKira', 'sozlesmeTarihi'] },
  'neighbor-complaint-letter': { title: 'Rahatsızlıkla İlgili Komşuya Mektup', fields: ['gonderenAd', 'gonderenAdres', 'aliciAd', 'rahatsizlikKonusu', 'tarih'] },
  'security-deposit-refund': { title: 'Güvence Bedeli İade Talebi', fields: ['talepEdenAd', 'talepEdenTC', 'güvenceBedeli', 'talepTarihi', 'aciklama'] },
  'visa-invitation-letter': { title: 'Vize Başvurusu Davet Mektubu', fields: ['davetEdenAd', 'davetEdenTC', 'davetEdenAdres', 'davetEdilenAd', 'davetEdilenUlke', 'ziyaretAmaci', 'ziyaretTarihi'] },
  'address-change-notification': { title: 'Adres Değişikliği Bildirimi', fields: ['adSoyad', 'tcKimlikNo', 'eskiAdres', 'yeniAdres', 'degisiklikTarihi'] },
  'long-term-vehicle-rental': { title: 'Uzun Dönem Araç Kiralama Sözleşmesi', fields: ['kirayaVerenAd', 'kirayaVerenTC', 'kiracıAd', 'kiracıTC', 'aracMarka', 'aracModel', 'plaka', 'aylikKira', 'sozlesmeSuresi', 'baslangicTarihi'] },
  'storage-agreement': { title: 'Saklama Sözleşmesi', fields: ['saklayanAd', 'saklayanTC', 'saklananAd', 'saklananTC', 'esyaAciklama', 'saklamaYeri', 'baslangicTarihi', 'bitisTarihi', 'ucret'] },
  'household-service-agreement': { title: 'Ev İşleri İçin Hizmet Sözleşmesi', fields: ['isVerenAd', 'isVerenTC', 'isVerenAdres', 'calisanAd', 'calisanTC', 'hizmetTuru', 'aylikUcret', 'calismaGunleri', 'baslangicTarihi'] },
  'bank-account-closure': { title: 'Banka Hesabını Kapatma Dilekçesi', fields: ['hesapSahibiAd', 'hesapSahibiTC', 'bankaAdi', 'hesapNo', 'kapatmaNedeni', 'tarih'] },
  'pool-maintenance-agreement': { title: 'Havuz Bakımına İlişkin Sözleşme', fields: ['havuzSahibiAd', 'havuzSahibiTC', 'havuzSahibiAdres', 'bakimFirmasiAd', 'bakimFirmasiAdres', 'aylikUcret', 'bakimPeriyodu', 'baslangicTarihi'] },
  'vehicle-sale-promise': { title: 'Araç Satış Vaadi Sözleşmesi', fields: ['saticiAd', 'saticiTC', 'alicıAd', 'alicıTC', 'aracMarka', 'aracModel', 'plaka', 'satisFiyati', 'peşinat', 'kalanTutar', 'odemePlani', 'sozlesmeTarihi'] },
  'diploma-request': { title: 'Diploma Talebi Dilekçesi', fields: ['ogrenciAd', 'ogrenciTC', 'okulAdi', 'bolum', 'mezuniyetYili', 'diplomaNo', 'talepTarihi'] },
  'grade-objection-primary-secondary': { title: 'İlköğretim ve Ortaöğretim Not İtiraz Dilekçesi', fields: ['ogrenciAd', 'ogrenciTC', 'okulAdi', 'sinif', 'dersAdi', 'itirazEdilenNot', 'itirazNedeni', 'tarih'] },
  'credit-card-closure': { title: 'Kredi Kartı Kapatma Dilekçesi', fields: ['kartSahibiAd', 'kartSahibiTC', 'bankaAdi', 'kartNo', 'kapatmaNedeni', 'tarih'] },
  'name-change-request': { title: 'İsim Değişikliği Talep Dilekçesi', fields: ['adSoyad', 'tcKimlikNo', 'eskiIsim', 'yeniIsim', 'degisiklikNedeni', 'tarih'] },
  'university-grade-objection': { title: 'Üniversite Not İtiraz Dilekçesi', fields: ['ogrenciAd', 'ogrenciTC', 'ogrenciNo', 'universiteAdi', 'fakulte', 'bolum', 'dersAdi', 'itirazEdilenNot', 'itirazNedeni', 'tarih'] },
  'green-passport-cadre-request': { title: 'Yeşil Pasaport İçin Kadro Derecesi Gösterir Belge Talebi', fields: ['adSoyad', 'tcKimlikNo', 'kurumAdi', 'gorevUnvani', 'kadroDerecesi', 'baslangicTarihi', 'talepTarihi'] },
  'surname-change-notification': { title: 'Soyadı Değişikliği Bildirimi', fields: ['adSoyad', 'tcKimlikNo', 'eskiSoyad', 'yeniSoyad', 'degisiklikNedeni', 'tarih'] },
  'high-school-grade-objection': { title: 'Lise Not İtiraz Dilekçesi', fields: ['ogrenciAd', 'ogrenciTC', 'okulAdi', 'sinif', 'dersAdi', 'itirazEdilenNot', 'itirazNedeni', 'tarih'] },
  'guardianship-appointment': { title: 'Vasi Atanması Dilekçesi', fields: ['dilekceSahibiAd', 'dilekceSahibiTC', 'vasisiOlunacakKisiAd', 'vasisiOlunacakKisiTC', 'vasisiOlunacakKisiYas', 'vasiAtamaNedeni', 'tarih'] },
  'excuse-exam-petition': { title: 'Mazeret Sınav Dilekçesi', fields: ['ogrenciAd', 'ogrenciTC', 'ogrenciNo', 'okulAdi', 'sinif', 'mazeretNedeni', 'mazeretTarihi', 'sinavTarihi', 'tarih'] },
  'widow-orphan-pension-request': { title: 'Dul/Yetim Aylığı Bağlanması İçin Talep Dilekçesi', fields: ['talepEdenAd', 'talepEdenTC', 'talepEdenAdres', 'vefatEdenAd', 'vefatEdenTC', 'vefatTarihi', 'iliskisi', 'tarih'] },
  'judicial-control-objection': { title: 'Adli Kontrol Kararına İtiraz Dilekçesi', fields: ['itirazEdenAd', 'itirazEdenTC', 'itirazEdenAdres', 'davaNo', 'kararTarihi', 'itirazNedeni', 'tarih'] },
  'detention-objection': { title: 'Tutukluluğa İtiraz Dilekçesi', fields: ['itirazEdenAd', 'itirazEdenTC', 'itirazEdenAdres', 'davaNo', 'tutuklamaTarihi', 'itirazNedeni', 'tarih'] },
  'foreclosure-objection': { title: 'Haciz Takibine İtiraz Dilekçesi', fields: ['itirazEdenAd', 'itirazEdenTC', 'itirazEdenAdres', 'takipNo', 'hacizTarihi', 'itirazNedeni', 'tarih'] },
  'enforcement-objection': { title: 'İlamlı İcra Takibine İtiraz Dilekçesi', fields: ['itirazEdenAd', 'itirazEdenTC', 'itirazEdenAdres', 'takipNo', 'icraTarihi', 'itirazNedeni', 'tarih'] },
  'alimony-reduction-lawsuit': { title: 'Nafakanın Azaltılması veya Kaldırılması İçin Dava Dilekçesi', fields: ['davaciAd', 'davaciTC', 'davaciAdres', 'davalıAd', 'davalıTC', 'mevcutNafaka', 'talepEdilenNafaka', 'azaltmaNedeni', 'tarih'] },
  'alimony-increase-lawsuit': { title: 'Nafakanın Artırılması Dava Dilekçesi', fields: ['davaciAd', 'davaciTC', 'davaciAdres', 'davalıAd', 'davalıTC', 'mevcutNafaka', 'talepEdilenNafaka', 'artirmaNedeni', 'tarih'] },
  'alimony-nonpayment-complaint': { title: 'Boşanma Sonrasında Nafakanın Ödenmemesine İlişkin Şikayet Dilekçesi', fields: ['sikayetEdenAd', 'sikayetEdenTC', 'sikayetEdenAdres', 'sikayetEdilenAd', 'sikayetEdilenTC', 'nafakaMiktari', 'odemeDurumu', 'tarih'] },
  'insolvency-certificate-request': { title: 'Aciz Belgesi Verilmesi Talebi', fields: ['talepEdenAd', 'talepEdenTC', 'talepEdenAdres', 'talepNedeni', 'tarih'] },
  'disable-auto-billing': { title: 'Otomatik Faturalandırmayı Devre Dışı Bırakma Mektubu', fields: ['gonderenAd', 'gonderenTC', 'gonderenAdres', 'firmaAdi', 'abonelikNo', 'talepTarihi'] },
  'line-cancellation': { title: 'Hat İptal Dilekçesi', fields: ['aboneAd', 'aboneTC', 'aboneAdres', 'firmaAdi', 'hatNo', 'iptalNedeni', 'tarih'] },
  'invoice-objection': { title: 'Fatura İtiraz Dilekçesi', fields: ['itirazEdenAd', 'itirazEdenTC', 'itirazEdenAdres', 'firmaAdi', 'faturaNo', 'faturaTarihi', 'itirazNedeni', 'tarih'] },
  'subscription-cancellation': { title: 'Abonelik İptal Dilekçesi', fields: ['aboneAd', 'aboneTC', 'aboneAdres', 'firmaAdi', 'abonelikNo', 'iptalNedeni', 'tarih'] },
  'monthly-goods-notice': { title: 'Aylık Malın Değişimi/Onarımı/İadesi İçin İhtarname', fields: ['gonderenAd', 'gonderenTC', 'gonderenAdres', 'aliciAd', 'aliciAdres', 'malAciklama', 'talepTuru', 'tarih'] },
  'association-organ-change': { title: 'Dernek Organlarındaki Değişiklik Bildirimi', fields: ['dernekAdi', 'dernekAdres', 'eskiOrganlar', 'yeniOrganlar', 'degisiklikTarihi', 'tarih'] },
  'association-address-change': { title: 'Dernek Yerleşim Yeri Değişikliği Bildirimi', fields: ['dernekAdi', 'eskiAdres', 'yeniAdres', 'degisiklikTarihi', 'tarih'] },
  'association-general-assembly-call': { title: 'Dernek Genel Kurulunu Toplantıya Çağrı', fields: ['dernekAdi', 'dernekAdres', 'toplantiTarihi', 'toplantiSaati', 'toplantiYeri', 'gundem', 'tarih'] },
  'association-bylaws': { title: 'Dernek Tüzüğü', fields: ['dernekAdi', 'dernekAdres', 'amac', 'calismaKonulari', 'organlar', 'tarih'] },
  // İş ve istihdam
  'defense-letter': { title: 'Savunma Yazısı', fields: ['calisanAd', 'calisanTC', 'calisanAdres', 'isverenAd', 'isverenAdres', 'savunmaKonusu', 'tarih'] },
  'flexible-work-request': { title: 'İşçinin Esnek Çalışma Talebi Dilekçesi', fields: ['calisanAd', 'calisanTC', 'calisanAdres', 'isverenAd', 'isverenAdres', 'esnekCalismaTuru', 'talepNedeni', 'baslangicTarihi', 'tarih'] },
  'caregiver-service-contract': { title: 'Bakıcı ve Yardımcı Hizmetli İş Sözleşmesi', fields: ['isverenAd', 'isverenTC', 'isverenAdres', 'calisanAd', 'calisanTC', 'calisanAdres', 'hizmetTuru', 'aylikUcret', 'calismaGunleri', 'baslangicTarihi', 'bitisTarihi'] },
  'retirement-request': { title: 'Emeklilik Talebi Dilekçesi', fields: ['calisanAd', 'calisanTC', 'calisanAdres', 'isverenAd', 'isverenAdres', 'emeklilikTarihi', 'tarih'] },
  'dismissal-reason-request': { title: 'İşten Çıkarılma Nedenini Öğrenme Talebi Mektubu', fields: ['calisanAd', 'calisanTC', 'calisanAdres', 'isverenAd', 'isverenAdres', 'cikarilmaTarihi', 'tarih'] },
  'job-offer-response': { title: 'İş Teklifi Kabul veya Ret Mektubu', fields: ['adSoyad', 'tcKimlikNo', 'adres', 'firmaAdi', 'firmaAdres', 'teklifTarihi', 'karar', 'baslangicTarihi', 'tarih'] },
  'salary-increase-request': { title: 'Maaş Artırımı Talebi', fields: ['calisanAd', 'calisanTC', 'calisanAdres', 'isverenAd', 'isverenAdres', 'mevcutMaas', 'talepEdilenMaas', 'artirmaNedeni', 'tarih'] },
  // İzin talebi
};

// Basit template'leri contractTemplates'e ekle
Object.keys(additionalSimpleTemplates).forEach(key => {
  const template = additionalSimpleTemplates[key];
  contractTemplates[key] = createSimpleTemplate(template.title, template.fields);
});

// Ev kiralama sözleşmesi için özel template (mevcut sayfadan alınacak)
// Bu dosya genişletilecek...

