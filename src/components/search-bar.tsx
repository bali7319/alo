'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SearchBar() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) return

    const params = new URLSearchParams()
    if (searchTerm.trim()) params.append('search', searchTerm.trim())
    
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form 
        onSubmit={handleSearch} 
        className="flex flex-col sm:flex-row gap-4"
        role="search"
        aria-label="İlan ara"
      >
        {/* Arama Kutusu */}
        <div className="flex-1 relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none transition-colors duration-200" 
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Ne arıyorsunuz? (örn: iPhone, araba, ev eşyası...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
            aria-label="Arama terimi"
            aria-describedby="search-description"
          />
          <span id="search-description" className="sr-only">
            İlan aramak için bir terim girin
          </span>
        </div>

        {/* Arama Butonu */}
        <Button
          type="submit"
          variant="default"
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium"
          aria-label="Ara"
        >
          <Search className="h-4 w-4 mr-2 sm:hidden" />
          <span className="hidden sm:inline">Ara</span>
        </Button>
      </form>
    </div>
  )
} 
