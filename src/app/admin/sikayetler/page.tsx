"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createSlug } from '@/lib/slug';
import { isAdmin } from '@/lib/admin-client';

interface Report {
  id: string;
  listing: { id: string; title: string };
  reporter: { id: string; name: string | null; email: string };
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
}

export default function SikayetlerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      router.push("/giris");
      return;
    }
    // Admin kontrolü
    if (!isAdmin(session)) {
      router.push("/");
      return;
    }
    fetchReports();
    // eslint-disable-next-line
  }, [session, status]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      // hata
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Şikayetler (Usulsüzlük Bildirimleri)</h1>
        {reports.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-gray-600">Hiç şikayet yok.</div>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">İlan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Şikayetçi</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sebep</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">
                      <a href={`/ilan/${createSlug(r.listing.title)}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {r.listing.title}
                      </a>
                    </td>
                    <td className="px-4 py-2">{r.reporter.name || r.reporter.email}</td>
                    <td className="px-4 py-2">{r.reason}</td>
                    <td className="px-4 py-2">{r.description || '-'}</td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2">{new Date(r.createdAt).toLocaleString('tr-TR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
