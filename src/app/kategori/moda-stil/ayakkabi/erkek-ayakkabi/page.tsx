"use client"

import Link from 'next/link'

export default function ErkekAyakkabiPage() {
  return (
    <div className="container mx-auto py-8">
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/kategori/moda-stil/ayakkabi" className="text-gray-700 hover:text-blue-600">
                Ayakkabı
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">Erkek Ayakkabı</span>
            </div>
          </li>
        </ol>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Erkek Ayakkabı</h1>
      <p className="text-gray-600">Erkek ayakkabı kategorisindeki ürünler burada listelenecek.</p>
    </div>
  )
} 
