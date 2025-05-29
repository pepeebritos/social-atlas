
'use client';

import { SlidersHorizontal } from 'lucide-react';

export default function FloatingFilterButton({
  onClick
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="fixed top-28 right-6 z-40 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 shadow-lg rounded-full p-3 transition-all"
      title="Filter Feed"
    >
      <SlidersHorizontal className="w-5 h-5" />
    </button>
  );
}
