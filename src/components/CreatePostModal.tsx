'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import {
  X, ArrowLeft, ImageIcon, Video, Map, FileText, Package, Star
} from 'lucide-react';
import dynamic from 'next/dynamic';
import PhotoUpload from './PhotoUpload';
import CreateRoutePostForm from './CreateRoutePostForm';

// ✅ Lazy load the write form to prevent plugin conflicts
const CreateWritePostForm = dynamic(() => import('./CreateWritePostForm'), { ssr: false });

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: any) => void;
  initialType?: string;
  setUploadProgress: (percent: number) => void;
}

const postTypes = [
  { label: 'Photo', value: 'photo', icon: ImageIcon },
  { label: 'Video', value: 'video', icon: Video },
  { label: 'Route', value: 'route', icon: Map },
  { label: 'Write', value: 'article', icon: FileText },
  { label: 'Gear List', value: 'gear', icon: Package },
  { label: 'Review', value: 'review', icon: Star },
];

export default function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  initialType,
  setUploadProgress
}: CreatePostModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(initialType?.toLowerCase() || null);
  const [mounted, setMounted] = useState(false);

  const handleBack = () => {
    setSelectedType(null);
  };

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      if (initialType) {
        setSelectedType(initialType.toLowerCase());
      }
    } else {
      // ✨ delay unmount until after fade-out to prevent flicker
      const timeout = setTimeout(() => {
        setMounted(false);
        setSelectedType(null);
      }, 300); // match your modal close animation

      return () => clearTimeout(timeout);
    }
  }, [isOpen, initialType]);

  const isPhoto = selectedType === 'photo';
  const isRoute = selectedType === 'route';
  const isArticle = selectedType === 'article';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-[#1D5136] text-white p-6 shadow-xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X />
          </button>

          {selectedType && (
            <button onClick={handleBack} className="flex items-center text-sm text-white/60 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          )}

          {/* Render only if mounted to prevent plugin overlap */}
          {mounted && isPhoto && (
            <PhotoUpload
              onPostCreated={onPostCreated}
              onDone={onClose}
              setUploadProgress={setUploadProgress}
            />
          )}

          {mounted && isRoute && (
            <CreateRoutePostForm
              onPostCreated={(newPost) => {
                onPostCreated(newPost);
                onClose();
              }}
            />
          )}

          {mounted && isArticle && (
            <CreateWritePostForm
              key="write-form" // ensures editor resets
              onPostCreated={onPostCreated}
              setUploadProgress={setUploadProgress}
              onClose={onClose}
            />
          )}

          {!selectedType && (
            <>
              <Dialog.Title className="text-xl font-semibold mb-6 text-center">
                What do you want to post?
              </Dialog.Title>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {postTypes.map(({ label, value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedType(value)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl hover:scale-105 hover:ring-2 hover:ring-[#FDFBF5] transition-all"
                  >
                    <Icon className="w-6 h-6 mb-2 text-white" />
                    <span className="text-sm text-[#FDFBF5] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
