'use client';

import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <div className="flex items-center justify-between p-4">
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <div className="relative h-10 w-10 flex-shrink-0">
          <Image 
            src="/images/logo-a17.svg" 
            alt="Alo17 Logo" 
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <span className="text-2xl font-bold text-blue-600">alo17.tr</span>
      </Link>
    </div>
  );
};

export default Navbar;
