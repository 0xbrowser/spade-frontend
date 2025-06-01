'use client'

import { Header } from '@/components/Header'
import { DataDetailsContent } from './DataDetailsContent'

export const PoolDetails = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <DataDetailsContent />
      </main>
    </div>
  )
}
