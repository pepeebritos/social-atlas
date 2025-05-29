// Sidebar.tsx (Polished Layout with Square Avatar)
import { Home, Map, Compass, Bell, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function Sidebar({ onCreatePost, userPhoto }: { onCreatePost: () => void, userPhoto: string }) {
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
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${
        pathname === href ? 'bg-green-700 text-white' : 'hover:bg-green-600/20 hover:translate-x-1'
      }`}
    >
      {icon} {label}
    </Link>
  );

  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-[#143F2B] text-white flex flex-col justify-start p-4 sticky top-0 left-0 z-10">
      {/* Logo + Title */}
      <div className="flex flex-col items-center">
        <motion.div
          className="w-[10rem] mb-0"
          animate={{ rotate: earthyIdle ? 360 : 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <Image src="/earthy-icon.png" alt="Earthy" width={160} height={160} />
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight text-center leading-none text-white">
          Social Atlas
        </h1>
        <div className="w-10/12 border-t border-black mt-2" style={{ borderWidth: '1px' }}></div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col items-center w-full gap-0 mt-4">
        <div className="flex flex-col gap-1 w-full px-2">
          {navLink('/', <Home className="w-5 h-5" />, 'Home')}
          {navLink('/map', <Map className="w-5 h-5" />, 'Map')}
          {navLink('/explore', <Compass className="w-5 h-5" />, 'Explore')}
          {navLink('/notifications', <Bell className="w-5 h-5" />, 'Notifications')}
          {navLink(
            '/profile',
            <Image
              src={userPhoto || '/default-avatar.png'}
              alt="Profile"
              width={32}
              height={32}
              className="object-cover w-8 h-8 border-2 border-white rounded-md"
            />,
            'Profile')}
        </div>

        {/* Divider */}
        <div className="w-10/12 border-t border-black mt-4" style={{ borderWidth: '1px' }}></div>

        {/* Create Post */}
        <div className="w-full px-2 mt-3">
          <button
            onClick={onCreatePost}
            className="bg-green-500 w-full text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Create Post
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full px-2 mt-3">
          <div className="flex items-center bg-white rounded-xl px-3 py-2">
            <Search className="text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 w-full text-sm text-black placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
