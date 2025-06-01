import Link from 'next/link'
import Image from 'next/image'

export const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/spade-logo.png"
                alt="DeFi Analytics"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                DeFi Analytics
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 