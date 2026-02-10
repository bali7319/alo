'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Send, CheckCircle, XCircle, Loader } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminTestEmailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    to: 'destek@alo17.tr',
    subject: 'Test Email',
    message: 'Bu bir test email\'idir. Email gönderme sistemi çalışıyor! ✅',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);

  // Admin kontrolü
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'admin') {
    router.push('/giris?callbackUrl=/admin/test-email');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.to) {
        setResult({
          success: true,
          message: `Email başarıyla gönderildi! Alıcı: ${data.to}`,
        });
        // Formu temizle
        setFormData({
          to: 'destek@alo17.tr',
          subject: 'Test Email',
          message: 'Bu bir test email\'idir. Email gönderme sistemi çalışıyor! ✅',
        });
      } else {
        const detailsMsg = data.details?.message || data.details?.code;
        setResult({
          success: false,
          message: data.error || 'Email gönderilemedi',
          details: detailsMsg ? String(detailsMsg) : undefined,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Email gönderme sırasında bir hata oluştu',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Test</h1>
            <p className="text-gray-600">Herhangi bir email adresine test emaili gönderin</p>
          </div>

          {/* SMTP Durumu */}
          <div className="mb-6">
            <a
              href="/api/test/smtp-check"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              SMTP Ayarlarını Kontrol Et →
            </a>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alıcı Email */}
              <div>
                <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                  Alıcı Email Adresi *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="to"
                    required
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="destek@alo17.tr"
                  />
                </div>
              </div>

              {/* Konu */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Konu *
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email konusu"
                />
              </div>

              {/* Mesaj */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email mesajı"
                />
              </div>

              {/* Sonuç Mesajı */}
              {result && (
                <div
                  className={`p-4 rounded-lg ${
                    result.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={
                          result.success ? 'text-green-800' : 'text-red-800'
                        }
                      >
                        {result.message}
                      </p>
                      {!result.success && result.details && (
                        <p className="mt-2 text-sm text-red-700 font-mono break-all">
                          {result.details}
                        </p>
                      )}
                      {!result.success && (result.message?.toLowerCase().includes('timeout') || result.details?.toLowerCase().includes('timeout')) && (
                        <p className="mt-2 text-sm text-amber-800 bg-amber-50 rounded p-2 space-y-1">
                          <strong>Connection timeout – ne yapılabilir?</strong>
                          <br />• Sunucudan da timeout alıyorsanız sunucu, mail.alo17.tr:587’ye ulaşamıyor demektir. SSH ile sunucuya bağlanıp: <code className="bg-amber-100 px-1 rounded">bash scripts/check-smtp-from-server.sh</code> çalıştırın (587 ve 465 test edilir); port açıksa sorun SMTP ayarlarında, kapalıysa firewall veya hosting giden 587’yi kapatıyor olabilir.
                          <br />• <strong>Port 465</strong> deneyin: sunucu .env içinde <code className="bg-amber-100 px-1 rounded">SMTP_PORT=465</code> ve <code className="bg-amber-100 px-1 rounded">SMTP_SECURE=true</code> yapın, build + pm2 restart.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Gönder Butonu */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Email Gönder
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bilgilendirme */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Bilgilendirme</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Email gönderme işlemi SMTP ayarlarını kullanır</li>
              <li>SMTP ayarları yapılandırılmamışsa email simüle edilir</li>
              <li>Test email'leri [TEST] öneki ile gönderilir</li>
              <li>Email gönderme hatası olsa bile form gönderilir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
