'use client';

import Cropper from 'react-easy-crop';
import { useState, useCallback, useEffect } from 'react';
import { getCroppedImg } from '@/lib/cropUtils';

interface InlineCropperProps {
  imageUrl: string;
  aspectRatio: number;
  onCropComplete: (blob: Blob) => void;
  className?: string;
}

export default function InlineCropper({
  imageUrl,
  aspectRatio,
  onCropComplete,
  className
}: InlineCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCroppedUrl, setLastCroppedUrl] = useState<string | null>(null);
  const [savedCrop, setSavedCrop] = useState<{ x: number; y: number } | null>(null);

  const handleCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels || !imageUrl) return;

    if (imageUrl === lastCroppedUrl) return;

    const blob = await getCroppedImg(imageUrl, croppedAreaPixels);
    onCropComplete(blob);
    setLastCroppedUrl(imageUrl);
    setSavedCrop(crop); // Save the current crop state

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  useEffect(() => {
    setZoom(1);
    setCrop(savedCrop || { x: 0, y: 0 }); // Restore saved crop position if available
    setLastCroppedUrl(null);
  }, [imageUrl]);

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={aspectRatio}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
        cropShape="rect"
        showGrid={false}
        objectFit="cover"
      />

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/60 px-3 py-1 rounded-full text-white text-sm">
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-24"
        />
        <button
          onClick={handleSaveCrop}
          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md font-semibold"
        >
          Save Crop
        </button>
        {showSuccess && <span className="ml-2 text-green-400">✓ Cropped</span>}
      </div>
    </div>
  );
}
