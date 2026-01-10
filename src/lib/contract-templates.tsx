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

// A4 Sayfa Wrapper Component - Sayfa numaralandırması ve print desteği ile
const A4PageWrapper = ({ children, pageNumber, totalPages }: { children: React.ReactNode; pageNumber?: number; totalPages?: number }) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .a4-page {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 20mm 25mm !important;
            box-shadow: none !important;
            page-break-after: auto !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
      <div 
        className="a4-page bg-white mb-4"
        style={{
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          padding: '20mm 25mm',
          fontSize: '12px',
          lineHeight: '1.6',
          position: 'relative',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
          pageBreakAfter: 'auto',
          pageBreakInside: 'avoid',
        }}
      >
        <div style={{ minHeight: 'calc(297mm - 40mm)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          {(pageNumber !== undefined && totalPages !== undefined) && (
            <div 
              style={{
                position: 'absolute',
                bottom: '15mm',
                right: '25mm',
                fontSize: '10px',
                color: '#666',
                textAlign: 'right',
              }}
            >
              Sayfa {pageNumber} / {totalPages}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Uzun içeriği sayfalara bölen yardımcı fonksiyon
const splitIntoPages = (content: React.ReactNode[], itemsPerPage: number = 1) => {
  const pages: React.ReactNode[][] = [];
  for (let i = 0; i < content.length; i += itemsPerPage) {
    pages.push(content.slice(i, i + itemsPerPage));
  }
  return pages;
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
  <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
      konutIl: '',
      konutIlce: '',
      konutMahalle: '',
      konutCadde: '',
      konutBinaNo: '',
      konutDaireNo: '',
      sozlesmeBaslangic: '',
      sozlesmeSuresi: '',
      aylikKiraBedeli: '',
      odemeGunu: '',
      depozito: '',
      depozitoBanka: '',
      esyalar: [{ no: 1, ad: '', marka: '', model: '', adet: '', durum: '' }],
      yetkiliMahkeme: '',
      sozlesmeTarihi: '',
      tahliyeTaahhutTarihi: '',
    }),
    getFormFields: (formData, onChange) => {
      const handleEsyaChange = (index: number, field: string, value: string) => {
        try {
          const currentEsyalar = Array.isArray(formData.esyalar) && formData.esyalar.length > 0 
            ? formData.esyalar 
            : [{ no: 1, ad: '', marka: '', model: '', adet: '', durum: '' }];
          const newEsyalar = [...currentEsyalar];
          if (!newEsyalar[index]) {
            newEsyalar[index] = { no: index + 1, ad: '', marka: '', model: '', adet: '', durum: '' };
          }
          newEsyalar[index] = { ...newEsyalar[index], [field]: value };
          const syntheticEvent = {
            target: { name: 'esyalar', value: newEsyalar, type: 'text' }
          } as any;
          onChange(syntheticEvent);
        } catch (error) {
          console.error('Eşya değiştirme hatası:', error);
        }
      };
      
      const addEsya = () => {
        try {
          const currentEsyalar = Array.isArray(formData.esyalar) && formData.esyalar.length > 0
            ? formData.esyalar 
            : [{ no: 1, ad: '', marka: '', model: '', adet: '', durum: '' }];
          const newEsyalar = [...currentEsyalar];
          newEsyalar.push({ no: newEsyalar.length + 1, ad: '', marka: '', model: '', adet: '', durum: '' });
          const syntheticEvent = {
            target: { name: 'esyalar', value: newEsyalar, type: 'text' }
          } as any;
          onChange(syntheticEvent);
        } catch (error) {
          console.error('Eşya ekleme hatası:', error);
        }
      };
      
      const removeEsya = (index: number) => {
        try {
          const currentEsyalar = Array.isArray(formData.esyalar) && formData.esyalar.length > 0
            ? formData.esyalar 
            : [{ no: 1, ad: '', marka: '', model: '', adet: '', durum: '' }];
          if (currentEsyalar.length <= 1) return; // En az 1 eşya kalmalı
          const newEsyalar = [...currentEsyalar];
          newEsyalar.splice(index, 1);
          newEsyalar.forEach((esya, idx) => { esya.no = idx + 1; });
          const syntheticEvent = {
            target: { name: 'esyalar', value: newEsyalar, type: 'text' }
          } as any;
          onChange(syntheticEvent);
        } catch (error) {
          console.error('Eşya silme hatası:', error);
        }
      };
      
      return (
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">MADDE 1 – TARAFLAR</h3>
          <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium mb-2">KİRAYA VEREN (MALİK)</h4>
                <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                    <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                    <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
                    <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                    <label className="block text-sm font-medium mb-1">Adres *</label>
                    <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
                <h4 className="text-md font-medium mb-2">KİRACI</h4>
                <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                    <input type="text" name="kiracıAd" value={formData.kiracıAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                    <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
                    <input type="text" name="kiracıTC" value={formData.kiracıTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                    <label className="block text-sm font-medium mb-1">Adres *</label>
                    <textarea name="kiracıAdres" value={formData.kiracıAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
            </div>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">MADDE 2 – KİRAYA VERİLEN TAŞINMAZ</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
        <div>
                  <label className="block text-sm font-medium mb-1">İl *</label>
                  <input type="text" name="konutIl" value={formData.konutIl || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
            <div>
                  <label className="block text-sm font-medium mb-1">İlçe *</label>
                  <input type="text" name="konutIlce" value={formData.konutIlce || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Mahalle *</label>
                <input type="text" name="konutMahalle" value={formData.konutMahalle || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cadde/Sokak *</label>
                <input type="text" name="konutCadde" value={formData.konutCadde || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Bina No *</label>
                  <input type="text" name="konutBinaNo" value={formData.konutBinaNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Daire No *</label>
                  <input type="text" name="konutDaireNo" value={formData.konutDaireNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
            </div>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">MADDE 3 – SÖZLEŞMENİN SÜRESİ (KISA SÜRELİ)</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
                  <input type="date" name="sozlesmeBaslangic" value={formData.sozlesmeBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Süre (Ay) *</label>
                  <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="6-11 arası" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">MADDE 4 – KİRA BEDELİ</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli (TL) *</label>
                <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Günü (Ayın kaçıncı günü) *</label>
                <input type="text" name="odemeGunu" value={formData.odemeGunu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 5" />
              </div>
            </div>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">MADDE 6 – DEPOZİTO (BANKA HESABINDA)</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Depozito Tutarı (TL) *</label>
                <input type="text" name="depozito" value={formData.depozito || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banka Hesabı (IBAN) *</label>
                <input type="text" name="depozitoBanka" value={formData.depozitoBanka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR..." />
              </div>
            </div>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">MADDE 7 – DETAYLI EŞYA LİSTESİ VE TESLİM TUTANAĞI</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">Konutta bulunan eşyaları listeleyin:</p>
              {Array.isArray(formData.esyalar) && formData.esyalar.length > 0 ? (
                formData.esyalar.map((esya: any, index: number) => (
                  <div key={`esya-${index}`} className="border p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Eşya #{esya?.no || index + 1}</span>
                      {formData.esyalar.length > 1 && (
                        <button type="button" onClick={() => removeEsya(index)} className="text-red-600 text-sm">Sil</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Eşya Adı *</label>
                        <input type="text" value={esya?.ad || ''} onChange={(e) => handleEsyaChange(index, 'ad', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Marka</label>
                        <input type="text" value={esya?.marka || ''} onChange={(e) => handleEsyaChange(index, 'marka', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Model</label>
                        <input type="text" value={esya?.model || ''} onChange={(e) => handleEsyaChange(index, 'model', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Adet</label>
                        <input type="text" value={esya?.adet || ''} onChange={(e) => handleEsyaChange(index, 'adet', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Durum *</label>
                      <input type="text" value={esya?.durum || ''} onChange={(e) => handleEsyaChange(index, 'durum', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" required placeholder="Örn: Yeni, İyi, Orta" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="border p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Eşya #1</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Eşya Adı *</label>
                      <input type="text" value="" onChange={(e) => handleEsyaChange(0, 'ad', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Marka</label>
                      <input type="text" value="" onChange={(e) => handleEsyaChange(0, 'marka', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Model</label>
                      <input type="text" value="" onChange={(e) => handleEsyaChange(0, 'model', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Adet</label>
                      <input type="text" value="" onChange={(e) => handleEsyaChange(0, 'adet', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Durum *</label>
                    <input type="text" value="" onChange={(e) => handleEsyaChange(0, 'durum', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" required placeholder="Örn: Yeni, İyi, Orta" />
                  </div>
                </div>
              )}
              <button type="button" onClick={addEsya} className="w-full py-2 px-4 border border-dashed rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                + Eşya Ekle
              </button>
            </div>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">MADDE 14 – YETKİ</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Yetkili Mahkeme Şehri *</label>
              <input type="text" name="yetkiliMahkeme" value={formData.yetkiliMahkeme || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">MADDE 15 – YÜRÜRLÜK</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
              <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
              </div>
              <div>
            <h3 className="text-lg font-semibold mb-4">TAHLİYE TAAHHÜDÜ</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Tahliye Taahhüt Tarihi *</label>
              <input type="date" name="tahliyeTaahhutTarihi" value={formData.tahliyeTaahhutTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
        </div>
      );
    },
    renderPreview: (formData) => {
      const sozlesmeBaslangic = formData.sozlesmeBaslangic ? formatDate(formData.sozlesmeBaslangic) : '___________________';
      const sozlesmeTarihi = formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________';
      const tahliyeTaahhutTarihi = formData.tahliyeTaahhutTarihi ? formatDate(formData.tahliyeTaahhutTarihi) : '___________________';
      
      const page1Content = (
        <>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">EŞYALI KONUT KİRA SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
              <div>
              <p className="font-semibold mb-2">MADDE 1 – TARAFLAR</p>
              <div className="space-y-2">
                <p className="font-semibold mb-1">KİRAYA VEREN (MALİK):</p>
                <p>Ad Soyad: <strong>{formData.kirayaVerenAd || '___________________'}</strong></p>
                <p>T.C. Kimlik No: <strong>{formData.kirayaVerenTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.kirayaVerenAdres || '___________________'}</strong></p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="font-semibold mb-1">KİRACI:</p>
                <p>Ad Soyad: <strong>{formData.kiracıAd || '___________________'}</strong></p>
                <p>T.C. Kimlik No: <strong>{formData.kiracıTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.kiracıAdres || '___________________'}</strong></p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 2 – KİRAYA VERİLEN TAŞINMAZ</p>
              <p className="text-justify">
                Kiraya verilen taşınmaz; <strong>{formData.konutIl || '___________________'}</strong> ili, <strong>{formData.konutIlce || '___________________'}</strong> ilçesi, <strong>{formData.konutMahalle || '___________________'}</strong> mahallesi, <strong>{formData.konutCadde || '___________________'}</strong> cadde/sokak, <strong>{formData.konutBinaNo || '___________________'}</strong> bina no, <strong>{formData.konutDaireNo || '___________________'}</strong> daire no adresinde bulunan eşyalı konut niteliğindeki taşınmazdır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 3 – SÖZLEŞMENİN SÜRESİ (KISA SÜRELİ)</p>
              <p className="text-justify">
                İşbu sözleşme <strong>{sozlesmeBaslangic}</strong> tarihinde başlayacak olup <strong>{formData.sozlesmeSuresi || '___________________'}</strong> ay (en az 6 – en fazla 11 ay) süreli olarak akdedilmiştir. Süre sonunda sözleşme kendiliğinden sona erer, uzama ancak tarafların yazılı mutabakatı ile mümkündür.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 4 – KİRA BEDELİ</p>
              <p>
                Aylık kira bedeli <strong>{formData.aylikKiraBedeli || '___________________'}</strong> TL'dir. Kira bedeli her ayın <strong>{formData.odemeGunu || '___________________'}</strong>. günü, kiraya verenin bildireceği banka hesabına havale/EFT yoluyla ödenir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 5 – KİRA ARTIŞI</p>
              <p className="text-justify">
                Sözleşmenin uzaması hâlinde uygulanacak kira artış oranı, Türk Borçlar Kanunu m.344 uyarınca bir önceki kira yılına ait TÜFE on iki aylık ortalama değişim oranını geçmemek üzere belirlenir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 6 – DEPOZİTO (BANKA HESABINDA)</p>
              <p className="text-justify">
                Kiracı, <strong>{formData.depozito || '___________________'}</strong> TL depozito bedelini kiraya veren adına açılmış banka hesabına (<strong>{formData.depozitoBanka || '___________________'}</strong>) yatırmıştır. Depozito, taşınmaz ve eşyaların eksiksiz ve hasarsız teslimi sonrası iade edilir.
              </p>
            </div>
          </div>
        </>
      );

      const page2Content = (
        <>
          <div className="space-y-4">
              <div>
              <p className="font-semibold mb-2">MADDE 7 – DETAYLI EŞYA LİSTESİ VE TESLİM TUTANAĞI</p>
              <p className="mb-2">
                Kiraya verilen konutta bulunan eşyalar aşağıda belirtilmiştir:
              </p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse border border-gray-400 text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-400 px-2 py-1 text-left">No</th>
                      <th className="border border-gray-400 px-2 py-1 text-left">Eşya Adı</th>
                      <th className="border border-gray-400 px-2 py-1 text-left">Marka</th>
                      <th className="border border-gray-400 px-2 py-1 text-left">Model</th>
                      <th className="border border-gray-400 px-2 py-1 text-left">Adet</th>
                      <th className="border border-gray-400 px-2 py-1 text-left">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.esyalar || []).map((esya: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-400 px-2 py-1">{esya.no || index + 1}</td>
                        <td className="border border-gray-400 px-2 py-1">{esya.ad || '___________________'}</td>
                        <td className="border border-gray-400 px-2 py-1">{esya.marka || '___________________'}</td>
                        <td className="border border-gray-400 px-2 py-1">{esya.model || '___________________'}</td>
                        <td className="border border-gray-400 px-2 py-1">{esya.adet || '___________________'}</td>
                        <td className="border border-gray-400 px-2 py-1">{esya.durum || '___________________'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-2">
                Bu tablo ve fotoğraflar, işbu sözleşmenin ayrılmaz eki olan teslim tutanağını oluşturur.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 8 – KULLANIM VE SORUMLULUK</p>
              <p className="text-justify">
                Kiracı, taşınmazı ve eşyaları özenle kullanmakla yükümlüdür. Olağan kullanım dışındaki tüm zararlar kiracı tarafından karşılanır.
              </p>
          </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 9 – AİDAT VE GİDERLER</p>
              <p className="text-justify">
                Aidat, elektrik, su, doğalgaz, internet ve benzeri tüm kullanım giderleri kiracıya aittir.
              </p>
        </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 10 – GÜNLÜK KİRALAMA / AIRBNB YASAĞI</p>
              <p className="text-justify">
                Kiracı; taşınmazı Airbnb, Booking, günlük veya saatlik kiralama, alt kiralama veya benzeri ticari amaçlarla kesinlikle kullanamaz. Aykırılık hâlinde sözleşme haklı nedenle derhal feshedilir.
              </p>
      </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 11 – İHTİYAÇ SEBEBİYLE TAHLİYE</p>
              <p className="text-justify">
                Kiraya verenin kendisi, eşi, altsoyu, üstsoyu veya bakmakla yükümlü olduğu kişiler için konut ihtiyacı doğması hâlinde, kiraya veren TBK m.350 uyarınca sözleşmeyi feshederek tahliye talep edebilir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 12 – TAHLİYE TAAHHÜDÜ İLE BİRLİKTE KULLANIM</p>
              <p className="text-justify">
                Kiracı, işbu sözleşme ile birlikte ayrı tarihli tahliye taahhüdü imzalayacağını, taahhüt tarihine kadar taşınmazı kayıtsız şartsız tahliye etmeyi kabul eder.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 13 – TEBLİGAT</p>
              <p className="text-justify">
                Tarafların yukarıda belirtilen adresleri yasal tebligat adresidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 14 – YETKİ</p>
              <p>
                İşbu sözleşmeden doğacak uyuşmazlıklarda <strong>{formData.yetkiliMahkeme || '___________________'}</strong> Sulh Hukuk Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 15 – YÜRÜRLÜK</p>
              <p>
                İşbu sözleşme <strong>{sozlesmeTarihi}</strong> tarihinde 2 nüsha olarak düzenlenmiş, taraflarca okunarak imza altına alınmıştır.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">KİRAYA VEREN</p>
                  <p className="mb-2">Ad Soyad</p>
                  <p className="mt-4">{formData.kirayaVerenAd || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KİRACI</p>
                  <p className="mb-2">Ad Soyad</p>
                  <p className="mt-4">{formData.kiracıAd || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
              </div>
            </div>
          </div>
        </>
      );

      const tahliyeTaahhutContent = (
        <>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">TAHLİYE TAAHHÜDÜ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">TARAFLAR</p>
              <div className="space-y-2">
                <p className="font-semibold mb-1">KİRAYA VEREN (MALİK):</p>
                <p>Ad Soyad: <strong>{formData.kirayaVerenAd || '___________________'}</strong></p>
                <p>T.C. Kimlik No: <strong>{formData.kirayaVerenTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.kirayaVerenAdres || '___________________'}</strong></p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="font-semibold mb-1">KİRACI:</p>
                <p>Ad Soyad: <strong>{formData.kiracıAd || '___________________'}</strong></p>
                <p>T.C. Kimlik No: <strong>{formData.kiracıTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.kiracıAdres || '___________________'}</strong></p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU</p>
              <p className="text-justify">
                Kiraya veren ile kiracı arasında <strong>{sozlesmeTarihi}</strong> tarihinde imzalanan Eşyalı Konut Kira Sözleşmesi'ne konu taşınmazın tahliyesine ilişkin taahhütname.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">TAHLİYE TAAHHÜDÜ</p>
              <p className="mb-2 text-justify">
                Kiracı olarak, yukarıda belirtilen <strong>{formData.konutIl || '___________________'}</strong> ili, <strong>{formData.konutIlce || '___________________'}</strong> ilçesi, <strong>{formData.konutMahalle || '___________________'}</strong> mahallesi, <strong>{formData.konutCadde || '___________________'}</strong> cadde/sokak, <strong>{formData.konutBinaNo || '___________________'}</strong> bina no, <strong>{formData.konutDaireNo || '___________________'}</strong> daire no adresindeki eşyalı konut niteliğindeki taşınmazı;
              </p>
              <p className="mb-2 text-justify">
                <strong>{tahliyeTaahhutTarihi}</strong> tarihine kadar kayıtsız şartsız tahliye etmeyi, taşınmazı ve içindeki tüm eşyaları eksiksiz, hasarsız ve temiz bir şekilde teslim etmeyi taahhüt ederim.
              </p>
              <p className="mb-2 text-justify">
                Belirtilen tarihe kadar tahliye gerçekleşmezse, kiraya verenin yasal yollara başvurma hakkı saklıdır ve bu durumda tüm yargılama giderleri, vekalet ücreti ve gecikme tazminatı kiracıya aittir.
              </p>
              <p className="text-justify">
                Bu taahhütname, Eşyalı Konut Kira Sözleşmesi'nin ayrılmaz bir parçasıdır ve sözleşme ile birlikte geçerlidir.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">KİRAYA VEREN</p>
                  <p className="mb-2">Ad Soyad</p>
                  <p className="mt-4">{formData.kirayaVerenAd || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KİRACI</p>
                  <p className="mb-2">Ad Soyad</p>
                  <p className="mt-4">{formData.kiracıAd || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
              </div>
              <p className="text-center mt-4 text-xs">
                <strong>Tarih:</strong> {tahliyeTaahhutTarihi}
              </p>
            </div>
          </div>
        </>
      );
      
      return (
        <div style={{ padding: '20px 0' }}>
          <A4PageWrapper pageNumber={1} totalPages={3}>
            {page1Content}
          </A4PageWrapper>
          <A4PageWrapper pageNumber={2} totalPages={3}>
            {page2Content}
          </A4PageWrapper>
          <A4PageWrapper pageNumber={3} totalPages={3}>
            {tahliyeTaahutContent}
          </A4PageWrapper>
        </div>
      );
    },
  },
  
  // KAT KARŞILIĞI BİNA YAPIM SÖZLEŞMESİ
  'construction-agreement': {
    getDefaultFormData: () => ({
      arsaSahibiAd: '',
      arsaSahibiTC: '',
      arsaSahibiAdres: '',
      arsaSahibiTuru: 'sahis',
      yukleniciAd: '',
      yukleniciTC: '',
      yukleniciAdres: '',
      yukleniciTuru: 'sahis',
      tapuIl: '',
      tapuIlce: '',
      tapuAda: '',
      tapuParsel: '',
      toplamBagimsizBolum: '',
      arsaSahibineDusen: '',
      yukleniciyeDusen: '',
      insaatSuresi: '',
      gecikmeCezasi: '',
      tapuDevir30: '',
      tapuDevir60: '',
      teminat: '',
      asansorMarka: '',
      asansorKisilik: '',
      dogramaMarka: '',
      dogramaTuru: 'PVC',
      zeminMarka: '',
      zeminTuru: 'seramik',
      yetkiliMahkeme: '',
      sozlesmeTarihi: '',
      sozlesmeNusha: '2',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 1 – TARAFLAR</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium mb-2">ARSA SAHİBİ</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Türü *</label>
                  <select name="arsaSahibiTuru" value={formData.arsaSahibiTuru || 'sahis'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                    <option value="sahis">Şahıs</option>
                    <option value="firma">Firma</option>
                  </select>
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad / Ünvan *</label>
                  <input type="text" name="arsaSahibiAd" value={formData.arsaSahibiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Vergi No *</label>
                  <input type="text" name="arsaSahibiTC" value={formData.arsaSahibiTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="arsaSahibiAdres" value={formData.arsaSahibiAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
              <h4 className="text-md font-medium mb-2">YÜKLENİCİ (MÜTEAHHİT)</h4>
              <div className="space-y-2">
            <div>
                  <label className="block text-sm font-medium mb-1">Türü *</label>
                  <select name="yukleniciTuru" value={formData.yukleniciTuru || 'sahis'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                    <option value="sahis">Şahıs</option>
                    <option value="firma">Firma</option>
                  </select>
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad / Ünvan *</label>
                  <input type="text" name="yukleniciAd" value={formData.yukleniciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Vergi No *</label>
                  <input type="text" name="yukleniciTC" value={formData.yukleniciTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="yukleniciAdres" value={formData.yukleniciAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 2 – TAŞINMAZ BİLGİLERİ</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
        <div>
                <label className="block text-sm font-medium mb-1">İl *</label>
                <input type="text" name="tapuIl" value={formData.tapuIl || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            <div>
                <label className="block text-sm font-medium mb-1">İlçe *</label>
                <input type="text" name="tapuIlce" value={formData.tapuIlce || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ada *</label>
                <input type="text" name="tapuAda" value={formData.tapuAda || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parsel *</label>
                <input type="text" name="tapuParsel" value={formData.tapuParsel || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 4 – PROJE BİLGİLERİ</h3>
              <div>
            <label className="block text-sm font-medium mb-1">Toplam Bağımsız Bölüm Sayısı *</label>
            <input type="text" name="toplamBagimsizBolum" value={formData.toplamBagimsizBolum || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 10 daire + 2 dükkân = 12" />
              </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 5 – BAĞIMSIZ BÖLÜM PAYLAŞIMI</h3>
          <div className="space-y-2">
              <div>
              <label className="block text-sm font-medium mb-1">Arsa Sahibine Düşen Bağımsız Bölümler *</label>
              <textarea name="arsaSahibineDusen" value={formData.arsaSahibineDusen || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 1,2,3,4 nolu daireler veya %50" />
              </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yükleniciye Düşen Bağımsız Bölümler *</label>
              <textarea name="yukleniciyeDusen" value={formData.yukleniciyeDusen || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 7 – İNŞAAT SÜRESİ</h3>
              <div>
            <label className="block text-sm font-medium mb-1">İnşaat Süresi (Ay) *</label>
            <input type="text" name="insaatSuresi" value={formData.insaatSuresi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 18" />
              </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 8 – GECİKME CEZASI VE KİRA TAZMİNATI</h3>
              <div>
            <label className="block text-sm font-medium mb-1">Gecikme Cezası (TL/Ay) *</label>
            <input type="text" name="gecikmeCezasi" value={formData.gecikmeCezasi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 9 – TAPU DEVRİ VE AŞAMALI TESLİM</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">%30 Seviye Bağımsız Bölüm Sayısı *</label>
              <input type="text" name="tapuDevir30" value={formData.tapuDevir30 || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">%60 Seviye Bağımsız Bölüm Sayısı *</label>
              <input type="text" name="tapuDevir60" value={formData.tapuDevir60 || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 10 – TEMİNAT</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Teminat Tutarı (TL) *</label>
            <input type="text" name="teminat" value={formData.teminat || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 11 – TEKNİK ŞARTNAME</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Asansör Marka</label>
                <input type="text" name="asansorMarka" value={formData.asansorMarka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Asansör Kişilik</label>
                <input type="text" name="asansorKisilik" value={formData.asansorKisilik || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: 6" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Doğrama Marka</label>
                <input type="text" name="dogramaMarka" value={formData.dogramaMarka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Doğrama Türü *</label>
                <select name="dogramaTuru" value={formData.dogramaTuru || 'PVC'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="PVC">PVC</option>
                  <option value="Alüminyum">Alüminyum</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Zemin Marka</label>
                <input type="text" name="zeminMarka" value={formData.zeminMarka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zemin Türü *</label>
                <select name="zeminTuru" value={formData.zeminTuru || 'seramik'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="seramik">Seramik</option>
                  <option value="parke">Parke</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 14 – YETKİ</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Yetkili Mahkeme Şehri *</label>
            <input type="text" name="yetkiliMahkeme" value={formData.yetkiliMahkeme || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">MADDE 15 – YÜRÜRLÜK</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
              <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nüsha Sayısı *</label>
              <input type="text" name="sozlesmeNusha" value={formData.sozlesmeNusha || '2'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const sozlesmeTarihi = formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________';
      const arsaSahibiKimlik = formData.arsaSahibiTuru === 'sahis' ? 'T.C. Kimlik No' : 'Vergi No';
      const yukleniciKimlik = formData.yukleniciTuru === 'sahis' ? 'T.C. Kimlik No' : 'Vergi No';
      
      const page1Content = (
        <>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">KAT KARŞILIĞI BİNA YAPIM SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <p className="mb-4 text-justify">
              Bu sözleşme, aşağıda bilgileri bulunan taraflar arasında, arsa sahibini ve yükleniciyi koruyacak şekilde, noter ve tapu uygulamalarına uygun olarak düzenlenmiştir.
            </p>
            
            <div>
              <p className="font-semibold mb-2">MADDE 1 – TARAFLAR</p>
              <div className="space-y-2">
                <p className="font-semibold mb-1">ARSA SAHİBİ:</p>
                <p>Ad Soyad / Ünvan: <strong>{formData.arsaSahibiAd || '___________________'}</strong></p>
                <p>{arsaSahibiKimlik}: <strong>{formData.arsaSahibiTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.arsaSahibiAdres || '___________________'}</strong></p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="font-semibold mb-1">YÜKLENİCİ (MÜTEAHHİT):</p>
                <p>Ad Soyad / Ünvan: <strong>{formData.yukleniciAd || '___________________'}</strong></p>
                <p>{yukleniciKimlik}: <strong>{formData.yukleniciTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.yukleniciAdres || '___________________'}</strong></p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 2 – TAŞINMAZ BİLGİLERİ</p>
              <div className="space-y-1 ml-4">
                <p>İl: <strong>{formData.tapuIl || '___________________'}</strong></p>
                <p>İlçe: <strong>{formData.tapuIlce || '___________________'}</strong></p>
                <p>Ada: <strong>{formData.tapuAda || '___________________'}</strong></p>
                <p>Parsel: <strong>{formData.tapuParsel || '___________________'}</strong></p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 3 – SÖZLEŞMENİN KONUSU</p>
              <p className="text-justify">
                İşbu sözleşmenin konusu; yukarıda bilgileri yazılı taşınmaz üzerine, yürürlükteki imar mevzuatına uygun şekilde bina yapılması ve ortaya çıkacak bağımsız bölümlerin kat karşılığı esasına göre taraflar arasında paylaşılmasıdır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 4 – PROJE BİLGİLERİ</p>
              <p>
                Toplam bağımsız bölüm sayısı: <strong>{formData.toplamBagimsizBolum || '___________________'}</strong>
              </p>
              <p className="text-xs mt-1">(Örn: 10 daire + 2 dükkân = 12)</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 5 – BAĞIMSIZ BÖLÜM PAYLAŞIMI</p>
              <p className="mb-2">
                Arsa sahibine düşen bağımsız bölümler:
              </p>
              <p className="ml-4 mb-2"><strong>{formData.arsaSahibineDusen || '___________________'}</strong></p>
              <p className="mb-2">
                Yükleniciye düşen bağımsız bölümler:
              </p>
              <p className="ml-4 mb-2"><strong>{formData.yukleniciyeDusen || '___________________'}</strong></p>
              <p className="text-xs mt-2">
                Bağımsız bölümlerin kat, cephe, net/brüt metrekare ve kullanım amacı ekli paylaşım krokisi ve mimari projede gösterilmiştir.
              </p>
            </div>
          </div>
        </>
      );

      const page2Content = (
        <>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">MADDE 6 – PROJE, RUHSAT VE İMAR RİSKLERİ</p>
              <p className="text-justify">
                Mimari, statik, elektrik ve mekanik projelerin hazırlanması ve yapı ruhsatının alınması yükleniciye aittir. İmar mevzuatından veya idari uygulamalardan kaynaklanan gecikmeler mücbir sebep olarak değerlendirilir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 7 – İNŞAAT SÜRESİ</p>
              <p>
                İnşaat süresi, yapı ruhsatının alındığı tarihten itibaren <strong>{formData.insaatSuresi || '___________________'}</strong> aydır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 8 – GECİKME CEZASI VE KİRA TAZMİNATI</p>
              <p className="text-justify">
                Yüklenicinin kusuru ile teslim gecikirse, geciken her ay için <strong>{formData.gecikmeCezasi || '___________________'}</strong> TL gecikme cezası ve ayrıca arsa sahibinin mahrum kaldığı kira bedeli ödenir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 9 – TAPU DEVRİ VE AŞAMALI TESLİM</p>
              <p>
                Tapu devirleri aşağıdaki inşaat seviyelerine bağlı olarak yapılacaktır:
              </p>
              <div className="ml-4 mt-2 space-y-1">
                <p>%30 seviye: <strong>{formData.tapuDevir30 || '___________________'}</strong> bağımsız bölüm</p>
                <p>%60 seviye: <strong>{formData.tapuDevir60 || '___________________'}</strong> bağımsız bölüm</p>
                <p>İskân sonrası: kalan bağımsız bölümler</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 10 – TEMİNAT</p>
              <p className="text-justify">
                Yüklenici, sözleşme hükümlerinin yerine getirilmesini teminen <strong>{formData.teminat || '___________________'}</strong> TL bedelli teminat senedi / banka teminat mektubu sunmayı kabul eder. Teminat, iskan alındıktan sonra iade edilir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 11 – TEKNİK ŞARTNAME</p>
              <p className="mb-2">
                İnşaatta kullanılacak malzemeler aşağıdaki asgari standartlara uygun olacaktır:
              </p>
              <div className="ml-4 space-y-1">
                <p>Beton: C30</p>
                <p>Asansör: <strong>{formData.asansorMarka || '___________________'}</strong> marka / <strong>{formData.asansorKisilik || '___________________'}</strong> kişilik</p>
                <p>Doğrama: <strong>{formData.dogramaMarka || '___________________'}</strong> marka <strong>{formData.dogramaTuru || 'PVC'}</strong> / Alüminyum</p>
                <p>Zemin: <strong>{formData.zeminMarka || '___________________'}</strong> marka <strong>{formData.zeminTuru || 'seramik'}</strong> / parke</p>
              </div>
              <p className="text-xs mt-2">(Teknik şartname işbu sözleşmenin ayrılmaz ekidir.)</p>
            </div>
          </div>
        </>
      );

      const page3Content = (
        <>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">MADDE 12 – MÜCBİR SEBEPLER</p>
              <p className="text-justify">
                Deprem, yangın, pandemi, resmi yasaklar, ruhsat gecikmeleri ve idari engeller mücbir sebep sayılır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 13 – FESİH</p>
              <p className="text-justify">
                Taraflardan biri sözleşmeye aykırı davranırsa, diğer taraf yazılı ihtar ile sözleşmeyi feshedebilir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 14 – YETKİ</p>
              <p>
                İşbu sözleşmeden doğacak uyuşmazlıklarda <strong>{formData.yetkiliMahkeme || '___________________'}</strong> Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 15 – YÜRÜRLÜK</p>
              <p>
                İşbu sözleşme <strong>{sozlesmeTarihi}</strong> tarihinde noter huzurunda <strong>{formData.sozlesmeNusha || '2'}</strong> nüsha olarak imzalanmıştır.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">ARSA SAHİBİ</p>
                  <p className="mb-2">Ad Soyad / Ünvan</p>
                  <p className="mt-4">{formData.arsaSahibiAd || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">YÜKLENİCİ</p>
                  <p className="mb-2">Ad Soyad / Ünvan</p>
                  <p className="mt-4">{formData.yukleniciAd || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
      
      return (
        <div style={{ padding: '20px 0' }}>
          <A4PageWrapper pageNumber={1} totalPages={3}>
            {page1Content}
          </A4PageWrapper>
          <A4PageWrapper pageNumber={2} totalPages={3}>
            {page2Content}
          </A4PageWrapper>
          <A4PageWrapper pageNumber={3} totalPages={3}>
            {page3Content}
          </A4PageWrapper>
        </div>
      );
    },
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
      kirayaVerenUnvan: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıUnvan: '',
      kiracıTC: '',
      kiracıAdres: '',
      aracPlaka: '',
      aracMarka: '',
      aracModel: '',
      aracSasiNo: '',
      yakitDurumu: '',
      teslimKilometresi: '',
      baslangicTarihi: '',
      baslangicSaati: '',
      iadeTarihi: '',
      iadeSaati: '',
      kiraBedeli: '',
      odemeSekli: 'nakit',
      gunlukKmSiniri: '',
      kmAsimUcreti: '',
      ekSurucuAdi: '',
      depozito: '',
      depozitoIadeGunu: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">1. TARAFLAR</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium mb-2">KİRAYA VEREN</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Ünvanı *</label>
                  <input type="text" name="kirayaVerenUnvan" value={formData.kirayaVerenUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. No / Vergi No *</label>
                  <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
              <h4 className="text-md font-medium mb-2">KİRACI</h4>
              <div className="space-y-2">
            <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Ünvanı *</label>
                  <input type="text" name="kiracıUnvan" value={formData.kiracıUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. No / Vergi No *</label>
                  <input type="text" name="kiracıTC" value={formData.kiracıTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="kiracıAdres" value={formData.kiracıAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">2. ARAÇ BİLGİLERİ</h3>
          <div className="space-y-2">
        <div>
              <label className="block text-sm font-medium mb-1">Plaka *</label>
              <input type="text" name="aracPlaka" value={formData.aracPlaka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
              <div>
              <label className="block text-sm font-medium mb-1">Marka / Model *</label>
              <input type="text" name="aracMarka" value={formData.aracMarka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Toyota Corolla" />
              </div>
              <div>
              <label className="block text-sm font-medium mb-1">Şasi No *</label>
              <input type="text" name="aracSasiNo" value={formData.aracSasiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yakıt Durumu *</label>
              <input type="text" name="yakitDurumu" value={formData.yakitDurumu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Çeyrek Depo / Tam Depo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teslim Kilometresi *</label>
              <input type="text" name="teslimKilometresi" value={formData.teslimKilometresi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 50000" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">3. KİRALAMA SÜRESİ VE BEDELİ</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
                <input type="date" name="baslangicTarihi" value={formData.baslangicTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Başlangıç Saati *</label>
                <input type="time" name="baslangicSaati" value={formData.baslangicSaati || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">İade Tarihi *</label>
                <input type="date" name="iadeTarihi" value={formData.iadeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">İade Saati *</label>
                <input type="time" name="iadeSaati" value={formData.iadeSaati || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kira Bedeli (TL) *</label>
              <input type="text" name="kiraBedeli" value={formData.kiraBedeli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ödeme Şekli *</label>
              <select name="odemeSekli" value={formData.odemeSekli || 'nakit'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="nakit">Nakit</option>
                <option value="havale">Havale</option>
                <option value="kredi-karti">Kredi Kartı</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Günlük Kilometre Sınırı *</label>
              <input type="text" name="gunlukKmSiniri" value={formData.gunlukKmSiniri || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 300" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">KM Aşımı Ücreti (TL/KM) *</label>
              <input type="text" name="kmAsimUcreti" value={formData.kmAsimUcreti || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 2" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">4. TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ek Sürücü Adı (Varsa)</label>
              <input type="text" name="ekSurucuAdi" value={formData.ekSurucuAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Boş bırakılabilir" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">5. TEMİNAT VE DEPOZİTO</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Depozito Tutarı (TL) *</label>
              <input type="text" name="depozito" value={formData.depozito || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Depozito İade Günü *</label>
              <input type="text" name="depozitoIadeGunu" value={formData.depozitoIadeGunu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 7" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const baslangicTarihi = formData.baslangicTarihi ? formatDate(formData.baslangicTarihi) : '___________________';
      const iadeTarihi = formData.iadeTarihi ? formatDate(formData.iadeTarihi) : '___________________';
      const baslangicSaati = formData.baslangicSaati || '___________________';
      const iadeSaati = formData.iadeSaati || '___________________';
      const odemeSekliText = formData.odemeSekli === 'nakit' ? 'Nakit' : formData.odemeSekli === 'havale' ? 'Havale' : 'Kredi Kartı';
      
      const page1Content = (
        <>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ARAÇ KİRALAMA SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. TARAFLAR</p>
              <p className="mb-2"><strong>KİRAYA VEREN:</strong> <strong>{formData.kirayaVerenUnvan || '___________________'}</strong>, <strong>{formData.kirayaVerenTC || '___________________'}</strong>, <strong>{formData.kirayaVerenAdres || '___________________'}</strong></p>
              <p><strong>KİRACI:</strong> <strong>{formData.kiracıUnvan || '___________________'}</strong>, <strong>{formData.kiracıTC || '___________________'}</strong>, <strong>{formData.kiracıAdres || '___________________'}</strong></p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. ARAÇ BİLGİLERİ</p>
              <p>Plaka: <strong>{formData.aracPlaka || '___________________'}</strong></p>
              <p>Marka / Model: <strong>{formData.aracMarka || '___________________'}</strong></p>
              <p>Şasi No: <strong>{formData.aracSasiNo || '___________________'}</strong></p>
              <p>Yakıt Durumu: <strong>{formData.yakitDurumu || '___________________'}</strong></p>
              <p>Teslim Kilometresi: <strong>{formData.teslimKilometresi || '___________________'}</strong></p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">3. KİRALAMA SÜRESİ VE BEDELİ</p>
              <p>Başlangıç Tarihi ve Saati: <strong>{baslangicTarihi}</strong> - <strong>{baslangicSaati}</strong></p>
              <p>İade Tarihi ve Saati: <strong>{iadeTarihi}</strong> - <strong>{iadeSaati}</strong></p>
              <p>Kira Bedeli: <strong>{formData.kiraBedeli || '___________________'}</strong> TL. (Ödeme Şekli: <strong>{odemeSekliText}</strong>)</p>
              <p className="text-justify">
                Kilometre Sınırı: Günlük <strong>{formData.gunlukKmSiniri || '___________________'}</strong> KM. (Sınır aşımı durumunda KM başına <strong>{formData.kmAsimUcreti || '___________________'}</strong> TL tahsil edilir.)
              </p>
            </div>
          </div>
        </>
      );

      const page2Content = (
        <>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">4. TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ</p>
              <p className="text-justify mb-2">
                <strong>Kullanım:</strong> Araç, kiralayan dışında {formData.ekSurucuAdi ? `"${formData.ekSurucuAdi}"` : 'kimse'} tarafından kullanılabilir. Araç; yarış, hız denemesi, ağır yük taşıma veya yasal olmayan işlerde kullanılamaz.
              </p>
              <p className="text-justify mb-2">
                <strong>Trafik Cezaları ve Köprü Geçişleri:</strong> Kira süresi boyunca oluşan tüm trafik cezaları, HGS/OGS geçiş ücretleri ve hatalı park nedeniyle oluşacak masraflar Kiracı'ya aittir.
              </p>
              <p className="text-justify mb-2">
                <strong>Yakıt ve Temizlik:</strong> Araç hangi yakıt seviyesiyle teslim alındıysa o seviyede iade edilmelidir. Eksik yakıt durumunda yakıt bedeli ve hizmet ücreti kiracıdan tahsil edilir.
              </p>
              <p className="text-justify mb-2">
                <strong>Hasar ve Kaza:</strong> Kaza durumunda kiracı, aracı yerinden oynatmadan trafik zaptı tutturmak ve en geç 24 saat içinde kiraya verene bildirmek zorundadır. Alkol veya uyuşturucu etkisi altında yapılan kazalarda tüm sorumluluk kiracıya aittir.
              </p>
              <p className="text-justify">
                <strong>Bakım:</strong> Aracın periyodik bakımları kiraya verene, günlük kontrol (su, yağ) kiracıya aittir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. TEMİNAT VE DEPOZİTO</p>
              <p className="text-justify">
                Kiracı, olası trafik cezaları ve hasarlar için <strong>{formData.depozito || '___________________'}</strong> TL depozito ödemiştir. Bu tutar, iade tarihinden <strong>{formData.depozitoIadeGunu || '___________________'}</strong> gün sonra yapılacak kontrol neticesinde iade edilecektir.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">KİRAYA VEREN</p>
                  <p className="mt-4">{formData.kirayaVerenUnvan || '___________________'}</p>
                  <p className="mt-4">(İmza)</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KİRACI</p>
                  <p className="mt-4">{formData.kiracıUnvan || '___________________'}</p>
                  <p className="mt-4">(İmza)</p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
      
      return (
        <div style={{ padding: '20px 0' }}>
          <A4PageWrapper pageNumber={1} totalPages={2}>
            {page1Content}
          </A4PageWrapper>
          <A4PageWrapper pageNumber={2} totalPages={2}>
            {page2Content}
          </A4PageWrapper>
        </div>
      );
    },
  },
  
  // DEPO KİRALAMA SÖZLEŞMESİ
  'warehouse': {
    getDefaultFormData: () => ({
      kirayaVerenUnvan: '',
      kirayaVerenTC: '',
      kirayaVerenAdres: '',
      kiracıUnvan: '',
      kiracıTC: '',
      kiracıAdres: '',
      depoIl: '',
      depoIlce: '',
      depoMahalle: '',
      depoAda: '',
      depoParsel: '',
      depoMetrekare: '',
      sozlesmeBaslangic: '',
      sozlesmeSuresi: '',
      sozlesmeSuresiTuru: 'ay',
      aylikKiraBedeli: '',
      odemeGunu: '',
      depozito: '',
      depozitoBanka: '',
      yuklemeBaslangic: '',
      yuklemeBitis: '',
      gecikmeFaizi: '',
      cezaiSart: '',
      yetkiliMahkeme: '',
      sozlesmeTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 1 – TARAFLAR</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium mb-2">KİRAYA VEREN</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad / Unvan *</label>
                  <input type="text" name="kirayaVerenUnvan" value={formData.kirayaVerenUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Vergi No *</label>
                  <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
              <h4 className="text-md font-medium mb-2">KİRACI</h4>
              <div className="space-y-2">
            <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad / Unvan *</label>
                  <input type="text" name="kiracıUnvan" value={formData.kiracıUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Vergi No *</label>
                  <input type="text" name="kiracıTC" value={formData.kiracıTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="kiracıAdres" value={formData.kiracıAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 2 – KİRAYA VERİLEN DEPO</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
        <div>
                <label className="block text-sm font-medium mb-1">İl *</label>
                <input type="text" name="depoIl" value={formData.depoIl || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            <div>
                <label className="block text-sm font-medium mb-1">İlçe *</label>
                <input type="text" name="depoIlce" value={formData.depoIlce || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mahalle *</label>
              <input type="text" name="depoMahalle" value={formData.depoMahalle || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ada *</label>
                <input type="text" name="depoAda" value={formData.depoAda || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parsel *</label>
                <input type="text" name="depoParsel" value={formData.depoParsel || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
              <div>
              <label className="block text-sm font-medium mb-1">Metrekare (m²) *</label>
              <input type="text" name="depoMetrekare" value={formData.depoMetrekare || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 100" />
              </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 3 – SÖZLEŞMENİN SÜRESİ</h3>
          <div className="space-y-2">
              <div>
              <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
              <input type="date" name="sozlesmeBaslangic" value={formData.sozlesmeBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Süre *</label>
                <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 12" />
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Süre Türü *</label>
                <select name="sozlesmeSuresiTuru" value={formData.sozlesmeSuresiTuru || 'ay'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="ay">Ay</option>
                  <option value="yıl">Yıl</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 4 – KİRA BEDELİ VE ÖDEME</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli (TL + KDV) *</label>
              <input type="text" name="aylikKiraBedeli" value={formData.aylikKiraBedeli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ödeme Günü (Ayın kaçıncı günü) *</label>
              <input type="text" name="odemeGunu" value={formData.odemeGunu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 5" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 6 – DEPOZİTO (BANKA HESABINDA)</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Depozito Tutarı (TL) *</label>
              <input type="text" name="depozito" value={formData.depozito || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Banka Hesabı (IBAN) *</label>
              <input type="text" name="depozitoBanka" value={formData.depozitoBanka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR..." />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 9 – TİCARİ KULLANIMA İLİŞKİN ÖZEL ŞARTLAR</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Yükleme Başlangıç Saati *</label>
                <input type="text" name="yuklemeBaslangic" value={formData.yuklemeBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 08:00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yükleme Bitiş Saati *</label>
                <input type="text" name="yuklemeBitis" value={formData.yuklemeBitis || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 18:00" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 10 – GECİKME FAİZİ VE CEZAİ ŞART</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Gecikme Faizi Oranı (%)</label>
              <input type="text" name="gecikmeFaizi" value={formData.gecikmeFaizi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: 2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cezai Şart Tutarı (TL)</label>
              <input type="text" name="cezaiSart" value={formData.cezaiSart || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Boş bırakılabilir" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 15 – YETKİ</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Yetkili Mahkeme Şehri *</label>
            <input type="text" name="yetkiliMahkeme" value={formData.yetkiliMahkeme || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 16 – YÜRÜRLÜK</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
            <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const sozlesmeBaslangic = formData.sozlesmeBaslangic ? formatDate(formData.sozlesmeBaslangic) : '___________________';
      const sozlesmeTarihi = formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________';
      const sozlesmeSuresiText = formData.sozlesmeSuresi ? `${formData.sozlesmeSuresi} ${formData.sozlesmeSuresiTuru === 'yıl' ? 'yıl' : 'ay'}` : '___________________';
      
      const page1Content = (
        <>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">DEPO KİRALAMA SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">MADDE 1 – TARAFLAR</p>
              <div className="space-y-2">
                <p className="font-semibold mb-1">KİRAYA VEREN:</p>
                <p>Ad Soyad / Unvan: <strong>{formData.kirayaVerenUnvan || '___________________'}</strong></p>
                <p>T.C. Kimlik No / Vergi No: <strong>{formData.kirayaVerenTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.kirayaVerenAdres || '___________________'}</strong></p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="font-semibold mb-1">KİRACI:</p>
                <p>Ad Soyad / Unvan: <strong>{formData.kiracıUnvan || '___________________'}</strong></p>
                <p>T.C. Kimlik No / Vergi No: <strong>{formData.kiracıTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.kiracıAdres || '___________________'}</strong></p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 2 – KİRAYA VERİLEN DEPO</p>
              <p className="text-justify">
                Kiraya verilen depo; <strong>{formData.depoIl || '___________________'}</strong> ili, <strong>{formData.depoIlce || '___________________'}</strong> ilçesi, <strong>{formData.depoMahalle || '___________________'}</strong> mahallesi, <strong>{formData.depoAda || '___________________'}</strong> ada, <strong>{formData.depoParsel || '___________________'}</strong> parsel üzerinde bulunan, yaklaşık <strong>{formData.depoMetrekare || '___________________'}</strong> m² büyüklüğünde ticari depo niteliğindeki taşınmazdır.
              </p>
              <p className="text-justify mt-2">
                Depo yalnızca ticari depolama amacıyla kullanılacaktır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 3 – SÖZLEŞMENİN SÜRESİ</p>
              <p className="text-justify">
                İşbu sözleşme <strong>{sozlesmeBaslangic}</strong> tarihinde başlayacak olup <strong>{sozlesmeSuresiText}</strong> sürelidir. Süre sonunda sözleşme, tarafların yazılı mutabakatı olmadıkça sona erer.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 4 – KİRA BEDELİ VE ÖDEME</p>
              <p className="text-justify">
                Aylık kira bedeli <strong>{formData.aylikKiraBedeli || '___________________'}</strong> TL + KDV'dir. Kira bedeli her ayın <strong>{formData.odemeGunu || '___________________'}</strong>. günü, kiraya verenin bildireceği banka hesabına ödenir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 5 – KİRA ARTIŞI (TİCARİ KİRA)</p>
              <p className="text-justify">
                Sözleşmenin uzaması hâlinde uygulanacak kira artış oranı, bir önceki kira yılına ait TÜFE on iki aylık ortalama değişim oranını geçmemek üzere belirlenir. Taraflar, bu oranın ticari kira hükümlerine uygun olduğunu kabul eder.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 6 – DEPOZİTO (BANKA HESABINDA)</p>
              <p className="text-justify">
                Kiracı, <strong>{formData.depozito || '___________________'}</strong> TL depozito bedelini kiraya veren adına açılmış banka hesabına (<strong>{formData.depozitoBanka || '___________________'}</strong>) yatırmıştır. Depozito, sözleşme sona erdiğinde deponun hasarsız ve borçsuz teslimi sonrası iade edilir.
              </p>
            </div>
          </div>
        </>
      );

      const page2Content = (
        <>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">MADDE 7 – GENİŞLETİLMİŞ TEHLİKELİ MADDE YASAĞI</p>
              <p className="text-justify">
                Kiracı; patlayıcı, yanıcı, kimyasal, toksik, çevreye zararlı, mevzuata aykırı veya sigorta kapsamı dışında kalan her türlü maddeyi depoda bulunduramaz. Aykırılık hâli haklı fesih ve derhal tahliye sebebidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 8 – SİGORTA YAPTIRMA ZORUNLULUĞU</p>
              <p className="text-justify">
                Kiracı, depoda bulunan emtia ve ekipmanlar için yangın, sel, hırsızlık ve üçüncü kişilere verilebilecek zararları kapsayan sigortayı yaptırmakla yükümlüdür. Sigorta poliçesi kiraya verene ibraz edilir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 9 – TİCARİ KULLANIMA İLİŞKİN ÖZEL ŞARTLAR</p>
              <p className="text-justify mb-2">
                Raf sistemleri ve sabit ekipmanlar kiraya verenin yazılı izni olmaksızın kurulamaz.
              </p>
              <p className="text-justify mb-2">
                Yükleme ve boşaltma işlemleri <strong>{formData.yuklemeBaslangic || '___________________'}</strong> – <strong>{formData.yuklemeBitis || '___________________'}</strong> saatleri arasında yapılabilir.
              </p>
              <p className="text-justify">
                Depoda gürültü, çevre kirliliği ve komşuları rahatsız edecek faaliyetler yapılamaz.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 10 – GECİKME FAİZİ VE CEZAİ ŞART</p>
              {formData.gecikmeFaizi || formData.cezaiSart ? (
                <>
                  {formData.gecikmeFaizi && (
                    <p className="text-justify">
                      Kira bedelinin süresinde ödenmemesi hâlinde, geciken her gün için <strong>{formData.gecikmeFaizi}</strong>% oranında gecikme faizi uygulanır.
                    </p>
                  )}
                  {formData.cezaiSart && (
                    <p className="text-justify mt-2">
                      Ayrıca her gecikme için <strong>{formData.cezaiSart}</strong> TL cezai şart ödeneceği kabul edilmiştir.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-justify">
                  Kira bedelinin süresinde ödenmemesi hâlinde, geciken her gün için belirlenen oranında gecikme faizi uygulanır. Ayrıca her gecikme için belirlenen tutarda cezai şart ödeneceği kabul edilmiştir.
                </p>
              )}
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 11 – TAHLİYE TAAHHÜDÜ İLE BİRLİKTE KULLANIM</p>
              <p className="text-justify">
                Kiracı, işbu sözleşme ile birlikte ayrı tarihli tahliye taahhüdü imzalayacağını ve taahhüt tarihinde depoyu kayıtsız şartsız tahliye edeceğini kabul eder.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 12 – FESİH VE TAHLİYE</p>
              <p className="text-justify">
                Sözleşmeye aykırılık hâlinde kiraya veren sözleşmeyi tek taraflı feshedebilir. Kiracı, fesih hâlinde depoyu derhal tahliye etmekle yükümlüdür.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 13 – NOTER VE TAPU ŞERHİNE UYGUNLUK</p>
              <p className="text-justify">
                İşbu sözleşme, talep hâlinde noterde düzenlenmeye ve tapu kütüğüne şerh edilmeye uygundur. Taraflar bu hususta mutabıktır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 14 – TEBLİGAT</p>
              <p className="text-justify">
                Tarafların sözleşmede belirtilen adresleri yasal tebligat adresidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 15 – YETKİ</p>
              <p>
                İşbu sözleşmeden doğacak uyuşmazlıklarda <strong>{formData.yetkiliMahkeme || '___________________'}</strong> Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 16 – YÜRÜRLÜK</p>
              <p>
                İşbu sözleşme <strong>{sozlesmeTarihi}</strong> tarihinde 2 nüsha olarak düzenlenmiş ve taraflarca imza altına alınmıştır.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">KİRAYA VEREN</p>
                  <p className="mb-2">Ad Soyad / Unvan</p>
                  <p className="mt-4">{formData.kirayaVerenUnvan || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KİRACI</p>
                  <p className="mb-2">Ad Soyad / Unvan</p>
                  <p className="mt-4">{formData.kiracıUnvan || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
      
      return (
        <div style={{ padding: '20px 0' }}>
          <A4PageWrapper pageNumber={1} totalPages={2}>
            {page1Content}
          </A4PageWrapper>
          <A4PageWrapper pageNumber={2} totalPages={2}>
            {page2Content}
          </A4PageWrapper>
        </div>
      );
    },
  },
  
  // SATIŞ SÖZLEŞMESİ
  'sale': {
    getDefaultFormData: () => ({
      satıcıUnvan: '',
      satıcıTC: '',
      satıcıAdres: '',
      alıcıUnvan: '',
      alıcıTC: '',
      alıcıAdres: '',
      malTanimi: '',
      malAdresi: '',
      satisBedeli: '',
      odemeSekli: 'peşin',
      peşinTutar: '',
      kalanTutar: '',
      odemeTarihi: '',
      teslimTarihi: '',
      teslimYeri: '',
      garantiSuresi: '',
      yetkiliMahkeme: '',
      sozlesmeTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 1 – TARAFLAR</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium mb-2">SATICI</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Unvan / Ad Soyad *</label>
                  <input type="text" name="satıcıUnvan" value={formData.satıcıUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Vergi No *</label>
                  <input type="text" name="satıcıTC" value={formData.satıcıTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="satıcıAdres" value={formData.satıcıAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
              <h4 className="text-md font-medium mb-2">ALICI</h4>
              <div className="space-y-2">
            <div>
                  <label className="block text-sm font-medium mb-1">Unvan / Ad Soyad *</label>
                  <input type="text" name="alıcıUnvan" value={formData.alıcıUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Vergi No *</label>
                  <input type="text" name="alıcıTC" value={formData.alıcıTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="alıcıAdres" value={formData.alıcıAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 2 – SÖZLEŞMENİN KONUSU</h3>
          <div className="space-y-2">
        <div>
              <label className="block text-sm font-medium mb-1">Satılan Mal/Gayrimenkul Tanımı *</label>
              <textarea name="malTanimi" value={formData.malTanimi || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Araç, Gayrimenkul, Eşya vb." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mal/Gayrimenkul Adresi</label>
              <textarea name="malAdresi" value={formData.malAdresi || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Gayrimenkul ise adres, araç ise plaka vb." />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 3 – SATIŞ BEDELİ VE ÖDEME</h3>
          <div className="space-y-2">
              <div>
              <label className="block text-sm font-medium mb-1">Satış Bedeli (TL) *</label>
              <input type="text" name="satisBedeli" value={formData.satisBedeli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
              <label className="block text-sm font-medium mb-1">Ödeme Şekli *</label>
              <select name="odemeSekli" value={formData.odemeSekli || 'peşin'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="peşin">Peşin</option>
                <option value="taksitli">Taksitli</option>
                <option value="kısmi">Kısmi Ödeme</option>
              </select>
              </div>
            {formData.odemeSekli !== 'peşin' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Peşin Tutar (TL)</label>
                  <input type="text" name="peşinTutar" value={formData.peşinTutar || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Kalan Tutar (TL)</label>
                  <input type="text" name="kalanTutar" value={formData.kalanTutar || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
              <div>
                  <label className="block text-sm font-medium mb-1">Kalan Tutar Ödeme Tarihi</label>
                  <input type="date" name="odemeTarihi" value={formData.odemeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              </>
            )}
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 4 – TESLİMAT</h3>
          <div className="space-y-2">
              <div>
              <label className="block text-sm font-medium mb-1">Teslim Tarihi *</label>
              <input type="date" name="teslimTarihi" value={formData.teslimTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teslim Yeri</label>
              <textarea name="teslimYeri" value={formData.teslimYeri || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Teslim edilecek yer" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 5 – AYIP VE GARANTİ</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Garanti Süresi</label>
            <input type="text" name="garantiSuresi" value={formData.garantiSuresi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: 1 yıl, 6 ay" />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 6 – YETKİ</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Yetkili Mahkeme Şehri *</label>
            <input type="text" name="yetkiliMahkeme" value={formData.yetkiliMahkeme || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 7 – YÜRÜRLÜK</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
            <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const sozlesmeTarihi = formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________';
      const teslimTarihi = formData.teslimTarihi ? formatDate(formData.teslimTarihi) : '___________________';
      const odemeTarihi = formData.odemeTarihi ? formatDate(formData.odemeTarihi) : '___________________';
      
      const page1Content = (
        <>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">SATIŞ SÖZLEŞMESİ</h1>
          </div>
          
          <div className="mb-6">
            <p className="text-justify mb-4">
              İşbu Satış Sözleşmesi, aşağıda bilgileri bulunan taraflar arasında, 6098 sayılı Türk Borçlar Kanunu ve ilgili mevzuat hükümleri uyarınca akdedilmiştir.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">MADDE 1 – TARAFLAR</p>
              <div className="space-y-2">
                <p className="font-semibold mb-1">SATICI:</p>
                <p>Unvan / Ad Soyad: <strong>{formData.satıcıUnvan || '___________________'}</strong></p>
                <p>T.C. Kimlik No / Vergi No: <strong>{formData.satıcıTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.satıcıAdres || '___________________'}</strong></p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="font-semibold mb-1">ALICI:</p>
                <p>Unvan / Ad Soyad: <strong>{formData.alıcıUnvan || '___________________'}</strong></p>
                <p>T.C. Kimlik No / Vergi No: <strong>{formData.alıcıTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.alıcıAdres || '___________________'}</strong></p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 2 – SÖZLEŞMENİN KONUSU</p>
              <p className="text-justify mb-2">
                İşbu sözleşmenin konusu; satıcının, aşağıda belirtilen mal/gayrimenkulü alıcıya satması ve alıcının da bu mal/gayrimenkulü satın almasıdır.
              </p>
              <p className="mb-2"><strong>Satılan Mal/Gayrimenkul:</strong></p>
              <p className="text-justify">{formData.malTanimi || '___________________'}</p>
              {formData.malAdresi && (
                <p className="mt-2"><strong>Adres/Konum:</strong> {formData.malAdresi}</p>
              )}
            </div>
          </div>
        </>
      );

      const page2Content = (
        <>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">MADDE 3 – SATIŞ BEDELİ VE ÖDEME</p>
              <p className="text-justify mb-2">
                Satış bedeli <strong>{formData.satisBedeli || '___________________'}</strong> TL'dir.
              </p>
              {formData.odemeSekli === 'peşin' ? (
                <p className="text-justify">
                  Ödeme, sözleşme tarihinde peşin olarak yapılacaktır.
                </p>
              ) : (
                <>
                  <p className="text-justify">
                    Ödeme şekli: <strong>{formData.odemeSekli === 'taksitli' ? 'Taksitli' : 'Kısmi Ödeme'}</strong>
                  </p>
                  {formData.peşinTutar && (
                    <p className="text-justify">
                      Peşin tutar: <strong>{formData.peşinTutar}</strong> TL (Sözleşme tarihinde ödenecektir)
                    </p>
                  )}
                  {formData.kalanTutar && (
                    <p className="text-justify">
                      Kalan tutar: <strong>{formData.kalanTutar}</strong> TL
                    </p>
                  )}
                  {formData.odemeTarihi && (
                    <p className="text-justify">
                      Kalan tutar, <strong>{odemeTarihi}</strong> tarihinde ödenecektir.
                    </p>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 4 – TESLİMAT</p>
              <p className="text-justify">
                Satılan mal/gayrimenkul, <strong>{teslimTarihi}</strong> tarihinde {formData.teslimYeri ? `"${formData.teslimYeri}" adresinde` : 'belirlenen yerde'} alıcıya teslim edilecektir. Teslim anında mal/gayrimenkulün durumu taraflarca birlikte tespit edilecek ve teslim tutanağı düzenlenecektir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 5 – AYIP VE GARANTİ</p>
              {formData.garantiSuresi ? (
                <p className="text-justify">
                  Satıcı, satılan mal/gayrimenkulün <strong>{formData.garantiSuresi}</strong> süre ile garanti altında olduğunu, bu süre içinde ortaya çıkacak ayıplardan sorumlu olduğunu kabul eder.
                </p>
              ) : (
                <p className="text-justify">
                  Satıcı, satılan mal/gayrimenkulün sözleşmede belirtilen özelliklere uygun olduğunu, ayıpsız teslim edildiğini kabul eder. Alıcı, teslim anında mal/gayrimenkulü inceleme ve ayıp varsa bildirme hakkına sahiptir.
                </p>
              )}
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 6 – YETKİ</p>
              <p>
                İşbu sözleşmeden doğacak uyuşmazlıklarda <strong>{formData.yetkiliMahkeme || '___________________'}</strong> Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 7 – YÜRÜRLÜK</p>
              <p>
                İşbu sözleşme <strong>{sozlesmeTarihi}</strong> tarihinde 2 nüsha olarak düzenlenmiş, taraflarca okunarak imza altına alınmıştır.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">SATICI</p>
                  <p className="mb-2">Ad Soyad / Unvan</p>
                  <p className="mt-4">{formData.satıcıUnvan || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">ALICI</p>
                  <p className="mb-2">Ad Soyad / Unvan</p>
                  <p className="mt-4">{formData.alıcıUnvan || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
      
      return (
        <div style={{ padding: '20px 0' }}>
          <A4PageWrapper pageNumber={1} totalPages={2}>
            {page1Content}
          </A4PageWrapper>
          <A4PageWrapper pageNumber={2} totalPages={2}>
            {page2Content}
          </A4PageWrapper>
        </div>
      );
    },
  },
  
  // HİZMET SÖZLEŞMESİ
  'service': {
    getDefaultFormData: () => ({
      hizmetAlanUnvan: '',
      hizmetAlanTC: '',
      hizmetAlanAdres: '',
      hizmetVerenUnvan: '',
      hizmetVerenTC: '',
      hizmetVerenAdres: '',
      hizmetKonusu: '',
      hizmetKapsami: '',
      sozlesmeBaslangic: '',
      sozlesmeBitis: '',
      sozlesmeUzama: 'sona-erer',
      hizmetBedeli: '',
      odemePeriyodu: '',
      odemeBanka: '',
      cezaiSart: '',
      fesihSuresi: '',
      yetkiliMahkeme: '',
      sozlesmeTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 1 – TARAFLAR</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium mb-2">HİZMET ALAN</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Unvan / Ad Soyad *</label>
                  <input type="text" name="hizmetAlanUnvan" value={formData.hizmetAlanUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Vergi No *</label>
                  <input type="text" name="hizmetAlanTC" value={formData.hizmetAlanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="hizmetAlanAdres" value={formData.hizmetAlanAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
              <h4 className="text-md font-medium mb-2">HİZMET VEREN</h4>
              <div className="space-y-2">
            <div>
                  <label className="block text-sm font-medium mb-1">Unvan / Ad Soyad *</label>
                  <input type="text" name="hizmetVerenUnvan" value={formData.hizmetVerenUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Vergi No *</label>
                  <input type="text" name="hizmetVerenTC" value={formData.hizmetVerenTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="hizmetVerenAdres" value={formData.hizmetVerenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 2 – SÖZLEŞMENİN KONUSU</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Hizmet Konusu *</label>
            <input type="text" name="hizmetKonusu" value={formData.hizmetKonusu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Danışmanlık, Yazılım Geliştirme, Muhasebe Hizmetleri" />
            </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 3 – HİZMETİN KAPSAMI</h3>
              <div>
            <label className="block text-sm font-medium mb-1">Hizmet Kapsamı *</label>
            <textarea name="hizmetKapsami" value={formData.hizmetKapsami || ''} onChange={onChange} rows={5} className="w-full px-3 py-2 border rounded-lg" required placeholder="Hizmetin kapsamını maddeler halinde yazın..." />
              </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 4 – SÜRE</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
                <input type="date" name="sozlesmeBaslangic" value={formData.sozlesmeBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bitiş Tarihi *</label>
                <input type="date" name="sozlesmeBitis" value={formData.sozlesmeBitis || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            </div>
              <div>
              <label className="block text-sm font-medium mb-1">Süre Bitiminde *</label>
              <select name="sozlesmeUzama" value={formData.sozlesmeUzama || 'sona-erer'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="sona-erer">Sözleşme sona erer</option>
                <option value="uzar">Aynı şartlarla uzar</option>
              </select>
              </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 5 – HİZMET BEDELİ VE ÖDEME</h3>
          <div className="space-y-2">
              <div>
              <label className="block text-sm font-medium mb-1">Hizmet Bedeli (TL + KDV) *</label>
              <input type="text" name="hizmetBedeli" value={formData.hizmetBedeli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ödeme Periyodu *</label>
              <input type="text" name="odemePeriyodu" value={formData.odemePeriyodu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Aylık, Haftalık, Günlük" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Banka Hesabı (IBAN) *</label>
              <input type="text" name="odemeBanka" value={formData.odemeBanka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR..." />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 8 – CEZAİ ŞART (VARSA)</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Cezai Şart Tutarı (TL)</label>
            <input type="text" name="cezaiSart" value={formData.cezaiSart || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Boş bırakılabilir" />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 9 – SÖZLEŞMENİN FESHİ</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Fesih Bildirim Süresi (Gün) *</label>
            <input type="text" name="fesihSuresi" value={formData.fesihSuresi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 30" />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 13 – YETKİ</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Yetkili Mahkeme Şehri *</label>
            <input type="text" name="yetkiliMahkeme" value={formData.yetkiliMahkeme || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MADDE 14 – YÜRÜRLÜK</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
            <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const sozlesmeBaslangic = formData.sozlesmeBaslangic ? formatDate(formData.sozlesmeBaslangic) : '___________________';
      const sozlesmeBitis = formData.sozlesmeBitis ? formatDate(formData.sozlesmeBitis) : '___________________';
      const sozlesmeTarihi = formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________';
      const sozlesmeUzamaText = formData.sozlesmeUzama === 'uzar' ? 'aynı şartlarla uzar' : 'tarafların yazılı mutabakatı olmaksızın sona erer';
      
      return (
        <A4PageWrapper pageNumber={1} totalPages={1}>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">HİZMET SÖZLEŞMESİ</h1>
          </div>
          
          <div className="mb-6">
            <p className="text-justify mb-4">
              İşbu Hizmet Sözleşmesi, aşağıda bilgileri bulunan taraflar arasında, 6098 sayılı Türk Borçlar Kanunu ve ilgili mevzuat hükümleri uyarınca akdedilmiştir.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">MADDE 1 – TARAFLAR</p>
              <div className="space-y-2">
                <p className="font-semibold mb-1">HİZMET ALAN:</p>
                <p>Unvan / Ad Soyad: <strong>{formData.hizmetAlanUnvan || '___________________'}</strong></p>
                <p>T.C. Kimlik No / Vergi No: <strong>{formData.hizmetAlanTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.hizmetAlanAdres || '___________________'}</strong></p>
              </div>
              <div className="space-y-2 mt-4">
                <p className="font-semibold mb-1">HİZMET VEREN:</p>
                <p>Unvan / Ad Soyad: <strong>{formData.hizmetVerenUnvan || '___________________'}</strong></p>
                <p>T.C. Kimlik No / Vergi No: <strong>{formData.hizmetVerenTC || '___________________'}</strong></p>
                <p>Adres: <strong>{formData.hizmetVerenAdres || '___________________'}</strong></p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 2 – SÖZLEŞMENİN KONUSU</p>
              <p className="text-justify">
                İşbu sözleşmenin konusu; hizmet verenin, hizmet alan adına <strong>{formData.hizmetKonusu || '___________________'}</strong> hizmetini, işbu sözleşmede belirtilen şartlar çerçevesinde yerine getirmesidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 3 – HİZMETİN KAPSAMI</p>
              <p className="mb-2">Hizmet veren tarafından sunulacak hizmetlerin kapsamı aşağıda belirtilmiştir:</p>
              <div className="whitespace-pre-line text-justify">
                {formData.hizmetKapsami || '___________________'}
              </div>
              <p className="mt-2 text-justify">
                Hizmet veren, hizmeti özen borcu çerçevesinde, mevzuata ve mesleki kurallara uygun şekilde ifa edecektir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 4 – SÜRE</p>
              <p className="text-justify">
                İşbu sözleşme <strong>{sozlesmeBaslangic}</strong> tarihinde yürürlüğe girer ve <strong>{sozlesmeBitis}</strong> tarihine kadar geçerlidir. Sürenin bitiminde sözleşme, {sozlesmeUzamaText}.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 5 – HİZMET BEDELİ VE ÖDEME</p>
              <p className="text-justify">
                Hizmet bedeli <strong>{formData.hizmetBedeli || '___________________'}</strong> TL + KDV'dir. Ödeme;
              </p>
              <p className="ml-4">- <strong>{formData.odemePeriyodu || '___________________'}</strong> periyotlarla,</p>
              <p className="ml-4">- Hizmet verenin bildireceği banka hesabına (<strong>{formData.odemeBanka || '___________________'}</strong>),</p>
              <p className="ml-4">- Fatura karşılığında ödenecektir.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 6 – TARAFLARIN YÜKÜMLÜLÜKLERİ</p>
              <p className="font-semibold mb-1">6.1 Hizmet Verenin Yükümlülükleri</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Hizmeti bizzat veya yetkili personeli aracılığıyla yerine getirmek,</li>
                <li>Hizmet sırasında gizli bilgilere riayet etmek,</li>
                <li>Hizmeti süresinde ve eksiksiz ifa etmek.</li>
              </ul>
              <p className="font-semibold mb-1 mt-4">6.2 Hizmet Alanın Yükümlülükleri</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Hizmetin ifası için gerekli bilgi ve belgeleri sağlamak,</li>
                <li>Hizmet bedelini süresinde ödemek.</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 7 – GİZLİLİK</p>
              <p className="text-justify">
                Taraflar, işbu sözleşme kapsamında öğrendikleri her türlü ticari, mali ve kişisel bilgiyi gizli tutmayı, üçüncü kişilerle paylaşmamayı kabul eder.
              </p>
            </div>
            
            {formData.cezaiSart && (
              <div className="mt-6">
                <p className="font-semibold mb-2">MADDE 8 – CEZAİ ŞART</p>
                <p className="text-justify">
                  Hizmet verenin sözleşmeye aykırı davranması hâlinde, hizmet alan lehine <strong>{formData.cezaiSart}</strong> TL cezai şart ödemeyi kabul eder.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 9 – SÖZLEŞMENİN FESHİ</p>
              <p className="text-justify">
                Taraflardan her biri, <strong>{formData.fesihSuresi || '___________________'}</strong> gün önceden yazılı bildirimde bulunmak suretiyle sözleşmeyi feshedebilir. Haklı nedenle derhal fesih hakkı saklıdır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 10 – MÜCBİR SEBEP</p>
              <p className="text-justify">
                Tarafların kontrolü dışında gelişen; doğal afet, savaş, grev, salgın hastalık ve benzeri hâller mücbir sebep sayılır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 11 – DEVİR VE ALT YÜKLENİCİ</p>
              <p className="text-justify">
                Hizmet veren, hizmeti hizmet alanın yazılı izni olmaksızın üçüncü kişilere devredemez.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 12 – TEBLİGAT</p>
              <p className="text-justify">
                Tarafların yukarıda belirtilen adresleri yasal tebligat adresleridir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 13 – YETKİ</p>
              <p>
                İşbu sözleşmeden doğacak uyuşmazlıklarda <strong>{formData.yetkiliMahkeme || '___________________'}</strong> Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDE 14 – YÜRÜRLÜK</p>
              <p>
                İşbu sözleşme <strong>{sozlesmeTarihi}</strong> tarihinde 2 nüsha olarak düzenlenmiş, taraflarca okunarak imza altına alınmıştır.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">HİZMET ALAN</p>
                  <p className="mb-2">Ad Soyad / Unvan</p>
                  <p className="mt-4">{formData.hizmetAlanUnvan || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">HİZMET VEREN</p>
                  <p className="mb-2">Ad Soyad / Unvan</p>
                  <p className="mt-4">{formData.hizmetVerenUnvan || '___________________'}</p>
                  <p className="mt-4">İmza</p>
                </div>
              </div>
            </div>
          </div>
        </A4PageWrapper>
      );
    },
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
      <div className="a4-container bg-white page-break-after" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 20px auto', padding: '20mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontSize: '12px', lineHeight: '1.6' }}>
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
      anneAd: '',
      anneTC: '',
      anneAdres: '',
      babaAd: '',
      babaTC: '',
      babaAdres: '',
      cocukAd: '',
      velayet: 'anne',
      istirakNafaka: '',
      nafakaArtis: 'TÜFE',
      egitimGiderleri: '50',
      egitimGiderleriSorumlu: 'anne',
      haftaSonuGorusme: '1-3',
      ozelGunler: '',
      yazTatili: '1-30 Temmuz',
      tapuIl: '',
      tapuIlce: '',
      tapuMahalle: '',
      tapuAda: '',
      tapuParsel: '',
      tapuBagimsizBolum: '',
      tapuDevir: 'anne',
      protokolTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">TARAFLAR</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium mb-2">ANNE Bilgileri</h4>
              <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                  <input type="text" name="anneAd" value={formData.anneAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
                  <input type="text" name="anneTC" value={formData.anneTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="anneAdres" value={formData.anneAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
              <h4 className="text-md font-medium mb-2">BABA Bilgileri</h4>
              <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                  <input type="text" name="babaAd" value={formData.babaAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
                  <input type="text" name="babaTC" value={formData.babaTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="babaAdres" value={formData.babaAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">1. VELAYET, İŞTİRAK NAFAKASI VE EĞİTİM GİDERLERİ</h3>
          <div className="space-y-2">
        <div>
              <label className="block text-sm font-medium mb-1">Çocuğun Adı *</label>
              <input type="text" name="cocukAd" value={formData.cocukAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
              <label className="block text-sm font-medium mb-1">Velayet *</label>
              <select name="velayet" value={formData.velayet || 'anne'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="anne">ANNE</option>
                <option value="baba">BABA</option>
              </select>
        </div>
        <div>
              <label className="block text-sm font-medium mb-1">İştirak Nafakası (TL) *</label>
              <input type="text" name="istirakNafaka" value={formData.istirakNafaka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
              <label className="block text-sm font-medium mb-1">Nafaka Artış Oranı *</label>
              <input type="text" name="nafakaArtis" value={formData.nafakaArtis || 'TÜFE'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: TÜFE" />
        </div>
        <div>
              <label className="block text-sm font-medium mb-1">Eğitim Giderleri Oranı (%) *</label>
              <input type="text" name="egitimGiderleri" value={formData.egitimGiderleri || '50'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="50 veya 100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Eğitim Giderleri Sorumlusu *</label>
              <select name="egitimGiderleriSorumlu" value={formData.egitimGiderleriSorumlu || 'anne'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="anne">ANNE</option>
                <option value="baba">BABA</option>
              </select>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">2. KİŞİSEL İLİŞKİ TESİSİ (Görüşme Günleri)</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Hafta Sonu Görüşme (Ayın kaçıncı haftaları) *</label>
              <input type="text" name="haftaSonuGorusme" value={formData.haftaSonuGorusme || '1-3'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 1-3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Özel Günler (Opsiyonel)</label>
              <textarea name="ozelGunler" value={formData.ozelGunler || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Ek görüşme günleri belirtmek isterseniz" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yaz Tatili Tarihleri *</label>
              <input type="text" name="yazTatili" value={formData.yazTatili || '1-30 Temmuz'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 1-30 Temmuz" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">3. TAŞINMAZ DEVRİ (Tapu İşlemleri)</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">İl *</label>
                <input type="text" name="tapuIl" value={formData.tapuIl || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">İlçe *</label>
                <input type="text" name="tapuIlce" value={formData.tapuIlce || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mahalle *</label>
              <input type="text" name="tapuMahalle" value={formData.tapuMahalle || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ada No *</label>
                <input type="text" name="tapuAda" value={formData.tapuAda || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parsel No *</label>
                <input type="text" name="tapuParsel" value={formData.tapuParsel || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bağımsız Bölüm No *</label>
              <input type="text" name="tapuBagimsizBolum" value={formData.tapuBagimsizBolum || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Devir Edilecek Taraf *</label>
              <select name="tapuDevir" value={formData.tapuDevir || 'anne'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="anne">ANNE</option>
                <option value="baba">BABA</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Protokol Tarihi *</label>
          <input type="date" name="protokolTarihi" value={formData.protokolTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const protokolTarihi = formData.protokolTarihi ? formatDate(formData.protokolTarihi) : '___________________';
      const velayetText = formData.velayet === 'anne' ? 'ANNE' : 'BABA';
      const egitimGiderleriSorumluText = formData.egitimGiderleriSorumlu === 'anne' ? 'ANNE' : 'BABA';
      const tapuDevirText = formData.tapuDevir === 'anne' ? formData.anneAd || 'ANNE' : formData.babaAd || 'BABA';
      const tapuDevirEdilenText = formData.tapuDevir === 'anne' ? formData.babaAd || 'BABA' : formData.anneAd || 'ANNE';
      
      const page1Content = (
        <>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ANLAŞMALI BOŞANMA PROTOKOLÜ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">TARAFLAR:</p>
              <p className="mb-2">
                <strong>{formData.anneAd || '___________________'}</strong>, T.C. No: {formData.anneTC || '___________________'}, Adres: {formData.anneAdres || '___________________'}
              </p>
              <p>
                <strong>{formData.babaAd || '___________________'}</strong>, T.C. No: {formData.babaTC || '___________________'}, Adres: {formData.babaAdres || '___________________'}
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">MADDELER:</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">1. VELAYET, İŞTİRAK NAFAKASI VE EĞİTİM GİDERLERİ</p>
              <p className="mb-2 text-justify">
                Müşterek çocuk/çocuklar <strong>{formData.cocukAd || '___________________'}</strong>'nın velayeti <strong>{velayetText}</strong>'ye verilecektir.
              </p>
              <p className="mb-2 text-justify">
                <strong>İştirak Nafakası:</strong> Velayet kendisine verilmeyen taraf, çocuk için her ay <strong>{formData.istirakNafaka || '___________________'}</strong> TL iştirak nafakasını diğer tarafın hesabına yatıracaktır. Bu tutar her yıl <strong>{formData.nafakaArtis || 'TÜFE'}</strong> oranında artırılacaktır.
              </p>
              <p className="text-justify">
                <strong>Eğitim Giderleri:</strong> İştirak nafakasına ek olarak; çocuğun özel okul ücreti, servis, yemek, kırtasiye ve kurs giderleri gibi tüm eğitim masraflarının %<strong>{formData.egitimGiderleri || '50'}</strong>'si (veya Tamamı) velayet kendisine verilmeyen taraf olan <strong>{egitimGiderleriSorumluText}</strong> tarafından karşılanacaktır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. KİŞİSEL İLİŞKİ TESİSİ (Görüşme Günleri)</p>
              <p className="mb-2 text-justify">
                Çocuğun yaşı ve menfaati gözetilerek kişisel ilişki şu şekilde kurulacaktır:
              </p>
              <p className="mb-2 text-justify">
                <strong>Hafta Sonu:</strong> Her ayın <strong>{formData.haftaSonuGorusme || '1-3'}</strong>. haftası Cumartesi saat 09:00'dan Pazar saat 18:00'e kadar. (Not: Çocuk 3 yaşından küçükse hakim "yatısız" olarak; sabah 09:00 - akşam 18:00 şeklinde karar verebilir.)
              </p>
              <p className="mb-2 text-justify">
                <strong>Özel Günler:</strong> Dini bayramların 2. günü, sömestir tatilinin ilk haftası ve yaz tatilinde <strong>{formData.yazTatili || '1-30 Temmuz'}</strong> tarihleri arasında çocuk diğer tarafla kalacaktır.
              </p>
              {formData.ozelGunler && (
                <p className="mb-2 text-justify">
                  <strong>Ek Görüşme:</strong> {formData.ozelGunler}
                </p>
              )}
              <p className="text-justify">
                <strong>Esneklik:</strong> Taraflar karşılıklı rıza ve çocuğun sosyal düzenini bozmayacak şekilde ek görüşme saatleri belirleyebilirler.
              </p>
            </div>
          </div>
        </>
      );

      const page2Content = (
        <>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">3. TAŞINMAZ DEVRİ (Tapu İşlemleri)</p>
              <p className="mb-2 text-justify">
                Taraflar, evlilik birliği içinde edinilen taşınmazın devri konusunda şu şekilde mutabık kalmışlardır:
              </p>
              <p className="text-justify">
                <strong>Tapu Bilgileri:</strong> <strong>{formData.tapuIl || '___________________'}</strong>, <strong>{formData.tapuIlce || '___________________'}</strong>, <strong>{formData.tapuMahalle || '___________________'}</strong>, <strong>{formData.tapuAda || '___________________'}</strong> Ada No, <strong>{formData.tapuParsel || '___________________'}</strong> Parsel No'da kayıtlı, <strong>{formData.tapuBagimsizBolum || '___________________'}</strong> numaralı taşınmazdaki <strong>{tapuDevirText}</strong>'a ait tüm hisseler, boşanma kararının kesinleşmesi ile birlikte hiçbir bedel talep edilmeksizin <strong>{tapuDevirEdilenText}</strong>'a devredilecektir. İşbu protokol ve mahkeme kararı tapuda tescil için yeterli dayanak teşkil edecektir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">4. MAL REJİMİ TASFİYESİ VE İBRA</p>
              <p className="mb-2 text-justify">
                Taraflar, evlilik birliği içinde edinilen tüm taşınır ve taşınmaz malları, banka mevduatlarını, ziynet eşyalarını ve araçları yukarıdaki maddeler çerçevesinde paylaşmışlardır.
              </p>
              <p className="text-justify">
                Bu protokolün imzalanması ve boşanmanın gerçekleşmesi ile birlikte taraflar; birbirlerinden "Katılma Alacağı", "Değer Artış Payı", "Katkı Payı Alacağı" veya benzeri adlar altında hiçbir mal rejimi talebinde bulunmayacaklarını, birbirlerini karşılıklı olarak tam ve kesin olarak ibra ettiklerini kabul ve taahhüt ederler. Taraflar bu haklarından geriye dönük ve geleceğe matuf olarak feragat etmişlerdir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. TAZMİNAT VE DİĞER HAKLAR</p>
              <p className="text-justify">
                Taraflar birbirlerinden karşılıklı olarak maddi-manevi tazminat ve yoksulluk nafakası talep etmediklerini, bu haklarından feragat ettiklerini beyan ederler.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ:</p>
              <p>
                İşbu 5 maddelik protokol, tarafların hür iradeleriyle <strong>{protokolTarihi}</strong> tarihinde tanzim edilerek imza altına alınmıştır.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">ANNE (İmza)</p>
                  <p className="mt-8">{formData.anneAd || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">BABA (İmza)</p>
                  <p className="mt-8">{formData.babaAd || '___________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
      
      return (
        <div style={{ padding: '20px 0' }}>
          <A4PageWrapper pageNumber={1} totalPages={2}>
            {page1Content}
          </A4PageWrapper>
          <A4PageWrapper pageNumber={2} totalPages={2}>
            {page2Content}
          </A4PageWrapper>
        </div>
      );
    },
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
  'flexible-work-request': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      yoneticiAd: '',
      sirketAdi: '',
      iseBaslamaTarihi: '',
      pozisyon: '',
      ozelNeden: '',
      onerilenCalismaModeli: '',
      calisanAd: '',
      calisanTC: '',
      calisanAdres: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yöneticinin Adı veya İnsan Kaynakları Departmanı *</label>
          <input type="text" name="yoneticiAd" value={formData.yoneticiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şirket Adı *</label>
          <input type="text" name="sirketAdi" value={formData.sirketAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İşe Başlama Tarihi *</label>
          <input type="date" name="iseBaslamaTarihi" value={formData.iseBaslamaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pozisyon *</label>
          <input type="text" name="pozisyon" value={formData.pozisyon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Özel Neden (Varsa: Çocuk bakımı, eğitim, ulaşım zorluğu veya odaklanma gerektiren iş yoğunluğu)</label>
          <textarea name="ozelNeden" value={formData.ozelNeden || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: Çocuk bakımı, eğitim, ulaşım zorluğu veya odaklanma gerektiren iş yoğunluğu" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Önerilen Çalışma Modeli *</label>
          <textarea name="onerilenCalismaModeli" value={formData.onerilenCalismaModeli || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Haftada 3 gün uzaktan (home-office) / Günlük mesai başlangıcının 08:00, bitişinin 17:00 olarak güncellenmesi / Hibrit çalışma" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Çalışan Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adres *</label>
          <textarea name="calisanAdres" value={formData.calisanAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const iseBaslamaTarihi = formData.iseBaslamaTarihi ? formatDate(formData.iseBaslamaTarihi) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ESNEK ÇALIŞMA TALEBİ DİLEKÇESİ</h1>
            <p className="text-sm">Tarih: {tarih}</p>
          </div>
          
          <div className="space-y-4">
            <p>
              Sayın <strong>{formData.yoneticiAd || '___________________'}</strong>,
            </p>
            
            <p>
              <strong>{formData.sirketAdi || '___________________'}</strong> bünyesinde <strong>{iseBaslamaTarihi}</strong> tarihinden bu yana <strong>{formData.pozisyon || '___________________'}</strong> olarak görev yapmaktayım.
            </p>
            
            <p>
              Görev ve sorumluluklarımı mevcut performans standartlarımın üzerinde sürdürmek, iş-özel hayat dengesini sağlamak{formData.ozelNeden ? ` ve ${formData.ozelNeden}` : ''} gerekçesiyle; çalışma düzenimin "Esnek Çalışma" modellerinden biriyle yeniden düzenlenmesini talep ediyorum.
            </p>
            
            <div className="mt-6">
              <p className="font-bold mb-2">Talebimin Kapsamı:</p>
              
              <p className="mb-2">
                <strong>Önerilen Çalışma Modeli:</strong> {formData.onerilenCalismaModeli || '___________________'}
              </p>
              
              <p className="mb-2">
                <strong>İş Akışı ve Verimlilik:</strong> Söz konusu esnek çalışma düzeninde, şirket içi iletişim kanalları (E-posta, Teams, Telefon vb.) üzerinden erişilebilir olmaya devam edeceğimi ve tüm projelerimi belirlenen teslim tarihlerinde eksiksiz tamamlayacağımı taahhüt ederim.
              </p>
              
              <p>
                Bu düzenlemenin, yolda geçen süreyi verimli çalışmaya dönüştürmeme ve motivasyonumu artırarak şirketime daha fazla katma değer sağlamama yardımcı olacağı kanaatindeyim.
              </p>
            </div>
            
            <p>
              Talebimin 4857 sayılı İş Kanunu ve Uzaktan Çalışma Yönetmeliği hükümleri çerçevesinde değerlendirilerek, uygun görülmesi halinde gerekli sözleşme tadilinin yapılmasını saygılarımla arz ederim.
            </p>
            
            <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <p className="font-semibold mb-1">Ad Soyad:</p>
                <p>{formData.calisanAd || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">T.C. Kimlik No:</p>
                <p>{formData.calisanTC || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">İmza:</p>
                <p className="mt-8">___________________</p>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'retirement-request': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sirketAdi: '',
      iseBaslamaTarihi: '',
      pozisyon: '',
      istenAyrilmaTarihi: '',
      calisanAd: '',
      calisanTC: '',
      calisanAdres: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şirket Adı *</label>
          <input type="text" name="sirketAdi" value={formData.sirketAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İşe Başlama Tarihi *</label>
          <input type="date" name="iseBaslamaTarihi" value={formData.iseBaslamaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pozisyon *</label>
          <input type="text" name="pozisyon" value={formData.pozisyon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İşten Ayrılacağınız Tarih *</label>
          <input type="date" name="istenAyrilmaTarihi" value={formData.istenAyrilmaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Çalışan Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adres *</label>
          <textarea name="calisanAdres" value={formData.calisanAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const iseBaslamaTarihi = formData.iseBaslamaTarihi ? formatDate(formData.iseBaslamaTarihi) : '___________________';
      const istenAyrilmaTarihi = formData.istenAyrilmaTarihi ? formatDate(formData.istenAyrilmaTarihi) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">EMEKLİLİK TALEBİ DİLEKÇESİ</h1>
            <p className="text-sm">Tarih: {tarih}</p>
          </div>
          
          <div className="space-y-4">
            <p>
              <strong>{formData.sirketAdi || '___________________'}</strong> Genel Müdürlüğü'ne / İnsan Kaynakları Departman Müdürlüğü'ne,
            </p>
            
            <p>
              Şirketiniz bünyesinde <strong>{iseBaslamaTarihi}</strong> tarihinden bu yana <strong>{formData.pozisyon || '___________________'}</strong> olarak görev yapmaktayım.
            </p>
            
            <p>
              Sosyal Güvenlik Kurumu'ndan (SGK) almış olduğum, emeklilik için gerekli olan sigortalılık süresi ve prim ödeme gün sayısını tamamladığımı gösteren "Emeklilik Şartlarını Haiz Olduğuma Dair Belge" (Emekli Olur Yazısı) ekte sunulmuştur. Bu belgeye istinaden, emeklilik haklarımı kullanmak amacıyla iş sözleşmemi <strong>{istenAyrilmaTarihi}</strong> tarihi itibarıyla feshediyorum.
            </p>
            
            <p>
              Çalıştığım süre boyunca hak etmiş olduğum kıdem tazminatım ile diğer tüm yasal haklarımın (yıllık izin ücreti, fazla mesai, prim vb.) hesaplanarak tarafıma ödenmesini ve gerekli çıkış işlemlerinin tamamlanmasını arz ederim.
            </p>
            
            <p className="mt-6">Saygılarımla,</p>
            
            <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <p className="font-semibold mb-1">Ad Soyad:</p>
                <p>{formData.calisanAd || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">T.C. Kimlik No:</p>
                <p>{formData.calisanTC || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">İmza:</p>
                <p className="mt-8">___________________</p>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'caregiver-service-contract': {
    getDefaultFormData: () => ({
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      isverenAd: '',
      isverenTC: '',
      isverenAdres: '',
      calisanAd: '',
      calisanTC: '',
      calisanAdres: '',
      bakimKisi: '',
      calismaSekli: '',
      gunlukMesaiBaslangic: '',
      gunlukMesaiBitis: '',
      araDinlenme: '1,5',
      haftalikIzinGunu: '',
      aylikUcret: '',
      odemeGunu: '5',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">1. TARAFLAR</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">İŞVEREN</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                  <input type="text" name="isverenAd" value={formData.isverenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
                  <input type="text" name="isverenTC" value={formData.isverenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="isverenAdres" value={formData.isverenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">ÇALIŞAN</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                  <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Pasaport No *</label>
                  <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adres *</label>
                  <textarea name="calisanAdres" value={formData.calisanAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">2. İŞİN KONUSU VE GÖREV LİSTESİ</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Bakım Verilecek Kişi (Çocuk/Hasta) *</label>
            <input type="text" name="bakimKisi" value={formData.bakimKisi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Çocuğun / Hastanın" />
          </div>
        </div>
        
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">3. ÇALIŞMA SAATLERİ VE DÜZENİ</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Çalışma Şekli *</label>
              <select name="calismaSekli" value={formData.calismaSekli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Seçiniz</option>
                <option value="Yatılı">Yatılı</option>
                <option value="Gündüzlü">Gündüzlü</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Günlük Mesai Başlangıç Saati *</label>
                <input type="time" name="gunlukMesaiBaslangic" value={formData.gunlukMesaiBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Günlük Mesai Bitiş Saati *</label>
                <input type="time" name="gunlukMesaiBitis" value={formData.gunlukMesaiBitis || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ara Dinlenme Süresi (saat) *</label>
              <input type="text" name="araDinlenme" value={formData.araDinlenme || '1,5'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Haftalık İzin Günü *</label>
              <input type="text" name="haftalikIzinGunu" value={formData.haftalikIzinGunu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Pazar" />
            </div>
          </div>
        </div>
        
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">4. MALİ HÜKÜMLER</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Aylık Net Ücret (TL) *</label>
              <input type="number" name="aylikUcret" value={formData.aylikUcret || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ödeme Günü (Ayın kaçıncı iş günü) *</label>
              <input type="number" name="odemeGunu" value={formData.odemeGunu || '5'} onChange={onChange} min="1" max="31" className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
          <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const sozlesmeTarihi = formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________';
      const mesaiSaatleri = formData.gunlukMesaiBaslangic && formData.gunlukMesaiBitis 
        ? `${formData.gunlukMesaiBaslangic.substring(0, 5)} – ${formData.gunlukMesaiBitis.substring(0, 5)}`
        : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">EV HİZMETLERİ VE BAKIM PERSONELİ İŞ SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-base mb-3">1. TARAFLAR</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold mb-1">İŞVEREN:</p>
                  <p>{formData.isverenAd || '___________________'} (T.C. Kimlik No: {formData.isverenTC || '___________________'})</p>
                  <p className="mt-1">Adres: {formData.isverenAdres || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">ÇALIŞAN:</p>
                  <p>{formData.calisanAd || '___________________'} (T.C. Kimlik No / Pasaport No: {formData.calisanTC || '___________________'})</p>
                  <p className="mt-1">Adres: {formData.calisanAdres || '___________________'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="font-bold text-base mb-3">2. İŞİN KONUSU VE GÖREV LİSTESİ</h2>
              <p className="mb-2">Çalışan, işverenin konutunda aşağıda belirtilen "Tam Görev Listesi" çerçevesinde hizmet verecektir:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Bakım Hizmeti:</strong> {formData.bakimKisi || '___________________'} günlük öz bakımı, beslenme düzeninin takibi, ilaçlarının zamanında verilmesi ve gelişimine/sağlığına uygun aktivitelerin yaptırılması.</li>
                <li><strong>Hijyen ve Temizlik:</strong> Bakım alanının temiz tutulması, {formData.bakimKisi || '___________________'} kıyafetlerinin yıkanması ve ütülenmesi.</li>
                <li><strong>Mutfak Hizmetleri:</strong> Günlük öğünlerin (kahvaltı, öğle, akşam) hazırlanması ve mutfak düzeninin sağlanması.</li>
                <li><strong>Genel Destek:</strong> Haftada bir gün genel ev temizliği ve ihtiyaç duyulduğunda günlük market alışverişinin yapılması.</li>
                <li><strong>Güvenlik:</strong> Bakım verilen kişinin ev içi ve dışı güvenliğinin sağlanması, işverenin onayı olmadan üçüncü şahısların eve alınmaması veya bakım verilen kişinin ev dışına çıkarılmaması.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="font-bold text-base mb-3">3. ÇALIŞMA SAATLERİ VE DÜZENİ</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Çalışma Şekli:</strong> {formData.calismaSekli || '___________________'}</li>
                <li><strong>Haftalık Çalışma Süresi:</strong> Haftalık toplam 45 saattir.</li>
                <li><strong>Günlük Mesai Saatleri:</strong> {mesaiSaatleri} saatleri arasıdır.</li>
                <li><strong>Ara Dinlenmesi:</strong> Gün içinde toplam {formData.araDinlenme || '1,5'} saat dinlenme ve yemek molası verilecektir.</li>
                <li><strong>Haftalık İzin:</strong> Haftada 1 (bir) gün {formData.haftalikIzinGunu || '___________________'} izin günüdür. Yatılı çalışmalarda izin günü konut dışında geçirilebilir.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="font-bold text-base mb-3">4. MALİ HÜKÜMLER</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Ücret:</strong> Aylık net {formData.aylikUcret ? formatCurrency(formData.aylikUcret) : '___________________'} olup, her ayın en geç {formData.odemeGunu || '5'}. iş gününde ödenecektir.</li>
                <li><strong>Sosyal Güvenlik:</strong> İşveren, çalışanı 5510 sayılı kanun kapsamında (Ev Hizmetleri Sigortalılığı) SGK'ya bildirmek ve primlerini ödemekle yükümlüdür.</li>
                <li><strong>Yıllık İzin:</strong> Çalışan, bir yıllık çalışma süresini tamamladığında 14 günlük ücretli yıllık izin hakkı kazanır.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="font-bold text-base mb-3">5. ÖZEL ŞARTLAR VE GİZLİLİK</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Gizlilik:</strong> Çalışan, işverenin ve ailesinin özel hayatına ilişkin tanık olduğu her türlü bilgi ve görseli (fotoğraf, video vb.) üçüncü şahıslarla veya sosyal medyada paylaşmayacağını taahhüt eder.</li>
                <li><strong>Kamera Onayı:</strong> Çalışan, güvenliğin tesisi amacıyla konutun ortak alanlarında bulunan güvenlik kameraları hakkında bilgilendirilmiş olup, bu hususta rızası vardır.</li>
                <li><strong>Tıbbi Müdahale:</strong> Acil bir sağlık durumunda çalışan derhal 112 Acil Servis'e ve işverene haber verecektir.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="font-bold text-base mb-3">6. FESİH VE DENEME SÜRESİ</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Deneme Süresi:</strong> İşbu sözleşmenin imzalandığı tarihten itibaren ilk 2 aydır. Bu süre içinde taraflar tazminatsız fesih yapabilir.</li>
                <li><strong>İhbar Süresi:</strong> Deneme süresi sonrasında taraflar fesih bildirimini yasal ihbar sürelerine (2-8 hafta) uygun olarak yapmak zorundadır.</li>
              </ul>
            </div>
            
            <div className="mt-8">
              <p className="mb-4">İşbu sözleşme {sozlesmeTarihi} tarihinde iki nüsha olarak tarafların hür iradeleri ile imzalanmıştır.</p>
              
              <div className="grid grid-cols-2 gap-8 mt-8 border-t pt-4">
                <div className="text-center">
                  <p className="font-semibold mb-2">İŞVEREN</p>
                  <p className="mt-12">(İmza)</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-2">ÇALIŞAN</p>
                  <p className="mt-12">(İmza)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'defense-letter': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      kime: '',
      tebligTarihi: '',
      iddiaEdilenOlay: '',
      olayTarihi: '',
      olaySaati: '',
      olayAciklamasi: '',
      hataliDavranis: '',
      haklilikKanitlari: '',
      sirketAdi: '',
      calisanAd: '',
      calisanTC: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kime (Şirket Adı / Disiplin Kurulu / İlgili Makam) *</label>
          <input type="text" name="kime" value={formData.kime || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: ABC Şirketi / Disiplin Kurulu" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tebliğ Tarihi *</label>
          <input type="date" name="tebligTarihi" value={formData.tebligTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İddia Edilen Olay/Kusur/Gecikme (Kısaca) *</label>
          <textarea name="iddiaEdilenOlay" value={formData.iddiaEdilenOlay || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: İş gecikmesi, kusurlu davranış vb." />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Olayın Gerçekleştiği Tarih *</label>
            <input type="date" name="olayTarihi" value={formData.olayTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Olayın Gerçekleştiği Saat</label>
            <input type="time" name="olaySaati" value={formData.olaySaati || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Olayın Açıklaması (Maddeler halinde, somut verilerle) *</label>
          <textarea name="olayAciklamasi" value={formData.olayAciklamasi || ''} onChange={onChange} rows={4} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: X işinin gecikme sebebi, sistemdeki teknik arıza nedeniyle onay mekanizmasının çalışmamasıdır." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hatalı/Kusurlu Görülen Davranış *</label>
          <textarea name="hataliDavranis" value={formData.hataliDavranis || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Haklılığınızı Kanıtlayan Belgeler/Şahitler *</label>
          <textarea name="haklilikKanitlari" value={formData.haklilikKanitlari || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Daha önceki performans kayıtlarım ve amirlerime gönderdiğim bilgilendirme e-postaları ekte yer almaktadır." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şirket/Kurum Adı *</label>
          <input type="text" name="sirketAdi" value={formData.sirketAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No / Sicil No *</label>
          <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const tebligTarihi = formData.tebligTarihi ? formatDate(formData.tebligTarihi) : '___________________';
      const olayTarihi = formData.olayTarihi ? formatDate(formData.olayTarihi) : '___________________';
      const olayTarihSaat = formData.olaySaati 
        ? `${olayTarihi} tarihinde ${formData.olaySaati.substring(0, 5)} saatinde`
        : `${olayTarihi} tarihinde`;
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">SAVUNMA YAZISI (SAVUNMA DİLEKÇESİ)</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p><strong>Kime:</strong> {formData.kime || '___________________'}</p>
            </div>
            
            <div>
              <p><strong>Tarih:</strong> {tarih}</p>
            </div>
            
            <div>
              <p><strong>Konu:</strong> {tarih} Tarihli Savunma Talebi Hakkında Cevaplarım.</p>
            </div>
            
            <div className="mt-6">
              <p className="mb-2">Sayın İlgili,</p>
              
              <p className="mb-2">
                Tarafıma <strong>{tebligTarihi}</strong> tarihinde tebliğ edilen savunma talep yazısında yer alan, "<strong>{formData.iddiaEdilenOlay || '___________________'}</strong>" hakkındaki iddialara ilişkin yasal süresi içerisinde savunmalarımı sunuyorum.
              </p>
            </div>
            
            <div>
              <h2 className="font-bold text-base mb-2">1. Olayın Özeti ve Açıklamalar:</h2>
              <p className="mb-2">
                Söz konusu iddiaya konu olan olay/durum <strong>{olayTarihSaat}</strong> gerçekleşmiştir. Olayın aslı, iddia edildiği gibi değil, şu şekilde vuku bulmuştur:
              </p>
              <div className="ml-4 mt-2">
                {formData.olayAciklamasi ? (
                  <div className="whitespace-pre-line">{formData.olayAciklamasi}</div>
                ) : (
                  <p>___________________</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="font-bold text-base mb-2">2. Hakkımdaki İddialara Cevaplarım:</h2>
              <p className="mb-2">
                Savunma talebinde belirtilen <strong>{formData.hataliDavranis || '___________________'}</strong> hususu gerçeği yansıtmamaktadır. Zira:
              </p>
              <div className="ml-4 mt-2">
                {formData.haklilikKanitlari ? (
                  <div className="whitespace-pre-line">{formData.haklilikKanitlari}</div>
                ) : (
                  <p>___________________</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="font-bold text-base mb-2">3. Sonuç ve Talep:</h2>
              <p>
                Yukarıda açıkladığım nedenlerle, söz konusu olayda herhangi bir kastım, ihmalim veya kusurum bulunmamaktadır. Görev ve sorumluluklarımı, iş sözleşmeme ve <strong>{formData.sirketAdi || '___________________'}</strong> yönetmeliklerine uygun olarak yerine getirdiğimi belirtmek isterim.
              </p>
              <p className="mt-2">
                Hakkımda başlatılan bu idari/disiplin sürecinin, sunduğum haklı gerekçeler ışığında değerlendirilerek, herhangi bir cezai işlem uygulanmaksızın sonlandırılmasını saygılarımla arz ve talep ederim.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <p className="font-semibold mb-1">Ad Soyad:</p>
                <p>{formData.calisanAd || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">T.C. Kimlik No / Sicil No:</p>
                <p>{formData.calisanTC || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">İmza:</p>
                <p className="mt-8">___________________</p>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'subscription-cancellation': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      firmaAdi: '',
      aboneNo: '',
      aboneTC: '',
      bilgilendirmeYolu: '',
      aboneAd: '',
      aboneTCKimlik: '',
      telefon: '',
      adres: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şirket/Kurum Adı *</label>
          <input type="text" name="firmaAdi" value={formData.firmaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Türk Telekom / Digiturk / Spor Salonu Adı" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Abone Numarası *</label>
          <input type="text" name="aboneNo" value={formData.aboneNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Abone Numarası veya T.C. Kimlik No (Hizmet kullanıcı numarası) *</label>
          <input type="text" name="aboneTC" value={formData.aboneTC || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bilgilendirme Yolu *</label>
          <select name="bilgilendirmeYolu" value={formData.bilgilendirmeYolu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="">Seçiniz</option>
            <option value="E-posta">E-posta</option>
            <option value="SMS">SMS</option>
            <option value="Posta">Posta</option>
            <option value="E-posta/SMS">E-posta/SMS</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="aboneAd" value={formData.aboneAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
          <input type="text" name="aboneTCKimlik" value={formData.aboneTCKimlik || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefon *</label>
          <input type="tel" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adres *</label>
          <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ABONELİK İPTAL DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p><strong>Kime:</strong> {formData.firmaAdi || '___________________'}</p>
            </div>
            
            <div>
              <p><strong>Tarih:</strong> {tarih}</p>
            </div>
            
            <div>
              <p><strong>Konu:</strong> {formData.aboneNo || '___________________'} Numaralı Aboneliğimin Feshi Hakkında.</p>
            </div>
            
            <div className="mt-6">
              <p className="mb-2">Sayın İlgili,</p>
              
              <p className="mb-2">
                Kurumunuzun <strong>{formData.aboneTC || '___________________'}</strong> numaralı hizmet kullanıcısıyım.
              </p>
              
              <p className="mb-2">
                Gördüğüm lüzum üzerine, söz konusu aboneliğimin <strong>{tarih}</strong> tarihi itibarıyla herhangi bir cezai şart uygulanmaksızın sonlandırılmasını talep ediyorum. Aboneliğime ilişkin verilmiş olan tüm otomatik ödeme talimatlarının iptal edilmesini, bu tarihten sonra adıma herhangi bir fatura tahakkuk ettirilmemesini rica ederim.
              </p>
              
              <p className="mb-2">
                Varsa kullanımımda bulunan mülkiyeti kurumunuza ait cihazları (Modem, Uydu Alıcısı vb.), firmanız tarafından belirtilen adrese/bayiye süresi içinde teslim edeceğimi beyan ederim.
              </p>
              
              <p>
                Aboneliğimin iptal edildiğine dair tarafıma <strong>{formData.bilgilendirmeYolu || '___________________'}</strong> yoluyla bilgi verilmesini ve gerekli işlemlerin başlatılmasını saygılarımla arz ederim.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-4 gap-4 border-t pt-4">
              <div>
                <p className="font-semibold mb-1">Ad Soyad:</p>
                <p>{formData.aboneAd || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">T.C. Kimlik No:</p>
                <p>{formData.aboneTCKimlik || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Telefon:</p>
                <p>{formData.telefon || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">İmza:</p>
                <p className="mt-8">___________________</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="font-semibold mb-1">Adres:</p>
              <p>{formData.adres || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'invoice-objection': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      firmaAdi: '',
      aboneNo: '',
      faturaNo: '',
      faturaTarihi: '',
      faturaTutari: '',
      itirazGerekceleri: '',
      itirazEdenAd: '',
      itirazEdenTC: '',
      telefon: '',
      adres: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kurum/Şirket Adı *</label>
          <input type="text" name="firmaAdi" value={formData.firmaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: EnerjiSA, İSKİ, Türk Telekom vb." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Abone/Müşteri Numarası *</label>
          <input type="text" name="aboneNo" value={formData.aboneNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fatura Numarası *</label>
          <input type="text" name="faturaNo" value={formData.faturaNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fatura Tarihi *</label>
          <input type="date" name="faturaTarihi" value={formData.faturaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fatura Tutarı (TL) *</label>
          <input type="number" name="faturaTutari" value={formData.faturaTutari || ''} onChange={onChange} step="0.01" className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İtiraz Gerekçeleri *</label>
          <textarea name="itirazGerekceleri" value={formData.itirazGerekceleri || ''} onChange={onChange} rows={6} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Yanlış Okuma: Sayaç üzerindeki güncel değerler ile faturadaki endeks bilgileri uyuşmamaktadır.&#10;Hizmet Kusuru: Faturada belirtilen tarihler arasında bölgedeki teknik arıza nedeniyle hizmet alamamış olmama rağmen tam bedel yansıtılmıştır.&#10;Tarife Hatası: Taahhüt ettiğim indirimli tarife yerine standart tarife üzerinden hesaplama yapılmıştır." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="itirazEdenAd" value={formData.itirazEdenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
          <input type="text" name="itirazEdenTC" value={formData.itirazEdenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefon *</label>
          <input type="tel" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adres *</label>
          <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const faturaTarihi = formData.faturaTarihi ? formatDate(formData.faturaTarihi) : '___________________';
      const faturaTutari = formData.faturaTutari ? formatCurrency(formData.faturaTutari) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">FATURA İTİRAZ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p><strong>Kime:</strong> {formData.firmaAdi || '___________________'}</p>
            </div>
            
            <div>
              <p><strong>Tarih:</strong> {tarih}</p>
            </div>
            
            <div>
              <p><strong>Konu:</strong> {formData.faturaNo || '___________________'} Numaralı, {faturaTarihi} Tarihli Faturaya İtiraz Hakkında.</p>
            </div>
            
            <div className="mt-6">
              <p className="mb-2">Sayın İlgili,</p>
              
              <p className="mb-2">
                Kurumunuzun <strong>{formData.aboneNo || '___________________'}</strong> numaralı hizmet kullanıcısıyım. Tarafıma tahakkuk ettirilen <strong>{faturaTarihi}</strong> dönemine ait <strong>{faturaTutari}</strong> tutarındaki fatura bedelini incelediğimde, söz konusu tutarın hatalı olduğunu tespit etmiş bulunmaktayım.
              </p>
              
              <div className="mt-4">
                <p className="font-semibold mb-2">İtiraz Gerekçelerim:</p>
                <div className="ml-4 mt-2">
                  {formData.itirazGerekceleri ? (
                    <div className="whitespace-pre-line">{formData.itirazGerekceleri}</div>
                  ) : (
                    <p>___________________</p>
                  )}
                </div>
              </div>
              
              <p className="mt-4">
                Yukarıda belirttiğim nedenlerle, söz konusu faturanın yeniden incelenmesini, tespit edilecek hatanın düzeltilerek faturanın iptalini veya güncel durumuma uygun şekilde yeniden düzenlenmesini talep ediyorum. İnceleme süresince hizmetimin kesilmemesi hususunda gereğinin yapılmasını ve tarafıma yazılı bilgilendirme sağlanmasını rica ederim.
              </p>
              
              <p className="mt-4">Saygılarımla,</p>
            </div>
            
            <div className="mt-8 grid grid-cols-4 gap-4 border-t pt-4">
              <div>
                <p className="font-semibold mb-1">Ad Soyad:</p>
                <p>{formData.itirazEdenAd || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">T.C. Kimlik No:</p>
                <p>{formData.itirazEdenTC || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Telefon:</p>
                <p>{formData.telefon || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">İmza:</p>
                <p className="mt-8">___________________</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="font-semibold mb-1">Adres:</p>
              <p>{formData.adres || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'line-cancellation': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      firmaAdi: '',
      telefonNo: '',
      hatTipi: '',
      ibanNo: '',
      aboneAd: '',
      aboneTC: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GSM Operatörü Adı *</label>
          <input type="text" name="firmaAdi" value={formData.firmaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Vodafone / Turkcell / Türk Telekom" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefon Numarası *</label>
          <input type="tel" name="telefonNo" value={formData.telefonNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hat Tipi *</label>
          <select name="hatTipi" value={formData.hatTipi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="">Seçiniz</option>
            <option value="Faturalı">Faturalı</option>
            <option value="Faturasız">Faturasız</option>
            <option value="Faturalı/Faturasız">Faturalı/Faturasız</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">IBAN Numarası (Bakiye/Güvence Bedeli İade İçin) *</label>
          <input type="text" name="ibanNo" value={formData.ibanNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR00 0000 0000 0000 0000 0000 00" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="aboneAd" value={formData.aboneAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
          <input type="text" name="aboneTC" value={formData.aboneTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">HAT İPTAL DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p><strong>Kime:</strong> {formData.firmaAdi || '___________________'}</p>
            </div>
            
            <div>
              <p><strong>Tarih:</strong> {tarih}</p>
            </div>
            
            <div>
              <p><strong>Konu:</strong> {formData.telefonNo || '___________________'} Numaralı Hattımın İptali ve Sözleşmemin Feshi Hakkında.</p>
            </div>
            
            <div className="mt-6">
              <p className="mb-2">Sayın İlgili,</p>
              
              <p className="mb-2">
                Kurumunuzun <strong>{formData.telefonNo || '___________________'}</strong> numaralı {formData.hatTipi || '___________________'} hat abonesiyim.
              </p>
              
              <p className="mb-2">
                Gördüğüm lüzum üzerine, söz konusu hattımın bu dilekçe tarihi itibarıyla tüm hizmetlere kapatılmasını ve abonelik sözleşmemin feshini talep ediyorum. İptal işlemiyle birlikte hattıma tanımlı olan her türlü katma değerli servis, paket ve taahhüdün sonlandırılmasını; iptal tarihinden sonra adıma herhangi bir fatura tahakkuk ettirilmemesini rica ederim.
              </p>
              
              <p className="mb-2">
                İptal sonrası çıkacak olan son faturanın (kıst fatura) tarafıma bildirilmesini ve varsa içeride kalan bakiyemin/güvence bedelimin <strong>{formData.ibanNo || '___________________'}</strong> numaralı hesabıma iadesini talep ediyorum.
              </p>
              
              <p>
                Gereğinin yapılmasını ve işlemin tamamlandığına dair tarafıma bilgi verilmesini saygılarımla arz ederim.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <p className="font-semibold mb-1">Ad Soyad:</p>
                <p>{formData.aboneAd || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">T.C. Kimlik No:</p>
                <p>{formData.aboneTC || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">İmza:</p>
                <p className="mt-8">___________________</p>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'disable-auto-billing': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      bankaAdi: '',
      hesapNo: '',
      kartNoSon4: '',
      hizmetSaglayici: '',
      aboneNo: '',
      hizmetTuru: '',
      gonderenAd: '',
      gonderenTC: '',
      telefon: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Banka Adı / Şube Adı veya Kurum Adı *</label>
          <input type="text" name="bankaAdi" value={formData.bankaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hesap Numarası (veya Kredi Kartı Son 4 Hanesi) *</label>
          <input type="text" name="hesapNo" value={formData.hesapNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Hesap No veya Kart Son 4 Hane" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hizmet Sağlayıcı Kurum *</label>
          <input type="text" name="hizmetSaglayici" value={formData.hizmetSaglayici || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Türk Telekom, İGDAŞ, Enerjisa vb." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Abone / Müşteri Numarası *</label>
          <input type="text" name="aboneNo" value={formData.aboneNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hizmet Türü *</label>
          <input type="text" name="hizmetTuru" value={formData.hizmetTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: İnternet, Elektrik, Cep Telefonu vb." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
          <input type="text" name="gonderenAd" value={formData.gonderenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
          <input type="text" name="gonderenTC" value={formData.gonderenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefon *</label>
          <input type="tel" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">OTOMATİK ÖDEME TALİMATI İPTAL DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p><strong>Kime:</strong> {formData.bankaAdi || '___________________'}</p>
            </div>
            
            <div>
              <p><strong>Tarih:</strong> {tarih}</p>
            </div>
            
            <div>
              <p><strong>Konu:</strong> Otomatik Ödeme Talimatının İptali Hakkında.</p>
            </div>
            
            <div className="mt-6">
              <p className="mb-2">Sayın İlgili,</p>
              
              <p className="mb-2">
                Bankanız bünyesinde bulunan <strong>{formData.hesapNo || '___________________'}</strong> numaralı hesabımdan/kartımdan verilmiş olan aşağıda detayları belirtilen otomatik ödeme talimatının, bu dilekçe tarihi itibarıyla iptal edilmesini talep ediyorum.
              </p>
              
              <div className="mt-4">
                <p className="font-semibold mb-2">İptali İstenen Talimat Bilgileri:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Hizmet Sağlayıcı Kurum:</strong> {formData.hizmetSaglayici || '___________________'}</li>
                  <li><strong>Abone / Müşteri Numarası:</strong> {formData.aboneNo || '___________________'}</li>
                  <li><strong>Hizmet Türü:</strong> {formData.hizmetTuru || '___________________'}</li>
                </ul>
              </div>
              
              <p className="mt-4">
                Söz konusu aboneliğe ilişkin bankanıza verdiğim ödeme yetkisini geri çektiğimi, bu tarihten sonra ilgili kurum tarafından yapılacak tahsilat girişimlerine onay vermediğimi beyan ederim. Bilgim ve onayım dışında yapılacak işlemlerden doğacak sorumluluğun tarafınıza ait olacağını hatırlatır, talebimin yerine getirilerek tarafıma bilgi verilmesini rica ederim.
              </p>
              
              <p className="mt-4">Saygılarımla,</p>
            </div>
            
            <div className="mt-8 grid grid-cols-4 gap-4 border-t pt-4">
              <div>
                <p className="font-semibold mb-1">Ad Soyad:</p>
                <p>{formData.gonderenAd || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">T.C. Kimlik No:</p>
                <p>{formData.gonderenTC || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Telefon:</p>
                <p>{formData.telefon || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">İmza:</p>
                <p className="mt-8">___________________</p>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'insolvency-certificate-request': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      sayi: '',
      yil: new Date().getFullYear().toString(),
      esasNo: '',
      alacakliAd: '',
      alacakliTicariUnvan: '',
      vekilAd: '',
      borcluAd: '',
      borcluTicariUnvan: '',
      hacizDurumu: '',
      sorguTarihi: '',
      odenmeyenTutar: '',
      kanunMaddesi: '143',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Şehir *</label>
            <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sayı *</label>
            <input type="text" name="sayi" value={formData.sayi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Yıl *</label>
            <input type="text" name="yil" value={formData.yil || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Esas No *</label>
            <input type="text" name="esasNo" value={formData.esasNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alacaklı Ad Soyad / Ticari Unvan *</label>
          <input type="text" name="alacakliAd" value={formData.alacakliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vekil Adı (Varsa)</label>
          <input type="text" name="vekilAd" value={formData.vekilAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Varsa Avukat Adı" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Borçlu Ad Soyad / Ticari Unvan *</label>
          <input type="text" name="borcluAd" value={formData.borcluAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Haciz Durumu *</label>
          <select name="hacizDurumu" value={formData.hacizDurumu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="">Seçiniz</option>
            <option value="haczi kabil mal bulunamadığı">Haczi kabil mal bulunamadığı</option>
            <option value="haczedilen malların satış bedelinin borcu karşılamaya yetmediği">Haczedilen malların satış bedelinin borcu karşılamaya yetmediği</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">UYAP Sorgu Tarihi *</label>
          <input type="date" name="sorguTarihi" value={formData.sorguTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ödenmeyen Tutar (TL) *</label>
          <input type="number" name="odenmeyenTutar" value={formData.odenmeyenTutar || ''} onChange={onChange} step="0.01" className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İcra ve İflas Kanunu Maddesi *</label>
          <select name="kanunMaddesi" value={formData.kanunMaddesi || '143'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="143">143</option>
            <option value="105">105</option>
          </select>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const sorguTarihi = formData.sorguTarihi ? formatDate(formData.sorguTarihi) : '___________________';
      const odenmeyenTutar = formData.odenmeyenTutar ? formatCurrency(formData.odenmeyenTutar) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ACİZ BELGESİ VERİLMESİ TALEBİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                T.C. <strong>{formData.sehir || '___________________'}</strong> <strong>{formData.sayi || '___________________'}</strong> İCRA MÜDÜRLÜĞÜ'NE
              </p>
              <p className="text-center">
                DOSYA NO: <strong>{formData.yil || '___________________'}</strong> / <strong>{formData.esasNo || '___________________'}</strong>
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <p><strong>ALACAKLI:</strong> {formData.alacakliAd || '___________________'}</p>
              {formData.vekilAd && (
                <p><strong>VEKİLİ:</strong> {formData.vekilAd}</p>
              )}
              <p><strong>BORÇLU:</strong> {formData.borcluAd || '___________________'}</p>
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> İİK m. {formData.kanunMaddesi || '143'} uyarınca Aciz Belgesi verilmesi talebidir.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR:</p>
              
              <p className="mb-2">
                Yukarıda esas numarası belirtilen dosya kapsamında borçlu hakkında yürütülen icra takibi kesinleşmiştir.
              </p>
              
              <p className="mb-2">
                Borçlunun bilinen adreslerinde yapılan haciz işlemleri neticesinde; <strong>{formData.hacizDurumu || '___________________'}</strong> tutanaklar ile tespit edilmiştir.
              </p>
              
              <p className="mb-2">
                Ayrıca yapılan UYAP sorgulamalarında (Sorgu Tarihi: <strong>{sorguTarihi}</strong>) borçlunun adına kayıtlı gayrimenkul, araç veya üçüncü kişilerde hak/alacağı (banka hesabı vb.) bulunmadığı görülmüştür.
              </p>
              
              <p>
                Bu nedenlerle, borcun ödenmeyen <strong>{odenmeyenTutar}</strong> kısmı için tarafımıza İcra ve İflas Kanunu m. {formData.kanunMaddesi || '143'} (veya m. 105) uyarınca "Aciz Belgesi" tanzim edilerek verilmesini arz ve talep ederim.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM:</p>
              <p className="mb-2">
                Yukarıda arz edilen nedenlerle, alacağımızın tahsil edilemeyen kısmı için aciz belgesi düzenlenmesini saygılarımla talep ederim.
              </p>
              <p className="mt-4">{tarih}</p>
              <p className="mt-4">Alacaklı / Vekili</p>
              <p className="mt-8">[İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'alimony-nonpayment-complaint': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      icraSehir: '',
      icraSayi: '',
      icraYil: new Date().getFullYear().toString(),
      icraEsasNo: '',
      mustekiAd: '',
      mustekiTC: '',
      mustekiAdres: '',
      sanikAd: '',
      sanikTC: '',
      sanikAdres: '',
      sucTarihi: '',
      mahkemeAdi: '',
      kararTarihi: '',
      esasNo: '',
      nafakaTutari: '',
      nafakaTuru: '',
      odenmeyenAylar: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir (İcra Ceza Mahkemesi) *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MÜŞTEKİ (Alacaklı) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="mustekiAd" value={formData.mustekiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="mustekiTC" value={formData.mustekiTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="mustekiAdres" value={formData.mustekiAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SANIK (Borçlu) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="sanikAd" value={formData.sanikAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="sanikTC" value={formData.sanikTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="sanikAdres" value={formData.sanikAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İcra Dosya Bilgileri</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">İcra Şehir *</label>
              <input type="text" name="icraSehir" value={formData.icraSehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İcra Sayı *</label>
              <input type="text" name="icraSayi" value={formData.icraSayi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İcra Yıl *</label>
              <input type="text" name="icraYil" value={formData.icraYil || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İcra Esas No *</label>
              <input type="text" name="icraEsasNo" value={formData.icraEsasNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Suç Tarihi (Ödenmeyen son nafaka ayı ve yılı) *</label>
          <input type="text" name="sucTarihi" value={formData.sucTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Ocak 2024" />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Nafaka Kararı Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Mahkeme Adı *</label>
              <input type="text" name="mahkemeAdi" value={formData.mahkemeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Karar Tarihi *</label>
              <input type="date" name="kararTarihi" value={formData.kararTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Esas/Karar No *</label>
              <input type="text" name="esasNo" value={formData.esasNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Aylık Nafaka Tutarı (TL) *</label>
              <input type="number" name="nafakaTutari" value={formData.nafakaTutari || ''} onChange={onChange} step="0.01" className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nafaka Türü *</label>
              <select name="nafakaTuru" value={formData.nafakaTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Seçiniz</option>
                <option value="Tedbir">Tedbir</option>
                <option value="İştirak">İştirak</option>
                <option value="Yoksulluk">Yoksulluk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ödenmeyen Aylar *</label>
              <textarea name="odenmeyenAylar" value={formData.odenmeyenAylar || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Ocak, Şubat, Mart" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const kararTarihi = formData.kararTarihi ? formatDate(formData.kararTarihi) : '___________________';
      const nafakaTutari = formData.nafakaTutari ? formatCurrency(formData.nafakaTutari) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">NAFAKANIN ÖDENMEMESİNE İLİŞKİN ŞİKAYET DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.sehir || '___________________'}</strong> İCRA CEZA MAHKEMESİ SAYIN HAKİMLİĞİ'NE
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <p><strong>MÜŞTEKİ (Alacaklı):</strong> {formData.mustekiAd || '___________________'}, T.C. Kimlik No: {formData.mustekiTC || '___________________'}, Adres: {formData.mustekiAdres || '___________________'}</p>
              <p><strong>SANIK (Borçlu):</strong> {formData.sanikAd || '___________________'}, T.C. Kimlik No: {formData.sanikTC || '___________________'}, Adres: {formData.sanikAdres || '___________________'}</p>
            </div>
            
            <div className="mt-4">
              <p><strong>İCRA DOSYA NO:</strong> {formData.icraSehir || '___________________'} {formData.icraSayi || '___________________'}. İcra Müdürlüğü {formData.icraYil || '___________________'}/{formData.icraEsasNo || '___________________'}</p>
            </div>
            
            <div className="mt-4">
              <p><strong>SUÇ:</strong> Nafaka Hükmüne Uymamak (İİK m. 344)</p>
            </div>
            
            <div className="mt-4">
              <p><strong>SUÇ TARİHİ:</strong> {formData.sucTarihi || '___________________'}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR:</p>
              
              <p className="mb-2">
                <strong>{formData.mahkemeAdi || '___________________'}</strong>'nın <strong>{kararTarihi}</strong> tarihli ve <strong>{formData.esasNo || '___________________'}</strong> sayılı kararı ile lehime/müşterek çocuk lehine aylık <strong>{nafakaTutari}</strong> <strong>{formData.nafakaTuru || '___________________'}</strong> nafakasına hükmedilmiştir.
              </p>
              
              <p className="mb-2">
                Söz konusu nafaka kararının tahsili amacıyla sanık aleyhine yukarıda belirtilen icra dosyası ile takip başlatılmış ve icra emri sanığa tebliğ edilmiştir. Takip kesinleşmiştir.
              </p>
              
              <p className="mb-2">
                Sanık borçlu, nafaka borcunu ödeme gücü olmasına rağmen; <strong>{formData.odenmeyenAylar || '___________________'}</strong> aylarına ait nafaka bedellerini kasten ödememiştir.
              </p>
              
              <p className="mb-2">
                İcra ve İflas Kanunu'nun 344. maddesi uyarınca; "Nafaka vermeye mahkum olan bir kimse, ilamda yazılı ödeme şartlarına riayet etmezse, alacaklının şikâyeti üzerine üç aya kadar tazyik hapsine karar verilir."
              </p>
              
              <p>
                Borçlunun nafaka borcunu ödememesi, hem mağduriyetime sebep olmakta hem de mahkeme ilamının gereğini yerine getirmeyerek suç teşkil etmektedir. Bu nedenle sanığın cezalandırılması için başvurma zorunluluğu doğmuştur.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">HUKUKİ DELİLLER:</p>
              <p>
                <strong>{formData.icraSehir || '___________________'}</strong> <strong>{formData.icraSayi || '___________________'}</strong>. İcra Müdürlüğü'nün <strong>{formData.icraYil || '___________________'}</strong>/<strong>{formData.icraEsasNo || '___________________'}</strong> sayılı dosyası, Aile Mahkemesi ilamı ve her türlü yasal delil.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM:</p>
              <p className="mb-2">
                Yukarıda arz edilen nedenlerle; nafaka hükümlerine uymayan sanık borçlunun İİK m. 344 uyarınca 3 aya kadar tazyik hapsi ile cezalandırılmasına, yargılama giderleri ve vekalet ücretinin karşı tarafa yükletilmesine karar verilmesini saygılarımla talep ederim.
              </p>
              <p className="mt-4">{tarih}</p>
              <p className="mt-4">Müşteki</p>
              <p className="mt-4">{formData.mustekiAd || '___________________'} / [İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'alimony-increase-lawsuit': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      davaciAd: '',
      davaciTC: '',
      davaciAdres: '',
      davaliAd: '',
      davaliTC: '',
      davaliAdres: '',
      bosanmaTarihi: '',
      mahkemeAdi: '',
      kararTarihi: '',
      esasNo: '',
      kararNo: '',
      mevcutNafaka: '',
      nafakaTuru: '',
      ozelIhtiyaclar: '',
      davaliGelir: '',
      talepEdilenNafaka: '',
      artirmaTarihi: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir (Aile Mahkemesi) *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVACI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davaciAd" value={formData.davaciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="davaciTC" value={formData.davaciTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davaciAdres" value={formData.davaciAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVALI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davaliAd" value={formData.davaliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="davaliTC" value={formData.davaliTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davaliAdres" value={formData.davaliAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Boşanma ve Nafaka Kararı Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Boşanma Tarihi *</label>
              <input type="date" name="bosanmaTarihi" value={formData.bosanmaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mahkeme Adı *</label>
              <input type="text" name="mahkemeAdi" value={formData.mahkemeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Karar Tarihi *</label>
              <input type="date" name="kararTarihi" value={formData.kararTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Esas No *</label>
                <input type="text" name="esasNo" value={formData.esasNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Karar No *</label>
                <input type="text" name="kararNo" value={formData.kararNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mevcut Aylık Nafaka Tutarı (TL) *</label>
              <input type="number" name="mevcutNafaka" value={formData.mevcutNafaka || ''} onChange={onChange} step="0.01" className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nafaka Türü *</label>
              <select name="nafakaTuru" value={formData.nafakaTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Seçiniz</option>
                <option value="Yoksulluk">Yoksulluk</option>
                <option value="İştirak">İştirak</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Özel İhtiyaçlar (Çocukların yaşı, eğitim durumu, özel ihtiyaçlar vb.)</label>
          <textarea name="ozelIhtiyaclar" value={formData.ozelIhtiyaclar || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Çocukların yaşı, eğitim durumu, özel ihtiyaçlar vb. ayrıntılı şekilde açıklayın" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davalının Gelir ve Yaşam Standartları (Çalıştığı yer, mesleği, bilinen gelir artışı, malvarlığı vb.)</label>
          <textarea name="davaliGelir" value={formData.davaliGelir || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Çalıştığı yer, mesleği, bilinen gelir artışı, malvarlığı vb. somut olgular belirtin" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Talep Edilen Aylık Nafaka Tutarı (TL) *</label>
          <input type="number" name="talepEdilenNafaka" value={formData.talepEdilenNafaka || ''} onChange={onChange} step="0.01" className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Artırımın Geçerli Olacağı Tarih *</label>
          <input type="date" name="artirmaTarihi" value={formData.artirmaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const bosanmaTarihi = formData.bosanmaTarihi ? formatDate(formData.bosanmaTarihi) : '___________________';
      const kararTarihi = formData.kararTarihi ? formatDate(formData.kararTarihi) : '___________________';
      const artirmaTarihi = formData.artirmaTarihi ? formatDate(formData.artirmaTarihi) : '___________________';
      const mevcutNafaka = formData.mevcutNafaka ? formatCurrency(formData.mevcutNafaka) : '___________________';
      const talepEdilenNafaka = formData.talepEdilenNafaka ? formatCurrency(formData.talepEdilenNafaka) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">NAFAKANIN ARTIRILMASI DAVA DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                T.C. <strong>{formData.sehir || '___________________'}</strong> AİLE MAHKEMESİ'NE
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <div>
                <p className="font-semibold mb-1">DAVACI:</p>
                <p>Ad Soyad: {formData.davaciAd || '___________________'}</p>
                <p>T.C. Kimlik No: {formData.davaciTC || '___________________'}</p>
                <p>Adres: {formData.davaciAdres || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">DAVALI:</p>
                <p>Ad Soyad: {formData.davaliAd || '___________________'}</p>
                <p>T.C. Kimlik No: {formData.davaliTC || '___________________'}</p>
                <p>Adres: {formData.davaliAdres || '___________________'}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> {kararTarihi} tarihli ve {formData.esasNo || '___________________'} E., {formData.kararNo || '___________________'} K. sayılı ilam ile hükmedilen nafakanın; değişen ekonomik ve sosyal koşullar nedeniyle artırılması talebimizden ibarettir.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR</p>
              
              <p className="mb-2">
                Davalı ile <strong>{bosanmaTarihi}</strong> tarihinde boşanmış bulunmaktayız. <strong>{formData.mahkemeAdi || '___________________'}</strong> Aile Mahkemesi'nin <strong>{kararTarihi}</strong> tarihli ve <strong>{formData.esasNo || '___________________'}</strong> E., <strong>{formData.kararNo || '___________________'}</strong> K. sayılı kararı ile boşanmamıza karar verilmiş; karar ile birlikte tarafım lehine aylık <strong>{mevcutNafaka}</strong> <strong>{formData.nafakaTuru || '___________________'}</strong> nafakasına hükmedilmiştir.
              </p>
              
              <p className="mb-2">
                Nafaka hükmünün verildiği tarihten bu yana ülkemizdeki ekonomik koşullar önemli ölçüde değişmiş, enflasyon ve hayat pahalılığı ciddi biçimde artmıştır. Mevcut nafaka tutarı, günümüz yaşam koşullarında asgari ihtiyaçları dahi karşılamaktan uzaktır.
              </p>
              
              <p className="mb-2">
                Nafaka alacaklısı olarak kira, gıda, eğitim, sağlık, ulaşım ve benzeri zorunlu giderlerim artmış; ayrıca {formData.ozelIhtiyaclar || '___________________'} (varsa çocukların yaşı, eğitim durumu, özel ihtiyaçlar vb. ayrıntılı şekilde açıklanmalıdır).
              </p>
              
              <p className="mb-2">
                Davalının gelir ve yaşam standartları nafaka hükmünün verildiği tarihe kıyasla artmıştır / azalmamıştır. Davalı {formData.davaliGelir || '___________________'} (çalıştığı yer, mesleği, bilinen gelir artışı, malvarlığı vb. somut olgular belirtilmelidir).
              </p>
              
              <p>
                Türk Medeni Kanunu'nun 176/4. maddesi uyarınca, tarafların mali durumlarının değişmesi veya hakkaniyetin gerektirmesi hâlinde nafakanın artırılması mümkündür. Somut olayda, hakkaniyet nafakanın artırılmasını zorunlu kılmaktadır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">HUKUKİ NEDENLER</p>
              <p>Türk Medeni Kanunu m. 175, 176 ve ilgili sair mevzuat.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">DELİLLER</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>{formData.mahkemeAdi || '___________________'}</strong> Aile Mahkemesi'nin <strong>{kararTarihi}</strong> tarihli <strong>{formData.esasNo || '___________________'}</strong> E., <strong>{formData.kararNo || '___________________'}</strong> K. sayılı boşanma ilamı</li>
                <li>Nüfus kayıt örnekleri</li>
                <li>Gelir durumunu gösterir belgeler (maaş bordrosu, SGK kayıtları vb.)</li>
                <li>Giderlere ilişkin belgeler (kira sözleşmesi, faturalar, okul/sağlık giderleri vb.)</li>
                <li>Tanık beyanları</li>
                <li>Her türlü yasal delil</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM</p>
              <p className="mb-2">Yukarıda arz ve izah edilen nedenlerle;</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                <li><strong>{artirmaTarihi}</strong> tarihinden itibaren geçerli olmak üzere, tarafım lehine hükmedilmiş olan aylık <strong>{mevcutNafaka}</strong> nafakanın, aylık <strong>{talepEdilenNafaka}</strong>'ye artırılmasına,</li>
                <li>Yargılama giderleri ve vekâlet ücretinin davalı üzerine bırakılmasına,</li>
              </ul>
              <p>karar verilmesini saygılarımla arz ve talep ederim.</p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="mb-2">Davacı</p>
              <p className="mb-2">{formData.davaciAd || '___________________'}</p>
              <p className="mb-2">İmza</p>
              <p className="mb-2">Tarih: {tarih}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'alimony-reduction-lawsuit': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      davaciAd: '',
      davaciTC: '',
      davaciAdres: '',
      davaliAd: '',
      davaliTC: '',
      davaliAdres: '',
      bosanmaTarihi: '',
      mahkemeAdi: '',
      kararTarihi: '',
      esasNo: '',
      kararNo: '',
      mevcutNafaka: '',
      nafakaTuru: '',
      davaciMaliDurum: '',
      davaliMaliDurum: '',
      talepEdilenNafaka: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir (Aile Mahkemesi) *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVACI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davaciAd" value={formData.davaciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="davaciTC" value={formData.davaciTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davaciAdres" value={formData.davaciAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVALI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davaliAd" value={formData.davaliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="davaliTC" value={formData.davaliTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davaliAdres" value={formData.davaliAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Boşanma ve Nafaka Kararı Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Boşanma Tarihi *</label>
              <input type="date" name="bosanmaTarihi" value={formData.bosanmaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mahkeme Adı *</label>
              <input type="text" name="mahkemeAdi" value={formData.mahkemeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Karar Tarihi *</label>
              <input type="date" name="kararTarihi" value={formData.kararTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Esas No *</label>
                <input type="text" name="esasNo" value={formData.esasNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Karar No *</label>
                <input type="text" name="kararNo" value={formData.kararNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mevcut Aylık Nafaka Tutarı (TL) *</label>
              <input type="number" name="mevcutNafaka" value={formData.mevcutNafaka || ''} onChange={onChange} step="0.01" className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nafaka Türü *</label>
              <select name="nafakaTuru" value={formData.nafakaTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Seçiniz</option>
                <option value="Yoksulluk">Yoksulluk</option>
                <option value="İştirak">İştirak</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davacının Mali Durumunun Kötüleşmesi (İş kaybı, gelir azalması, hastalık, yeni evlilik, bakmakla yükümlü olunan kişi sayısının artması vb.) *</label>
          <textarea name="davaciMaliDurum" value={formData.davaciMaliDurum || ''} onChange={onChange} rows={4} className="w-full px-3 py-2 border rounded-lg" required placeholder="Somut ve belgeli şekilde açıklayın" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Davalının Mali Durumunun İyileşmesi veya Nafaka Alma Koşullarının Ortadan Kalkması (Düzenli işe girmesi, gelir elde etmeye başlaması, evlenmesi, miras veya malvarlığı edinmesi vb.) *</label>
          <textarea name="davaliMaliDurum" value={formData.davaliMaliDurum || ''} onChange={onChange} rows={4} className="w-full px-3 py-2 border rounded-lg" required placeholder="Ayrıntılı şekilde belirtin" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Talep Edilen Nafaka Tutarı (TL) (Azaltma durumunda, boş bırakılırsa kaldırma talebi olur)</label>
          <input type="number" name="talepEdilenNafaka" value={formData.talepEdilenNafaka || ''} onChange={onChange} step="0.01" className="w-full px-3 py-2 border rounded-lg" placeholder="Boş bırakılırsa kaldırma talebi olur" />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const bosanmaTarihi = formData.bosanmaTarihi ? formatDate(formData.bosanmaTarihi) : '___________________';
      const kararTarihi = formData.kararTarihi ? formatDate(formData.kararTarihi) : '___________________';
      const mevcutNafaka = formData.mevcutNafaka ? formatCurrency(formData.mevcutNafaka) : '___________________';
      const talepEdilenNafaka = formData.talepEdilenNafaka ? formatCurrency(formData.talepEdilenNafaka) : '';
      const azaltmaVeyaKaldirma = talepEdilenNafaka ? `hakkaniyete uygun bir miktara indirilmesine` : `tamamen kaldırılmasına`;
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">NAFAKANIN AZALTILMASI VEYA KALDIRILMASI DAVA DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                T.C. <strong>{formData.sehir || '___________________'}</strong> AİLE MAHKEMESİ'NE
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <div>
                <p className="font-semibold mb-1">DAVACI:</p>
                <p>Ad Soyad: {formData.davaciAd || '___________________'}</p>
                <p>T.C. Kimlik No: {formData.davaciTC || '___________________'}</p>
                <p>Adres: {formData.davaciAdres || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">DAVALI:</p>
                <p>Ad Soyad: {formData.davaliAd || '___________________'}</p>
                <p>T.C. Kimlik No: {formData.davaliTC || '___________________'}</p>
                <p>Adres: {formData.davaliAdres || '___________________'}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> {kararTarihi} tarihli ve {formData.esasNo || '___________________'} E., {formData.kararNo || '___________________'} K. sayılı ilam ile hükmedilen nafakanın değişen koşullar nedeniyle azaltılması; mümkün olmadığı takdirde kaldırılması talebimizden ibarettir.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR</p>
              
              <p className="mb-2">
                Davalı ile <strong>{bosanmaTarihi}</strong> tarihinde boşanmış bulunmaktayız. <strong>{formData.mahkemeAdi || '___________________'}</strong> Aile Mahkemesi'nin <strong>{kararTarihi}</strong> tarihli ve <strong>{formData.esasNo || '___________________'}</strong> E., <strong>{formData.kararNo || '___________________'}</strong> K. sayılı kararı ile boşanmamıza karar verilmiş; karar ile birlikte davalı lehine aylık <strong>{mevcutNafaka}</strong> <strong>{formData.nafakaTuru || '___________________'}</strong> nafakasına hükmedilmiştir.
              </p>
              
              <p className="mb-2">
                Nafakaya hükmedildiği tarihten sonra davacı olarak mali durumum önemli ölçüde kötüleşmiştir. {formData.davaciMaliDurum || '___________________'} (iş kaybı, gelir azalması, hastalık, yeni evlilik, bakmakla yükümlü olunan kişi sayısının artması vb. somut ve belgeli şekilde açıklanmalıdır).
              </p>
              
              <p className="mb-2">
                Buna karşılık davalının mali durumu iyileşmiş / nafaka alma koşulları ortadan kalkmıştır. Davalı {formData.davaliMaliDurum || '___________________'} (düzenli işe girmesi, gelir elde etmeye başlaması, evlenmesi, miras veya malvarlığı edinmesi vb. hususlar ayrıntılı şekilde belirtilmelidir).
              </p>
              
              <p className="mb-2">
                Mevcut nafaka miktarı, güncel gelir durumum karşısında hakkaniyete aykırı hâle gelmiş, tarafım için katlanılamaz bir yük oluşturmuştur.
              </p>
              
              <p>
                Türk Medeni Kanunu'nun 176/4. maddesi uyarınca, tarafların mali durumlarının değişmesi veya hakkaniyetin gerektirmesi hâlinde nafakanın azaltılması ya da tamamen kaldırılması mümkündür. Somut olayda bu şartlar gerçekleşmiştir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">HUKUKİ NEDENLER</p>
              <p>Türk Medeni Kanunu m. 175, 176 ve ilgili sair mevzuat.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">DELİLLER</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>{formData.mahkemeAdi || '___________________'}</strong> Aile Mahkemesi'nin <strong>{kararTarihi}</strong> tarihli <strong>{formData.esasNo || '___________________'}</strong> E., <strong>{formData.kararNo || '___________________'}</strong> K. sayılı boşanma ilamı</li>
                <li>Gelir durumunu gösterir belgeler (maaş bordrosu, SGK kayıtları, işten çıkış belgesi vb.)</li>
                <li>Sağlık raporları (varsa)</li>
                <li>Davalının gelir durumuna ilişkin belgeler</li>
                <li>Tanık beyanları</li>
                <li>Her türlü yasal delil</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM</p>
              <p className="mb-2">Yukarıda arz ve izah edilen nedenlerle;</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                {talepEdilenNafaka ? (
                  <>
                    <li><strong>{kararTarihi}</strong> tarihli ilam ile hükmedilen aylık <strong>{mevcutNafaka}</strong> nafakanın, aylık <strong>{talepEdilenNafaka}</strong>'ye indirilmesine,</li>
                    <li>Mahkemece azaltma uygun görülmez ise, nafakanın tamamen kaldırılmasına,</li>
                  </>
                ) : (
                  <li><strong>{kararTarihi}</strong> tarihli ilam ile hükmedilen aylık <strong>{mevcutNafaka}</strong> nafakanın tamamen kaldırılmasına,</li>
                )}
                <li>Yargılama giderleri ve vekâlet ücretinin davalı üzerine bırakılmasına,</li>
              </ul>
              <p>karar verilmesini saygılarımla arz ve talep ederim.</p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="mb-2">Davacı</p>
              <p className="mb-2">{formData.davaciAd || '___________________'}</p>
              <p className="mb-2">İmza</p>
              <p className="mb-2">Tarih: {tarih}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'enforcement-objection': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      borcluAd: '',
      borcluTC: '',
      borcluAdres: '',
      alacakliAd: '',
      alacakliTC: '',
      alacakliAdres: '',
      icraSehir: '',
      icraYil: new Date().getFullYear().toString(),
      icraEsasNo: '',
      icraEmriTebligTarihi: '',
      ilamMahkemeAdi: '',
      ilamTarihi: '',
      ilamEsasNo: '',
      ilamKararNo: '',
      ilamSorunu: '',
      odemeDurumu: '',
      faizSorunu: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir (İcra Hukuk Mahkemesi) *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVACI / BORÇLU Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="borcluAd" value={formData.borcluAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="borcluTC" value={formData.borcluTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="borcluAdres" value={formData.borcluAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVALI / ALACAKLI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="alacakliAd" value={formData.alacakliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="alacakliTC" value={formData.alacakliTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="alacakliAdres" value={formData.alacakliAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İcra Takip Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">İcra Şehir *</label>
              <input type="text" name="icraSehir" value={formData.icraSehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">İcra Yıl *</label>
                <input type="text" name="icraYil" value={formData.icraYil || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">İcra Esas No *</label>
                <input type="text" name="icraEsasNo" value={formData.icraEsasNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İcra Emri Tebliğ Tarihi *</label>
              <input type="date" name="icraEmriTebligTarihi" value={formData.icraEmriTebligTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İlam Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Mahkeme Adı *</label>
              <input type="text" name="ilamMahkemeAdi" value={formData.ilamMahkemeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İlam Tarihi *</label>
              <input type="date" name="ilamTarihi" value={formData.ilamTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Esas No *</label>
                <input type="text" name="ilamEsasNo" value={formData.ilamEsasNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Karar No *</label>
                <input type="text" name="ilamKararNo" value={formData.ilamKararNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İlam Sorunu *</label>
              <select name="ilamSorunu" value={formData.ilamSorunu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Seçiniz</option>
                <option value="hukuka uygun değildir">Hukuka uygun değildir</option>
                <option value="infaz kabiliyeti bulunmamaktadır">İnfaz kabiliyeti bulunmamaktadır</option>
                <option value="ilamın kesinleşmesi gerekmektedir">İlamın kesinleşmesi gerekmektedir</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ödeme Durumu (Tamamen/Kısmen ödenmiş ise açıklayın)</label>
          <textarea name="odemeDurumu" value={formData.odemeDurumu || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: Borç tamamen/kısmen ödenmiş olup, ödeme belgeleri ile sabittir" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Faiz, Vekalet Ücreti ve Fer'iler Sorunu</label>
          <textarea name="faizSorunu" value={formData.faizSorunu || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="İlamda yer almamakta ya da hatalı şekilde hesaplanmıştır" />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const icraEmriTebligTarihi = formData.icraEmriTebligTarihi ? formatDate(formData.icraEmriTebligTarihi) : '___________________';
      const ilamTarihi = formData.ilamTarihi ? formatDate(formData.ilamTarihi) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">İLAMLI İCRA TAKİBİNE İTİRAZ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                T.C. <strong>{formData.sehir || '___________________'}</strong> İCRA HUKUK MAHKEMESİ'NE
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <div>
                <p className="font-semibold mb-1">DAVACI / BORÇLU:</p>
                <p>Ad Soyad: {formData.borcluAd || '___________________'}</p>
                <p>T.C. Kimlik No: {formData.borcluTC || '___________________'}</p>
                <p>Adres: {formData.borcluAdres || '___________________'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">DAVALI / ALACAKLI:</p>
                <p>Ad Soyad: {formData.alacakliAd || '___________________'}</p>
                <p>T.C. Kimlik No: {formData.alacakliTC || '___________________'}</p>
                <p>Adres: {formData.alacakliAdres || '___________________'}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> <strong>{formData.icraSehir || '___________________'}</strong> İcra Müdürlüğü'nün <strong>{formData.icraYil || '___________________'}</strong>/<strong>{formData.icraEsasNo || '___________________'}</strong> E. sayılı dosyası ile başlatılan ilamlı icra takibine ilişkin itirazlarımızın sunulması ve takibin durdurulması talebimizdir.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR</p>
              
              <p className="mb-2">
                Davalı/alacaklı tarafından, <strong>{formData.icraSehir || '___________________'}</strong> İcra Müdürlüğü'nün <strong>{formData.icraYil || '___________________'}</strong>/<strong>{formData.icraEsasNo || '___________________'}</strong> E. sayılı dosyası ile ilamlı icra takibi başlatılmıştır. Tarafıma gönderilen icra emri <strong>{icraEmriTebligTarihi}</strong> tarihinde tebliğ edilmiştir.
              </p>
              
              <p className="mb-2">
                Dayanak gösterilen ilam, <strong>{formData.ilamMahkemeAdi || '___________________'}</strong> Mahkemesi'nin <strong>{ilamTarihi}</strong> tarihli ve <strong>{formData.ilamEsasNo || '___________________'}</strong> E., <strong>{formData.ilamKararNo || '___________________'}</strong> K. sayılı kararıdır. Ancak söz konusu ilam takibe konu edildiği şekliyle <strong>{formData.ilamSorunu || '___________________'}</strong>.
              </p>
              
              {formData.odemeDurumu && (
                <p className="mb-2">
                  Takibe konu edilen borç, {formData.odemeDurumu}. Buna rağmen mükerrer ve haksız şekilde icra takibi başlatılmıştır.
                </p>
              )}
              
              {formData.faizSorunu && (
                <p className="mb-2">
                  Ayrıca, icra emrinde talep edilen faiz, vekâlet ücreti ve fer'iler {formData.faizSorunu}. Bu yönüyle takip fazlaya ve hukuka aykırıdır.
                </p>
              )}
              
              <p>
                Açıklanan nedenlerle, başlatılan ilamlı icra takibine itiraz etme zorunluluğu doğmuştur.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">HUKUKİ NEDENLER</p>
              <p>İİK m. 33, 34, 36 ve ilgili sair mevzuat.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">DELİLLER</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>{formData.icraSehir || '___________________'}</strong> İcra Müdürlüğü'nün <strong>{formData.icraYil || '___________________'}</strong>/<strong>{formData.icraEsasNo || '___________________'}</strong> E. sayılı takip dosyası</li>
                <li><strong>{formData.ilamMahkemeAdi || '___________________'}</strong> Mahkemesi'nin <strong>{ilamTarihi}</strong> tarihli <strong>{formData.ilamEsasNo || '___________________'}</strong> E., <strong>{formData.ilamKararNo || '___________________'}</strong> K. sayılı ilamı</li>
                <li>Ödeme dekontları / makbuzlar</li>
                <li>Tebligat evrakları</li>
                <li>Her türlü yasal delil</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM</p>
              <p className="mb-2">Yukarıda arz ve izah edilen nedenlerle;</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                <li><strong>{formData.icraSehir || '___________________'}</strong> İcra Müdürlüğü'nün <strong>{formData.icraYil || '___________________'}</strong>/<strong>{formData.icraEsasNo || '___________________'}</strong> E. sayılı dosyası ile başlatılan ilamlı icra takibinin durdurulmasına,</li>
                <li>Takibin kısmen haksız olması hâlinde haksız kısım yönünden iptaline,</li>
                <li>Yargılama giderleri ve vekâlet ücretinin davalı/alacaklı üzerine bırakılmasına,</li>
              </ul>
              <p>karar verilmesini saygılarımla arz ve talep ederim.</p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="mb-2">Davacı / Borçlu</p>
              <p className="mb-2">{formData.borcluAd || '___________________'}</p>
              <p className="mb-2">İmza</p>
              <p className="mb-2">Tarih: {tarih}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'foreclosure-objection': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      sayi: '',
      yil: new Date().getFullYear().toString(),
      esasNo: '',
      borcluAd: '',
      borcluTC: '',
      borcluAdres: '',
      alacakliAd: '',
      alacakliUnvan: '',
      vekilAd: '',
      tebligTarihi: '',
      borcaItirazNedeni: '',
      yetkiItirazi: false,
      yetkiSehir: '',
      kendiSehri: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">İcra Şehir *</label>
            <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">İcra Sayı *</label>
            <input type="text" name="sayi" value={formData.sayi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Yıl *</label>
            <input type="text" name="yil" value={formData.yil || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Esas No *</label>
            <input type="text" name="esasNo" value={formData.esasNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">BORÇLU (İtiraz Eden) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="borcluAd" value={formData.borcluAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="borcluTC" value={formData.borcluTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="borcluAdres" value={formData.borcluAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ALACAKLI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Unvanı *</label>
              <input type="text" name="alacakliAd" value={formData.alacakliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vekil Adı (Varsa)</label>
              <input type="text" name="vekilAd" value={formData.vekilAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Varsa Avukat Adı" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ödeme Emri Tebliğ Tarihi *</label>
          <input type="date" name="tebligTarihi" value={formData.tebligTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Borca İtiraz Nedeni (Varsa özel neden) *</label>
          <textarea name="borcaItirazNedeni" value={formData.borcaItirazNedeni || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Borç daha önce ödenmiştir / Takibe konu ürün teslim edilmemiştir / İmza şahsıma ait değildir" />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" name="yetkiItirazi" checked={formData.yetkiItirazi || false} onChange={(e) => {
              const fakeEvent = { ...e, target: { ...e.target, name: 'yetkiItirazi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }} className="mr-2" />
            Yetki İtirazı Var
          </label>
        </div>
        {formData.yetkiItirazi && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">İcra Takibinin Başlatıldığı Şehir *</label>
              <input type="text" name="yetkiSehir" value={formData.yetkiSehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yerleşim Yeriniz (Kendi Şehriniz) *</label>
              <input type="text" name="kendiSehri" value={formData.kendiSehri || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </>
        )}
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const tebligTarihi = formData.tebligTarihi ? formatDate(formData.tebligTarihi) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">HACİZ TAKİBİNE İTİRAZ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                T.C. <strong>{formData.sehir || '___________________'}</strong> <strong>{formData.sayi || '___________________'}</strong>. İCRA MÜDÜRLÜĞÜ'NE
              </p>
              <p className="text-center">
                DOSYA NO: <strong>{formData.yil || '___________________'}</strong> / <strong>{formData.esasNo || '___________________'}</strong>
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <p><strong>BORÇLU (İtiraz Eden):</strong> {formData.borcluAd || '___________________'}, T.C. Kimlik No: {formData.borcluTC || '___________________'}, Adres: {formData.borcluAdres || '___________________'}</p>
              <p><strong>ALACAKLI:</strong> {formData.alacakliAd || '___________________'}</p>
              {formData.vekilAd && (
                <p><strong>VEKİLİ:</strong> {formData.vekilAd}</p>
              )}
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> Ödeme emrine; borca, faize ve tüm ferilerine karşı itirazlarımın sunulmasıdır.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR:</p>
              
              <p className="mb-2">
                Müdürlüğünüzün yukarıda belirtilen dosyası üzerinden tarafıma gönderilen ödeme emri <strong>{tebligTarihi}</strong> tarihinde tebliğ edilmiştir. Yasal süresi içinde itirazlarımı sunuyorum.
              </p>
              
              <div className="mt-4">
                <p className="font-semibold mb-1">Borca İtiraz:</p>
                <p className="mb-2">
                  Alacaklı tarafa yukarıda numarası yazılı dosya üzerinden herhangi bir borcum bulunmamaktadır. Söz konusu takip haksız ve dayanaksızdır. {formData.borcaItirazNedeni || '___________________'}.
                </p>
              </div>
              
              <div className="mt-4">
                <p className="font-semibold mb-1">Faize İtiraz:</p>
                <p>
                  Borca dair hiçbir kabulüm olmamakla birlikte, talep edilen asıl alacağa, işletilen fahiş faiz oranına ve faiz başlangıç tarihine de ayrıca itiraz ediyorum.
                </p>
              </div>
              
              {formData.yetkiItirazi && (
                <div className="mt-4">
                  <p className="font-semibold mb-1">Yetkiye İtiraz:</p>
                  <p>
                    İcra takibinin başlatıldığı <strong>{formData.yetkiSehir || '___________________'}</strong> İcra Müdürlükleri yetkili değildir. Genel yetki kuralı gereği yerleşim yerim olan <strong>{formData.kendiSehri || '___________________'}</strong> İcra Müdürlükleri yetkilidir. Bu nedenle yetki itirazında bulunuyorum.
                  </p>
                </div>
              )}
              
              <p className="mt-4">
                Yukarıda arz edilen nedenlerle, hakkımda başlatılan icra takibine, ödeme emrine, borcun tamamına, faize ve tüm ferilerine açıkça itiraz ediyorum.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM:</p>
              <p>
                Yasal süresi içinde sunduğum itirazlarımın kabulü ile haksız ve hukuka aykırı olarak başlatılan icra takibinin DURDURULMASINA karar verilmesini saygılarımla talep ederim.
              </p>
              <p className="mt-4">{tarih}</p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="mb-2">Borçlu (İtiraz Eden)</p>
              <p className="mb-2">{formData.borcluAd || '___________________'} / [İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'detention-objection': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      sayi: '',
      mahkemeTuru: 'sulh',
      mahkemeTuruIkinci: 'sulh',
      yil: new Date().getFullYear().toString(),
      dosyaNo: '',
      sorguNo: '',
      itirazEdenAd: '',
      itirazEdenTC: '',
      cezaevi: '',
      mudafiAd: '',
      mudafiAdres: '',
      tutuklamaTarihi: '',
      kisiselDurum: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Şehir *</label>
            <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sayı *</label>
            <input type="text" name="sayi" value={formData.sayi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mahkeme Türü (İlk) *</label>
          <select name="mahkemeTuru" value={formData.mahkemeTuru || 'sulh'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="sulh">SULH CEZA HAKİMLİĞİ</option>
            <option value="asliye">ASLİYE CEZA MAHKEMESİ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mahkeme Türü (İkinci) *</label>
          <select name="mahkemeTuruIkinci" value={formData.mahkemeTuruIkinci || 'sulh'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="sulh">SULH CEZA HAKİMLİĞİ</option>
            <option value="agir">AĞIR CEZA MAHKEMESİ</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Yıl *</label>
            <input type="text" name="yil" value={formData.yil || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dosya No *</label>
            <input type="text" name="dosyaNo" value={formData.dosyaNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sorgu No (Tutuklama Kararındaki) *</label>
          <input type="text" name="sorguNo" value={formData.sorguNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İTİRAZ EDEN (Şüpheli/Sanık) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="itirazEdenAd" value={formData.itirazEdenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="itirazEdenTC" value={formData.itirazEdenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şu An Bulunduğu Cezaevi *</label>
              <input type="text" name="cezaevi" value={formData.cezaevi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MÜDAFİ Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Avukat Adı (Varsa)</label>
              <input type="text" name="mudafiAd" value={formData.mudafiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Avukat Adresi (Varsa)</label>
              <textarea name="mudafiAdres" value={formData.mudafiAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tutuklama Kararı Tarihi *</label>
          <input type="date" name="tutuklamaTarihi" value={formData.tutuklamaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kişisel Durum (Varsa özel durum)</label>
          <textarea name="kisiselDurum" value={formData.kisiselDurum || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: Bakmakla yükümlü olduğum bir ailem var / Ağır bir sağlık sorunum var / Öğrenciyim, eğitim hayatım aksıyor" />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const tutuklamaTarihi = formData.tutuklamaTarihi ? formatDate(formData.tutuklamaTarihi) : '___________________';
      
      const mahkemeTuruText = formData.mahkemeTuru === 'sulh' ? 'SULH CEZA HAKİMLİĞİ' : 'ASLİYE CEZA MAHKEMESİ';
      const mahkemeTuruIkinciText = formData.mahkemeTuruIkinci === 'sulh' ? 'SULH CEZA HAKİMLİĞİ' : 'AĞIR CEZA MAHKEMESİ';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">TUTUKLULUĞA İTİRAZ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center mb-2">
                <strong>{formData.sehir || '___________________'}</strong> <strong>{formData.sayi || '___________________'}</strong> {mahkemeTuruText}'NE / {formData.mahkemeTuru === 'asliye' ? 'ASLİYE CEZA MAHKEMESİ' : 'SULH CEZA HAKİMLİĞİ'}'NE
              </p>
              <p className="text-center text-xs">(Gönderilmek Üzere)</p>
            </div>
            
            <div className="mt-6">
              <p className="text-center font-semibold mb-2">
                <strong>{formData.sehir || '___________________'}</strong> <strong>{formData.sayi || '___________________'}</strong> {mahkemeTuruIkinciText}'NE
              </p>
              <p className="text-center">
                SORUŞTURMA/ESAS NO: <strong>{formData.yil || '___________________'}</strong> / <strong>{formData.dosyaNo || '___________________'}</strong>
              </p>
              <p className="text-center">
                SORGU NO: <strong>{formData.sorguNo || '___________________'}</strong>
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <p><strong>İTİRAZ EDEN (Şüpheli/Sanık):</strong> {formData.itirazEdenAd || '___________________'}, T.C. Kimlik No: {formData.itirazEdenTC || '___________________'}, Şu An Bulunduğu Cezaevi: {formData.cezaevi || '___________________'}</p>
              {formData.mudafiAd && (
                <p><strong>MÜDAFİ:</strong> {formData.mudafiAd}{formData.mudafiAdres ? `, ${formData.mudafiAdres}` : ''}</p>
              )}
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> <strong>{tutuklamaTarihi}</strong> tarihli tutuklama kararına itirazlarımız ile tahliye talebimiz hakkındadır.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR:</p>
              
              <div className="mt-4">
                <p className="font-semibold mb-1">Tutuklama Şartlarının Oluşmaması:</p>
                <p className="mb-2">
                  Tarafıma isnat edilen suçlamaya ilişkin dosyada tutuklamayı gerektirecek "kuvvetli suç şüphesi" uyandıracak somut bir delil bulunmamaktadır. Sabit ikametgah sahibi olmam ve toplumsal bağlarım nedeniyle kaçma şüphem bulunmamaktadır.
                </p>
              </div>
              
              <div className="mt-4">
                <p className="font-semibold mb-1">Delillerin Karartılma İhtimalinin Yokluğu:</p>
                <p className="mb-2">
                  Soruşturmaya konu delillerin büyük bir kısmı toplanmış olup, muhafaza altına alınmıştır. Benim bu aşamadan sonra delilleri karartma veya tanıklar üzerinde baskı kurma ihtimalim fiilen imkansızdır.
                </p>
              </div>
              
              <div className="mt-4">
                <p className="font-semibold mb-1">Ölçülülük İlkesine Aykırılık:</p>
                <p className="mb-2">
                  Tutuklama kararı en son başvurulması gereken bir tedbirdir. CMK m. 109 uyarınca adli kontrol hükümlerinden (imza atma, yurt dışı çıkış yasağı vb.) birinin uygulanması, yargılamanın selameti açısından yeterli olacaktır. Tutukluluğumun devamı, mağduriyetime ve telafisi güç zararlara yol açmaktadır.
                </p>
              </div>
              
              {formData.kisiselDurum && (
                <div className="mt-4">
                  <p className="font-semibold mb-1">Kişisel Durum:</p>
                  <p>{formData.kisiselDurum}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM:</p>
              <p>
                Yukarıda arz edilen nedenlerle; <strong>{tutuklamaTarihi}</strong> tarihli haksız ve hukuki dayanaktan yoksun tutuklama kararının İTİRAZEN KALDIRILMASINA, şüphelinin/sanığın bihakkın veya uygun görülecek adli kontrol tedbirleri uygulanarak TAHLİYESİNE karar verilmesini saygılarımla arz ve talep ederim.
              </p>
              <p className="mt-4">{tarih}</p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="mb-2">Şüpheli / Sanık / Müdafi</p>
              <p className="mb-2">{formData.itirazEdenAd || '___________________'} / [İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'judicial-control-objection': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      sayi: '',
      yil: new Date().getFullYear().toString(),
      dosyaNo: '',
      sorguNo: '',
      itirazEdenAd: '',
      itirazEdenTC: '',
      itirazEdenAdres: '',
      mudafiAd: '',
      mudafiAdres: '',
      kararTarihi: '',
      tedbirTuru: '',
      yurtDisiYasagi: false,
      imzaYukumlulugu: false,
      imzaGunSayisi: '',
      meslekiMagduriyet: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Şehir *</label>
            <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sayı *</label>
            <input type="text" name="sayi" value={formData.sayi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Yıl *</label>
            <input type="text" name="yil" value={formData.yil || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dosya No *</label>
            <input type="text" name="dosyaNo" value={formData.dosyaNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sorgu No (Adli Kontrol Kararındaki) *</label>
          <input type="text" name="sorguNo" value={formData.sorguNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İTİRAZ EDEN (Şüpheli) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="itirazEdenAd" value={formData.itirazEdenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="itirazEdenTC" value={formData.itirazEdenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="itirazEdenAdres" value={formData.itirazEdenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MÜDAFİ Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Avukat Adı (Varsa)</label>
              <input type="text" name="mudafiAd" value={formData.mudafiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Avukat Adresi (Varsa)</label>
              <textarea name="mudafiAdres" value={formData.mudafiAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adli Kontrol Kararı Tarihi *</label>
          <input type="date" name="kararTarihi" value={formData.kararTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Uygulanan Tedbir Türü *</label>
          <input type="text" name="tedbirTuru" value={formData.tedbirTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Yurt dışı çıkış yasağı, imza yükümlülüğü vb." />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" name="yurtDisiYasagi" checked={formData.yurtDisiYasagi || false} onChange={(e) => {
              const fakeEvent = { ...e, target: { ...e.target, name: 'yurtDisiYasagi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }} className="mr-2" />
            Yurt Dışı Yasağı Var
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" name="imzaYukumlulugu" checked={formData.imzaYukumlulugu || false} onChange={(e) => {
              const fakeEvent = { ...e, target: { ...e.target, name: 'imzaYukumlulugu', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }} className="mr-2" />
            İmza Yükümlülüğü Var
          </label>
        </div>
        {formData.imzaYukumlulugu && (
          <div>
            <label className="block text-sm font-medium mb-1">Haftalık İmza Gün Sayısı</label>
            <input type="text" name="imzaGunSayisi" value={formData.imzaGunSayisi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: 3" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Mesleki/Kişisel Mağduriyet (Detaylı açıklama)</label>
          <textarea name="meslekiMagduriyet" value={formData.meslekiMagduriyet || ''} onChange={onChange} rows={4} className="w-full px-3 py-2 border rounded-lg" placeholder="İş gereği/eğitim nedeniyle yurt dışına çıkma gerekliliği, imza yükümlülüğünün iş hayatına etkisi vb." />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const kararTarihi = formData.kararTarihi ? formatDate(formData.kararTarihi) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ADLİ KONTROL KARARINA İTİRAZ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center mb-2">
                <strong>{formData.sehir || '___________________'}</strong> <strong>{formData.sayi || '___________________'}</strong> SULH CEZA HAKİMLİĞİ'NE
              </p>
              <p className="text-center text-xs">(Gönderilmek Üzere)</p>
            </div>
            
            <div className="mt-6">
              <p className="text-center font-semibold mb-2">
                <strong>{formData.sehir || '___________________'}</strong> <strong>{formData.sayi || '___________________'}</strong> SULH CEZA HAKİMLİĞİ'NE
              </p>
              <p className="text-center">
                SORUŞTURMA NO: <strong>{formData.yil || '___________________'}</strong> / <strong>{formData.dosyaNo || '___________________'}</strong>
              </p>
              <p className="text-center">
                SORGÜ NO: <strong>{formData.sorguNo || '___________________'}</strong>
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <p><strong>İTİRAZ EDEN (Şüpheli):</strong> {formData.itirazEdenAd || '___________________'}, T.C. Kimlik No: {formData.itirazEdenTC || '___________________'}, Adres: {formData.itirazEdenAdres || '___________________'}</p>
              {formData.mudafiAd && (
                <p><strong>MÜDAFİ:</strong> {formData.mudafiAd}{formData.mudafiAdres ? `, ${formData.mudafiAdres}` : ''}</p>
              )}
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> <strong>{kararTarihi}</strong> tarihli adli kontrol kararına ({formData.tedbirTuru || 'yurt dışı çıkış yasağı/imza yükümlülüğü vb.'}) karşı itirazlarımız ve adli kontrolün kaldırılması talebimiz hakkındadır.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR:</p>
              
              <div className="mt-4">
                <p className="font-semibold mb-1">Tedbirin Gereksizliği:</p>
                <p className="mb-2">
                  Tarafıma isnat edilen suçlama ile ilgili olarak dosya kapsamındaki deliller büyük ölçüde toplanmıştır. Şahsımın kaçma, delilleri karartma veya tanıklar üzerinde baskı kurma ihtimali bulunmamaktadır. Sabit ikametgah sahibi olmam ve düzenli iş hayatım göz önüne alındığında, uygulanan adli kontrol tedbiri ölçüsüz kalmaktadır.
                </p>
              </div>
              
              {(formData.yurtDisiYasagi || formData.imzaYukumlulugu || formData.meslekiMagduriyet) && (
                <div className="mt-4">
                  <p className="font-semibold mb-1">Mesleki/Kişisel Mağduriyet:</p>
                  {formData.yurtDisiYasagi && (
                    <p className="mb-2">
                      <strong>* [Yurt dışı yasağı varsa]:</strong> İş gereği/eğitim nedeniyle sık sık yurt dışına çıkmam gerekmektedir. Mevcut yasak, ticari/akademik hayatımı durma noktasına getirmiştir.
                    </p>
                  )}
                  {formData.imzaYukumlulugu && (
                    <p className="mb-2">
                      <strong>[İmza yükümlülüğü varsa]:</strong> Çalışma saatlerim ve iş yerimin konumu nedeniyle haftada <strong>{formData.imzaGunSayisi || '[X]'}</strong> gün karakola gidip imza atmam, işimi kaybetme riskiyle beni karşı karşıya bırakmaktadır.
                    </p>
                  )}
                  {formData.meslekiMagduriyet && (
                    <p className="mb-2">{formData.meslekiMagduriyet}</p>
                  )}
                </div>
              )}
              
              <div className="mt-4">
                <p className="font-semibold mb-1">Ölçülülük İlkesi:</p>
                <p className="mb-2">
                  CMK m. 109 uyarınca adli kontrol tedbirleri, yargılamanın selameti için gereklidir ancak bu tedbirlerin kişi üzerinde ağır bir yük oluşturmaması esastır. Hakkımdaki suç şüphesinin zayıflığı ve kişisel durumum dikkate alındığında, tedbirin devamı bir "ceza" niteliğine bürünmüştür.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM:</p>
              <p>
                Yukarıda arz edilen nedenlerle; <strong>{kararTarihi}</strong> tarihli haksız ve mağduriyetime sebep olan Adli Kontrol Kararının İTİRAZEN KALDIRILMASINA, sayın hakimlik aksi görüşte ise tedbirin daha hafif bir yükümlülükle (örneğin imza sayısının azaltılması gibi) değiştirilmesine karar verilmesini saygılarımla talep ederim.
              </p>
              <p className="mt-4">{tarih}</p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="mb-2">Şüpheli / Müdafi</p>
              <p className="mb-2">{formData.itirazEdenAd || '___________________'} / [İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'widow-orphan-pension-request': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      ilMudurlugu: '',
      vefatEdenSigortaSicilNo: '',
      vefatEdenTC: '',
      vefatEdenAd: '',
      vefatTarihi: '',
      iliskisi: '',
      talepEdenAd: '',
      talepEdenTC: '',
      talepEdenAdres: '',
      talepEdenTelefon: '',
      bankaAdi: '',
      subeAdi: '',
      hesapNo: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İlgili İl Müdürlüğü veya Sosyal Güvenlik Merkezi Adı *</label>
          <input type="text" name="ilMudurlugu" value={formData.ilMudurlugu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Vefat Eden Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="vefatEdenAd" value={formData.vefatEdenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sigorta Sicil No / T.C. No *</label>
              <input type="text" name="vefatEdenSigortaSicilNo" value={formData.vefatEdenSigortaSicilNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vefat Tarihi *</label>
              <input type="date" name="vefatTarihi" value={formData.vefatTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Başvuru Sahibi (Hak Sahibi) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="talepEdenAd" value={formData.talepEdenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="talepEdenTC" value={formData.talepEdenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="talepEdenAdres" value={formData.talepEdenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="talepEdenTelefon" value={formData.talepEdenTelefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vefat Eden ile İlişkisi *</label>
              <select name="iliskisi" value={formData.iliskisi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Seçiniz</option>
                <option value="es">Eşi</option>
                <option value="cocuk">Çocuğu</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Banka Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Banka Adı *</label>
              <input type="text" name="bankaAdi" value={formData.bankaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şube Adı *</label>
              <input type="text" name="subeAdi" value={formData.subeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hesap No (Opsiyonel)</label>
              <input type="text" name="hesapNo" value={formData.hesapNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const vefatTarihi = formData.vefatTarihi ? formatDate(formData.vefatTarihi) : '___________________';
      
      const iliskisiText = formData.iliskisi === 'es' ? 'eşi' : formData.iliskisi === 'cocuk' ? 'çocuğu' : 'yasal mirasçısı';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">DUL/YETİM AYLIĞI BAĞLANMASI İÇİN TALEP DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">T.C. SOSYAL GÜVENLİK KURUMU BAŞKANLIĞI</p>
              <p className="text-center">
                <strong>{formData.ilMudurlugu || '___________________'}</strong>'na
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: Ölüm Aylığı (Dul/Yetim Aylığı) Tahsis Talebi.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Kurumunuzun <strong>{formData.vefatEdenSigortaSicilNo || '___________________'}</strong> numaralı sigortalısı olan <strong>{formData.vefatEdenAd || '___________________'}</strong>, <strong>{vefatTarihi}</strong> tarihinde vefat etmiştir.
              </p>
              
              <p className="mb-2">
                Müteveffanın yasal mirasçısı ({iliskisiText}) olarak, 5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu hükümleri uyarınca tarafıma Dul / Yetim aylığı bağlanmasını talep ediyorum.
              </p>
              
              <p className="mb-2">
                Aylık bağlama işlemleri için gerekli olan beyan ve taahhüt belgelerim ekte sunulmuş olup, birikmiş tutarların ve aylığımın <strong>{formData.bankaAdi || '___________________'}</strong> ve <strong>{formData.subeAdi || '___________________'}</strong> şubesindeki{formData.hesapNo ? ` <strong>${formData.hesapNo}</strong> numaralı` : ''} hesabıma gönderilmesini arz ederim.
              </p>
              
              <p className="mt-4">Saygılarımla,</p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Başvuru Sahibi (Hak Sahibi):</strong> {formData.talepEdenAd || '___________________'}</p>
              <p><strong>T.C. Kimlik No:</strong> {formData.talepEdenTC || '___________________'}</p>
              <p><strong>Adres:</strong> {formData.talepEdenAdres || '___________________'}</p>
              <p><strong>Telefon:</strong> {formData.talepEdenTelefon || '___________________'}</p>
              <p className="mt-4"><strong>Tarih:</strong> {tarih}</p>
              <p className="mt-2"><strong>İmza:</strong> [İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'excuse-exam-petition': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      universiteAdi: '',
      fakulteYuksekokulAdi: '',
      dekanlikMudurluk: 'dekanlik',
      bolum: '',
      ogrenciNo: '',
      sinavTarihi: '',
      dersKodu: '',
      dersAdi: '',
      sinavTuru: 'ara',
      mazeretNedeni: '',
      mazeretTuru: '',
      telefon: '',
      email: '',
      ekBelgeler: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Üniversite Adı *</label>
          <input type="text" name="universiteAdi" value={formData.universiteAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fakülte / Yüksekokul Adı *</label>
          <input type="text" name="fakulteYuksekokulAdi" value={formData.fakulteYuksekokulAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dekanlık / Müdürlük *</label>
          <select name="dekanlikMudurluk" value={formData.dekanlikMudurluk || 'dekanlik'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="dekanlik">DEKANLIĞI'NA</option>
            <option value="mudurluk">MÜDÜRLÜĞÜ'NE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bölüm *</label>
          <input type="text" name="bolum" value={formData.bolum || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öğrenci Numarası *</label>
          <input type="text" name="ogrenciNo" value={formData.ogrenciNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sınav Tarihi *</label>
          <input type="date" name="sinavTarihi" value={formData.sinavTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Ders Kodu *</label>
            <input type="text" name="dersKodu" value={formData.dersKodu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ders Adı *</label>
            <input type="text" name="dersAdi" value={formData.dersAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sınav Türü *</label>
          <select name="sinavTuru" value={formData.sinavTuru || 'ara'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="ara">Ara Sınav</option>
            <option value="final">Final</option>
            <option value="butunleme">Bütünleme</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mazeret Türü *</label>
          <select name="mazeretTuru" value={formData.mazeretTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="">Seçiniz</option>
            <option value="saglik">Sağlık Sorunu</option>
            <option value="vefat">Vefat</option>
            <option value="cakisan">Çakışan Sınav</option>
            <option value="trafik">Trafik Kazası</option>
            <option value="diger">Diğer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mazeret Nedeni (Kısa açıklama) *</label>
          <textarea name="mazeretNedeni" value={formData.mazeretNedeni || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Ekte sunduğum sağlık raporunda belirtilen rahatsızlığım / Birinci derece yakınımdın vefatı / Trafik kazası" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ek Belgeler (Açıklama) *</label>
          <textarea name="ekBelgeler" value={formData.ekBelgeler || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Sağlık Raporu (Hastaneden onaylı), Sınav Takvimi, Diğer Kanıtlayıcı Belgeler" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Telefon *</label>
            <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-posta (Üniversite e-posta adresiniz) *</label>
            <input type="email" name="email" value={formData.email || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const sinavTarihi = formData.sinavTarihi ? formatDate(formData.sinavTarihi) : '___________________';
      
      const dekanlikMudurlukText = formData.dekanlikMudurluk === 'dekanlik' ? "DEKANLIĞI'NA" : "MÜDÜRLÜĞÜ'NE";
      const sinavTuruText = formData.sinavTuru === 'ara' ? 'Ara Sınav' : formData.sinavTuru === 'final' ? 'Final' : 'Bütünleme';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">MAZERET SINAV DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.universiteAdi || '___________________'}</strong>
              </p>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.fakulteYuksekokulAdi || '___________________'}</strong> {dekanlikMudurlukText}
              </p>
              <p className="text-center">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: Sınav mazeretimin bildirilmesi ve mazeret sınavı talebi hakkındadır.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Fakülteniz/Yüksekokulunuz <strong>{formData.bolum || '___________________'}</strong> Bölümü, <strong>{formData.ogrenciNo || '___________________'}</strong> numaralı öğrencisiyim.
              </p>
              
              <p className="mb-2">
                <strong>{sinavTarihi}</strong> tarihinde gerçekleştirilen <strong>{formData.dersKodu || '___________________'}</strong> - <strong>{formData.dersAdi || '___________________'}</strong> dersinin <strong>{sinavTuruText}</strong> sınavına; {formData.mazeretNedeni || '___________________'} nedeniyle katılamadım.
              </p>
              
              <p className="mb-2">
                Üniversitemizin Eğitim-Öğretim ve Sınav Yönetmeliği'nin ilgili maddeleri uyarınca; mazeretimin kabul edilmesini ve giremediğim sınav için tarafıma Mazeret Sınav Hakkı tanınmasını arz ederim.
              </p>
              
              <p className="mb-2">
                Mazeretime dair resmi belgeler dilekçemin ekinde sunulmuştur.
              </p>
              
              <p className="mt-4">Gereğini bilgilerinize saygılarımla arz ederim.</p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Ad Soyad:</strong> [Ad Soyad]</p>
              <p><strong>İmza:</strong> [İmza]</p>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold mb-2">EK:</p>
              <div className="ml-4 space-y-1">
                {formData.ekBelgeler ? (
                  formData.ekBelgeler.split('\n').map((belge, index) => (
                    <p key={index}>{index + 1}- {belge}</p>
                  ))
                ) : (
                  <>
                    <p>1- [Örn: Sağlık Raporu (Hastaneden onaylı)]</p>
                    <p>2- [Örn: Sınav Takvimi / Diğer Kanıtlayıcı Belgeler]</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold mb-2">İletişim Bilgileri:</p>
              <p><strong>Telefon:</strong> {formData.telefon || '___________________'}</p>
              <p><strong>E-posta:</strong> {formData.email || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'guardianship-appointment': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      davaciAd: '',
      davaciTC: '',
      davaciAdres: '',
      kisitliAdayiAd: '',
      kisitliAdayiTC: '',
      kisitliAdayiAdres: '',
      vasiAdayiAd: '',
      vasiAdayiTC: '',
      vasiAdayiAdres: '',
      iliski: '',
      kısıtlamaNedeni: '',
      somutOlaylar: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVACI (Kısıtlı Adayı Yakını) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davaciAd" value={formData.davaciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="davaciTC" value={formData.davaciTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davaciAdres" value={formData.davaciAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">VESAYET ALTINA ALINMASI İSTENEN (Kısıtlı Adayı) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="kisitliAdayiAd" value={formData.kisitliAdayiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="kisitliAdayiTC" value={formData.kisitliAdayiTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kisitliAdayiAdres" value={formData.kisitliAdayiAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Davacı ile İlişkisi *</label>
              <select name="iliski" value={formData.iliski || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Seçiniz</option>
                <option value="anne">Annem</option>
                <option value="baba">Babam</option>
                <option value="kardes">Kardeşim</option>
                <option value="es">Eşim</option>
                <option value="cocuk">Çocuğum</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">VASİ ADAYI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="vasiAdayiAd" value={formData.vasiAdayiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="vasiAdayiTC" value={formData.vasiAdayiTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="vasiAdayiAdres" value={formData.vasiAdayiAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kısıtlanma Nedeni *</label>
          <select name="kısıtlamaNedeni" value={formData.kısıtlamaNedeni || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="">Seçiniz</option>
            <option value="yaslilik">Yaşlılık</option>
            <option value="demans">Demans</option>
            <option value="alzheimer">Alzheimer</option>
            <option value="zihinsel">Zihinsel Engellilik</option>
            <option value="madde">Madde Bağımlılığı</option>
            <option value="diger">Diğer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Somut Olaylar (Varsa)</label>
          <textarea name="somutOlaylar" value={formData.somutOlaylar || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: Son zamanlarda tanımadığı kişilere para transferleri yapmıştır veya Yolunu kaybetmekte ve kendini tehlikeye atmaktadır" />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      const iliskiText = formData.iliski === 'anne' ? 'Annem' : formData.iliski === 'baba' ? 'Babam' : formData.iliski === 'kardes' ? 'Kardeşim' : formData.iliski === 'es' ? 'Eşim' : formData.iliski === 'cocuk' ? 'Çocuğum' : 'Yakınım';
      
      const kısıtlamaNedeniText = formData.kısıtlamaNedeni === 'yaslilik' ? 'Yaşlılık' : formData.kısıtlamaNedeni === 'demans' ? 'Demans' : formData.kısıtlamaNedeni === 'alzheimer' ? 'Alzheimer' : formData.kısıtlamaNedeni === 'zihinsel' ? 'Zihinsel Engellilik' : formData.kısıtlamaNedeni === 'madde' ? 'Madde Bağımlılığı' : formData.kısıtlamaNedeni || '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">VASİ ATANMASI DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.sehir || '___________________'}</strong> NÖBETÇİ SULH HUKUK MAHKEMESİ SAYIN HAKİMLİĞİ'NE
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <p><strong>DAVACI (Kısıtlı Adayı Yakını):</strong> {formData.davaciAd || '___________________'}, T.C. Kimlik No: {formData.davaciTC || '___________________'}, Adres: {formData.davaciAdres || '___________________'}</p>
              <p><strong>VESAYET ALTINA ALINMASI İSTENEN (Kısıtlı Adayı):</strong> {formData.kisitliAdayiAd || '___________________'}, T.C. Kimlik No: {formData.kisitliAdayiTC || '___________________'}, Adres: {formData.kisitliAdayiAdres || '___________________'}</p>
              <p><strong>VASİ ADAYI:</strong> {formData.vasiAdayiAd || '___________________'}, T.C. No: {formData.vasiAdayiTC || '___________________'}, Adres: {formData.vasiAdayiAdres || '___________________'}</p>
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> <strong>{formData.kisitliAdayiAd || '___________________'}</strong>'nın vesayet altına alınması ve tarafımın/belirtilen kişinin vasi olarak atanması talebidir.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR:</p>
              
              <p className="mb-2">
                Vesayet altına alınması istenen <strong>{formData.kisitliAdayiAd || '___________________'}</strong>, benim <strong>{iliskiText}</strong> olur.
              </p>
              
              <p className="mb-2">
                Kendisi <strong>{kısıtlamaNedeniText}</strong> nedeniyle kendi işlerini çekip çeviremeyecek durumdadır. Bu durum, hem günlük yaşamını idame ettirmesini imkansız kılmakta hem de mal varlığının yönetimi konusunda kendisini suiistimallere açık hale getirmektedir.
              </p>
              
              {formData.somutOlaylar && (
                <p className="mb-2">
                  {formData.somutOlaylar}
                </p>
              )}
              
              <p className="mb-2">
                Söz konusu durumun tespiti amacıyla mahkemenizce tam teşekküllü bir devlet hastanesinden Sağlık Kurulu Raporu alınmasını talep ediyoruz.
              </p>
              
              <p className="mb-2">
                Türk Medeni Kanunu uyarınca, kısıtlı adayının haklarının korunması, resmi işlemlerinin yürütülmesi ve mal varlığının yönetilmesi amacıyla kendisinin vesayet altına alınması ve <strong>{formData.vasiAdayiAd || '___________________'}</strong>'nın vasi olarak atanmasını arz ve talep ederim.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">HUKUKİ DELİLLER:</p>
              <p>Nüfus kayıtları, varsa mevcut doktor raporları, tanık beyanları ve mahkemece sevk edilecek hastaneden alınacak Sağlık Kurulu Raporu.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM:</p>
              <p>
                Yukarıda arz edilen nedenlerle; <strong>{formData.kisitliAdayiAd || '___________________'}</strong>'nın kısıtlanarak vesayet altına alınmasına, tarafımın/belirtilen vasi adayının vasi olarak atanmasına karar verilmesini saygılarımla arz ederim.
              </p>
              <p className="mt-4">{tarih}</p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="mb-2">Davacı</p>
              <p className="mb-2">{formData.davaciAd || '___________________'} / [İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'high-school-grade-objection': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      okulAdi: '',
      sehir: '',
      sinif: '',
      sube: '',
      okulNo: '',
      veliMi: false,
      ogrenciAd: '',
      sinavTarihi: '',
      dersAdi: '',
      donem: '1',
      yazili: '1',
      alinanNot: '',
      veliAd: '',
      adres: '',
      telefon: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Okul Adı *</label>
          <input type="text" name="okulAdi" value={formData.okulAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Sınıf *</label>
            <input type="text" name="sinif" value={formData.sinif || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 9, 10, 11, 12" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Şube</label>
            <input type="text" name="sube" value={formData.sube || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: A, B, C" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Okul Numarası *</label>
          <input type="text" name="okulNo" value={formData.okulNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" name="veliMi" checked={formData.veliMi || false} onChange={(e) => {
              const fakeEvent = { ...e, target: { ...e.target, name: 'veliMi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }} className="mr-2" />
            Veli başvurusu (Öğrenci değil, veli başvuruyor)
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öğrenci Ad Soyad *</label>
          <input type="text" name="ogrenciAd" value={formData.ogrenciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sınav Tarihi *</label>
          <input type="date" name="sinavTarihi" value={formData.sinavTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dersin Adı *</label>
          <input type="text" name="dersAdi" value={formData.dersAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Dönem *</label>
            <select name="donem" value={formData.donem || '1'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
              <option value="1">1. Dönem</option>
              <option value="2">2. Dönem</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Yazılı *</label>
            <select name="yazili" value={formData.yazili || '1'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
              <option value="1">1. Yazılı</option>
              <option value="2">2. Yazılı</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alınan Not *</label>
          <input type="text" name="alinanNot" value={formData.alinanNot || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 45, 60" />
        </div>
        {formData.veliMi && (
          <div>
            <label className="block text-sm font-medium mb-1">Veli Ad Soyad *</label>
            <input type="text" name="veliAd" value={formData.veliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Adres *</label>
          <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefon *</label>
          <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const sinavTarihi = formData.sinavTarihi ? formatDate(formData.sinavTarihi) : '___________________';
      
      const sinifSube = formData.sube ? `${formData.sinif || '___________________'} / ${formData.sube}` : formData.sinif || '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">LİSE NOT İTİRAZ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.okulAdi || '___________________'}</strong> MÜDÜRLÜĞÜ'NE
              </p>
              <p className="text-center">
                <strong>{formData.sehir || '___________________'}</strong>
              </p>
              <p className="text-center mt-2">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: Sınav notuna itiraz ve kağıdın yeniden incelenmesi talebi.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN OKUL MÜDÜRLÜĞÜ,</p>
              
              <p className="mb-2">
                Okulunuzun <strong>{sinifSube}</strong> sınıfı, <strong>{formData.okulNo || '___________________'}</strong> numaralı öğrencisiyim. {formData.veliMi ? `... numaralı öğrencisi <strong>${formData.ogrenciAd || '___________________'}</strong>'nın velisiyim.` : ''}
              </p>
              
              <p className="mb-2">
                <strong>{sinavTarihi}</strong> tarihinde yapılan <strong>{formData.dersAdi || '___________________'}</strong> dersi, <strong>{formData.donem || '___________________'}</strong>. dönem, <strong>{formData.yazili || '___________________'}</strong>. yazılı sınavı sonucum <strong>{formData.alinanNot || '___________________'}</strong> olarak ilan edilmiştir.
              </p>
              
              <p className="mb-2">
                Söz konusu sınav kağıdımın; cevap anahtarı ile karşılaştırılarak maddi hata (puan toplama hatası, cevaplandığı halde puan verilmemiş soru vb.) yönünden yeniden incelenmesini talep ediyorum. Sınav sonucumun beklentimin altında olması nedeniyle, hata varsa düzeltilmesini ve sonucun tarafıma bildirilmesini saygılarımla arz ederim.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Öğrenci Ad Soyad:</strong> {formData.ogrenciAd || '___________________'}</p>
              <p><strong>İmza:</strong> [İmzanız]</p>
              {formData.veliMi && (
                <>
                  <p className="mt-2"><strong>Veli Ad Soyad:</strong> {formData.veliAd || '___________________'}</p>
                  <p><strong>İmza:</strong> [Velinin İmzası]</p>
                </>
              )}
              <p className="mt-2"><strong>Adres:</strong> {formData.adres || '___________________'}</p>
              <p><strong>Telefon:</strong> {formData.telefon || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'surname-change-notification': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      kurumAdi: '',
      kurumTuru: '',
      mahkemeKarariTarihi: '',
      mahkemeKarariNo: '',
      degisiklikNedeni: '',
      ad: '',
      eskiSoyad: '',
      yeniSoyad: '',
      tcKimlikNo: '',
      adres: '',
      telefon: '',
      email: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kurum / İşveren / Okul / Banka Adı *</label>
          <input type="text" name="kurumAdi" value={formData.kurumAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kurum Türü</label>
          <select name="kurumTuru" value={formData.kurumTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Seçiniz</option>
            <option value="kurum">Kurum</option>
            <option value="isveren">İşveren</option>
            <option value="okul">Okul</option>
            <option value="banka">Banka</option>
            <option value="diger">Diğer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Değişiklik Nedeni *</label>
          <select name="degisiklikNedeni" value={formData.degisiklikNedeni || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="">Seçiniz</option>
            <option value="mahkeme">Mahkeme Kararı</option>
            <option value="evlilik">Evlilik</option>
            <option value="bosanma">Boşanma</option>
            <option value="diger">Diğer</option>
          </select>
        </div>
        {formData.degisiklikNedeni === 'mahkeme' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Mahkeme Kararı Tarihi *</label>
              <input type="date" name="mahkemeKarariTarihi" value={formData.mahkemeKarariTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mahkeme Kararı Sayısı *</label>
              <input type="text" name="mahkemeKarariNo" value={formData.mahkemeKarariNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </>
        )}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad *</label>
              <input type="text" name="ad" value={formData.ad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Eski Soyad *</label>
              <input type="text" name="eskiSoyad" value={formData.eskiSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yeni Soyad *</label>
              <input type="text" name="yeniSoyad" value={formData.yeniSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İletişim Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta *</label>
              <input type="email" name="email" value={formData.email || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const mahkemeKarariTarihi = formData.mahkemeKarariTarihi ? formatDate(formData.mahkemeKarariTarihi) : '___________________';
      
      let degisiklikNedeniText = '';
      if (formData.degisiklikNedeni === 'mahkeme') {
        degisiklikNedeniText = `${mahkemeKarariTarihi} tarihli ve ${formData.mahkemeKarariNo || '___________________'} sayılı mahkeme kararı`;
      } else if (formData.degisiklikNedeni === 'evlilik') {
        degisiklikNedeniText = 'evlilik';
      } else if (formData.degisiklikNedeni === 'bosanma') {
        degisiklikNedeniText = 'boşanma işlemi';
      } else {
        degisiklikNedeniText = formData.degisiklikNedeni || '___________________';
      }
      
      const yeniAdSoyad = `${formData.ad || '___________________'} ${formData.yeniSoyad || '___________________'}`;
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">SOYADI DEĞİŞİKLİĞİ BİLDİRİMİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-4">
              <p><strong>Kime:</strong> {formData.kurumAdi || '___________________'} ({formData.kurumTuru || 'Kurum / İşveren / Okul / Banka vb.'})</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">Konu: Soyadı Değişikliği Bildirimi</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">Sayın Yetkili,</p>
              
              <p className="mb-2">
                {degisiklikNedeniText} sonucunda soyadım değişmiştir.
              </p>
              
              <p className="mb-2">Bu kapsamda;</p>
              
              <div className="ml-4 space-y-1">
                <p><strong>Eski Soyadım:</strong> {formData.eskiSoyad || '___________________'}</p>
                <p><strong>Yeni Soyadım:</strong> {formData.yeniSoyad || '___________________'}</p>
                <p><strong>Adım:</strong> {formData.ad || '___________________'}</p>
                <p><strong>T.C. Kimlik Numaram:</strong> {formData.tcKimlikNo || '___________________'}</p>
              </div>
              
              <p className="mt-4 mb-2">
                olup, kayıtlarınızda yer alan bilgilerimin yeni soyadım esas alınarak güncellenmesini arz ederim.
              </p>
              
              <p className="mt-4">Gereğini bilgilerinize sunar, işlemlerin yapılmasını saygılarımla talep ederim.</p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Ad Soyad (Yeni Soyadı ile):</strong> {yeniAdSoyad}</p>
              <p><strong>İmza:</strong> [İmza]</p>
              <p className="mt-2"><strong>Adres:</strong> {formData.adres || '___________________'}</p>
              <p><strong>Telefon:</strong> {formData.telefon || '___________________'}</p>
              <p><strong>E-posta:</strong> {formData.email || '___________________'}</p>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold mb-2">Ekler:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nüfus cüzdanı / T.C. Kimlik Kartı fotokopisi</li>
                {formData.degisiklikNedeni === 'mahkeme' && (
                  <li>Mahkeme kararı</li>
                )}
                {formData.degisiklikNedeni === 'evlilik' && (
                  <li>Evlilik cüzdanı</li>
                )}
                {formData.degisiklikNedeni === 'bosanma' && (
                  <li>Boşanma ilamı</li>
                )}
                {(formData.degisiklikNedeni === 'mahkeme' || formData.degisiklikNedeni === 'evlilik' || formData.degisiklikNedeni === 'bosanma') && (
                  <li className="text-gray-500">(varsa)</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      );
    },
  },
  'green-passport-cadre-request': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      kurumAdi: '',
      birimAdi: '',
      sehir: '',
      sicilNo: '',
      pozisyon: '',
      unvan: '',
      adSoyad: '',
      tcKimlikNo: '',
      adres: '',
      telefon: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kurum Adı *</label>
          <input type="text" name="kurumAdi" value={formData.kurumAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İlgili Birim/Personel Daire Başkanlığı *</label>
          <input type="text" name="birimAdi" value={formData.birimAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sicil No *</label>
          <input type="text" name="sicilNo" value={formData.sicilNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pozisyon/Unvan *</label>
          <input type="text" name="pozisyon" value={formData.pozisyon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Müdür, Uzman, Memur" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unvan (İmza için) *</label>
          <input type="text" name="unvan" value={formData.unvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="adSoyad" value={formData.adSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">YEŞİL PASAPORT İÇİN KADRO DERECESİ GÖSTERİR BELGE TALEBİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.kurumAdi || '___________________'}</strong>
              </p>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.birimAdi || '___________________'}</strong>'NA
              </p>
              <p className="text-center">
                <strong>{formData.sehir || '___________________'}</strong>
              </p>
              <p className="text-center mt-2">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: Hususi Damgalı Pasaport (Yeşil Pasaport) alımı için kadro derecesini gösterir belge talebi.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Kurumunuz bünyesinde <strong>{formData.sicilNo || '___________________'}</strong> sicil numarası ile <strong>{formData.pozisyon || '___________________'}</strong> olarak görev yapmaktayım.
              </p>
              
              <p className="mb-2">
                Halen işgal etmekte olduğum kadro derecesinin Hususi Damgalı Pasaport alımına uygun olması sebebiyle; İl Nüfus ve Vatandaşlık Müdürlüğü'ne sunulmak üzere, kadro derecemi gösterir <strong>"Hususi Pasaport Talep Formu"</strong>nun tanzim edilerek tarafıma verilmesini arz ederim.
              </p>
              
              <p className="mt-4">Gereğini bilgilerinize saygılarımla sunarım.</p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Ad Soyad:</strong> {formData.adSoyad || '___________________'}</p>
              <p><strong>T.C. Kimlik No:</strong> {formData.tcKimlikNo || '___________________'}</p>
              <p><strong>Unvan:</strong> {formData.unvan || '___________________'}</p>
              <p><strong>İmza:</strong> [İmza]</p>
              <p className="mt-2"><strong>Adres:</strong> {formData.adres || '___________________'}</p>
              <p><strong>Telefon:</strong> {formData.telefon || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'university-grade-objection': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      universiteAdi: '',
      fakulteYuksekokulAdi: '',
      dekanlikMudurluk: 'dekanlik',
      bolum: '',
      ogrenciNo: '',
      ogretimYili: '',
      yariyil: 'guz',
      sinavTuru: 'vize',
      alinanNot: '',
      dersKodu: '',
      dersAdi: '',
      ogretimUyesiUnvan: '',
      ogretimUyesiAd: '',
      ogrenciAd: '',
      telefon: '',
      email: '',
      adres: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Üniversite Adı *</label>
          <input type="text" name="universiteAdi" value={formData.universiteAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fakülte / Yüksekokul Adı *</label>
          <input type="text" name="fakulteYuksekokulAdi" value={formData.fakulteYuksekokulAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dekanlık / Müdürlük *</label>
          <select name="dekanlikMudurluk" value={formData.dekanlikMudurluk || 'dekanlik'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="dekanlik">DEKANLIĞI'NA</option>
            <option value="mudurluk">MÜDÜRLÜĞÜ'NE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bölüm Adı *</label>
          <input type="text" name="bolum" value={formData.bolum || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öğrenci Numarası *</label>
          <input type="text" name="ogrenciNo" value={formData.ogrenciNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öğretim Yılı *</label>
          <input type="text" name="ogretimYili" value={formData.ogretimYili || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 2023-2024" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yarıyıl *</label>
          <select name="yariyil" value={formData.yariyil || 'guz'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="guz">Güz</option>
            <option value="bahar">Bahar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sınav Türü *</label>
          <select name="sinavTuru" value={formData.sinavTuru || 'vize'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="vize">Vize</option>
            <option value="final">Final</option>
            <option value="butunleme">Bütünleme</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alınan Not *</label>
          <input type="text" name="alinanNot" value={formData.alinanNot || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 45, 60" />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Ders Bilgileri</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ders Kodu *</label>
                <input type="text" name="dersKodu" value={formData.dersKodu || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ders Adı *</label>
                <input type="text" name="dersAdi" value={formData.dersAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Öğretim Üyesi Unvan *</label>
                <input type="text" name="ogretimUyesiUnvan" value={formData.ogretimUyesiUnvan || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Prof. Dr., Doç. Dr., Dr. Öğr. Üyesi" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Öğretim Üyesi Ad Soyad *</label>
                <input type="text" name="ogretimUyesiAd" value={formData.ogretimUyesiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Öğrenci Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="ogrenciAd" value={formData.ogrenciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta (Üniversite e-posta adresiniz) *</label>
              <input type="email" name="email" value={formData.email || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      const dekanlikMudurlukText = formData.dekanlikMudurluk === 'dekanlik' ? "DEKANLIĞI'NA" : "MÜDÜRLÜĞÜ'NE";
      const yariyilText = formData.yariyil === 'guz' ? 'Güz' : 'Bahar';
      const sinavTuruText = formData.sinavTuru === 'vize' ? 'Vize' : formData.sinavTuru === 'final' ? 'Final' : 'Bütünleme';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ÜNİVERSİTE NOT İTİRAZ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.universiteAdi || '___________________'}</strong>
              </p>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.fakulteYuksekokulAdi || '___________________'}</strong> {dekanlikMudurlukText}
              </p>
              <p className="text-center mt-2">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: Sınav notuna itiraz ve maddi hata incelemesi talebi hakkında.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Fakülteniz/Yüksekokulunuz <strong>{formData.bolum || '___________________'}</strong> Bölümü, <strong>{formData.ogrenciNo || '___________________'}</strong> numaralı öğrencisiyim.
              </p>
              
              <p className="mb-2">
                <strong>{formData.ogretimYili || '___________________'}</strong> Eğitim-Öğretim Yılı <strong>{yariyilText}</strong> yarıyılında aşağıda bilgileri yer alan dersin <strong>{sinavTuruText}</strong> sınavına katılım sağladım. Söz konusu sınav sonucum <strong>{formData.alinanNot || '___________________'}</strong> olarak ilan edilmiştir.
              </p>
              
              <div className="mt-4">
                <p className="font-semibold mb-2">Ders Bilgileri:</p>
                <p className="mb-1"><strong>Dersin Kodu ve Adı:</strong> <strong>{formData.dersKodu || '___________________'}</strong> - <strong>{formData.dersAdi || '___________________'}</strong></p>
                <p><strong>Dersin Sorumlu Öğretim Üyesi:</strong> <strong>{formData.ogretimUyesiUnvan || '___________________'}</strong> <strong>{formData.ogretimUyesiAd || '___________________'}</strong></p>
              </div>
              
              <p className="mt-4 mb-2">
                Sınav kağıdımın; puan toplama hatası, cevaplandığı halde puan verilmemiş soru veya sisteme yanlış veri girişi gibi maddi hatalar yönünden yeniden incelenmesini talep ediyorum. İnceleme sonucunun tarafıma bildirilmesi hususunda gereğini bilgilerinize saygılarımla arz ederim.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Öğrenci Ad Soyad:</strong> {formData.ogrenciAd || '___________________'}</p>
              <p><strong>İmza:</strong> [İmza]</p>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold mb-2">İletişim Bilgileri:</p>
              <p><strong>Telefon:</strong> {formData.telefon || '___________________'}</p>
              <p><strong>E-posta:</strong> {formData.email || '___________________'}</p>
              <p><strong>Adres:</strong> {formData.adres || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'name-change-request': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      sehir: '',
      davaciAd: '',
      davaciTC: '',
      davaciAdres: '',
      il: '',
      ilce: '',
      eskiIsim: '',
      yeniIsim: '',
      degisiklikNedeni: '',
      sosyalCevre: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVACI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davaciAd" value={formData.davaciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="davaciTC" value={formData.davaciTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davaciAdres" value={formData.davaciAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVALI Bilgileri</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">İl *</label>
              <input type="text" name="il" value={formData.il || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İlçe *</label>
              <input type="text" name="ilce" value={formData.ilce || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İsim Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Eski İsim *</label>
              <input type="text" name="eskiIsim" value={formData.eskiIsim || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yeni İsim *</label>
              <input type="text" name="yeniIsim" value={formData.yeniIsim || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Değişiklik Nedeni *</label>
              <select name="degisiklikNedeni" value={formData.degisiklikNedeni || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Seçiniz</option>
                <option value="gulunc">İsmin gülünç olması</option>
                <option value="toplumsal">Toplumsal değerlerle çatışması</option>
                <option value="telaffuz">Telaffuz zorluğu</option>
                <option value="dini">Dini veya kültürel nedenler</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sosyal Çevrede Yeni İsimle Tanınma Durumu (Detaylı açıklama)</label>
              <textarea name="sosyalCevre" value={formData.sosyalCevre || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Çevremde, ailemde ve sosyal ilişkilerimde uzun yıllardır yeni ismimle tanınmakta ve bu isimle çağrılmaktayım..." />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      const degisiklikNedeniText = formData.degisiklikNedeni === 'gulunc' ? 'ismin gülünç olması' : formData.degisiklikNedeni === 'toplumsal' ? 'toplumsal değerlerle çatışması' : formData.degisiklikNedeni === 'telaffuz' ? 'telaffuz zorluğu' : formData.degisiklikNedeni === 'dini' ? 'dini veya kültürel nedenler' : formData.degisiklikNedeni || '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">İSİM DEĞİŞİKLİĞİ TALEP DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.sehir || '___________________'}</strong> NÖBETÇİ ASLIYE HUKUK MAHKEMESİ SAYIN HAKİMLİĞİ'NE
              </p>
            </div>
            
            <div className="mt-6 space-y-2">
              <p><strong>DAVACI:</strong> {formData.davaciAd || '___________________'}, T.C. Kimlik No: {formData.davaciTC || '___________________'}, Adres: {formData.davaciAdres || '___________________'}</p>
              <p><strong>DAVALI:</strong> {formData.il || '___________________'}/{formData.ilce || '___________________'} Nüfus Müdürlüğü</p>
            </div>
            
            <div className="mt-4">
              <p><strong>KONU:</strong> Haklı nedenlerle isim değişikliği talebidir.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">AÇIKLAMALAR:</p>
              
              <p className="mb-2">
                Nüfus kayıtlarında ismim "<strong>{formData.eskiIsim || '___________________'}</strong>" olarak geçmektedir. Ancak bu isim <strong>{degisiklikNedeniText}</strong> sebebiyle sosyal hayatımda ve iş hayatımda ciddi zorluklar yaşamama neden olmaktadır.
              </p>
              
              {formData.sosyalCevre ? (
                <p className="mb-2">{formData.sosyalCevre}</p>
              ) : (
                <p className="mb-2">
                  Çevremde, ailemde ve sosyal ilişkilerimde uzun yıllardır "<strong>{formData.yeniIsim || '___________________'}</strong>" ismiyle tanınmakta ve bu isimle çağrılmaktayım. Mevcut resmi ismim ile günlük hayatta kullandığım ismin farklı olması, resmi işlemlerde ve sosyal münasebetlerde karışıklığa ve mağduriyetime yol açmaktadır.
                </p>
              )}
              
              <p className="mb-2">
                İsmimin "<strong>{formData.yeniIsim || '___________________'}</strong>" olarak değiştirilmesi, aidiyet duygumu güçlendirecek ve yaşadığım karmaşayı sona erdirecektir. İsim değişikliği talebimde herhangi bir kötü niyet bulunmamakta olup, bu durum üçüncü kişilerin haklarını da haleldar etmemektedir.
              </p>
              
              <p className="mb-2">
                Türk Medeni Kanunu'nun 27. maddesi uyarınca; "Adın değiştirilmesi, ancak haklı sebeplere dayanılarak hakimden istenebilir." Yukarıda belirttiğim hususlar yasal "haklı sebep" teşkil etmektedir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">HUKUKİ DELİLLER:</p>
              <p>Nüfus kayıt örneği, tanık beyanları (sosyal çevremde yeni ismimle tanındığıma dair), sosyal medya kayıtları veya bu ismi kullandığımı gösterir diğer belgeler ve her türlü yasal delil.</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">SONUÇ VE İSTEM:</p>
              <p>
                Yukarıda arz ve izah edilen nedenlerle; nüfus kayıtlarında "<strong>{formData.eskiIsim || '___________________'}</strong>" olan ismimin iptali ile "<strong>{formData.yeniIsim || '___________________'}</strong>" olarak değiştirilmesine ve bu durumun nüfus kütüğüne tesciline karar verilmesini saygılarımla arz ederim.
              </p>
              <p className="mt-4">{tarih}</p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="mb-2">Davacı</p>
              <p className="mb-2">{formData.davaciAd || '___________________'} / [İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'credit-card-closure': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      bankaAdi: '',
      subeAdi: '',
      genelMudurluk: false,
      tcKimlikNo: '',
      musteriNo: '',
      kartNoSon4: '',
      borcVarMi: false,
      borcDurumu: '',
      otomatikOdeme: true,
      bilgilendirmeYolu: 'sms',
      adSoyad: '',
      telefon: '',
      adres: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Banka Adı *</label>
          <input type="text" name="bankaAdi" value={formData.bankaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" name="genelMudurluk" checked={formData.genelMudurluk || false} onChange={(e) => {
              const fakeEvent = { ...e, target: { ...e.target, name: 'genelMudurluk', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }} className="mr-2" />
            Genel Müdürlük'e gönderilecek
          </label>
        </div>
        {!formData.genelMudurluk && (
          <div>
            <label className="block text-sm font-medium mb-1">Şube Adı *</label>
            <input type="text" name="subeAdi" value={formData.subeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        )}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kart Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Müşteri No (Varsa)</label>
              <input type="text" name="musteriNo" value={formData.musteriNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kredi Kartı Numarasının Son 4 Hanesi *</label>
              <input type="text" name="kartNoSon4" value={formData.kartNoSon4 || ''} onChange={onChange} maxLength={4} className="w-full px-3 py-2 border rounded-lg" required placeholder="XXXX" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Borç Durumu</h3>
          <div>
            <label className="flex items-center">
              <input type="checkbox" name="borcVarMi" checked={formData.borcVarMi || false} onChange={(e) => {
                const fakeEvent = { ...e, target: { ...e.target, name: 'borcVarMi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }} className="mr-2" />
              Kartımda borç var
            </label>
          </div>
          {formData.borcVarMi && (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Borç Durumu *</label>
              <textarea name="borcDurumu" value={formData.borcDurumu || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Kartımdaki mevcut borç bakiyesi tarafımdan kapatılmıştır/kapatılacaktır" />
            </div>
          )}
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" name="otomatikOdeme" checked={formData.otomatikOdeme !== false} onChange={(e) => {
              const fakeEvent = { ...e, target: { ...e.target, name: 'otomatikOdeme', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }} className="mr-2" />
            Otomatik ödeme talimatlarının iptal edilmesini istiyorum
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bilgilendirme Yolu *</label>
          <select name="bilgilendirmeYolu" value={formData.bilgilendirmeYolu || 'sms'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="sms">SMS</option>
            <option value="email">E-posta</option>
            <option value="her-ikisi">Her İkisi</option>
          </select>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="adSoyad" value={formData.adSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="05XX XXX XX XX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      const bankaBaslik = formData.genelMudurluk 
        ? `${formData.bankaAdi || '___________________'} GENEL MÜDÜRLÜĞÜ'NE`
        : `${formData.bankaAdi || '___________________'} / ${formData.subeAdi || '___________________'} MÜDÜRLÜĞÜ'NE`;
      
      const bilgilendirmeYoluText = formData.bilgilendirmeYolu === 'sms' ? 'SMS' : formData.bilgilendirmeYolu === 'email' ? 'E-posta' : 'SMS/E-posta';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">KREDİ KARTI KAPATMA DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                {bankaBaslik}
              </p>
              <p className="text-center mt-2">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: <strong>{formData.kartNoSon4 || 'XXXX'}</strong> Numaralı Kredi Kartımın İptali Hakkında.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Bankanızın <strong>{formData.tcKimlikNo || '___________________'}</strong> kimlik numaralı{formData.musteriNo ? ` ve <strong>${formData.musteriNo}</strong> numaralı` : ''} müşterisiyim. Kullanmakta olduğum, son dört hanesi <strong>{formData.kartNoSon4 || 'XXXX'}</strong> olan kredi kartımın ve bu karta bağlı tüm ek kartların, bu dilekçe tarihi itibarıyla iptal edilmesini ve kullanıma kapatılmasını talep ediyorum.
              </p>
              
              <div className="mt-4">
                <p className="font-semibold mb-2">İptal Talebime İlişkin Hususlar:</p>
                
                {formData.borcVarMi ? (
                  <p className="mb-2">
                    Kartımdaki mevcut borç bakiyesi tarafımdan {formData.borcDurumu || 'kapatılmıştır/kapatılacaktır'}.
                  </p>
                ) : (
                  <p className="mb-2">
                    Kartıma ait güncel borç tutarı bulunmamaktadır.
                  </p>
                )}
                
                {formData.otomatikOdeme !== false && (
                  <p className="mb-2">
                    Kartıma bağlı tüm otomatik ödeme talimatlarının iptal edilmesini rica ederim.
                  </p>
                )}
                
                <p className="mb-2">
                  Kartımın iptal edildiğine dair tarafıma <strong>{bilgilendirmeYoluText}</strong> yoluyla yazılı bilgi verilmesini talep ediyorum.
                </p>
              </div>
              
              <p className="mt-4 mb-2">
                Kredi kartımın iptal işlemi gerçekleştirilmediği takdirde, 6502 sayılı Kanun uyarınca Tüketici Hakem Heyeti'ne başvuracağımı bildirir, gereğinin ivedilikle yapılmasını saygılarımla arz ederim.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Ad Soyad:</strong> {formData.adSoyad || '___________________'}</p>
              <p><strong>İmza:</strong> [İmza]</p>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold mb-2">İletişim Bilgileri:</p>
              <p><strong>Telefon:</strong> {formData.telefon || '05XX XXX XX XX'}</p>
              <p><strong>Adres:</strong> {formData.adres || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'grade-objection-primary-secondary': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      okulAdi: '',
      sehir: '',
      sinif: '',
      sube: '',
      okulNo: '',
      ogrenciAd: '',
      sinavTarihi: '',
      dersAdi: '',
      donem: '1',
      yazili: '1',
      alinanNot: '',
      veliAd: '',
      adres: '',
      telefon: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Okul Adı *</label>
          <input type="text" name="okulAdi" value={formData.okulAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Sınıf *</label>
            <input type="text" name="sinif" value={formData.sinif || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 5, 6, 7, 8, 9, 10, 11, 12" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Şube</label>
            <input type="text" name="sube" value={formData.sube || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: A, B, C" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Okul Numarası *</label>
          <input type="text" name="okulNo" value={formData.okulNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öğrenci Ad Soyad *</label>
          <input type="text" name="ogrenciAd" value={formData.ogrenciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sınav Tarihi *</label>
          <input type="date" name="sinavTarihi" value={formData.sinavTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dersin Adı *</label>
          <input type="text" name="dersAdi" value={formData.dersAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Dönem *</label>
            <select name="donem" value={formData.donem || '1'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
              <option value="1">1. Dönem</option>
              <option value="2">2. Dönem</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Yazılı *</label>
            <select name="yazili" value={formData.yazili || '1'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
              <option value="1">1. Yazılı</option>
              <option value="2">2. Yazılı</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alınan Not *</label>
          <input type="text" name="alinanNot" value={formData.alinanNot || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 45, 60" />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Veli Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Veli Ad Soyad *</label>
              <input type="text" name="veliAd" value={formData.veliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="05XX XXX XX XX" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const sinavTarihi = formData.sinavTarihi ? formatDate(formData.sinavTarihi) : '___________________';
      
      const sinifSube = formData.sube ? `${formData.sinif || '___________________'} / ${formData.sube}` : formData.sinif || '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">İLKÖĞRETİM VE ORTAÖĞRETİM NOT İTİRAZ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.okulAdi || '___________________'}</strong> MÜDÜRLÜĞÜ'NE
              </p>
              <p className="text-center">
                <strong>{formData.sehir || '___________________'}</strong>
              </p>
              <p className="text-center mt-2">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: Sınav notuna itiraz ve maddi hata incelemesi talebi.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN OKUL MÜDÜRLÜĞÜ,</p>
              
              <p className="mb-2">
                Okulunuzun <strong>{sinifSube}</strong> sınıfı, <strong>{formData.okulNo || '___________________'}</strong> numaralı öğrencisi <strong>{formData.ogrenciAd || '___________________'}</strong>'nın velisiyim.
              </p>
              
              <p className="mb-2">
                Öğrencimin <strong>{sinavTarihi}</strong> tarihinde yapılan <strong>{formData.dersAdi || '___________________'}</strong> dersi, <strong>{formData.donem || '___________________'}</strong>. dönem, <strong>{formData.yazili || '___________________'}</strong>. yazılı sınavı sonucu <strong>{formData.alinanNot || '___________________'}</strong> olarak ilan edilmiştir.
              </p>
              
              <p className="mb-2">
                Söz konusu sınav kağıdının; puan toplama hatası, cevaplandığı halde puan verilmemiş soru veya cevap anahtarı ile uyumsuzluk gibi maddi hatalar yönünden tekrar incelenmesini talep ediyorum. Hata tespit edilmesi durumunda gerekli düzeltmenin e-Okul sistemi üzerinde yapılmasını ve sonucun tarafıma bildirilmesini saygılarımla arz ederim.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Veli Ad Soyad:</strong> {formData.veliAd || '___________________'}</p>
              <p><strong>İmza:</strong> [İmzanız]</p>
              <p className="mt-2"><strong>Öğrenci Ad Soyad:</strong> {formData.ogrenciAd || '___________________'}</p>
              <p className="mt-2"><strong>Adres:</strong> {formData.adres || '___________________'}</p>
              <p><strong>Telefon:</strong> {formData.telefon || '05XX XXX XX XX'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'diploma-request': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      okulUniversiteAdi: '',
      fakulteDekanlik: '',
      okulMudurluk: '',
      kurumTuru: 'universite',
      sehir: '',
      mezuniyetYili: '',
      bolum: '',
      ogrenciNo: '',
      kullanimAmaci: '',
      geciciMezuniyetBelgesi: false,
      vekaletleTeslim: false,
      adSoyad: '',
      tcKimlikNo: '',
      telefon: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kurum Türü *</label>
          <select name="kurumTuru" value={formData.kurumTuru || 'universite'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="universite">Üniversite</option>
            <option value="okul">Okul</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Okul veya Üniversite Adı *</label>
          <input type="text" name="okulUniversiteAdi" value={formData.okulUniversiteAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        {formData.kurumTuru === 'universite' && (
          <div>
            <label className="block text-sm font-medium mb-1">İlgili Fakülte Dekanlığı *</label>
            <input type="text" name="fakulteDekanlik" value={formData.fakulteDekanlik || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        )}
        {formData.kurumTuru === 'okul' && (
          <div>
            <label className="block text-sm font-medium mb-1">Okul Müdürlüğü *</label>
            <input type="text" name="okulMudurluk" value={formData.okulMudurluk || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Şehir *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mezuniyet Yılı *</label>
          <input type="text" name="mezuniyetYili" value={formData.mezuniyetYili || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 2023" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bölüm/Alan Adı *</label>
          <input type="text" name="bolum" value={formData.bolum || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Öğrenci Numarası *</label>
          <input type="text" name="ogrenciNo" value={formData.ogrenciNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kullanım Amacı *</label>
          <input type="text" name="kullanimAmaci" value={formData.kullanimAmaci || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: İş başvurusu / Akademik başvuru / Arşiv amaçlı" />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" name="geciciMezuniyetBelgesi" checked={formData.geciciMezuniyetBelgesi || false} onChange={(e) => {
              const fakeEvent = { ...e, target: { ...e.target, name: 'geciciMezuniyetBelgesi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }} className="mr-2" />
            Geçici Mezuniyet Belgesi var
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" name="vekaletleTeslim" checked={formData.vekaletleTeslim || false} onChange={(e) => {
              const fakeEvent = { ...e, target: { ...e.target, name: 'vekaletleTeslim', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }} className="mr-2" />
            Vekaletle teslim edilecek
          </label>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="adSoyad" value={formData.adSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      const kurumBaslik = formData.kurumTuru === 'universite' 
        ? `${formData.okulUniversiteAdi || '___________________'}\n${formData.fakulteDekanlik || '___________________'}`
        : `${formData.okulUniversiteAdi || '___________________'}\n${formData.okulMudurluk || '___________________'}`;
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">DİPLOMA TALEBİ DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.okulUniversiteAdi || '___________________'}</strong>
              </p>
              {formData.kurumTuru === 'universite' ? (
                <p className="text-center font-semibold mb-2">
                  <strong>{formData.fakulteDekanlik || '___________________'}</strong>
                </p>
              ) : (
                <p className="text-center font-semibold mb-2">
                  <strong>{formData.okulMudurluk || '___________________'}</strong>
                </p>
              )}
              <p className="text-center">
                <strong>{formData.sehir || '___________________'}</strong>
              </p>
              <p className="text-center mt-2">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: Diploma aslı (veya Mezuniyet Belgesi) teslimi talebi.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Kurumunuzun <strong>{formData.mezuniyetYili || '___________________'}</strong> yılı, <strong>{formData.bolum || '___________________'}</strong> bölümü, <strong>{formData.ogrenciNo || '___________________'}</strong> numaralı mezunuyum.
              </p>
              
              <p className="mb-2">
                Mezuniyet işlemlerimi tamamlamış bulunmaktayım. <strong>{formData.kullanimAmaci || 'İş başvurusu / Akademik başvuru / Arşiv amaçlı'}</strong> kullanmak üzere, adıma düzenlenen Diplomanın aslının tarafıma teslim edilmesini arz ederim.
              </p>
              
              {formData.geciciMezuniyetBelgesi && (
                <p className="mb-2">
                  Diploma teslimi sırasında teslim etmem gereken "Geçici Mezuniyet Belgesi" (varsa) dilekçe ekinde sunulmuştur.
                </p>
              )}
              
              {formData.vekaletleTeslim ? (
                <p className="mb-2">
                  Diplomamın noter tasdikli vekilime teslimi hususunda gereğini bilgilerinize sunarım.
                </p>
              ) : (
                <p className="mb-2">
                  Diplomamın şahsıma teslimi hususunda gereğini bilgilerinize sunarım.
                </p>
              )}
              
              <p className="mt-4">Saygılarımla,</p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Ad Soyad:</strong> {formData.adSoyad || '___________________'}</p>
              <p><strong>T.C. Kimlik No:</strong> {formData.tcKimlikNo || '___________________'}</p>
              <p><strong>Telefon:</strong> {formData.telefon || '___________________'}</p>
              <p><strong>İmza:</strong> [İmza]</p>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold mb-2">EK:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nüfus Cüzdanı Fotokopisi</li>
                {formData.geciciMezuniyetBelgesi && (
                  <li>Geçici Mezuniyet Belgesi (Varsa aslı)</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      );
    },
  },
  'vehicle-sale-promise': {
    getDefaultFormData: () => ({
      sozlesmeTarihi: new Date().toISOString().split('T')[0],
      saticiAd: '',
      saticiTC: '',
      saticiAdres: '',
      aliciAd: '',
      aliciTC: '',
      aliciAdres: '',
      plaka: '',
      marka: '',
      model: '',
      modelYili: '',
      sasiNo: '',
      motorNo: '',
      toplamSatisBedeli: '',
      pesinat: '',
      bakiyeOdeme: '',
      bakiyeOdemeTarihi: '',
      devirTarihi: '',
      aracDurumu: '',
      cezaiSart: '2',
      sehir: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sözleşme Tarihi *</label>
          <input type="date" name="sozlesmeTarihi" value={formData.sozlesmeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SATICI (Vaad Eden) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="saticiAd" value={formData.saticiAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="saticiTC" value={formData.saticiTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="saticiAdres" value={formData.saticiAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ALICI (Vaad Edilen) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="aliciAd" value={formData.aliciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="aliciTC" value={formData.aliciTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="aliciAdres" value={formData.aliciAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ARAÇ BİLGİLERİ</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Plaka No *</label>
              <input type="text" name="plaka" value={formData.plaka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Marka *</label>
                <input type="text" name="marka" value={formData.marka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model *</label>
                <input type="text" name="model" value={formData.model || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model Yılı *</label>
              <input type="text" name="modelYili" value={formData.modelYili || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 2020" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şasi No *</label>
              <input type="text" name="sasiNo" value={formData.sasiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Motor No *</label>
              <input type="text" name="motorNo" value={formData.motorNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SATIŞ BEDELİ VE ÖDEME PLANI</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Toplam Satış Bedeli (TL) *</label>
              <input type="text" name="toplamSatisBedeli" value={formData.toplamSatisBedeli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kapora / Peşinat (TL) *</label>
              <input type="text" name="pesinat" value={formData.pesinat || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bakiye Ödeme (TL) *</label>
              <input type="text" name="bakiyeOdeme" value={formData.bakiyeOdeme || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bakiye Ödeme Tarihi *</label>
              <input type="date" name="bakiyeOdemeTarihi" value={formData.bakiyeOdemeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SATIŞIN GERÇEKLEŞTİRİLMESİ VE TESLİMAT</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Devir Tarihi *</label>
              <input type="date" name="devirTarihi" value={formData.devirTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Aracın Durumu *</label>
              <textarea name="aracDurumu" value={formData.aracDurumu || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Ekspertiz raporunda belirtildiği gibi" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">CAYMA VE CEZAİ ŞART</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Cezai Şart (Kaporanın kaç katı) *</label>
            <input type="text" name="cezaiSart" value={formData.cezaiSart || '2'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Mahkeme Şehri *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const sozlesmeTarihi = formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________';
      const bakiyeOdemeTarihi = formData.bakiyeOdemeTarihi ? formatDate(formData.bakiyeOdemeTarihi) : '___________________';
      const devirTarihi = formData.devirTarihi ? formatDate(formData.devirTarihi) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ARAÇ SATIŞ VAADİ SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. TARAFLAR</p>
              <p><strong>SATICI (Vaad Eden):</strong> {formData.saticiAd || '___________________'}, T.C. No: {formData.saticiTC || '___________________'}, Adres: {formData.saticiAdres || '___________________'}</p>
              <p className="mt-2"><strong>ALICI (Vaad Edilen):</strong> {formData.aliciAd || '___________________'}, T.C. No: {formData.aliciTC || '___________________'}, Adres: {formData.aliciAdres || '___________________'}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. SÖZLEŞME KONUSU ARAÇ BİLGİLERİ</p>
              <div className="space-y-1 ml-4">
                <p><strong>Plaka No:</strong> {formData.plaka || '___________________'}</p>
                <p><strong>Marka / Model:</strong> {formData.marka || '___________________'} / {formData.model || '___________________'}</p>
                <p><strong>Model Yılı:</strong> {formData.modelYili || '___________________'}</p>
                <p><strong>Şasi No:</strong> {formData.sasiNo || '___________________'}</p>
                <p><strong>Motor No:</strong> {formData.motorNo || '___________________'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">3. SATIŞ BEDELİ VE ÖDEME PLANI</p>
              <p className="mb-2">
                <strong>Toplam Satış Bedeli:</strong> <strong>{formData.toplamSatisBedeli || '___________________'}</strong> TL'dir.
              </p>
              <p className="mb-2">
                <strong>Kapora / Peşinat:</strong> Alıcı, satıcıya sözleşme imza tarihinde <strong>{formData.pesinat || '___________________'}</strong> TL peşinat ödemiştir.
              </p>
              <p className="mb-2">
                <strong>Bakiye Ödeme:</strong> Kalan tutar olan <strong>{formData.bakiyeOdeme || '___________________'}</strong> TL, en geç <strong>{bakiyeOdemeTarihi}</strong> tarihinde noter satışı sırasında nakden veya banka havalesi ile ödenecektir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">4. SATIŞIN GERÇEKLEŞTİRİLMESİ VE TESLİMAT</p>
              <p className="mb-2">
                <strong>Devir Tarihi:</strong> Taraflar, en geç <strong>{devirTarihi}</strong> tarihine kadar ilgili Noterlik nezdinde asıl satış işlemini gerçekleştirmeyi taahhüt ederler.
              </p>
              <p className="mb-2">
                <strong>Aracın Durumu:</strong> Satıcı, aracın devir tarihine kadar üzerinde hiçbir haciz, rehin veya borç (vergi, trafik cezası vb.) bulunmadığını, aracın mevcut hasar durumunun <strong>{formData.aracDurumu || 'Ekspertiz raporunda belirtildiği gibi'}</strong> olduğunu beyan eder.
              </p>
              <p className="mb-2">
                <strong>Kullanım:</strong> Devir tarihine kadar aracın tüm hukuki ve cezai sorumluluğu Satıcıya aittir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. CAYMA VE CEZAİ ŞART</p>
              <p className="mb-2">
                Satıcı, haklı bir sebep olmaksızın satışı gerçekleştirmekten imtina ederse, aldığı kaporayı <strong>{formData.cezaiSart || '2'} katı</strong> olarak geri ödemeyi kabul eder.
              </p>
              <p className="mb-2">
                Alıcı, satıştan vazgeçmesi durumunda verdiği kaporanın iadesini talep edemeyeceğini kabul eder.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">6. YETKİLİ MAHKEME</p>
              <p>
                Bu sözleşmeden doğacak uyuşmazlıklarda <strong>{formData.sehir || '___________________'}</strong> Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">SATICININ İMZASI</p>
                  <p className="mt-8">{formData.saticiAd || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">ALICININ İMZASI</p>
                  <p className="mt-8">{formData.aliciAd || '___________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'pool-maintenance-agreement': {
    getDefaultFormData: () => ({
      isverenAd: '',
      isverenTC: '',
      isverenVergiNo: '',
      isverenAdres: '',
      isverenTuru: 'sahis',
      yukleniciAd: '',
      yukleniciTC: '',
      yukleniciVergiNo: '',
      yukleniciAdres: '',
      yukleniciTuru: 'firma',
      havuzAdres: '',
      bakimSikligi: '1',
      bakimGunleri: '',
      baslangicTarihi: '',
      bitisTarihi: '',
      aylikUcret: '',
      kimyaGiderleri: 'dahil',
      odemeGunu: '5',
      odemeBanka: '',
      odemeIBAN: '',
      suAnaliziSayisi: '1',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İŞVEREN Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">İşveren Türü *</label>
              <select name="isverenTuru" value={formData.isverenTuru || 'sahis'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="sahis">Şahıs</option>
                <option value="site">Site Yönetimi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Site Yönetimi Adı *</label>
              <input type="text" name="isverenAd" value={formData.isverenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. No (Şahıs ise)</label>
              <input type="text" name="isverenTC" value={formData.isverenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi No (Site Yönetimi ise)</label>
              <input type="text" name="isverenVergiNo" value={formData.isverenVergiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="isverenAdres" value={formData.isverenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">YÜKLENİCİ (Bakım Sorumlusu) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Yüklenici Türü *</label>
              <select name="yukleniciTuru" value={formData.yukleniciTuru || 'firma'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="firma">Firma</option>
                <option value="sahis">Şahıs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Firma Adı / Şahıs Adı *</label>
              <input type="text" name="yukleniciAd" value={formData.yukleniciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. No (Şahıs ise)</label>
              <input type="text" name="yukleniciTC" value={formData.yukleniciTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi No (Firma ise)</label>
              <input type="text" name="yukleniciVergiNo" value={formData.yukleniciVergiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="yukleniciAdres" value={formData.yukleniciAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">HAVUZ BİLGİLERİ</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Havuz Adresi *</label>
            <textarea name="havuzAdres" value={formData.havuzAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ÇALIŞMA PERİYODU</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Bakım Sıklığı (Haftada kaç gün) *</label>
              <select name="bakimSikligi" value={formData.bakimSikligi || '1'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="1">1 Gün</option>
                <option value="2">2 Gün</option>
                <option value="3">3 Gün</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bakım Günleri *</label>
              <input type="text" name="bakimGunleri" value={formData.bakimGunleri || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Pazartesi, Çarşamba, Cuma" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Haftalık Su Analizi Sayısı *</label>
              <input type="text" name="suAnaliziSayisi" value={formData.suAnaliziSayisi || '1'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 1, 2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
                <input type="date" name="baslangicTarihi" value={formData.baslangicTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bitiş Tarihi *</label>
                <input type="date" name="bitisTarihi" value={formData.bitisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MALİ HÜKÜMLER</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Aylık Hizmet Bedeli (TL) *</label>
              <input type="text" name="aylikUcret" value={formData.aylikUcret || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kimyasal Giderleri *</label>
              <select name="kimyaGiderleri" value={formData.kimyaGiderleri || 'dahil'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="dahil">Bakım ücretine dahildir</option>
                <option value="ayri">İşveren tarafından tedarik edilir veya ayrıca faturalandırılır</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Günü (Ayın kaçıncı iş günü) *</label>
                <input type="text" name="odemeGunu" value={formData.odemeGunu || '5'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banka / IBAN *</label>
                <input type="text" name="odemeIBAN" value={formData.odemeIBAN || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const baslangicTarihi = formData.baslangicTarihi ? formatDate(formData.baslangicTarihi) : '___________________';
      const bitisTarihi = formData.bitisTarihi ? formatDate(formData.bitisTarihi) : '___________________';
      
      const isverenKimlik = formData.isverenTuru === 'sahis' 
        ? `T.C. No: ${formData.isverenTC || '___________________'}`
        : `Vergi No: ${formData.isverenVergiNo || '___________________'}`;
      
      const yukleniciKimlik = formData.yukleniciTuru === 'sahis'
        ? `T.C. No: ${formData.yukleniciTC || '___________________'}`
        : `Vergi No: ${formData.yukleniciVergiNo || '___________________'}`;
      
      const kimyaGiderleriText = formData.kimyaGiderleri === 'dahil' 
        ? 'Bakım ücretine dahildir.'
        : 'İşveren tarafından tedarik edilir veya ayrıca faturalandırılır.';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">HAVUZ BAKIM VE SERVİS SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. TARAFLAR</p>
              <p><strong>İŞVEREN:</strong> {formData.isverenAd || '___________________'}, {isverenKimlik}, Adres: {formData.isverenAdres || '___________________'}</p>
              <p className="mt-2"><strong>YÜKLENİCİ (Bakım Sorumlusu):</strong> {formData.yukleniciAd || '___________________'}, {yukleniciKimlik}, Adres: {formData.yukleniciAdres || '___________________'}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. SÖZLEŞMENİN KONUSU</p>
              <p>
                İşbu sözleşme, İşveren'e ait <strong>{formData.havuzAdres || '___________________'}</strong> konumunda bulunan havuzun/havuzların periyodik bakımı, su kimyasının dengelenmesi, mekanik sistemlerin kontrolü ve hijyen standartlarının korunması hizmetlerini kapsar.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">3. GÖREV VE SORUMLULUK LİSTESİ (Tam Hizmet Kapsamı)</p>
              <p className="mb-2">Yüklenici, sözleşme süresince aşağıdaki işlemleri eksiksiz yerine getirecektir:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Su Analizi:</strong> Haftada en az <strong>{formData.suAnaliziSayisi || '1'}</strong> kez pH, klor, siyanürik asit ve alkalinite ölçümlerinin yapılması.</li>
                <li><strong>Kimyasal Uygulama:</strong> Analiz sonuçlarına göre gerekli kimyasalların (sağlık bakanlığı onaylı) doğru dozajda eklenmesi.</li>
                <li><strong>Fiziksel Temizlik:</strong> Havuz tabanının süpürülmesi, yüzeydeki yabancı maddelerin kepçe ile temizlenmesi ve duvarların fırçalanması.</li>
                <li><strong>Filtre Temizliği:</strong> Kum filtrelerinin ters yıkama (backwash) ve durulama işlemlerinin yapılması, ön filtre sepetlerinin temizlenmesi.</li>
                <li><strong>Mekanik Kontrol:</strong> Aydınlatma, pompa ve dozaj ünitelerinin çalışma durumunun kontrol edilmesi; arıza durumunda İşveren'e yazılı bilgi verilmesi.</li>
                <li><strong>Kayıt Tutma:</strong> Yapılan her işlem ve ölçüm sonucunun "Havuz Bakım Defteri"ne düzenli işlenmesi.</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">4. ÇALIŞMA PERİYODU VE SAATLERİ</p>
              <p className="mb-2">
                <strong>Bakım Sıklığı:</strong> Haftada <strong>{formData.bakimSikligi || '1'}</strong> gün, <strong>{formData.bakimGunleri || '___________________'}</strong> günlerinde yapılacaktır.
              </p>
              <p>
                <strong>Süre:</strong> Sözleşme <strong>{baslangicTarihi}</strong> tarihinde başlar ve <strong>{bitisTarihi}</strong> tarihinde sona erer.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. MALİ HÜKÜMLER</p>
              <p className="mb-2">
                <strong>Hizmet Bedeli:</strong> Aylık net <strong>{formData.aylikUcret || '___________________'}</strong> TL'dir.
              </p>
              <p className="mb-2">
                <strong>Kimyasal Giderleri:</strong> {kimyaGiderleriText}
              </p>
              <p>
                <strong>Ödeme Şekli:</strong> Her ayın <strong>{formData.odemeGunu || '5'}</strong>. iş gününe kadar <strong>{formData.odemeIBAN || '___________________'}</strong> numarasına yatırılacaktır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">6. SAĞLIK VE GÜVENLİK</p>
              <p className="mb-2">
                Yüklenici, kullanılan kimyasalların T.C. Sağlık Bakanlığı onaylı olmasından sorumludur.
              </p>
              <p>
                Havuz suyunun yönetmeliklere aykırı değerlerde olması nedeniyle oluşabilecek sağlık sorunlarından (enfeksiyon vb.) doğrudan Yüklenici sorumludur.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">7. GİZLİLİK VE FESİH</p>
              <p className="mb-2">
                Taraflar, 15 gün önceden yazılı bildirimde bulunmak kaydıyla sözleşmeyi tek taraflı feshedebilir.
              </p>
              <p>
                Yüklenici, iş disiplinine ve site/konut kurallarına uymakla yükümlüdür.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">İŞVEREN (İmza)</p>
                  <p className="mt-8">{formData.isverenAd || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">YÜKLENİCİ (İmza)</p>
                  <p className="mt-8">{formData.yukleniciAd || '___________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'bank-account-closure': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      bankaAdi: '',
      subeAdi: '',
      sehir: '',
      tcKimlikNo: '',
      musteriNo: '',
      hesapNo: '',
      iban: '',
      bakiyeTransferi: false,
      transferIBAN: '',
      transferBankaAdi: '',
      nakdenOdeme: false,
      bilgilendirmeYolu: 'yazili',
      adSoyad: '',
      telefon: '',
      adres: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Banka Adı *</label>
          <input type="text" name="bankaAdi" value={formData.bankaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şube Adı *</label>
          <input type="text" name="subeAdi" value={formData.subeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Müşteri Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Müşteri No (Varsa)</label>
              <input type="text" name="musteriNo" value={formData.musteriNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Hesap Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Hesap Numarası *</label>
              <input type="text" name="hesapNo" value={formData.hesapNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IBAN *</label>
              <input type="text" name="iban" value={formData.iban || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR..." />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Bakiye Transferi</h3>
          <div className="space-y-2">
            <div>
              <label className="flex items-center">
                <input type="checkbox" name="bakiyeTransferi" checked={formData.bakiyeTransferi || false} onChange={(e) => {
                  const fakeEvent = { ...e, target: { ...e.target, name: 'bakiyeTransferi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                  onChange(fakeEvent);
                }} className="mr-2" />
                Bakiye başka hesaba transfer edilecek
              </label>
            </div>
            {formData.bakiyeTransferi && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Transfer Edilecek Banka Adı *</label>
                  <input type="text" name="transferBankaAdi" value={formData.transferBankaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transfer Edilecek IBAN *</label>
                  <input type="text" name="transferIBAN" value={formData.transferIBAN || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR..." />
                </div>
              </>
            )}
            <div>
              <label className="flex items-center">
                <input type="checkbox" name="nakdenOdeme" checked={formData.nakdenOdeme || false} onChange={(e) => {
                  const fakeEvent = { ...e, target: { ...e.target, name: 'nakdenOdeme', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                  onChange(fakeEvent);
                }} className="mr-2" />
                Bakiye nakden ödenecek
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bilgilendirme Yolu *</label>
          <select name="bilgilendirmeYolu" value={formData.bilgilendirmeYolu || 'yazili'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="yazili">Yazılı</option>
            <option value="sms">SMS</option>
            <option value="email">E-posta</option>
            <option value="her-ikisi">SMS/E-posta</option>
          </select>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="adSoyad" value={formData.adSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      const bilgilendirmeYoluText = formData.bilgilendirmeYolu === 'yazili' ? 'yazılı' : formData.bilgilendirmeYolu === 'sms' ? 'SMS' : formData.bilgilendirmeYolu === 'email' ? 'E-posta' : 'SMS/E-posta';
      
      let bakiyeIslemi = '';
      if (formData.bakiyeTransferi && formData.transferIBAN) {
        bakiyeIslemi = `hesapta bakiye bulunması halinde bu tutarın ${formData.transferBankaAdi || '___________________'} - ${formData.transferIBAN} numaralı hesabıma transfer edilmesini`;
      } else if (formData.nakdenOdeme) {
        bakiyeIslemi = 'hesapta bakiye bulunması halinde bu tutarın nakden ödenmesini';
      } else {
        bakiyeIslemi = 'hesapta bakiye bulunması halinde bu tutarın aşağıda belirtilen başka banka hesabıma transfer edilmesini (veya nakden ödenmesini)';
      }
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">BANKA HESABINI KAPATMA DİLEKÇESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.bankaAdi || '___________________'}</strong> <strong>{formData.subeAdi || '___________________'}</strong> MÜDÜRLÜĞÜ'NE
              </p>
              <p className="text-center">
                <strong>{formData.sehir || '___________________'}</strong>
              </p>
              <p className="text-center mt-2">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: <strong>{formData.hesapNo || '___________________'}</strong> / <strong>{formData.iban || '___________________'}</strong> Numaralı Hesabımın Kapatılması Hakkında.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Bankanızın <strong>{formData.tcKimlikNo || '___________________'}</strong> kimlik numaralı{formData.musteriNo ? ` ve <strong>${formData.musteriNo}</strong> numaralı` : ''} müşterisiyim.
              </p>
              
              <p className="mb-2">
                Aşağıda detayları belirtilen mevduat hesabımın bu dilekçe tarihi itibarıyla kalıcı olarak kapatılmasını talep ediyorum:
              </p>
              
              <div className="ml-4 space-y-1 mb-2">
                <p><strong>Hesap Numarası:</strong> {formData.hesapNo || '___________________'}</p>
                <p><strong>IBAN:</strong> TR {formData.iban || '___________________'}</p>
              </div>
              
              <p className="mb-2">
                Söz konusu hesabıma bağlı olan tüm otomatik ödeme talimatlarının, bağlı banka kartlarının ve ek hizmetlerin iptal edilmesini; {bakiyeIslemi} rica ederim.
              </p>
              
              <p className="mb-2">
                Hesabımın kapatıldığına dair tarafıma <strong>{bilgilendirmeYoluText}</strong> veya elektronik ortamda ({bilgilendirmeYoluText === 'yazılı' ? 'SMS/E-posta' : bilgilendirmeYoluText}) bilgi verilmesini ve gereğinin yapılmasını saygılarımla arz ederim.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Ad Soyad:</strong> {formData.adSoyad || '___________________'}</p>
              <p><strong>İmza:</strong> [İmza]</p>
              {formData.bakiyeTransferi && formData.transferIBAN && (
                <p className="mt-2"><strong>Bakiye Transferi İçin IBAN:</strong> {formData.transferBankaAdi || '___________________'} - {formData.transferIBAN}</p>
              )}
            </div>
            
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold mb-2">İletişim Bilgileri:</p>
              <p><strong>Telefon:</strong> {formData.telefon || '___________________'}</p>
              <p><strong>Adres:</strong> {formData.adres || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'household-service-agreement': {
    getDefaultFormData: () => ({
      isverenAd: '',
      isverenTC: '',
      isverenAdres: '',
      calisanAd: '',
      calisanTC: '',
      calisanAdres: '',
      calismaSekli: 'gunduzlu',
      haftalikGun: '5',
      mesaiBaslangic: '09:00',
      mesaiBitis: '18:00',
      dinlenmeSuresi: '1',
      izinGunu: 'Pazar',
      aylikUcret: '',
      odemeGunu: '5',
      odemeSekli: 'elden',
      yolYemek: '',
      sgkBildirimi: true,
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İŞVEREN Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="isverenAd" value={formData.isverenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="isverenTC" value={formData.isverenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="isverenAdres" value={formData.isverenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ÇALIŞAN Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="calisanAd" value={formData.calisanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="calisanTC" value={formData.calisanTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="calisanAdres" value={formData.calisanAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ÇALIŞMA ŞARTLARI</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Çalışma Şekli *</label>
              <select name="calismaSekli" value={formData.calismaSekli || 'gunduzlu'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="yatili">Yatılı</option>
                <option value="gunduzlu">Gündüzlü</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Haftalık Çalışma Günü Sayısı *</label>
              <input type="text" name="haftalikGun" value={formData.haftalikGun || '5'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 5" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Mesai Başlangıç Saati *</label>
                <input type="time" name="mesaiBaslangic" value={formData.mesaiBaslangic || '09:00'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mesai Bitiş Saati *</label>
                <input type="time" name="mesaiBitis" value={formData.mesaiBitis || '18:00'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dinlenme Süresi (Saat) *</label>
              <input type="text" name="dinlenmeSuresi" value={formData.dinlenmeSuresi || '1'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Haftalık İzin Günü *</label>
              <input type="text" name="izinGunu" value={formData.izinGunu || 'Pazar'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Pazar" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">MALİ HÜKÜMLER</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Aylık Maaş (TL) *</label>
              <input type="text" name="aylikUcret" value={formData.aylikUcret || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Günü (Ayın kaçıncı günü) *</label>
                <input type="text" name="odemeGunu" value={formData.odemeGunu || '5'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Şekli *</label>
                <select name="odemeSekli" value={formData.odemeSekli || 'elden'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="elden">Elden</option>
                  <option value="banka">Banka</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yol/Yemek *</label>
              <input type="text" name="yolYemek" value={formData.yolYemek || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Yol ücreti maaşa dahildir / Yemek işveren tarafından karşılanır" />
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" name="sgkBildirimi" checked={formData.sgkBildirimi !== false} onChange={(e) => {
                  const fakeEvent = { ...e, target: { ...e.target, name: 'sgkBildirimi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                  onChange(fakeEvent);
                }} className="mr-2" />
                SGK Bildirimi yapılacak
              </label>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const calismaSekliText = formData.calismaSekli === 'yatili' ? 'Yatılı' : 'Gündüzlü';
      const odemeSekliText = formData.odemeSekli === 'elden' ? 'elden' : 'banka yoluyla';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">EV HİZMETLERİ İŞ SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. TARAFLAR</p>
              <p><strong>İŞVEREN:</strong> {formData.isverenAd || '___________________'}, T.C. No: {formData.isverenTC || '___________________'}, Adres: {formData.isverenAdres || '___________________'}</p>
              <p className="mt-2"><strong>ÇALIŞAN:</strong> {formData.calisanAd || '___________________'}, T.C. No: {formData.calisanTC || '___________________'}, Adres: {formData.calisanAdres || '___________________'}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. İŞİN KONUSU VE GÖREV TANIMI</p>
              <p className="mb-2">Çalışan, işverenin konutunda aşağıda belirtilen hizmetleri yerine getirmeyi kabul eder:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Genel Temizlik:</strong> Evin süpürülmesi, silinmesi, toz alınması ve banyo/mutfak hijyeninin sağlanması.</li>
                <li><strong>Çamaşır ve Ütü:</strong> Giysilerin ve ev tekstilinin yıkanması, kurutulması, ütülenmesi ve yerleştirilmesi.</li>
                <li><strong>Yemek Hizmetleri:</strong> Günlük öğünlerin hazırlanması, mutfak alışveriş listesinin takibi ve mutfak düzeni.</li>
                <li><strong>Mevsimlik/Ağır Temizlik:</strong> Camların silinmesi, perde yıkama veya dolap içi düzenleme gibi periyodik işler (İşverenle mutabık kalınan günlerde).</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">3. ÇALIŞMA ŞARTLARI VE SÜRESİ</p>
              <p className="mb-2">
                <strong>Çalışma Şekli:</strong> {calismaSekliText} (Haftada <strong>{formData.haftalikGun || '___________________'}</strong> Gün)
              </p>
              <p className="mb-2">
                <strong>Mesai Saatleri:</strong> <strong>{formData.mesaiBaslangic || '09:00'}</strong> – <strong>{formData.mesaiBitis || '18:00'}</strong> saatleri arasıdır.
              </p>
              <p className="mb-2">
                <strong>Dinlenme:</strong> Gün içinde <strong>{formData.dinlenmeSuresi || '1'}</strong> saat ara dinlenmesi ve öğle yemeği molası verilecektir.
              </p>
              <p>
                <strong>İzin:</strong> Haftalık izin günü <strong>{formData.izinGunu || 'Pazar'}</strong> günüdür.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">4. MALİ HÜKÜMLER VE SOSYAL GÜVENLİK</p>
              <p className="mb-2">
                <strong>Maaş:</strong> Aylık net <strong>{formData.aylikUcret || '___________________'}</strong> TL. (Ödemeler her ayın <strong>{formData.odemeGunu || '5'}</strong>. günü {odemeSekliText} yapılır).
              </p>
              {formData.sgkBildirimi !== false && (
                <p className="mb-2">
                  <strong>SGK Bildirimi:</strong> İşveren, çalışanı 5510 sayılı Kanun uyarınca "Ev Hizmetlerinde Sigortalı Çalıştırma" kapsamında (10 günden fazla/az durumuna göre) e-Devlet üzerinden bildirmekle yükümlüdür.
                </p>
              )}
              <p>
                <strong>Yol/Yemek:</strong> {formData.yolYemek || '___________________'}.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. GİZLİLİK VE GÜVENLİK KURALLARI</p>
              <p className="mb-2">
                <strong>Özel Hayatın Gizliliği:</strong> Çalışan, işverenin evinde gördüğü, duyduğu hiçbir özel bilgiyi veya aile sırrını üçüncü şahıslarla paylaşamaz.
              </p>
              <p className="mb-2">
                <strong>Emanet Eşya:</strong> Evdeki eşyaların, elektronik cihazların ve kişisel objelerin özenle kullanılması esastır. Kasti zarar durumunda Çalışan sorumludur.
              </p>
              <p>
                <strong>Misafir Kabulü:</strong> İşverenin izni olmaksızın eve yabancı kimse kabul edilemez.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">6. FESİH VE DENEME SÜRESİ</p>
              <p className="mb-2">
                Deneme süresi 2 aydır. Bu süre içinde taraflar önelsiz fesih yapabilir.
              </p>
              <p>
                Sözleşmeyi feshetmek isteyen taraf, yasal ihbar sürelerine uymak zorundadır.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">İŞVEREN (İmza)</p>
                  <p className="mt-8">{formData.isverenAd || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">ÇALIŞAN (İmza)</p>
                  <p className="mt-8">{formData.calisanAd || '___________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'storage-agreement': {
    getDefaultFormData: () => ({
      saklatanAd: '',
      saklatanTC: '',
      saklatanAdres: '',
      saklayanAd: '',
      saklayanTC: '',
      saklayanVergiNo: '',
      saklayanAdres: '',
      saklayanTuru: 'sahis',
      esyaTanimi: '',
      adetMiktar: '',
      teslimDurumu: '',
      tahminiDeger: '',
      saklamaAdresi: '',
      depoOzellikleri: '',
      baslangicTarihi: '',
      bitisTarihi: '',
      ucretliMi: false,
      toplamUcret: '',
      aylikUcret: '',
      odemeSekli: '',
      sigorta: 'saklatan',
      sehir: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SAKLATAN (Mudi) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="saklatanAd" value={formData.saklatanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="saklatanTC" value={formData.saklatanTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="saklatanAdres" value={formData.saklatanAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SAKLAYAN (Müstevdi) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Saklayan Türü *</label>
              <select name="saklayanTuru" value={formData.saklayanTuru || 'sahis'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="sahis">Şahıs</option>
                <option value="firma">Firma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Firma Unvanı *</label>
              <input type="text" name="saklayanAd" value={formData.saklayanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. No (Şahıs ise)</label>
              <input type="text" name="saklayanTC" value={formData.saklayanTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi No (Firma ise)</label>
              <input type="text" name="saklayanVergiNo" value={formData.saklayanVergiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="saklayanAdres" value={formData.saklayanAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SAKLANACAK EŞYALARIN LİSTESİ VE DURUMU</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Eşya Tanımı *</label>
              <textarea name="esyaTanimi" value={formData.esyaTanimi || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 200 koli tekstil ürünü / Mobilya takımı / Tablo vb." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adet/Miktar *</label>
              <input type="text" name="adetMiktar" value={formData.adetMiktar || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teslim Anındaki Durumu *</label>
              <textarea name="teslimDurumu" value={formData.teslimDurumu || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Ambalajlı, hasarsız, yeni vb." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tahmini Değeri (TL) *</label>
              <input type="text" name="tahminiDeger" value={formData.tahminiDeger || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SAKLAMA YERİ VE ŞARTLARI</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Saklama Adresi *</label>
              <textarea name="saklamaAdresi" value={formData.saklamaAdresi || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Depo Özellikleri *</label>
              <input type="text" name="depoOzellikleri" value={formData.depoOzellikleri || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 24 saat güvenlikli / Yangın tesisatlı" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SÖZLEŞME SÜRESİ</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
              <input type="date" name="baslangicTarihi" value={formData.baslangicTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş Tarihi *</label>
              <input type="date" name="bitisTarihi" value={formData.bitisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ÜCRET VE ÖDEME</h3>
          <div className="space-y-2">
            <div>
              <label className="flex items-center">
                <input type="checkbox" name="ucretliMi" checked={formData.ucretliMi || false} onChange={(e) => {
                  const fakeEvent = { ...e, target: { ...e.target, name: 'ucretliMi', value: String(e.target.checked) } } as React.ChangeEvent<HTMLInputElement>;
                  onChange(fakeEvent);
                }} className="mr-2" />
                Saklama ücretli
              </label>
            </div>
            {formData.ucretliMi && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Toplam Ücret (TL)</label>
                  <input type="text" name="toplamUcret" value={formData.toplamUcret || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Aylık Ücret (TL)</label>
                  <input type="text" name="aylikUcret" value={formData.aylikUcret || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ödeme Şekli</label>
                  <input type="text" name="odemeSekli" value={formData.odemeSekli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Örn: Banka havalesi ile her ayın sonunda" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SİGORTA</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Sigorta Sorumluluğu *</label>
            <select name="sigorta" value={formData.sigorta || 'saklatan'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
              <option value="saklatan">Eşyaların sigortalanması Saklatan'a aittir</option>
              <option value="saklayan">Eşyaların sigortalanması Saklayan tarafından yapılacaktır</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Mahkeme Şehri *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const baslangicTarihi = formData.baslangicTarihi ? formatDate(formData.baslangicTarihi) : '___________________';
      const bitisTarihi = formData.bitisTarihi ? formatDate(formData.bitisTarihi) : '___________________';
      
      const saklayanKimlik = formData.saklayanTuru === 'sahis'
        ? `T.C. No: ${formData.saklayanTC || '___________________'}`
        : `Vergi No: ${formData.saklayanVergiNo || '___________________'}`;
      
      const sigortaText = formData.sigorta === 'saklatan'
        ? 'Eşyaların sigortalanması Saklatan\'a aittir.'
        : 'Eşyaların sigortalanması Saklayan tarafından yapılacaktır.';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">SAKLAMA (VEDİA) SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. TARAFLAR</p>
              <p><strong>SAKLATAN (Mudi):</strong> {formData.saklatanAd || '___________________'}, T.C. No: {formData.saklatanTC || '___________________'}, Adres: {formData.saklatanAdres || '___________________'}</p>
              <p className="mt-2"><strong>SAKLAYAN (Müstevdi):</strong> {formData.saklayanAd || '___________________'}, {saklayanKimlik}, Adres: {formData.saklayanAdres || '___________________'}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. SÖZLEŞMENİN KONUSU</p>
              <p>
                İşbu sözleşme, Saklatan tarafından Saklayan'a teslim edilen aşağıdaki malların, Saklayan tarafından belirlenen adreste muhafaza edilmesi ve süresi sonunda iadesi şartlarını kapsar.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">3. SAKLANACAK EŞYALARIN LİSTESİ VE DURUMU</p>
              <div className="space-y-1 ml-4">
                <p><strong>Eşya Tanımı:</strong> {formData.esyaTanimi || '___________________'}</p>
                <p><strong>Adet/Miktar:</strong> {formData.adetMiktar || '___________________'}</p>
                <p><strong>Teslim Anındaki Durumu:</strong> {formData.teslimDurumu || '___________________'}</p>
                <p><strong>Tahmini Değeri:</strong> <strong>{formData.tahminiDeger || '___________________'}</strong> TL (Sigorta ve tazminat durumları için belirtilmesi önerilir).</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">4. SAKLAMA YERİ VE ŞARTLARI</p>
              <p className="mb-2">
                Eşyalar <strong>{formData.saklamaAdresi || '___________________'}</strong> adresindeki güvenli, nemsiz ve <strong>{formData.depoOzellikleri || '24 saat güvenlikli / Yangın tesisatlı'}</strong> depoda muhafaza edilecektir.
              </p>
              <p className="mb-2">
                Saklayan, kendisine bırakılan eşyayı Saklatan'ın izni olmaksızın kullanamaz ve bir başkasına saklamak üzere devredemez.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. SÖZLEŞME SÜRESİ VE İADE</p>
              <p className="mb-2">
                <strong>Süre:</strong> <strong>{baslangicTarihi}</strong> tarihinde başlar, <strong>{bitisTarihi}</strong> tarihinde sona erer.
              </p>
              <p>
                Saklatan, sözleşmede bir süre belirlenmiş olsa dahi, dilediği zaman eşyayı geri isteyebilir. (Ancak bu durumda Saklayan'ın yaptığı masrafları ödemekle yükümlüdür).
              </p>
            </div>
            
            {formData.ucretliMi && (
              <div className="mt-6">
                <p className="font-semibold mb-2">6. ÜCRET VE ÖDEME</p>
                <p className="mb-2">
                  <strong>Saklama Ücreti:</strong> {formData.toplamUcret ? `Toplam <strong>${formData.toplamUcret}</strong> TL` : ''} {formData.aylikUcret ? `veya aylık <strong>${formData.aylikUcret}</strong> TL` : ''}'dir.
                </p>
                {formData.odemeSekli && (
                  <p className="mb-2">
                    <strong>Ödeme Şekli:</strong> {formData.odemeSekli}.
                  </p>
                )}
                <p>
                  Eşyanın korunması için yapılması zorunlu olan olağanüstü masraflar Saklatan tarafından karşılanacaktır.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <p className="font-semibold mb-2">{formData.ucretliMi ? '7' : '6'}. SORUMLULUK VE SİGORTA</p>
              <p className="mb-2">
                Saklayan, eşyanın kaybolması, çalınması veya zarar görmemesi için gerekli her türlü özeni göstermekle yükümlüdür. Saklayan'ın kusuru nedeniyle oluşacak zararlardan Saklayan sorumludur.
              </p>
              <p>
                {sigortaText}
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">{formData.ucretliMi ? '8' : '7'}. YETKİLİ MAHKEME</p>
              <p>
                Bu sözleşmeden doğacak uyuşmazlıklarda <strong>{formData.sehir || '___________________'}</strong> Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">SAKLATAN (İmza)</p>
                  <p className="mt-8">{formData.saklatanAd || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">SAKLAYAN (İmza)</p>
                  <p className="mt-8">{formData.saklayanAd || '___________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'long-term-vehicle-rental': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenVergiNo: '',
      kirayaVerenAdres: '',
      kiracıAd: '',
      kiracıTC: '',
      kiracıVergiNo: '',
      kiracıAdres: '',
      kiracıTuru: 'sahis',
      marka: '',
      model: '',
      plaka: '',
      sasiNo: '',
      baslangicTarihi: '',
      bitisTarihi: '',
      sozlesmeSuresi: '',
      yillikKilometre: '',
      kmAsimUcreti: '',
      aylikKira: '',
      odemeGunu: '1',
      depozito: '',
      depozitoSekli: 'nakit',
      lastikDegisimKm: '',
      erkenDonusTazminati: '',
      sehir: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">KİRAYA VEREN Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Şirket Ünvanı *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi No *</label>
              <input type="text" name="kirayaVerenVergiNo" value={formData.kirayaVerenVergiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">KİRACI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Kiracı Türü *</label>
              <select name="kiracıTuru" value={formData.kiracıTuru || 'sahis'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="sahis">Şahıs</option>
                <option value="sirket">Şirket</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Şirket Ünvanı *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. No (Şahıs ise)</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi No (Şirket ise)</label>
              <input type="text" name="kiracıVergiNo" value={formData.kiracıVergiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ARAÇ BİLGİLERİ</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Marka *</label>
                <input type="text" name="marka" value={formData.marka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model *</label>
                <input type="text" name="model" value={formData.model || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plaka No / Şasi No *</label>
              <input type="text" name="plaka" value={formData.plaka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 34ABC123 / Şasi No" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şasi No *</label>
              <input type="text" name="sasiNo" value={formData.sasiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
                <input type="date" name="baslangicTarihi" value={formData.baslangicTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bitiş Tarihi *</label>
                <input type="date" name="bitisTarihi" value={formData.bitisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sözleşme Süresi (Ay) *</label>
              <input type="text" name="sozlesmeSuresi" value={formData.sozlesmeSuresi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 12" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Yıllık Kilometre Sınırı (KM) *</label>
                <input type="text" name="yillikKilometre" value={formData.yillikKilometre || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 30000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">KM Aşımı Ücreti (TL) *</label>
                <input type="text" name="kmAsimUcreti" value={formData.kmAsimUcreti || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">KİRA BEDELİ VE ÖDEME ŞARTLARI</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Aylık Kira Bedeli (TL) *</label>
              <input type="text" name="aylikKira" value={formData.aylikKira || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ödeme Günü (Ayın kaçıncı iş günü) *</label>
              <input type="text" name="odemeGunu" value={formData.odemeGunu || '1'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 1-5" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Depozito / Teminat (TL) *</label>
                <input type="text" name="depozito" value={formData.depozito || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teminat Şekli *</label>
                <select name="depozitoSekli" value={formData.depozitoSekli || 'nakit'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="nakit">Nakit</option>
                  <option value="teminat">Teminat Mektubu</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">BAKIM VE LASTİK</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Lastik Değişim Kilometresi *</label>
            <input type="text" name="lastikDegisimKm" value={formData.lastikDegisimKm || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 10000" />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">FESİH KOŞULLARI</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Erken Dönüş Tazminatı (%) *</label>
            <input type="text" name="erkenDonusTazminati" value={formData.erkenDonusTazminati || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 30" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yetkili Mahkeme Şehri *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const baslangicTarihi = formData.baslangicTarihi ? formatDate(formData.baslangicTarihi) : '___________________';
      const bitisTarihi = formData.bitisTarihi ? formatDate(formData.bitisTarihi) : '___________________';
      
      const kiracıKimlik = formData.kiracıTuru === 'sahis'
        ? `T.C. No: ${formData.kiracıTC || '___________________'}`
        : `Vergi No: ${formData.kiracıVergiNo || '___________________'}`;
      
      const depozitoSekliText = formData.depozitoSekli === 'nakit' ? 'nakit' : 'teminat mektubu';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">UZUN DÖNEM ARAÇ KİRALAMA SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. TARAFLAR</p>
              <p><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}, Vergi No: {formData.kirayaVerenVergiNo || '___________________'}, Adres: {formData.kirayaVerenAdres || '___________________'}</p>
              <p className="mt-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}, {kiracıKimlik}, Adres: {formData.kiracıAdres || '___________________'}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. ARAÇ VE KİRALAMA BİLGİLERİ</p>
              <div className="space-y-1 ml-4">
                <p><strong>Marka / Model:</strong> {formData.marka || '___________________'} / {formData.model || '___________________'}</p>
                <p><strong>Plaka No / Şasi No:</strong> {formData.plaka || '___________________'} / {formData.sasiNo || '___________________'}</p>
                <p><strong>Sözleşme Başlangıç ve Bitiş Tarihi:</strong> <strong>{baslangicTarihi}</strong> – <strong>{bitisTarihi}</strong> (<strong>{formData.sozlesmeSuresi || '___________________'}</strong> Ay)</p>
                <p><strong>Yıllık Kilometre Sınırı:</strong> <strong>{formData.yillikKilometre || '___________________'}</strong> KM. (Sınır aşımı durumunda KM başına <strong>{formData.kmAsimUcreti || '___________________'}</strong> TL ücretlendirilir).</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">3. KİRA BEDELİ VE ÖDEME ŞARTLARI</p>
              <p className="mb-2">
                <strong>Aylık Kira Bedeli:</strong> <strong>{formData.aylikKira || '___________________'}</strong> TL + KDV.
              </p>
              <p className="mb-2">
                <strong>Ödeme Günü:</strong> Her ayın <strong>{formData.odemeGunu || '1-5'}</strong>. iş günü arasında banka havalesi ile peşin ödenir.
              </p>
              <p>
                <strong>Depozito / Teminat:</strong> Kiracı, sözleşme imza tarihinde <strong>{formData.depozito || '___________________'}</strong> TL tutarında teminat ({depozitoSekliText}) teslim etmiştir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">4. BAKIM, ONARIM VE LASTİK YÖNETİMİ</p>
              <p className="mb-2">
                <strong>Periyodik Bakımlar:</strong> Aracın üretici tarafından belirlenen tüm periyodik bakımları Kiraya Veren tarafından yetkili servislerde yaptırılacaktır.
              </p>
              <p className="mb-2">
                <strong>Arıza ve Onarım:</strong> Kullanıcı hatası dışındaki tüm mekanik arızalar Kiraya Veren'e aittir. Kullanıcı hatası (yanlış yakıt, hor kullanım vb.) kaynaklı zararlar Kiracı tarafından karşılanır.
              </p>
              <p>
                <strong>Lastik Değişimi:</strong> Kiraya Veren, her <strong>{formData.lastikDegisimKm || '___________________'}</strong> kilometrede bir veya mevsim geçişlerinde (Kış/Yaz) lastik değişim hizmeti sunacaktır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. SİGORTA VE HASAR YÖNETİMİ</p>
              <p className="mb-2">
                Aracın Zorunlu Mali Sorumluluk Sigortası (Trafik Sigortası) ve Kasko sigortası Kiraya Veren tarafından yaptırılır.
              </p>
              <p className="mb-2">
                <strong>İkame Araç:</strong> Aracın kaza veya arıza nedeniyle 24 saatten fazla serviste kalması durumunda, Kiraya Veren 24 saat içinde Kiracı'ya benzer segmentte bir ikame araç tahsis edecektir.
              </p>
              <p>
                <strong>Trafik Cezaları:</strong> Sözleşme süresi boyunca tahakkuk eden tüm trafik cezaları, köprü ve otoyol geçiş ücretleri (HGS/OGS) Kiracı'ya aittir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">6. KULLANIM KOŞULLARI</p>
              <p className="mb-2">
                Araç, Türkiye sınırları dışında kullanılamaz (Yazılı izin hariç).
              </p>
              <p className="mb-2">
                Araç; alkol/madde etkisi altında, yarışlarda, ticari yolcu taşımacılığında veya ağır yük taşımacılığında kullanılamaz.
              </p>
              <p>
                Aracı sadece Kiracı veya Kiracı'nın SGK'lı çalışanları (kurumsal ise) / birinci derece yakınları (bireysel ise) kullanabilir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">7. SÖZLEŞMENİN FESHİ</p>
              <p>
                Kiracı, sözleşme süresi dolmadan aracı iade etmek isterse, kalan ayların toplam bedelinin %<strong>{formData.erkenDonusTazminati || '___________________'}</strong>'ini "Erken Dönüş Tazminatı" olarak ödemeyi kabul eder.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">KİRAYA VEREN (İmza)</p>
                  <p className="mt-8">{formData.kirayaVerenAd || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KİRACI (İmza)</p>
                  <p className="mt-8">{formData.kiracıAd || '___________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'address-change-notification': {
    getDefaultFormData: () => ({
      tarih: new Date().toISOString().split('T')[0],
      kurumAdi: '',
      kurumTuru: '',
      adSoyad: '',
      tcKimlikNo: '',
      eskiAdres: '',
      yeniAdres: '',
      degisiklikTarihi: '',
      telefon: '',
      email: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kurum / İşveren / Okul / Banka / Apartman Yönetimi Adı *</label>
          <input type="text" name="kurumAdi" value={formData.kurumAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kurum Türü</label>
          <select name="kurumTuru" value={formData.kurumTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Seçiniz</option>
            <option value="kurum">Kurum</option>
            <option value="isveren">İşveren</option>
            <option value="okul">Okul</option>
            <option value="banka">Banka</option>
            <option value="apartman">Apartman Yönetimi</option>
            <option value="diger">Diğer</option>
          </select>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="adSoyad" value={formData.adSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Adres Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Eski Adres *</label>
              <textarea name="eskiAdres" value={formData.eskiAdres || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yeni Adres *</label>
              <textarea name="yeniAdres" value={formData.yeniAdres || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres Değişikliği Geçerlilik Tarihi *</label>
              <input type="date" name="degisiklikTarihi" value={formData.degisiklikTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İletişim Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta *</label>
              <input type="email" name="email" value={formData.email || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const degisiklikTarihi = formData.degisiklikTarihi ? formatDate(formData.degisiklikTarihi) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">ADRES DEĞİŞİKLİĞİ BİLDİRİMİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-4">
              <p><strong>Kime:</strong> {formData.kurumAdi || '___________________'} ({formData.kurumTuru || 'Kurum / İşveren / Okul / Banka / Apartman Yönetimi vb.'})</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">Konu: Adres Değişikliği Bildirimi</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">Sayın Yetkili,</p>
              
              <p className="mb-2">
                Tarafıma ait adres bilgilerinde değişiklik meydana gelmiştir. Bu kapsamda, kayıtlarınızda yer alan adresimin aşağıda belirtilen yeni adres olarak güncellenmesini arz ederim.
              </p>
              
              <div className="mt-4 space-y-2">
                <p><strong>Ad Soyad:</strong> {formData.adSoyad || '___________________'}</p>
                <p><strong>T.C. Kimlik No:</strong> {formData.tcKimlikNo || '___________________'}</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <p><strong>Eski Adres:</strong></p>
                <p className="ml-4 whitespace-pre-line">{formData.eskiAdres || '___________________'}</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <p><strong>Yeni Adres:</strong></p>
                <p className="ml-4 whitespace-pre-line">{formData.yeniAdres || '___________________'}</p>
              </div>
              
              <p className="mt-4 mb-2">
                Adres değişikliğim <strong>{degisiklikTarihi}</strong> tarihi itibarıyla geçerlidir.
              </p>
              
              <p className="mt-4">Gereğini bilgilerinize sunar, gerekli güncellemenin yapılmasını saygılarımla talep ederim.</p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Ad Soyad:</strong> {formData.adSoyad || '___________________'}</p>
              <p><strong>İmza:</strong> [İmza]</p>
              <p className="mt-2"><strong>Telefon:</strong> {formData.telefon || '___________________'}</p>
              <p><strong>E-posta:</strong> {formData.email || '___________________'}</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'visa-invitation-letter': {
    getDefaultFormData: () => ({
      dil: 'turkce',
      tarih: new Date().toISOString().split('T')[0],
      ulkeAdi: '',
      davetEdenAd: '',
      davetEdenUyruk: '',
      davetEdenPasaport: '',
      davetEdenAdres: '',
      davetEdenTelefon: '',
      davetEdenEmail: '',
      davetEdenMeslek: '',
      davetEdilenAd: '',
      davetEdilenUyruk: '',
      davetEdilenPasaport: '',
      davetEdilenDogumTarihi: '',
      davetEdilenAdres: '',
      ziyaretBaslangic: '',
      ziyaretBitis: '',
      ziyaretSehri: '',
      konaklamaGiderleri: 'davetEden',
      ziyaretAmaci: 'turistik',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dil *</label>
          <select name="dil" value={formData.dil || 'turkce'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
            <option value="turkce">Türkçe</option>
            <option value="ingilizce">İngilizce</option>
            <option value="almanca">Almanca</option>
            <option value="fransizca">Fransızca</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarih *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ülke Adı (Konsolosluk/Büyükelçilik) *</label>
          <input type="text" name="ulkeAdi" value={formData.ulkeAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Almanya, Fransa, İngiltere" />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVET EDEN KİŞİ BİLGİLERİ</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davetEdenAd" value={formData.davetEdenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Uyruğu *</label>
              <input type="text" name="davetEdenUyruk" value={formData.davetEdenUyruk || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pasaport / Kimlik No *</label>
              <input type="text" name="davetEdenPasaport" value={formData.davetEdenPasaport || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davetEdenAdres" value={formData.davetEdenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Telefon *</label>
                <input type="text" name="davetEdenTelefon" value={formData.davetEdenTelefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-posta *</label>
                <input type="email" name="davetEdenEmail" value={formData.davetEdenEmail || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meslek / Oturum Statüsü *</label>
              <input type="text" name="davetEdenMeslek" value={formData.davetEdenMeslek || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVET EDİLEN KİŞİ BİLGİLERİ</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davetEdilenAd" value={formData.davetEdilenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Uyruğu *</label>
              <input type="text" name="davetEdilenUyruk" value={formData.davetEdilenUyruk || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pasaport No *</label>
              <input type="text" name="davetEdilenPasaport" value={formData.davetEdilenPasaport || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Doğum Tarihi *</label>
              <input type="date" name="davetEdilenDogumTarihi" value={formData.davetEdilenDogumTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davetEdilenAdres" value={formData.davetEdilenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ZİYARET BİLGİLERİ</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ziyaret Başlangıç Tarihi *</label>
                <input type="date" name="ziyaretBaslangic" value={formData.ziyaretBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ziyaret Bitiş Tarihi *</label>
                <input type="date" name="ziyaretBitis" value={formData.ziyaretBitis || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ziyaret Şehri *</label>
              <input type="text" name="ziyaretSehri" value={formData.ziyaretSehri || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konaklama Giderleri *</label>
              <select name="konaklamaGiderleri" value={formData.konaklamaGiderleri || 'davetEden'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="davetEden">Tarafımdan karşılanacaktır</option>
                <option value="davetEdilen">Kendisine aittir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ziyaret Amacı *</label>
              <select name="ziyaretAmaci" value={formData.ziyaretAmaci || 'turistik'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="turistik">Turistik</option>
                <option value="aile">Aile ziyareti</option>
                <option value="arkadas">Arkadaş ziyareti</option>
                <option value="ozel">Özel ziyaret</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const ziyaretBaslangic = formData.ziyaretBaslangic ? formatDate(formData.ziyaretBaslangic) : '___________________';
      const ziyaretBitis = formData.ziyaretBitis ? formatDate(formData.ziyaretBitis) : '___________________';
      const dogumTarihi = formData.davetEdilenDogumTarihi ? formatDate(formData.davetEdilenDogumTarihi) : '___________________';
      
      const konaklamaGiderleriText = formData.konaklamaGiderleri === 'davetEden' 
        ? 'tarafımın adresinde konaklayacaktır. Ziyaret süresince konaklama giderleri tarafımdan karşılanacaktır'
        : 'tarafımın adresinde konaklayacaktır. Ziyaret süresince konaklama giderleri kendisine aittir';
      
      const ziyaretAmaciText = formData.ziyaretAmaci === 'turistik' ? 'turistik' : formData.ziyaretAmaci === 'aile' ? 'aile ziyareti' : formData.ziyaretAmaci === 'arkadas' ? 'arkadaş ziyareti' : 'özel ziyaret';
      
      // Dil seçimine göre metinler
      const translations: Record<string, any> = {
        turkce: {
          title: 'VİZE BAŞVURUSU DAVET MEKTUBU',
          to: 'Kime:',
          dear: 'Sayın Yetkili,',
          letter: 'Bu mektup ile,',
          dates: 'tarihleri arasında',
          address: 'adresimde misafir etmek istediğim aşağıda bilgileri yer alan kişiye resmî davette bulunduğumu beyan ederim.',
          inviter: 'DAVET EDEN KİŞİ BİLGİLERİ',
          invited: 'DAVET EDİLEN KİŞİ BİLGİLERİ',
          name: 'Ad Soyad:',
          nationality: 'Uyruğu:',
          passport: 'Pasaport / Kimlik No:',
          address: 'Adres:',
          phone: 'Telefon:',
          email: 'E-posta:',
          profession: 'Meslek / Oturum Statüsü:',
          passportNo: 'Pasaport No:',
          birthDate: 'Doğum Tarihi:',
          stay: 'Davet edilen kişi, yukarıda belirtilen tarihler arasında',
          visit: 'Söz konusu ziyaret',
          purpose: 'amaçlı olup, ziyaret sonunda davet edilen kişinin ülkesine geri döneceğini beyan ederim.',
          contact: 'Gerek görülmesi hâlinde tarafımla iletişime geçilmesinde herhangi bir sakınca bulunmamaktadır.',
          regards: 'Bilgilerinize arz ederim.',
          inviterLabel: 'Davet Eden',
          attachments: 'EKLER',
          attachment1: 'Davet eden kişiye ait kimlik / pasaport fotokopisi',
          attachment2: 'Oturum izni (varsa)',
          attachment3: 'Adres belgesi / kira sözleşmesi / tapu fotokopisi',
          attachment4: 'Davet edilen kişinin pasaport fotokopisi',
        },
        ingilizce: {
          title: 'VISA INVITATION LETTER',
          to: 'To:',
          dear: 'Dear Sir/Madam,',
          letter: 'I hereby declare that I am officially inviting the person whose information is provided below to stay at my address',
          dates: 'between',
          address: 'during the period',
          inviter: 'INVITER INFORMATION',
          invited: 'INVITEE INFORMATION',
          name: 'Full Name:',
          nationality: 'Nationality:',
          passport: 'Passport / ID No:',
          address: 'Address:',
          phone: 'Phone:',
          email: 'E-mail:',
          profession: 'Profession / Residence Status:',
          passportNo: 'Passport No:',
          birthDate: 'Date of Birth:',
          stay: 'The invited person will stay at my address during the above-mentioned dates.',
          visit: 'The accommodation expenses during the visit will be covered by me / are the responsibility of the invitee (please mark the appropriate option).',
          purpose: 'The purpose of this visit is',
          contact: 'I have no objection to being contacted if necessary.',
          regards: 'Yours sincerely,',
          inviterLabel: 'Inviter',
          attachments: 'ATTACHMENTS',
          attachment1: 'Copy of inviter\'s ID / passport',
          attachment2: 'Residence permit (if applicable)',
          attachment3: 'Address certificate / rental agreement / property deed copy',
          attachment4: 'Invitee\'s passport copy',
        },
        almanca: {
          title: 'EINLADUNGSBRIEF FÜR VISUMANTRAG',
          to: 'An:',
          dear: 'Sehr geehrte Damen und Herren,',
          letter: 'Hiermit erkläre ich, dass ich offiziell die unten genannte Person einlade, in der Zeit vom',
          dates: 'bis',
          address: 'an meiner Adresse zu wohnen.',
          inviter: 'ANGABEN ZUR EINLADENDEN PERSON',
          invited: 'ANGABEN ZUR EINGELADENEN PERSON',
          name: 'Vollständiger Name:',
          nationality: 'Staatsangehörigkeit:',
          passport: 'Pass / Ausweis-Nr.:',
          address: 'Adresse:',
          phone: 'Telefon:',
          email: 'E-Mail:',
          profession: 'Beruf / Aufenthaltsstatus:',
          passportNo: 'Passnummer:',
          birthDate: 'Geburtsdatum:',
          stay: 'Die eingeladene Person wird in dem oben genannten Zeitraum an meiner Adresse wohnen.',
          visit: 'Die Unterkunftskosten während des Besuchs werden von mir übernommen / sind Sache der eingeladenen Person (bitte zutreffendes ankreuzen).',
          purpose: 'Der Zweck dieses Besuchs ist',
          contact: 'Ich habe keine Einwände dagegen, bei Bedarf kontaktiert zu werden.',
          regards: 'Mit freundlichen Grüßen,',
          inviterLabel: 'Einladende Person',
          attachments: 'ANHÄNGE',
          attachment1: 'Kopie des Ausweises / Passes der einladenden Person',
          attachment2: 'Aufenthaltserlaubnis (falls zutreffend)',
          attachment3: 'Adressnachweis / Mietvertrag / Eigentumsurkunde',
          attachment4: 'Passkopie der eingeladenen Person',
        },
        fransizca: {
          title: 'LETTRE D\'INVITATION POUR DEMANDE DE VISA',
          to: 'À:',
          dear: 'Madame, Monsieur,',
          letter: 'Par la présente, je déclare inviter officiellement la personne dont les informations figurent ci-dessous à séjourner à mon adresse',
          dates: 'entre le',
          address: 'et le',
          inviter: 'INFORMATIONS SUR L\'INVITANT',
          invited: 'INFORMATIONS SUR L\'INVITÉ',
          name: 'Nom complet:',
          nationality: 'Nationalité:',
          passport: 'Passeport / N° d\'identité:',
          address: 'Adresse:',
          phone: 'Téléphone:',
          email: 'E-mail:',
          profession: 'Profession / Statut de résidence:',
          passportNo: 'N° de passeport:',
          birthDate: 'Date de naissance:',
          stay: 'La personne invitée séjournera à mon adresse pendant les dates mentionnées ci-dessus.',
          visit: 'Les frais d\'hébergement pendant la visite seront pris en charge par moi / sont à la charge de l\'invité (veuillez cocher l\'option appropriée).',
          purpose: 'Le but de cette visite est',
          contact: 'Je n\'ai aucune objection à être contacté si nécessaire.',
          regards: 'Je vous prie d\'agréer, Madame, Monsieur, mes salutations distinguées.',
          inviterLabel: 'Invitant',
          attachments: 'PIÈCES JOINTES',
          attachment1: 'Copie de la pièce d\'identité / passeport de l\'invitant',
          attachment2: 'Permis de séjour (le cas échéant)',
          attachment3: 'Certificat d\'adresse / contrat de location / copie du titre de propriété',
          attachment4: 'Copie du passeport de l\'invité',
        },
      };
      
      const t = translations[formData.dil || 'turkce'] || translations.turkce;
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">{t.title}</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center">Tarih: {tarih}</p>
            </div>
            
            <div className="mt-4">
              <p><strong>{t.to}</strong> {formData.ulkeAdi || '___________________'} Konsolosluğu / Büyükelçiliği</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">{t.dear}</p>
              
              <p className="mb-2">
                {t.letter} <strong>{ziyaretBaslangic}</strong> – <strong>{ziyaretBitis}</strong> {t.dates} <strong>{formData.ziyaretSehri || '___________________'}</strong> {t.address}
              </p>
              
              <div className="mt-6">
                <p className="font-semibold mb-2">{t.inviter}</p>
                <div className="space-y-1 ml-4">
                  <p><strong>{t.name}</strong> {formData.davetEdenAd || '___________________'}</p>
                  <p><strong>{t.nationality}</strong> {formData.davetEdenUyruk || '___________________'}</p>
                  <p><strong>{t.passport}</strong> {formData.davetEdenPasaport || '___________________'}</p>
                  <p><strong>{t.address}</strong> {formData.davetEdenAdres || '___________________'}</p>
                  <p><strong>{t.phone}</strong> {formData.davetEdenTelefon || '___________________'}</p>
                  <p><strong>{t.email}</strong> {formData.davetEdenEmail || '___________________'}</p>
                  <p><strong>{t.profession}</strong> {formData.davetEdenMeslek || '___________________'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="font-semibold mb-2">{t.invited}</p>
                <div className="space-y-1 ml-4">
                  <p><strong>{t.name}</strong> {formData.davetEdilenAd || '___________________'}</p>
                  <p><strong>{t.nationality}</strong> {formData.davetEdilenUyruk || '___________________'}</p>
                  <p><strong>{t.passportNo}</strong> {formData.davetEdilenPasaport || '___________________'}</p>
                  <p><strong>{t.birthDate}</strong> {dogumTarihi}</p>
                  <p><strong>{t.address}</strong> {formData.davetEdilenAdres || '___________________'}</p>
                </div>
              </div>
              
              <p className="mt-4 mb-2">
                {t.stay} {konaklamaGiderleriText}.
              </p>
              
              <p className="mb-2">
                {t.visit} <strong>{ziyaretAmaciText}</strong> {t.purpose}
              </p>
              
              <p className="mt-4 mb-2">
                {t.contact}
              </p>
              
              <p className="mt-4">{t.regards}</p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p className="font-semibold">{t.inviterLabel}</p>
              <p>{formData.davetEdenAd || '___________________'}</p>
              <p><strong>İmza:</strong> [İmza]</p>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold mb-2">{t.attachments}</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>{t.attachment1}</li>
                <li>{t.attachment2}</li>
                <li>{t.attachment3}</li>
                <li>{t.attachment4}</li>
              </ul>
            </div>
          </div>
        </div>
      );
    },
  },
  'security-deposit-refund': {
    getDefaultFormData: () => ({
      kurumAdi: '',
      sehir: '',
      abonelikNo: '',
      adres: '',
      sonlandirmaTarihi: '',
      adSoyad: '',
      tcKimlikNo: '',
      bankaAdi: '',
      iban: '',
      telefon: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kurum Adı *</label>
          <input type="text" name="kurumAdi" value={formData.kurumAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şehir *</label>
          <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Abonelik Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Abonelik/Tesisat No *</label>
              <input type="text" name="abonelikNo" value={formData.abonelikNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="adres" value={formData.adres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sonlandırma Tarihi *</label>
              <input type="date" name="sonlandirmaTarihi" value={formData.sonlandirmaTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="adSoyad" value={formData.adSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input type="text" name="telefon" value={formData.telefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İade Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Banka Adı *</label>
              <input type="text" name="bankaAdi" value={formData.bankaAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IBAN Numarası *</label>
              <input type="text" name="iban" value={formData.iban || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR..." />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const sonlandirmaTarihi = formData.sonlandirmaTarihi ? formatDate(formData.sonlandirmaTarihi) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">GÜVENCE BEDELİ İADE TALEBİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.kurumAdi || '___________________'}</strong> MÜDÜRLÜĞÜ'NE
              </p>
              <p className="text-center">
                <strong>{formData.sehir || '___________________'}</strong>
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">KONU: Güvence bedeli iadesi talebi.</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Kurumunuzun <strong>{formData.abonelikNo || '___________________'}</strong> numaralı abonesiyim. <strong>{formData.adres || '___________________'}</strong> adresinde bulunan aboneliğimi <strong>{sonlandirmaTarihi}</strong> tarihi itibarıyla sonlandırmış bulunmaktayım.
              </p>
              
              <p className="mb-2">
                Abonelik başlangıcında yatırmış olduğum Güvence Bedeli tutarının, varsa son fatura borçlarım mahsup edildikten sonra kalan kısmının, 6446 sayılı Elektrik Piyasası Kanunu (veya ilgili mevzuat) uyarınca güncel değerlemeler yapılarak aşağıda belirtilen IBAN numarasına iade edilmesini arz ederim.
              </p>
              
              <p className="mb-2">
                <strong>Banka ve IBAN:</strong> {formData.adSoyad || '___________________'} - <strong>{formData.iban || 'TR.. .... .... .... .... ..'}</strong>
              </p>
              
              <p className="mb-2">
                <strong>Telefon:</strong> {formData.telefon || '___________________'}
              </p>
              
              <p className="mt-4">Saygılarımla,</p>
            </div>
            
            <div className="mt-8 border-t pt-4 space-y-2">
              <p><strong>Ad Soyad:</strong> {formData.adSoyad || '___________________'}</p>
              <p><strong>T.C. Kimlik No:</strong> {formData.tcKimlikNo || '___________________'}</p>
              <p><strong>İmza:</strong> [İmza]</p>
            </div>
          </div>
        </div>
      );
    },
  },
  'neighbor-complaint-letter': {
    getDefaultFormData: () => ({
      gonderenAd: '',
      gonderenKapiNo: '',
      aliciAd: '',
      rahatsizlikTuru: '',
      rahatsizlikDetay: '',
      zorlamaZamani: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Gönderen Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="gonderenAd" value={formData.gonderenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kapı Numarası *</label>
              <input type="text" name="gonderenKapiNo" value={formData.gonderenKapiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 5, 12" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Alıcı Bilgileri</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Komşu Adı (Varsa)</label>
            <input type="text" name="aliciAd" value={formData.aliciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Boş bırakılabilir" />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Rahatsızlık Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Rahatsızlık Türü *</label>
              <input type="text" name="rahatsizlikTuru" value={formData.rahatsizlikTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: geç saatlerde müzik/ayak sesi/yüksek sesli konuşma" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zorlama Zamanı *</label>
              <input type="text" name="zorlamaZamani" value={formData.zorlamaZamani || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: gece dinlenme saatlerinde / bebeğimizin uyku saatinde" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rahatsızlık Detayı (Opsiyonel)</label>
              <textarea name="rahatsizlikDetay" value={formData.rahatsizlikDetay || ''} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Ek açıklama yapmak isterseniz" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="space-y-4">
            <div>
              <p className="mb-2">
                Sayın Komşum {formData.aliciAd ? `<strong>${formData.aliciAd}</strong>` : ''},
              </p>
              
              <p className="mb-2">
                Umuyorum ki her şey yolundadır. Ben <strong>{formData.gonderenKapiNo || '___________________'}</strong> numaralı dairede oturan komşunuz <strong>{formData.gonderenAd || '___________________'}</strong>.
              </p>
              
              <p className="mb-2">
                Size bu notu, muhtemelen farkında olmadığınız bir durumu paylaşmak için yazıyorum. Son zamanlarda dairemize <strong>{formData.rahatsizlikTuru || 'geç saatlerde müzik/ayak sesi/yüksek sesli konuşma'}</strong> yansımakta ve bu durum özellikle <strong>{formData.zorlamaZamani || 'gece dinlenme saatlerinde / bebeğimizin uyku saatinde'}</strong> bizi biraz zorlamaktadır.
              </p>
              
              {formData.rahatsizlikDetay && (
                <p className="mb-2">
                  {formData.rahatsizlikDetay}
                </p>
              )}
              
              <p className="mb-2">
                Apartman yaşamında ses yalıtımının bazen yetersiz kalabildiğini biliyorum. Bu konuda biraz daha hassasiyet gösterebilirseniz çok memnun oluruz. Komşuluk ilişkimizin nezaketle devam etmesi bizim için çok değerli.
              </p>
              
              <p className="mb-2">
                Anlayışınız için şimdiden teşekkür ederim.
              </p>
              
              <p className="mt-4">Saygılarımla,</p>
              <p className="mt-2"><strong>{formData.gonderenAd || '___________________'}</strong></p>
            </div>
          </div>
        </div>
      );
    },
  },
  'movable-rental': {
    getDefaultFormData: () => ({
      kirayaVerenAd: '',
      kirayaVerenTC: '',
      kirayaVerenVergiNo: '',
      kirayaVerenAdres: '',
      kirayaVerenTuru: 'sahis',
      kiracıAd: '',
      kiracıTC: '',
      kiracıVergiNo: '',
      kiracıAdres: '',
      kiracıTuru: 'sahis',
      malCinsi: '',
      marka: '',
      seriNo: '',
      mevcutDurum: '',
      baslangicTarihi: '',
      bitisTarihi: '',
      kiraBedeli: '',
      kiraTuru: 'aylik',
      odemeGunu: '5',
      odemeBanka: '',
      odemeIBAN: '',
      gecikmeFaizi: '',
      teslimatAdres: '',
      kullanimAmaci: '',
      bakimSorumlulugu: 'kirayaVeren',
      teminat: '',
      fesihSuresi: '15',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">KİRAYA VEREN Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Kiraya Veren Türü *</label>
              <select name="kirayaVerenTuru" value={formData.kirayaVerenTuru || 'sahis'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="sahis">Şahıs</option>
                <option value="firma">Firma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Firma Ünvanı *</label>
              <input type="text" name="kirayaVerenAd" value={formData.kirayaVerenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. No (Şahıs ise)</label>
              <input type="text" name="kirayaVerenTC" value={formData.kirayaVerenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi No (Firma ise)</label>
              <input type="text" name="kirayaVerenVergiNo" value={formData.kirayaVerenVergiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kirayaVerenAdres" value={formData.kirayaVerenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">KİRACI Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Kiracı Türü *</label>
              <select name="kiracıTuru" value={formData.kiracıTuru || 'sahis'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="sahis">Şahıs</option>
                <option value="firma">Firma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad / Firma Ünvanı *</label>
              <input type="text" name="kiracıAd" value={formData.kiracıAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. No (Şahıs ise)</label>
              <input type="text" name="kiracıTC" value={formData.kiracıTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi No (Firma ise)</label>
              <input type="text" name="kiracıVergiNo" value={formData.kiracıVergiNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="kiracıAdres" value={formData.kiracıAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">KİRALANAN MAL BİLGİLERİ</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Malın Cinsi/Modeli *</label>
              <input type="text" name="malCinsi" value={formData.malCinsi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Endüstriyel Yazıcı / İş Makinesi" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Marka *</label>
                <input type="text" name="marka" value={formData.marka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Seri No *</label>
                <input type="text" name="seriNo" value={formData.seriNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mevcut Durumu *</label>
              <textarea name="mevcutDurum" value={formData.mevcutDurum || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Çalışır durumda, sıfır veya ikinci el, çizik/darbe durumu" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">KİRALAMA SÜRESİ VE BEDELİ</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
                <input type="date" name="baslangicTarihi" value={formData.baslangicTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bitiş Tarihi *</label>
                <input type="date" name="bitisTarihi" value={formData.bitisTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Kira Bedeli (TL) *</label>
                <input type="text" name="kiraBedeli" value={formData.kiraBedeli || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kira Türü *</label>
                <select name="kiraTuru" value={formData.kiraTuru || 'aylik'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="aylik">Aylık</option>
                  <option value="gunluk">Günlük</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Günü (Ayın kaçıncı günü) *</label>
                <input type="text" name="odemeGunu" value={formData.odemeGunu || '5'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banka / IBAN *</label>
                <input type="text" name="odemeIBAN" value={formData.odemeIBAN || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="TR..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gecikme Faizi (%) *</label>
              <input type="text" name="gecikmeFaizi" value={formData.gecikmeFaizi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 2" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">TESLİMAT VE KULLANIM</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Teslimat Adresi *</label>
              <textarea name="teslimatAdres" value={formData.teslimatAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kullanım Amacı *</label>
              <input type="text" name="kullanimAmaci" value={formData.kullanimAmaci || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Ofis hizmetlerinde" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bakım Sorumluluğu *</label>
              <select name="bakimSorumlulugu" value={formData.bakimSorumlulugu || 'kirayaVeren'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="kirayaVeren">Kiraya Veren</option>
                <option value="kiracı">Kiracı</option>
              </select>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">TEMİNAT</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Teminat / Depozito (TL) *</label>
            <input type="text" name="teminat" value={formData.teminat || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fesih Süresi (Gün) *</label>
          <input type="text" name="fesihSuresi" value={formData.fesihSuresi || '15'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const baslangicTarihi = formData.baslangicTarihi ? formatDate(formData.baslangicTarihi) : '___________________';
      const bitisTarihi = formData.bitisTarihi ? formatDate(formData.bitisTarihi) : '___________________';
      
      const kirayaVerenKimlik = formData.kirayaVerenTuru === 'sahis'
        ? `T.C. No: ${formData.kirayaVerenTC || '___________________'}`
        : `Vergi No: ${formData.kirayaVerenVergiNo || '___________________'}`;
      
      const kiracıKimlik = formData.kiracıTuru === 'sahis'
        ? `T.C. No: ${formData.kiracıTC || '___________________'}`
        : `Vergi No: ${formData.kiracıVergiNo || '___________________'}`;
      
      const kiraTuruText = formData.kiraTuru === 'aylik' ? 'Aylık' : 'Günlük';
      const bakimSorumluluguText = formData.bakimSorumlulugu === 'kirayaVeren' ? 'Kiraya Veren' : 'Kiracı';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">TAŞINIR MAL KİRALAMA SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. TARAFLAR</p>
              <p><strong>KİRAYA VEREN:</strong> {formData.kirayaVerenAd || '___________________'}, {kirayaVerenKimlik}, Adres: {formData.kirayaVerenAdres || '___________________'}</p>
              <p className="mt-2"><strong>KİRACI:</strong> {formData.kiracıAd || '___________________'}, {kiracıKimlik}, Adres: {formData.kiracıAdres || '___________________'}</p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. SÖZLEŞMENİN KONUSU VE KİRALANAN MAL</p>
              <p className="mb-2">
                Kiraya veren, aşağıda detayları belirtilen taşınır malı, bu sözleşmede belirtilen şartlarla kiracıya teslim etmeyi; kiracı da bu malı kullanmayı ve kira bedelini ödemeyi kabul eder.
              </p>
              <div className="space-y-1 ml-4 mt-2">
                <p><strong>Malın Cinsi/Modeli:</strong> {formData.malCinsi || '___________________'}</p>
                <p><strong>Marka ve Seri No:</strong> {formData.marka || '___________________'} / {formData.seriNo || '___________________'}</p>
                <p><strong>Mevcut Durumu:</strong> {formData.mevcutDurum || '___________________'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">3. KİRALAMA SÜRESİ VE BEDELİ</p>
              <p className="mb-2">
                <strong>Süre:</strong> <strong>{baslangicTarihi}</strong> tarihinde başlar, <strong>{bitisTarihi}</strong> tarihinde sona erer.
              </p>
              <p className="mb-2">
                <strong>Kira Bedeli:</strong> {kiraTuruText} <strong>{formData.kiraBedeli || '___________________'}</strong> TL + KDV'dir.
              </p>
              <p className="mb-2">
                <strong>Ödeme Planı:</strong> Kira bedeli her ayın <strong>{formData.odemeGunu || '5'}</strong>. gününe kadar <strong>{formData.odemeIBAN || '___________________'}</strong> numarasına yatırılacaktır.
              </p>
              <p>
                <strong>Gecikme:</strong> Ödemelerin gecikmesi durumunda aylık %<strong>{formData.gecikmeFaizi || '___________________'}</strong> oranında gecikme faizi uygulanır.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">4. TESLİMAT VE İADE ŞARTLARI</p>
              <p className="mb-2">
                Mal, <strong>{formData.teslimatAdres || '___________________'}</strong> konumunda çalışır vaziyette kiracıya teslim edilmiştir.
              </p>
              <p className="mb-2">
                Sözleşme sonunda mal; temiz, bakımlı ve (olağan kullanım kaynaklı aşınmalar hariç) teslim alındığı haliyle iade edilecektir.
              </p>
              <p>
                İade işlemleri için bir "İade Tesellüm Tutanağı" düzenlenecektir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. KULLANIM VE BAKIM SORUMLULUĞU</p>
              <p className="mb-2">
                <strong>Kullanım Amacı:</strong> Mal, sadece amacına uygun olarak <strong>{formData.kullanimAmaci || 'Ofis hizmetlerinde'}</strong> kullanılacaktır. Kiraya verenin yazılı onayı olmadan üçüncü kişilere alt kiralama yapılamaz.
              </p>
              <p className="mb-2">
                <strong>Bakım ve Onarım:</strong> Olağan kullanım dışındaki arızalar ve kullanıcı hatalarından kaynaklanan zararlar tamamen Kiracı'ya aittir. Periyodik bakımlar <strong>{bakimSorumluluguText}</strong> tarafından karşılanacaktır.
              </p>
              <p>
                <strong>Kayıp ve Hasar:</strong> Malın çalınması, kaybolması veya tamiri mümkün olmayacak şekilde hasar görmesi durumunda Kiracı, malın güncel piyasa değerini ödemeyi taahhüt eder.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">6. TEMİNAT (DEPOZİTO)</p>
              <p>
                Kiracı, olası hasar veya borçlara karşılık teminat olarak <strong>{formData.teminat || '___________________'}</strong> TL ödemiştir. Bu tutar, sözleşme sonunda mal hasarsız teslim edildiğinde iade edilecektir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">7. FESİH ŞARTLARI</p>
              <p>
                Taraflardan biri, <strong>{formData.fesihSuresi || '15'}</strong> gün önceden yazılı bildirimde bulunmak şartıyla sözleşmeyi tek taraflı feshedebilir. Kiracının kira bedelini ödememesi durumunda Kiraya Veren, sözleşmeyi derhal feshedip malın iadesini talep etme hakkına sahiptir.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">KİRAYA VEREN (İmza)</p>
                  <p className="mt-8">{formData.kirayaVerenAd || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KİRACI (İmza)</p>
                  <p className="mt-8">{formData.kiracıAd || '___________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'movable-property-loan': {
    getDefaultFormData: () => ({
      oduncVerenAd: '',
      oduncVerenTC: '',
      oduncVerenAdres: '',
      oduncAlanAd: '',
      oduncAlanTC: '',
      oduncAlanAdres: '',
      esyaCinsi: '',
      esyaMarka: '',
      esyaModel: '',
      esyaSeriNo: '',
      teslimDurumu: '',
      teslimTarihi: '',
      iadeTarihi: '',
      kullanimAmaci: '',
      teslimatAdres: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ÖDÜNÇ VEREN Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="oduncVerenAd" value={formData.oduncVerenAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="oduncVerenTC" value={formData.oduncVerenTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="oduncVerenAdres" value={formData.oduncVerenAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ÖDÜNÇ ALAN Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="oduncAlanAd" value={formData.oduncAlanAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="oduncAlanTC" value={formData.oduncAlanTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="oduncAlanAdres" value={formData.oduncAlanAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">ÖDÜNÇ VERİLEN EŞYA BİLGİLERİ</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Eşyanın Cinsi *</label>
              <input type="text" name="esyaCinsi" value={formData.esyaCinsi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Dizüstü Bilgisayar / Sanayi Tipi Matkap / Sergi Tablosu" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Marka</label>
                <input type="text" name="esyaMarka" value={formData.esyaMarka || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input type="text" name="esyaModel" value={formData.esyaModel || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seri No</label>
              <input type="text" name="esyaSeriNo" value={formData.esyaSeriNo || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teslim Anındaki Durumu *</label>
              <textarea name="teslimDurumu" value={formData.teslimDurumu || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Çalışır durumda, tüm parçaları tam, hasarsız." />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">SÖZLEŞME SÜRESİ</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Teslim Tarihi *</label>
                <input type="date" name="teslimTarihi" value={formData.teslimTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">İade Tarihi *</label>
                <input type="date" name="iadeTarihi" value={formData.iadeTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">KULLANIM ŞARTLARI</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Kullanım Amacı *</label>
              <input type="text" name="kullanimAmaci" value={formData.kullanimAmaci || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Eğitim faaliyetleri / Ev tadilatı" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teslimat Adresi *</label>
              <textarea name="teslimatAdres" value={formData.teslimatAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const teslimTarihi = formData.teslimTarihi ? formatDate(formData.teslimTarihi) : '___________________';
      const iadeTarihi = formData.iadeTarihi ? formatDate(formData.iadeTarihi) : '___________________';
      
      const markaModelSeri = [
        formData.esyaMarka,
        formData.esyaModel,
        formData.esyaSeriNo
      ].filter(Boolean).join(' / ') || '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">TAŞINIR EŞYA ÖDÜNCÜ (ARİYAT) SÖZLEŞMESİ</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">1. TARAFLAR</p>
              <p className="mb-2">
                <strong>ÖDÜNÇ VEREN:</strong> {formData.oduncVerenAd || '___________________'}, T.C. No: {formData.oduncVerenTC || '___________________'}, Adres: {formData.oduncVerenAdres || '___________________'}
              </p>
              <p>
                <strong>ÖDÜNÇ ALAN:</strong> {formData.oduncAlanAd || '___________________'}, T.C. No: {formData.oduncAlanTC || '___________________'}, Adres: {formData.oduncAlanAdres || '___________________'}
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">2. SÖZLEŞMENİN KONUSU</p>
              <p>
                İşbu sözleşmenin konusu, Ödünç Veren'in mülkiyetinde bulunan aşağıda nitelikleri belirtilen taşınır eşyanın, Ödünç Alan'a belirli bir süreyle karşılıksız (ücretsiz) olarak kullanılması amacıyla teslim edilmesidir.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">3. ÖDÜNÇ VERİLEN EŞYANIN BİLGİLERİ</p>
              <div className="space-y-1 ml-4 mt-2">
                <p><strong>Eşyanın Cinsi:</strong> {formData.esyaCinsi || '___________________'}</p>
                <p><strong>Marka/Model/Seri No:</strong> {markaModelSeri}</p>
                <p><strong>Teslim Anındaki Durumu:</strong> {formData.teslimDurumu || '___________________'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">4. SÖZLEŞME SÜRESİ VE İADE</p>
              <p className="mb-2">
                <strong>Süre:</strong> Eşya, <strong>{teslimTarihi}</strong> tarihinde teslim edilmiş olup, <strong>{iadeTarihi}</strong> tarihinde iade edilecektir.
              </p>
              <p className="mb-2">
                <strong>Erken İade:</strong> Ödünç Veren, haklı bir sebep ortaya çıkması durumunda sözleşme süresi dolmadan da eşyanın iadesini talep edebilir.
              </p>
              <p>
                <strong>Gecikme:</strong> Ödünç Alan, eşyayı süresinde iade etmezse, gecikmeden doğan tüm zararlardan (beklenmedik haller dahil) sorumlu olur.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">5. KULLANIM ŞARTLARI VE SORUMLULUKLAR</p>
              <p className="mb-2">
                <strong>Amaca Uygun Kullanım:</strong> Ödünç Alan, eşyayı sadece <strong>{formData.kullanimAmaci || '___________________'}</strong> amacıyla kullanabilir. Eşyayı başkasına kullandıramaz veya devredemez.
              </p>
              <p className="mb-2">
                <strong>Bakım ve Koruma:</strong> Ödünç Alan, eşyayı özenle korumakla yükümlüdür. Olağan kullanım için gerekli olan bakım ve temizlik masrafları Ödünç Alan'a aittir.
              </p>
              <p className="mb-2">
                <strong>Olağanüstü Masraflar:</strong> Eşyanın korunması için yapılması zorunlu olan olağanüstü masrafları Ödünç Veren öder (Örn: Cihazın kendi kendine bozulan ana kartı).
              </p>
              <p>
                <strong>Zarar ve Ziyan:</strong> Eşyanın kusurlu kullanım nedeniyle zarar görmesi veya kaybolması durumunda Ödünç Alan, eşyanın rayiç bedelini ödemeyi taahhüt eder.
              </p>
            </div>
            
            <div className="mt-6">
              <p className="font-semibold mb-2">6. ÖZEL HÜKÜMLER</p>
              <p className="mb-2">
                Eşya, Ödünç Veren'in <strong>{formData.teslimatAdres || '___________________'}</strong> adresindeki yerinde teslim edilecek ve aynı adreste iade edilecektir.
              </p>
              <p>
                Ödünç Alan, eşyada meydana gelen herhangi bir arıza veya hasarı derhal Ödünç Veren'e bildirmekle yükümlüdür.
              </p>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold mb-2">ÖDÜNÇ VEREN (İmza)</p>
                  <p className="mt-8">{formData.oduncVerenAd || '___________________'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">ÖDÜNÇ ALAN (İmza)</p>
                  <p className="mt-8">{formData.oduncAlanAd || '___________________'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'criminal-record-statement': {
    getDefaultFormData: () => ({
      kurumAdi: '',
      islemTuru: '',
      adSoyad: '',
      tcKimlikNo: '',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kurum Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Kurum/Şirket Adı *</label>
              <input type="text" name="kurumAdi" value={formData.kurumAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: ABC Şirketi" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İşlem Türü *</label>
              <input type="text" name="islemTuru" value={formData.islemTuru || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: İş Başvurusu / Kayıt / İşlemler" />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="adSoyad" value={formData.adSoyad || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tarih *</label>
              <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.kurumAdi || '___________________'}</strong> MÜDÜRLÜĞÜ'NE / İNSAN KAYNAKLARI BİRİMİ'NE
              </p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">KONU: Adli Sicil (Sabıka) Kaydı Beyanı Hakkında.</p>
            </div>
            
            <div className="mt-4">
              <p className="mb-2">SAYIN İLGİLİ,</p>
              
              <p className="mb-2">
                Kurumunuz nezdinde yürütmekte olduğum <strong>{formData.islemTuru || 'İş Başvurusu / Kayıt / İşlemler'}</strong> kapsamında, adli sicil durumuma ilişkin beyanım aşağıdadır:
              </p>
              
              <p className="mb-2">
                Tarafıma ait herhangi bir adli sicil (sabıka) kaydı ve adli sicil arşiv kaydı bulunmamaktadır. Hakkımda kesinleşmiş bir mahkûmiyet hükmü olmadığı gibi, hali hazırda devam eden ve bu süreci etkileyecek bir hukuki engelim de yoktur.
              </p>
              
              <p className="mb-2">
                Beyanımın gerçeğe aykırı olduğunun tespit edilmesi halinde doğabilecek her türlü hukuki ve idari sorumluluğu kabul ettiğimi bildirir, gereğini bilgilerinize arz ederim.
              </p>
              
              <p className="mt-4 mb-2">Saygılarımla,</p>
              
              <div className="mt-6 space-y-2">
                <p><strong>Ad Soyad:</strong> {formData.adSoyad || '___________________'}</p>
                <p><strong>T.C. Kimlik No:</strong> {formData.tcKimlikNo || '___________________'}</p>
                <p><strong>Tarih:</strong> {tarih}</p>
                <p className="mt-4"><strong>İmza:</strong> [İmza]</p>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'student-permission': {
    getDefaultFormData: () => ({
      okulAdi: '',
      sehir: '',
      tarih: '',
      sinif: '',
      okulNumarasi: '',
      ogrenciAd: '',
      ogrenciTC: '',
      izinBaslangic: '',
      izinBitis: '',
      gunSayisi: '',
      mazeret: '',
      veliAd: '',
      veliTelefon: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Okul Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Okul Adı *</label>
              <input type="text" name="okulAdi" value={formData.okulAdi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şehir *</label>
              <input type="text" name="sehir" value={formData.sehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tarih *</label>
              <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Öğrenci Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Öğrencinin Adı Soyadı *</label>
              <input type="text" name="ogrenciAd" value={formData.ogrenciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Sınıf / Şube *</label>
                <input type="text" name="sinif" value={formData.sinif || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 5-A" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Okul Numarası *</label>
                <input type="text" name="okulNumarasi" value={formData.okulNumarasi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Öğrenci T.C. Kimlik No *</label>
              <input type="text" name="ogrenciTC" value={formData.ogrenciTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">İzin Bilgileri</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">İzin Başlangıç Tarihi *</label>
                <input type="date" name="izinBaslangic" value={formData.izinBaslangic || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">İzin Bitiş Tarihi *</label>
                <input type="date" name="izinBitis" value={formData.izinBitis || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gün Sayısı *</label>
              <input type="text" name="gunSayisi" value={formData.gunSayisi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: 3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mazeret *</label>
              <textarea name="mazeret" value={formData.mazeret || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required placeholder="Örn: Ailevi bir nedenle şehir dışına çıkacağımızdan / Sağlık sorunları nedeniyle dinlenmesi gerektiğinden / Özel bir mazeretimizden" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Veli Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Veli Ad Soyad *</label>
              <input type="text" name="veliAd" value={formData.veliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Veli Telefon *</label>
              <input type="text" name="veliTelefon" value={formData.veliTelefon || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required placeholder="05XX XXX XX XX" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      const izinBaslangic = formData.izinBaslangic ? formatDate(formData.izinBaslangic) : '___________________';
      const izinBitis = formData.izinBitis ? formatDate(formData.izinBitis) : '___________________';
      
      return (
        <div className="p-8 space-y-6 text-sm leading-relaxed">
          <div className="space-y-4">
            <div>
              <p className="text-center font-semibold mb-2">
                <strong>{formData.okulAdi || '___________________'}</strong> MÜDÜRLÜĞÜ'NE
              </p>
              <p className="text-center">
                <strong>{formData.sehir || '___________________'}</strong>
              </p>
            </div>
            
            <div className="mt-4">
              <p className="mb-2"><strong>Tarih:</strong> {tarih}</p>
            </div>
            
            <div className="mt-4">
              <p className="font-semibold mb-2">KONU: Öğrenci İzin Talebi Hakkında.</p>
            </div>
            
            <div className="mt-4">
              <p className="mb-2">SAYIN OKUL MÜDÜRLÜĞÜ,</p>
              
              <p className="mb-2">
                Okulunuzun <strong>{formData.sinif || '___________________'}</strong> sınıfı, <strong>{formData.okulNumarasi || '___________________'}</strong> numaralı öğrencisi <strong>{formData.ogrenciAd || '___________________'}</strong>'nın velisiyim.
              </p>
              
              <p className="mb-2">
                Öğrencim, <strong>{izinBaslangic}</strong> ile <strong>{izinBitis}</strong> tarihleri arasında (toplam <strong>{formData.gunSayisi || '___________________'}</strong> gün), <strong>{formData.mazeret || '___________________'}</strong> dolayı okula devam edemeyecektir.
              </p>
              
              <p className="mb-2">
                Söz konusu tarihlerde öğrencimin izinli sayılmasını ve devamsızlığının "özürlü devamsızlık" olarak e-Okul sistemine işlenmesini saygılarımla arz ederim.
              </p>
              
              <div className="mt-6 space-y-2">
                <p><strong>Veli Ad Soyad:</strong> {formData.veliAd || '___________________'}</p>
                <p className="mt-4"><strong>İmza:</strong> [İmza]</p>
                <p><strong>Öğrenci T.C. Kimlik No:</strong> {formData.ogrenciTC || '___________________'}</p>
                <p><strong>Veli Telefon:</strong> {formData.veliTelefon || '___________________'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  'eviction-need-lawsuit': {
    getDefaultFormData: () => ({
      mahkemeSehir: '',
      davaciAd: '',
      davaciTC: '',
      davaciAdres: '',
      davaliAd: '',
      davaliAdres: '',
      tapuIl: '',
      tapuIlce: '',
      tapuMahalle: '',
      tapuAda: '',
      tapuParsel: '',
      kiraSozlesmesiTarihi: '',
      ihtiyacSahibi: 'kendim',
      ihtarnameGonderildi: 'evet',
      tarih: '',
    }),
    getFormFields: (formData, onChange) => (
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Mahkeme Bilgileri</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Mahkeme Şehri *</label>
            <input type="text" name="mahkemeSehir" value={formData.mahkemeSehir || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVACI (MALİK) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davaciAd" value={formData.davaciAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">T.C. Kimlik No *</label>
              <input type="text" name="davaciTC" value={formData.davaciTC || ''} onChange={onChange} maxLength={11} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davaciAdres" value={formData.davaciAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">DAVALI (KİRACI) Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
              <input type="text" name="davaliAd" value={formData.davaliAd || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres *</label>
              <textarea name="davaliAdres" value={formData.davaliAdres || ''} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Taşınmaz Bilgileri</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">İl *</label>
                <input type="text" name="tapuIl" value={formData.tapuIl || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">İlçe *</label>
                <input type="text" name="tapuIlce" value={formData.tapuIlce || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mahalle *</label>
              <input type="text" name="tapuMahalle" value={formData.tapuMahalle || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Ada *</label>
                <input type="text" name="tapuAda" value={formData.tapuAda || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parsel *</label>
                <input type="text" name="tapuParsel" value={formData.tapuParsel || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Kira Sözleşmesi ve İhtiyaç Bilgileri</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Kira Sözleşmesi Başlangıç Tarihi *</label>
              <input type="date" name="kiraSozlesmesiTarihi" value={formData.kiraSozlesmesiTarihi || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İhtiyaç Sahibi *</label>
              <select name="ihtiyacSahibi" value={formData.ihtiyacSahibi || 'kendim'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="kendim">Kendim</option>
                <option value="esim">Eşim</option>
                <option value="cocuklarim">Çocuklarım</option>
                <option value="aileBireyleri">Bakmakla Yükümlü Olduğum Aile Bireylerim</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İhtarname Gönderildi mi? *</label>
              <select name="ihtarnameGonderildi" value={formData.ihtarnameGonderildi || 'evet'} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="evet">Evet, gönderildi</option>
                <option value="hayir">Hayır, gönderilmedi</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dilekçe Tarihi *</label>
          <input type="date" name="tarih" value={formData.tarih || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
      </div>
    ),
    renderPreview: (formData) => {
      const kiraSozlesmesiTarihi = formData.kiraSozlesmesiTarihi ? formatDate(formData.kiraSozlesmesiTarihi) : '___________________';
      const tarih = formData.tarih ? formatDate(formData.tarih) : '___________________';
      
      const ihtiyacSahibiText = {
        'kendim': 'kendim',
        'esim': 'eşim',
        'cocuklarim': 'çocuklarım',
        'aileBireyleri': 'bakmakla yükümlü olduğum aile bireylerim'
      }[formData.ihtiyacSahibi || 'kendim'] || 'kendim';
      
      const ihtarnameText = formData.ihtarnameGonderildi === 'evet' 
        ? 'Davalıya, ihtiyacın varlığı gerekçe gösterilerek usulüne uygun ihtarname gönderilmiş olup tahliye gerçekleşmemiştir.'
        : 'Davalıya, ihtiyacın varlığı gerekçe gösterilerek usulüne uygun ihtarname gönderilmesine rağmen tahliye gerçekleşmemiştir.';
      
      return (
        <div style={{ padding: '20px 0' }}>
          <A4PageWrapper pageNumber={1} totalPages={2}>
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold mb-2">KONUTUN İHTİYAÇ SEBEBİYLE TAHLİYESİNE İLİŞKİN DAVA DİLEKÇESİ</h1>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-center font-semibold mb-2">
                    T.C.
                  </p>
                  <p className="text-center font-semibold mb-4">
                    <strong>{formData.mahkemeSehir || '___________________'}</strong> SULH HUKUK MAHKEMESİ'NE
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold mb-2">DAVACI (MALİK):</p>
                  <p>Ad Soyad: <strong>{formData.davaciAd || '___________________'}</strong></p>
                  <p>T.C. Kimlik No: <strong>{formData.davaciTC || '___________________'}</strong></p>
                  <p>Adres: <strong>{formData.davaciAdres || '___________________'}</strong></p>
                </div>
                
                <div className="mt-4">
                  <p className="font-semibold mb-2">DAVALI (KİRACI):</p>
                  <p>Ad Soyad: <strong>{formData.davaliAd || '___________________'}</strong></p>
                  <p>Adres: <strong>{formData.davaliAdres || '___________________'}</strong></p>
                </div>
                
                <div className="mt-6">
                  <p className="font-semibold mb-2">KONU:</p>
                  <p className="text-justify">
                    Davaya konu taşınmazın, davacı ve/veya bakmakla yükümlü olduğu yakınlarının konut ihtiyacı sebebiyle tahliyesine karar verilmesi talebidir.
                  </p>
                </div>
                
                <div className="mt-6">
                  <p className="font-semibold mb-2">AÇIKLAMALAR</p>
                  
                  <p className="mb-2 text-justify">
                    Davacı, <strong>{formData.tapuIl || '___________________'}</strong> ili, <strong>{formData.tapuIlce || '___________________'}</strong> ilçesi, <strong>{formData.tapuMahalle || '___________________'}</strong> mahallesi, <strong>{formData.tapuAda || '___________________'}</strong> ada, <strong>{formData.tapuParsel || '___________________'}</strong> parselde bulunan ve davalı tarafından kiracı olarak kullanılan konut nitelikli taşınmazın malikidir.
                  </p>
                  
                  <p className="mb-2 text-justify">
                    Davalı ile aramızda <strong>{kiraSozlesmesiTarihi}</strong> başlangıç tarihli kira sözleşmesi bulunmaktadır. Davalı, taşınmazda halen kiracı olarak ikamet etmektedir.
                  </p>
                  
                  <p className="mb-2 text-justify">
                    Davacı olarak <strong>{ihtiyacSahibiText}</strong> için söz konusu taşınmaza gerçek, samimi ve zorunlu konut ihtiyacım doğmuştur. Hâlihazırda davacının konut ihtiyacını karşılayabileceği başka bir taşınmazı bulunmamaktadır.
                  </p>
                  
                  <p className="mb-2 text-justify">
                    Türk Borçlar Kanunu'nun 350. maddesi uyarınca; kiraya veren, kendisi, eşi, altsoyu, üstsoyu veya kanunen bakmakla yükümlü olduğu kişiler için konut ihtiyacı sebebiyle kira sözleşmesinin sona erdirilmesini ve tahliyeyi talep edebilir.
                  </p>
                  
                  <p className="mb-2 text-justify">
                    {ihtarnameText} Bu nedenle işbu davanın açılması zorunlu hâle gelmiştir.
                  </p>
                  
                  <p className="text-justify">
                    Davacının ihtiyacı gerçek ve süreklidir. Tahliye talebi, kötü niyetli olmayıp yalnızca zorunlu konut ihtiyacına dayanmaktadır.
                  </p>
                </div>
              </div>
            </div>
          </A4PageWrapper>
          
          <A4PageWrapper pageNumber={2} totalPages={2}>
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <p className="font-semibold mb-2">HUKUKİ NEDENLER</p>
                <p>
                  6098 sayılı Türk Borçlar Kanunu m. 350 ve ilgili sair mevzuat.
                </p>
              </div>
              
              <div className="mt-6">
                <p className="font-semibold mb-2">DELİLLER</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tapu kaydı</li>
                  <li>Kira sözleşmesi</li>
                  <li>İhtarname ve tebliğ evrakları (varsa)</li>
                  <li>Nüfus kayıt örnekleri</li>
                  <li>Tanık beyanları</li>
                  <li>Her türlü yasal delil</li>
                </ul>
              </div>
              
              <div className="mt-6">
                <p className="font-semibold mb-2">SONUÇ VE İSTEM</p>
                <p className="mb-2 text-justify">
                  Yukarıda arz ve izah edilen nedenlerle;
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-2">
                  <li>Davaya konu taşınmazın, davacının konut ihtiyacı sebebiyle tahliyesine,</li>
                  <li>Yargılama giderleri ve vekâlet ücretinin davalı üzerine bırakılmasına,</li>
                </ul>
                <p className="text-justify">
                  karar verilmesini saygılarımla arz ve talep ederim.
                </p>
              </div>
              
              <div className="mt-8 space-y-2">
                <p><strong>Davacı</strong></p>
                <p><strong>Ad Soyad:</strong> {formData.davaciAd || '___________________'}</p>
                <p className="mt-4"><strong>İmza:</strong> [İmza]</p>
                <p><strong>Tarih:</strong> {tarih}</p>
              </div>
            </div>
          </A4PageWrapper>
        </div>
      );
    },
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
  // İş ve istihdam
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

