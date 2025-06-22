"use client"
import Link from 'next/link'
export default function GuvenlikPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Güvenlik</h1>
      <p className="mb-4">Güvenlik hizmetleriyle ilgili ilanlar burada listelenir.</p>
      <Link href="/kategori/is" className="text-blue-600 hover:underline">İş Kategorisine Dön</Link>
    </div>
  )
} 
