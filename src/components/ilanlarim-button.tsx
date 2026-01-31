'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export default function IlanlarimButton() {
  const { data: session, status } = useSession()

  // Sadece giriş yapılmış kullanıcılar için göster
  if (status === 'loading' || !session) {
    return null
  }

  return (
    <div className="mb-4">
      <Button
        asChild
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
        size="lg"
      >
        <Link href="/ilanlarim" className="block">
          <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          İlanlarım
        </Link>
      </Button>
    </div>
  )
}
