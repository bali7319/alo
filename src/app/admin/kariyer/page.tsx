'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Mail, Phone, Briefcase, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface CareerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string | null;
  education: string | null;
  coverLetter: string;
  resume: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminKariyerPage() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [status]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/career');
      const data = await response.json();
      
      if (response.ok) {
        let filtered = data.applications;
        if (status !== 'all') {
          filtered = filtered.filter((app: CareerApplication) => app.status === status);
        }
        setApplications(filtered);
      } else {
        console.error('Hata:', data.error);
      }
    } catch (error) {
      console.error('API hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: CareerApplication) => {
    setSelectedApplication(application);
    setAdminNotes(application.adminNotes || '');
    setNewStatus(application.status);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`/api/career/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Başvuruları yeniden yükle
        fetchApplications();
        setShowModal(false);
        setSelectedApplication(null);
      } else {
        console.error('Hata:', data.error);
        alert('Durum güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('API hatası:', error);
      alert('Durum güncellenirken bir hata oluştu');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Beklemede
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            İncelendi
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Kabul Edildi
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Reddedildi
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kariyer Başvuruları</h1>
      
      {/* Filtreler */}
      <div className="mb-4 flex gap-2">
        <Button 
          variant={status === 'all' ? 'default' : 'outline'}
          onClick={() => setStatus('all')}
        >
          Tümü ({applications.length})
        </Button>
        <Button 
          variant={status === 'pending' ? 'default' : 'outline'}
          onClick={() => setStatus('pending')}
        >
          Beklemede
        </Button>
        <Button 
          variant={status === 'reviewed' ? 'default' : 'outline'}
          onClick={() => setStatus('reviewed')}
        >
          İncelendi
        </Button>
        <Button 
          variant={status === 'accepted' ? 'default' : 'outline'}
          onClick={() => setStatus('accepted')}
        >
          Kabul Edildi
        </Button>
        <Button 
          variant={status === 'rejected' ? 'default' : 'outline'}
          onClick={() => setStatus('rejected')}
        >
          Reddedildi
        </Button>
      </div>

      {/* Başvurular Tablosu */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad Soyad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pozisyon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Henüz başvuru bulunmamaktadır.
                </td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {application.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {application.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {application.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(application.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplication(application)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Görüntüle
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Başvuru Detayları */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Başvuru Detayları</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Kişisel Bilgiler */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                    <p className="text-gray-900">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <p className="text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
                    <p className="text-gray-900">{selectedApplication.position}</p>
                  </div>
                </div>

                {/* Deneyim */}
                {selectedApplication.experience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İş Deneyimi</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.experience}</p>
                  </div>
                )}

                {/* Eğitim */}
                {selectedApplication.education && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eğitim Bilgisi</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.education}</p>
                  </div>
                )}

                {/* Ön Yazı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ön Yazı</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>

                {/* CV */}
                {selectedApplication.resume && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CV</label>
                    <a
                      href={selectedApplication.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      CV'yi Görüntüle
                    </a>
                  </div>
                )}

                {/* Durum Güncelleme */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="reviewed">İncelendi</option>
                    <option value="accepted">Kabul Edildi</option>
                    <option value="rejected">Reddedildi</option>
                  </select>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notları</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Admin notları buraya yazılabilir..."
                  />
                </div>

                {/* Butonlar */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdateStatus} className="flex-1">
                    Durumu Güncelle
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Kapat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

