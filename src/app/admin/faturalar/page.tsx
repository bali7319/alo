'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Download, Mail, Eye, Search, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  listingId: string | null;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  planType: string | null;
  planName: string | null;
  status: string;
  paymentMethod: string | null;
  paymentDate: Date | null;
  billingName: string;
  billingEmail: string;
  billingPhone: string | null;
  billingAddress: string | null;
  billingTaxId: string | null;
  emailSent: boolean;
  emailSentAt: Date | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function FaturalarPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, filterStatus, searchTerm, startDate, endDate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: filterStatus,
        search: searchTerm,
      });

      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/admin/invoices?${params}`);
      if (!response.ok) {
        throw new Error('Faturalar yüklenemedi');
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Fatura yükleme hatası:', error);
      alert('Faturalar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXML = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/xml`);
      if (!response.ok) throw new Error('XML indirilemedi');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatura-${invoiceId}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('XML indirme hatası:', error);
      alert('XML dosyası indirilemedi');
    }
  };

  const handleDownloadExcel = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/excel`);
      if (!response.ok) throw new Error('Excel indirilemedi');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatura-${invoiceId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      alert('Excel dosyası indirilemedi');
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    if (!confirm('Fatura e-postası gönderilsin mi?')) return;

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/send-email`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('E-posta gönderilemedi');
      
      alert('Fatura e-postası başarıyla gönderildi');
      fetchInvoices(); // Listeyi yenile
    } catch (error) {
      console.error('E-posta gönderme hatası:', error);
      alert('E-posta gönderilemedi');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      pending: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Ödendi', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal', className: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const handleBulkDownloadHTML = async () => {
    if (selectedInvoices.length === 0) {
      alert('Lütfen en az bir fatura seçin');
      return;
    }

    try {
      const response = await fetch('/api/admin/invoices/bulk-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceIds: selectedInvoices }),
      });

      if (!response.ok) {
        throw new Error('HTML indirilemedi');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faturalar-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSelectedInvoices([]);
    } catch (error) {
      console.error('Toplu HTML indirme hatası:', error);
      alert('HTML dosyası indirilemedi');
    }
  };

  const handleBulkDownloadExcel = async () => {
    if (selectedInvoices.length === 0) {
      alert('Lütfen en az bir fatura seçin');
      return;
    }

    try {
      const response = await fetch('/api/admin/invoices/bulk-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceIds: selectedInvoices }),
      });

      if (!response.ok) {
        throw new Error('Excel indirilemedi');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faturalar-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSelectedInvoices([]);
    } catch (error) {
      console.error('Toplu Excel indirme hatası:', error);
      alert('Excel dosyası indirilemedi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faturalar</h1>
          <p className="text-gray-600 mt-1">Tüm faturaları görüntüleyin ve yönetin</p>
        </div>
        {selectedInvoices.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleBulkDownloadHTML}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              HTML İndir ({selectedInvoices.length})
            </button>
            <button
              onClick={handleBulkDownloadExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Excel İndir ({selectedInvoices.length})
            </button>
          </div>
        )}
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Fatura no, müşteri adı veya e-posta ara..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="paid">Ödendi</option>
            <option value="cancelled">İptal</option>
          </select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              placeholder="Başlangıç Tarihi"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              placeholder="Bitiş Tarihi"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            {(startDate || endDate) && (
              <>
                <button
                  onClick={() => {
                    // Tarih aralığındaki tüm faturaları seç
                    const filteredInvoices = invoices.filter((inv: Invoice) => {
                      const invDate = new Date(inv.createdAt);
                      if (startDate && invDate < new Date(startDate)) return false;
                      if (endDate) {
                        const endDateTime = new Date(endDate);
                        endDateTime.setHours(23, 59, 59, 999);
                        if (invDate > endDateTime) return false;
                      }
                      return true;
                    });
                    setSelectedInvoices(filteredInvoices.map((inv: Invoice) => inv.id));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Filtrelenmiş Faturaları Seç
                </button>
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                >
                  Tarih Filtresini Temizle
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Faturalar Tablosu */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Faturalar yükleniyor...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Fatura bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices(invoices.map((inv: Invoice) => inv.id));
                          } else {
                            setSelectedInvoices([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fatura No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KDV Hariç
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KDV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam
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
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices([...selectedInvoices, invoice.id]);
                            } else {
                              setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.billingName}</div>
                        <div className="text-sm text-gray-500">{invoice.billingEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {invoice.planName || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(invoice.taxAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(invoice.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/faturalar/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Detay"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDownloadXML(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                            title="XML İndir"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadExcel(invoice.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Excel İndir"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleSendEmail(invoice.id)}
                            className={`${invoice.emailSent ? 'text-gray-400' : 'text-orange-600 hover:text-orange-900'}`}
                            title={invoice.emailSent ? 'E-posta gönderildi' : 'E-posta Gönder'}
                            disabled={invoice.emailSent}
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Sayfa {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

