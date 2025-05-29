'use client';

import { FC, useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrls: string[];
  initialIndex?: number;
}

const ImageViewerModal: FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrls,
  initialIndex = 0
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-90 flex items-center justify-center">
      <button
        className="absolute top-6 right-6 text-white hover:text-red-400"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      <img
        src={imageUrls[initialIndex]}
        alt="Full view"
        className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
      />
    </div>
  );
};

export default ImageViewerModal;
