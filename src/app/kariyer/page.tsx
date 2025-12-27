'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, FileText, User, Mail, Phone, Briefcase, GraduationCap, FileCheck } from 'lucide-react';

export default function KariyerPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    education: '',
    coverLetter: '',
    resume: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Kullanıcı bilgilerini yükle ve form'a doldur
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // localStorage'dan kaydedilmiş form verilerini yükle
    const savedFormData = localStorage.getItem('kariyerFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          resume: null // Dosya localStorage'da saklanamaz
        }));
      } catch (e) {
        console.error('Form verileri yüklenirken hata:', e);
      }
    }

    // Session varsa kullanıcı bilgilerini doldur
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }));

      // API'den telefon bilgisini çek
      const loadUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setFormData(prev => ({
                ...prev,
                phone: prev.phone || data.user.phone || '',
              }));
            }
          }
        } catch (error) {
          console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        }
      };

      loadUserProfile();
    }
  }, [session]);

  // Form verileri değiştiğinde localStorage'a kaydet (resume hariç)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const dataToSave = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      experience: formData.experience,
      education: formData.education,
      coverLetter: formData.coverLetter,
    };
    localStorage.setItem('kariyerFormData', JSON.stringify(dataToSave));
  }, [formData.fullName, formData.email, formData.phone, formData.position, formData.experience, formData.education, formData.coverLetter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Validasyon
      if (!formData.fullName || !formData.email || !formData.phone || !formData.position || !formData.coverLetter) {
        throw new Error('Lütfen tüm zorunlu alanları doldurun');
      }

      // Email validasyonu
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Geçerli bir email adresi giriniz');
      }

      // CV'yi base64'e çevir
      let resumeBase64 = null;
      if (formData.resume) {
        if (formData.resume.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('CV dosyası 5MB\'dan büyük olamaz');
        }
        resumeBase64 = await convertFileToBase64(formData.resume);
      }

      const response = await fetch('/api/career', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          experience: formData.experience || null,
          education: formData.education || null,
          coverLetter: formData.coverLetter,
          resume: resumeBase64,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API Response (not JSON):', text.substring(0, 500));
        throw new Error('Sunucudan beklenen JSON yanıtı alınamadı. Lütfen daha sonra tekrar deneyin.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Başvuru gönderilirken bir hata oluştu');
      }

      setSubmitStatus('success');
      // Formu temizle
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        education: '',
        coverLetter: '',
        resume: null,
      });
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kariyer</h1>
          <p className="text-lg text-gray-600">
            Alo17 ekibine katılmak ister misiniz? Aşağıdaki formu doldurarak başvurunuzu gönderebilirsiniz.
          </p>
        </div>

        {/* Başarı Mesajı */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Başvurunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
            </p>
          </div>
        )}

        {/* Hata Mesajı */}
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ad Soyad */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ornek@email.com"
              />
            </div>

            {/* Telefon */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="05XX XXX XX XX"
              />
            </div>

            {/* Pozisyon */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Başvurulan Pozisyon <span className="text-red-500">*</span>
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pozisyon seçiniz</option>
                <option value="Yazılım Geliştirici">Yazılım Geliştirici</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="UI/UX Tasarımcı">UI/UX Tasarımcı</option>
                <option value="Pazarlama Uzmanı">Pazarlama Uzmanı</option>
                <option value="İçerik Editörü">İçerik Editörü</option>
                <option value="Müşteri Hizmetleri">Müşteri Hizmetleri</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            {/* Deneyim */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                İş Deneyimi
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Önceki iş deneyimlerinizi kısaca özetleyiniz..."
              />
            </div>

            {/* Eğitim */}
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="inline h-4 w-4 mr-1" />
                Eğitim Bilgisi
              </label>
              <textarea
                id="education"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Eğitim bilgilerinizi giriniz..."
              />
            </div>

            {/* Ön Yazı */}
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Ön Yazı <span className="text-red-500">*</span>
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Neden bizimle çalışmak istediğinizi ve kendinizi kısaca tanıtınız..."
              />
            </div>

            {/* CV Yükleme */}
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                <FileCheck className="inline h-4 w-4 mr-1" />
                CV Yükle (PDF, DOC, DOCX - Max 5MB)
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.resume && (
                <p className="mt-2 text-sm text-gray-600">
                  Seçilen dosya: {formData.resume.name} ({(formData.resume.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Başvuruyu Gönder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

