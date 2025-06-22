'use client';

import Link from 'next/link';

const Navbar = () => {
  return (
    <div className="flex items-center justify-between p-4">
      <Link href="/" className="flex items-center">
        <span className="text-2xl font-bold text-blue-600">alo17.tr</span>
      </Link>
    </div>
  );
};

export default Navbar;
