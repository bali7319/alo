'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export default function EvKiralamaSozlesmePage() {
  const [formData, setFormData] = useState({
    // Ev Sahibi Bilgileri
    evSahibiAd: '',
    evSahibiTC: '',
    evSahibiAdres: '',
    evSahibiTelefon: '',
    evSahibiEmail: '',
    
    // Kiracı Bilgileri
    kiracıAd: '',
    kiracıTC: '',
    kiracıAdres: '',
    kiracıTelefon: '',
    kiracıEmail: '',
    
    // Ev Bilgileri (Detaylı Adres)
    evDaire: '',
    evMahalle: '',
    evCaddeSokak: '',
    kiralananSeyinCinsi: 'MESKEN',
    evAdres: '', // Tam adres (tahliye için)
    
    // Kira Bilgileri
    birAylikKira: '',
    kiraOdemeSekli: 'BANKA',
    kiraMuddeti: '',
    kiraBaslangic: '',
    kiraBitis: '',
    depozito: '',
    aidat: '',
    kullanımAmaci: 'MESKEN',
    
    // Demirbaş Eşyalar
    demirbasEşyalar: '',
    
    // Ek Bilgiler
    sozlesmeTarihi: new Date().toISOString().split('T')[0],
    sozlesmeYeri: 'Çanakkale',
    
    // Hususi Şartlar
    kiraOdemeGunu: '20',
    kiraOdemeIBAN: '',
    gecikmeTazminati: '2',
    elektrikSuAidatKiracıya: true,
    abonelikAcmaSuresi: '15',
    kombiBakimKiracıya: true,
    kiraMuddetiYil: '1',
    kiraArtisOrani: 'TÜFE',
    artisDonemi: 'Eylül',
    tahliyeBildirimi: '2',
    erkenTahliyeMuacceliyet: true,
    onarimTadilatOnay: true,
    altKiracıDevir: false,
    konutKullanimKisitlama: true,
    maxIkametSayisi: '5',
    ticariFaaliyet: false,
    ihtilafMahkemesi: 'Çanakkale',
    kontratNushasi: '3',
    
    // Ek Maddeler
    ekMaddeler: '',
    
  });

  // Admin kontrolü kaldırıldı - herkese açık sayfa

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: string) => {
    if (!value) return '0,00 ₺';
    const num = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(num)) return '0,00 ₺';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(num);
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Sayıyı Türkçe sıra sayısına çevir (1 -> Birinci, 20 -> Yirminci)
  const numberToTurkishOrdinal = (num: string | number): string => {
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

  // Tahliye taahhüdü hazırlanma tarihi: Sözleşme tarihinden 35 gün sonra
  const getTahliyeHazirlanmaTarihi = () => {
    if (!formData.sozlesmeTarihi) return null;
    const sozlesmeTarihi = new Date(formData.sozlesmeTarihi);
    const tahliyeTarihi = new Date(sozlesmeTarihi);
    tahliyeTarihi.setDate(tahliyeTarihi.getDate() + 35);
    return tahliyeTarihi.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header - Print'te gizlenecek */}
      <div className="bg-white border-b shadow-sm print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/sozlesmeler"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ev Kiralama Sözleşmesi</h1>
                <p className="text-sm text-gray-600">Sözleşme oluştur ve yazdır</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="h-5 w-5 mr-2" />
                Yazdır
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-1">
          {/* Sol Taraf - Form */}
          <div className="print:hidden lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Ev Sahibi Bilgileri */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Ev Sahibi Bilgileri
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      name="evSahibiAd"
                      value={formData.evSahibiAd}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TC Kimlik No *
                    </label>
                    <input
                      type="text"
                      name="evSahibiTC"
                      value={formData.evSahibiTC}
                      onChange={handleInputChange}
                      maxLength={11}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <textarea
                      name="evSahibiAdres"
                      value={formData.evSahibiAdres}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="evSahibiTelefon"
                        value={formData.evSahibiTelefon}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta
                      </label>
                      <input
                        type="email"
                        name="evSahibiEmail"
                        value={formData.evSahibiEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kiracı Bilgileri */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Kiracı Bilgileri
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      name="kiracıAd"
                      value={formData.kiracıAd}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TC Kimlik No *
                    </label>
                    <input
                      type="text"
                      name="kiracıTC"
                      value={formData.kiracıTC}
                      onChange={handleInputChange}
                      maxLength={11}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <textarea
                      name="kiracıAdres"
                      value={formData.kiracıAdres}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="kiracıTelefon"
                        value={formData.kiracıTelefon}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta
                      </label>
                      <input
                        type="email"
                        name="kiracıEmail"
                        value={formData.kiracıEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ev Bilgileri */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Kiralanan Ev Bilgileri
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daire No
                      </label>
                      <input
                        type="text"
                        name="evDaire"
                        value={formData.evDaire}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mahalle *
                      </label>
                      <input
                        type="text"
                        name="evMahalle"
                        value={formData.evMahalle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cadde/Sokak *
                      </label>
                      <input
                        type="text"
                        name="evCaddeSokak"
                        value={formData.evCaddeSokak}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kiralanan Şeyin Cinsi *
                    </label>
                    <select
                      name="kiralananSeyinCinsi"
                      value={formData.kiralananSeyinCinsi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="MESKEN">MESKEN</option>
                      <option value="İŞYERİ">İŞYERİ</option>
                      <option value="DEPO">DEPO</option>
                      <option value="DİĞER">DİĞER</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Kira Bilgileri */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Kira Bilgileri
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bir Aylık Kira Karşılığı (₺) *
                    </label>
                    <input
                      type="text"
                      name="birAylikKira"
                      value={formData.birAylikKira}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kira Karşılığının Ne Şekilde Ödeneceği *
                    </label>
                    <select
                      name="kiraOdemeSekli"
                      value={formData.kiraOdemeSekli}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="BANKA">BANKA</option>
                      <option value="NAKİT">NAKİT</option>
                      <option value="HAVALE/EFT">HAVALE/EFT</option>
                      <option value="ÇEK">ÇEK</option>
                      <option value="SENET">SENET</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kira Müddeti
                    </label>
                    <input
                      type="text"
                      name="kiraMuddeti"
                      value={formData.kiraMuddeti}
                      onChange={handleInputChange}
                      placeholder="Örn: 12 ay"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kiranın Başlangıcı *
                      </label>
                      <input
                        type="date"
                        name="kiraBaslangic"
                        value={formData.kiraBaslangic}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        name="kiraBitis"
                        value={formData.kiraBitis}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kiralanan Şeyin Ne İçin Kullanılacağı *
                    </label>
                    <select
                      name="kullanımAmaci"
                      value={formData.kullanımAmaci}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="MESKEN">MESKEN</option>
                      <option value="İŞYERİ">İŞYERİ</option>
                      <option value="DEPO">DEPO</option>
                      <option value="DİĞER">DİĞER</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Depozito (₺)
                      </label>
                      <input
                        type="text"
                        name="depozito"
                        value={formData.depozito}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aidat (₺)
                      </label>
                      <input
                        type="text"
                        name="aidat"
                        value={formData.aidat}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Demirbaş Eşyalar */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Demirbaş Eşyalar
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kiralanan Şey İle Beraber Teslim Olunan Demirbaş Eşyanın Beyanı
                  </label>
                  <textarea
                    name="demirbasEşyalar"
                    value={formData.demirbasEşyalar}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Örn: Demirdöküm kombi, Beko ankastre set, 8 adet kalorifer peteği, Altus 24000 Btu klima"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sözleşme Bilgileri */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Sözleşme Bilgileri
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sözleşme Tarihi
                    </label>
                    <input
                      type="date"
                      name="sozlesmeTarihi"
                      value={formData.sozlesmeTarihi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sözleşme Yeri
                    </label>
                    <input
                      type="text"
                      name="sozlesmeYeri"
                      value={formData.sozlesmeYeri}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Hususi Şartlar */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Hususi Şartlar
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kira Ödeme Günü *
                      </label>
                      <input
                        type="text"
                        name="kiraOdemeGunu"
                        value={formData.kiraOdemeGunu}
                        onChange={handleInputChange}
                        placeholder="Örn: 20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Artış Dönemi (Ay) *
                      </label>
                      <select
                        name="artisDonemi"
                        value={formData.artisDonemi}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Ocak">Ocak</option>
                        <option value="Şubat">Şubat</option>
                        <option value="Mart">Mart</option>
                        <option value="Nisan">Nisan</option>
                        <option value="Mayıs">Mayıs</option>
                        <option value="Haziran">Haziran</option>
                        <option value="Temmuz">Temmuz</option>
                        <option value="Ağustos">Ağustos</option>
                        <option value="Eylül">Eylül</option>
                        <option value="Ekim">Ekim</option>
                        <option value="Kasım">Kasım</option>
                        <option value="Aralık">Aralık</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IBAN *
                    </label>
                    <input
                      type="text"
                      name="kiraOdemeIBAN"
                      value={formData.kiraOdemeIBAN}
                      onChange={handleInputChange}
                      placeholder="TR..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Tahliye Taahhütnamesi */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Tahliye Taahhütnamesi
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Not:</strong> Taahhüt Eden (Kiracı) ve Mal Sahibi bilgileri yukarıdaki form alanlarından otomatik olarak alınacaktır.
                  </p>
                  <p className="text-sm text-blue-800 mb-2">
                    Adres bilgileri de ev bilgilerinden (Mahalle, Cadde/Sokak, Daire) otomatik oluşturulacaktır.
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Tahliye Tarihi:</strong> Kira bitiş tarihi olarak otomatik kullanılacaktır.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Ön İzleme (A4 Format - 3 Sayfa) */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-100px)] lg:col-span-1 print:w-full">
            <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-0 print:w-full">
              {/* SAYFA 1 */}
              <div className="a4-container bg-white page-break-after" style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                margin: '0 auto 20px auto',
                padding: '20mm',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontSize: '12px',
                lineHeight: '1.6',
              }}>
                {/* Sözleşme Başlığı */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2 uppercase">
                    KİRA KONTRATOSU
                  </h1>
                </div>

                {/* Adres Bilgileri Tablosu */}
                <table className="w-full mb-6 border-collapse" style={{ fontSize: '11px' }}>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold" style={{ width: '30%' }}>DAİRESİ:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.evDaire || '___________________'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">MAHALLESİ:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.evMahalle || '___________________'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">CADDE/SOKAĞI:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.evCaddeSokak || '___________________'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">KİRALANAN ŞEYİN CİNSİ:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.kiralananSeyinCinsi || 'MESKEN'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Kiraya Veren Bilgileri */}
                <div className="mb-4">
                  <p className="font-semibold mb-1">KİRAYA VERENİN Adı Soyadı:</p>
                  <p className="mb-2">{formData.evSahibiAd || '___________________'}</p>
                  {formData.evSahibiTC && (
                    <p className="text-xs">TC: {formData.evSahibiTC}</p>
                  )}
                </div>

                {/* Kira Bilgileri Tablosu */}
                <table className="w-full mb-6 border-collapse" style={{ fontSize: '11px' }}>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold" style={{ width: '40%' }}>BİR AYLIK KİRA KARŞILIĞI:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.birAylikKira ? formatCurrency(formData.birAylikKira) : '___________________'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">KİRA KARŞILIĞININ NE ŞEKİLDE ÖDENECEĞİ:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.kiraOdemeSekli || 'BANKA'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">KİRA MÜDDETİ:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.kiraMuddeti || '___________________'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">KİRANIN BAŞLANGICI:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.kiraBaslangic ? formatDate(formData.kiraBaslangic) : '___________________'}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 font-semibold">KİRALANAN ŞEYİN NE İÇİN KULLANILACAĞI:</td>
                      <td className="border border-gray-300 px-2 py-1">{formData.kullanımAmaci || 'MESKEN'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Demirbaş Eşyalar */}
                {formData.demirbasEşyalar && (
                  <div className="mb-6">
                    <p className="font-semibold mb-2">KİRALANAN ŞEY İLE BERABER TESLİM OLUNUN DEMİRBAŞ EŞYANIN BEYANI:</p>
                    <div className="border border-gray-300 p-3 bg-gray-50" style={{ minHeight: '60px' }}>
                      <p className="text-sm whitespace-pre-line">{formData.demirbasEşyalar}</p>
                    </div>
                  </div>
                )}

                {/* Kiracı Bilgileri */}
                <div className="mb-6">
                  <p className="font-semibold mb-2">KİRACI:</p>
                  <p className="mb-1">{formData.kiracıAd || '___________________'}</p>
                  {formData.kiracıTC && (
                    <p className="text-xs">TC: {formData.kiracıTC}</p>
                  )}
                  {formData.kiracıAdres && (
                    <p className="text-xs mt-1">Adres: {formData.kiracıAdres}</p>
                  )}
                </div>

                {/* Ek Maddeler */}
                {formData.ekMaddeler && (
                  <div className="mb-6">
                    <p className="font-semibold mb-2">EK MADDELER:</p>
                    <div className="text-sm whitespace-pre-line border border-gray-300 p-3 bg-gray-50">
                      {formData.ekMaddeler}
                    </div>
                  </div>
                )}

                {/* İmzalar */}
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-semibold mb-4 border-t pt-2">KİRAYA VEREN</p>
                    <p className="mb-8">{formData.evSahibiAd || '___________________'}</p>
                    <p className="text-xs border-t pt-2">İmza</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-4 border-t pt-2">KİRACI</p>
                    <p className="mb-8">{formData.kiracıAd || '___________________'}</p>
                    <p className="text-xs border-t pt-2">İmza</p>
                  </div>
                </div>

              </div>

              {/* SAYFA 2 - HUSUSİ ŞARTLAR */}
              <div className="a4-container bg-white" style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                margin: '0 auto',
                padding: '20mm',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontSize: '12px',
                lineHeight: '1.6',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Başlık */}
                <div className="text-center mb-4">
                  <h1 className="text-xl font-bold text-gray-900 mb-2 uppercase">
                    HUSUSİ ŞARTLAR
                  </h1>
                </div>

                {/* Hususi Şartlar */}
                <div className="space-y-3 text-sm flex-1" style={{ fontSize: '11px' }}>
                  {/* Madde 1 */}
                  <div>
                    <p className="mb-1.5">
                      <strong>1)</strong> Kiracı Mevcut Kira bedelini her ayın{' '}
                      <strong>{formData.kiraOdemeGunu ? numberToTurkishOrdinal(formData.kiraOdemeGunu) : 'Yirminci'}</strong> günü kiralayanın bildireceği{' '}
                      <strong>{formData.kiraOdemeIBAN || 'TR iban nolu'}</strong> hesabına ödeyecektir. 
                      Temerrüt halinde her ay için Aylık <strong>% {formData.gecikmeTazminati || '2'}</strong> Hesabıyla gecikme tazminatı alınır. 
                      Şu kadar ki! Temerrüt halinde takip eden bir yılın bakiye dönem kiraları da muacceliyet kesbedecektir.
                    </p>
                  </div>

                  {/* Madde 2 */}
                  <div>
                    <p className="mb-2">
                      <strong>2)</strong> Elektrik, su çevre temizlik ve stopaj vergileri ile site apartman aidatı{' '}
                      {formData.elektrikSuAidatKiracıya ? 'kiracıya aittir' : 'kiralayana aittir'}. 
                      Kira bedeli net ödenir. Kiracı adına{' '}
                      <strong>{formData.abonelikAcmaSuresi || '15'}</strong> gün içinde abonelik açtırmayı ve{' '}
                      {formData.kombiBakimKiracıya ? 'kombinin servis güvencesinde rutin olarak bakım yaptırmayı taahhüt eder. Bakım yaptırmaması halinde sorumluluk kiracıya aittir.' : 'kombi bakımı kiralayana aittir.'}
                    </p>
                  </div>

                  {/* Madde 3 */}
                  <div>
                    <p className="mb-1.5">
                      <strong>3)</strong> Kira müddeti <strong>{formData.kiraMuddetiYil || '1'}</strong> yıl olup, 
                      HER yıl dönem başı olan <strong>{formData.artisDonemi || 'Eylül'}</strong> ayı ve takip eden yıllarda 
                      mevcut kira bedeli <strong>{formData.kiraArtisOrani || 'TÜFE'}</strong> oranında arttırılacaktır.
                    </p>
                  </div>

                  {/* Madde 4 */}
                  <div>
                    <p className="mb-1.5">
                      <strong>4)</strong> Kiracı meskeni sözleşme hitamında tahliye etmek istediği takdirde;{' '}
                      <strong>{formData.tahliyeBildirimi || '2'}</strong> ay öncesinden kiraya verene yazılı olarak haber vermek zorundadır. 
                      {formData.erkenTahliyeMuacceliyet && (
                        <> Şu kadar ki erken tahliye halinde bakiye 1 yıllık dönem kiraları da muacelliyet kesbedecektir.</>
                      )}
                    </p>
                  </div>

                  {/* Madde 5 */}
                  <div>
                    <p className="mb-1.5">
                      <strong>5)</strong> {formData.onarimTadilatOnay ? (
                        <>Kiralayanın onayı alınmaksızın. Mecurda esaslı onarım, tadilat yapılamaz. Kullanıldığı süre içinde yapılacak küçük değişiklikler için kiralayandan hak talep edilemez. Kiralayan talep ederse; mecur eski hale getirilerek teslim edilecektir.</>
                      ) : (
                        <>Mecurda onarım ve tadilat yapılabilir.</>
                      )}
                    </p>
                  </div>

                  {/* Madde 6 - Boş bırakıldı PDF'de */}
                  <div>
                    <p className="mb-2">
                      <strong>6)</strong> {' '}
                    </p>
                  </div>

                  {/* Madde 7 */}
                  <div>
                    <p className="mb-1.5">
                      <strong>7)</strong> Kiracı, mecuru Mülk sahibinin rızası{' '}
                      {formData.altKiracıDevir ? 'alınarak her zaman devir yapılabilir.' : 'alınmadan Üçüncü bir kişi -alt kiracıya devredemez.'}
                    </p>
                  </div>

                  {/* Madde 8 */}
                  <div>
                    <p className="mb-1.5">
                      <strong>8)</strong> Kiracı şirket temsilcileri konutu şirket personelinin ikametgahı için konut olarak kullandıklarını beyan etmişlerdir. 
                      {formData.konutKullanimKisitlama && (
                        <> 3+1 konutta ailece konaklama dışında <strong>{formData.maxIkametSayisi || 'beş'}</strong> kişiden fazla şahıs ikamet edemez.</>
                      )}
                      {formData.ticariFaaliyet && (
                        <> Konutun ticari faaliyet olarak kullanılması halinde taraflar yeni bir kira akdi yapmayı peşinen kabul etmişlerdir. Akde aykırılık taraflarca tahliye sebebi sayılmıştır.</>
                      )}
                    </p>
                  </div>

                  {/* Madde 9 */}
                  <div>
                    <p className="mb-1.5">
                      <strong>9)</strong> İhtilaf halinde <strong>{formData.ihtilafMahkemesi || 'Çanakkale'}</strong> Mahkemeleri ve İcra Daireleri yetkilidir.
                    </p>
                  </div>
                </div>

                {/* Son Paragraf */}
                <div className="mt-8 text-sm">
                  <p className="mb-4">
                    Mezkûr konut iki tarafın rızasıyla ve yukarıda yazılı şartlarla kiralanmış olduğuna dair bu kontrat{' '}
                    <strong>{formData.kontratNushasi || 'ÜÇ'} NÜSHA</strong> olarak tanzim ve teati edilmiştir.
                  </p>
                  
                  <div className="mt-4">
                    <p className="mb-2 text-xs">
                      <strong>TARİH:</strong> {formData.sozlesmeTarihi ? formatDate(formData.sozlesmeTarihi) : '___________________'}
                    </p>
                  </div>
                </div>

                {/* İmzalar */}
                <div className="mt-4 grid grid-cols-2 gap-6" style={{ marginTop: '12px' }}>
                  <div>
                    <p className="font-semibold mb-1 border-t pt-1 text-xs">KİRACI</p>
                    <p className="mb-2 text-sm">{formData.kiracıAd || '___________________'}</p>
                    <p className="text-xs border-t pt-1">İmza</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1 border-t pt-1 text-xs">KİRAYA VEREN</p>
                    <p className="mb-2 text-sm">{formData.evSahibiAd || '___________________'}</p>
                    <p className="text-xs border-t pt-1">İmza</p>
                  </div>
                </div>
              </div>

              {/* SAYFA 3 - TAHLİYE TAAHHÜTNAMESİ */}
              <div className="a4-container bg-white" style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                margin: '20px auto 0 auto',
                padding: '20mm',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontSize: '12px',
                lineHeight: '1.8',
              }}>
                {/* Başlık */}
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold text-gray-900 mb-2 uppercase">
                    TAHLİYE TAAHHÜTNAMESİ
                  </h1>
                </div>

                {/* Taahhüt Eden Bilgileri */}
                <div className="mb-6">
                  <p className="font-semibold mb-2">TAAHHÜT EDEN:</p>
                  <p className="mb-1">
                    Ad Soyad: <strong>{formData.kiracıAd || '___________________'}</strong>
                  </p>
                  {formData.kiracıTC && (
                    <p className="text-sm">
                      TC Kimlik No: <strong>{formData.kiracıTC}</strong>
                    </p>
                  )}
                </div>

                {/* Mal Sahibi Bilgileri */}
                <div className="mb-6">
                  <p className="font-semibold mb-2">MAL SAHİBİ:</p>
                  <p className="mb-1">
                    Ad Soyad: <strong>{formData.evSahibiAd || '___________________'}</strong>
                  </p>
                  {formData.evSahibiTC && (
                    <p className="text-sm">
                      TC Kimlik No: <strong>{formData.evSahibiTC}</strong>
                    </p>
                  )}
                </div>

                {/* Tahliye Edilecek Mecurun Adresi */}
                <div className="mb-6">
                  <p className="font-semibold mb-2">TAHLİYE EDİLECEK MECURUN ADRESİ:</p>
                  <div className="border border-gray-300 p-3 bg-gray-50">
                    <p className="text-sm">
                      {formData.evMahalle && formData.evCaddeSokak 
                        ? `${formData.evMahalle} ${formData.evCaddeSokak} ${formData.evDaire ? `No:${formData.evDaire}` : ''} ${formData.sozlesmeYeri ? `Merkez/${formData.sozlesmeYeri}` : ''}`.trim()
                        : '___________________'}
                    </p>
                  </div>
                </div>

                {/* Ana Metin */}
                <div className="mb-8">
                  <p className="text-sm leading-relaxed">
                    Halen kiracısı bulunduğum kiralayanı <strong>{formData.evSahibiAd || '___________________'}</strong> olan, 
                    yukarıda adresi yazılı mecurda kiracı olarak bulunmaktayım. İş bu taşınmazı, 
                    Hiçbir <strong>BASKI</strong> altında kalmaksızın, <strong>PROTESTO</strong>, <strong>İKAZ</strong> ve <strong>İHTARA</strong> hacet kalmaksızın{' '}
                    <strong>{formData.kiraBitis ? formatDate(formData.kiraBitis) : '___________________'}</strong> Tarihinde 
                    sahibi veya göstereceği kanuni vekillerine <strong>BOŞ</strong> olarak <strong>TAHLİYE</strong> edip, 
                    teslim etmeyi kesin olarak taahhüt eder ve yüklenirim.
                  </p>
                </div>

                {/* İmza */}
                <div className="mt-16">
                  <p className="font-semibold mb-4">TAAHHÜT EDEN:</p>
                  <p className="mb-12 text-lg">{formData.kiracıAd || '___________________'}</p>
                  <p className="text-xs border-t pt-2">İmza</p>
                </div>

                {/* Tarih */}
                <div className="mt-8 text-right">
                  <p className="text-sm">
                    <strong>Tarih:</strong> {getTahliyeHazirlanmaTarihi() ? formatDate(getTahliyeHazirlanmaTarihi()!) : '___________________'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: auto !important;
          }
          /* Tüm header ve footer elementlerini gizle */
          header, footer, nav, .header, .footer,
          .bg-white.border-b, .container.mx-auto:not(:has(.a4-container)) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          /* Header, form ve butonları gizle */
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          /* Ana container */
          .min-h-screen {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            min-height: auto !important;
          }
          /* Container ve grid düzenlemeleri */
          .container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .container:not(:has(.a4-container)) {
            display: none !important;
          }
          .grid {
            display: block !important;
            gap: 0 !important;
          }
          /* Form alanlarını gizle */
          .lg\\:w-1\\/2:not(.print\\:w-full) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          /* Sadece A4 container'ları göster */
          .a4-container {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20mm !important;
            width: 210mm !important;
            min-height: auto !important;
            max-height: 297mm !important;
            page-break-after: always;
            display: block !important;
            background: white !important;
            position: relative !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
          .a4-container:last-child {
            page-break-after: auto !important;
            min-height: auto !important;
          }
          .a4-container:empty {
            display: none !important;
          }
          .page-break-after {
            page-break-after: always;
          }
          /* Boş sayfaları engelle */
          @page :blank {
            display: none;
          }
          /* Son sayfadan sonra boş sayfa engelle */
          body::after {
            display: none !important;
          }
          /* Gereksiz boşlukları kaldır */
          .a4-container:last-child::after {
            display: none !important;
          }
          /* Ön izleme container'ını tam genişlik yap */
          .lg\\:sticky {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            top: auto !important;
          }
          .lg\\:w-1\\/2.print\\:w-full {
            width: 100% !important;
            margin: 0 !important;
          }
          /* Shadow ve padding'leri kaldır */
          .shadow-lg, .rounded-lg, .p-8 {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

