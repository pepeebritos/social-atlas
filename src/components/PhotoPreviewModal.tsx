'use client';

import { Dialog } from '@headlessui/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

type Props = {
  photos: string[];         // cropped preview images
  originals: string[];      // full-size originals
};

export default function PhotoPreviewModal({ photos, originals }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleOpen = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const visiblePhotos = photos.slice(0, 4);
  const extraCount = photos.length - 4;

  return (
    <>
      {/* Grid preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl overflow-hidden">
        {visiblePhotos.map((url, i) => (
          <div
            key={i}
            className="relative cursor-pointer"
            onClick={() => handleOpen(i)}
          >
            <Image
              src={url}
              alt={`Preview ${i}`}
              width={200}
              height={200}
              className="w-full h-32 object-cover rounded-md"
            />
            {i === 3 && extraCount > 0 && (
              <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-lg font-semibold rounded-md">
                +{extraCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen modal viewer */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <Dialog.Panel className="relative max-w-6xl w-full max-h-[90vh]">
            <button
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full z-10"
              onClick={() => setIsOpen(false)}
            >
              <X size={24} />
            </button>

            <div className="relative">
              <Image
                src={originals[activeIndex] || photos[activeIndex]}
                alt={`Image ${activeIndex}`}
                width={1200}
                height={800}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
              {activeIndex > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                  onClick={() => setActiveIndex((prev) => prev - 1)}
                >
                  <ChevronLeft size={28} className="text-white" />
                </button>
              )}
              {activeIndex < photos.length - 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                  onClick={() => setActiveIndex((prev) => prev + 1)}
                >
                  <ChevronRight size={28} className="text-white" />
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
