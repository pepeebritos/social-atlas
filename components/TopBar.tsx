'use client';

import { Home, Map, Compass, Bell, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function TopBar({
  onCreatePost,
  userPhoto
}: {
  onCreatePost: () => void;
  userPhoto: string;
}) {
  const [earthyIdle, setEarthyIdle] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const firstSpin = setTimeout(() => setEarthyIdle(true), 2000);
    const loopSpin = setInterval(() => setEarthyIdle((prev) => !prev), 8000);
    return () => {
      clearTimeout(firstSpin);
      clearInterval(loopSpin);
    };
  }, []);

  const navLink = (href: string, icon: ReactNode, label: string) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-105 ${
        pathname === href
          ? 'bg-green-700 text-white'
          : 'text-white hover:bg-green-600/30'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </Link>
  );

  return (
    <header className="w-full h-[90px] px-6 py-3 flex items-center justify-between bg-[#143F2B] sticky top-0 z-50 shadow-md">
      {/* Left: Earthy Logo and Title */}
      <div className="flex items-center gap-4">
        <motion.div
          className="w-20 h-20"
          animate={{ rotate: earthyIdle ? 360 : 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <Image src="/earthy-icon.png" alt="Earthy" width={80} height={80} />
        </motion.div>
        <h1 className="text-white font-extrabold text-3xl hidden sm:block">
          Social Atlas
        </h1>

        {/* Nav Links (hidden on small screens) */}
        <nav className="hidden md:flex items-center gap-2 ml-4">
          {navLink('/', <Home className="w-5 h-5" />, 'Home')}
          {navLink('/map', <Map className="w-5 h-5" />, 'Map')}
          {navLink('/explore', <Compass className="w-5 h-5" />, 'Explore')}
        </nav>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu (hidden on md+) */}
        <button className="text-white md:hidden">
          <Menu className="w-6 h-6" />
        </button>

        <input
          type="text"
          placeholder="Search Social Atlas..."
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-white w-56 placeholder-gray-500 hidden sm:block"
        />

        <Link href="/notifications" className="text-white hover:text-green-300">
          <Bell className="w-6 h-6" />
        </Link>

        <Link href="/profile">
          <Image
            src={userPhoto || '/default-avatar.png'}
            alt="Profile"
            width={48}
            height={48}
            className="object-cover w-12 h-12 rounded-md border-2 border-white mt-1"
          />
        </Link>
      </div>
    </header>
  );
}
