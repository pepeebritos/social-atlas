
'use client';

import Cropper from 'react-easy-crop';
import { useState, useCallback } from 'react';
import { getCroppedImg } from '@/lib/cropUtils';
import { Dialog } from '@headlessui/react';

interface CropModalProps {
  imageUrl: string;
  aspectRatio: number;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  isOpen: boolean;
}

export default function CropModal({
  imageUrl,
  aspectRatio,
  isOpen,
  onClose,
  onCropComplete
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
    onCropComplete(croppedBlob);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="bg-[#1e1e1e] p-4 rounded-md shadow-lg max-w-lg w-full relative">
        <div className="relative w-full h-[400px] bg-black">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full mr-4"
          />
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            Save Crop
          </button>
        </div>
      </div>
    </Dialog>
  );
}
