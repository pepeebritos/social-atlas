'use client';

import { FC, useEffect } from 'react';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  geojson: any;
}

const RouteMapModal: FC<RouteMapModalProps> = ({ isOpen, onClose, geojson }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !geojson) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-90 flex items-center justify-center">
      <button
        className="absolute top-6 right-6 text-white hover:text-red-400"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      <div className="w-full h-full max-w-[95vw] max-h-[90vh] rounded-xl overflow-hidden shadow-2xl">
        <Map geojsonData={[geojson]} focus="route" />
      </div>
    </div>
  );
};

export default RouteMapModal;
