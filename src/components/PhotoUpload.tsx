'use client';

import { useState, useMemo } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import InlineCropper from './InlineCropper';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { POST_SIZE_MAP } from '@/utils/LayoutEngine'; // ✅ NEW IMPORT

interface PhotoUploadProps {
  onPostCreated: (newPost: any) => void;
  onDone: () => void;
  setUploadProgress: (percent: number) => void;
}

export default function PhotoUpload({ onPostCreated, onDone, setUploadProgress }: PhotoUploadProps) {
  const [step, setStep] = useState(1);
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [originalImages, setOriginalImages] = useState<File[]>([]);
  const [croppedImages, setCroppedImages] = useState<File[]>([]);
  const [displaySize, setDisplaySize] = useState<'small' | 'medium' | 'large'>('medium');
  const [suggestionText, setSuggestionText] = useState('');
  const [rerollUsed, setRerollUsed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const isPremium = false;

  const stableImageUrls = useMemo(() => {
    return images.map((file) => URL.createObjectURL(file));
  }, [images]);

  const previewUrls = useMemo(() => {
    return images.map((file, i) =>
      croppedImages[i] ? URL.createObjectURL(croppedImages[i]) : URL.createObjectURL(file)
    );
  }, [images, croppedImages]);

  const getRandomDisplaySize = (): 'small' | 'medium' | 'large' => {
    const sizes = ['small', 'medium', 'large'] as const;
    const index = Math.floor(Math.random() * sizes.length);
    return sizes[index];
  };

  const autoDetectSize = () => {
    if (!isPremium) {
      const randomSize = getRandomDisplaySize();
      setDisplaySize(randomSize);
      setSuggestionText(`Random size: ${randomSize.toUpperCase()}`);
      setRerollUsed(false);
    }
  };

  const handleReroll = () => {
    if (isPremium || rerollUsed) return;
    const newSize = getRandomDisplaySize();
    setDisplaySize(newSize);
    setSuggestionText(`New roll: ${newSize.toUpperCase()}`);
    setRerollUsed(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setImages(fileArray);
      setOriginalImages(fileArray);
      setCroppedImages([]);
      autoDetectSize();
      setStep(2);
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    const newFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const updated = [...croppedImages];
    updated[activeIndex] = newFile;
    setCroppedImages(updated);
  };

  const handleSubmit = async () => {
    const filesToUpload = croppedImages.length > 0 ? croppedImages : images;
    const originalsToUpload = originalImages;

    if (!auth.currentUser || filesToUpload.length === 0) return;

    onDone();
    setUploadProgress(1);

    try {
      const croppedUrls = await Promise.all(
        filesToUpload.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const storageRef = ref(storage, `photos/${uuidv4()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setUploadProgress(percent);
              },
              reject,
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              }
            );
          });
        })
      );

      const originalUrls = await Promise.all(
        originalsToUpload.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const storageRef = ref(storage, `photos/originals/${uuidv4()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed', () => {}, reject, async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            });
          });
        })
      );

      const newPost = {
        type: 'photo',
        authorId: auth.currentUser.uid,
        content: {
          caption,
          description,
          location,
          imageUrls: croppedUrls,
          originalUrls: originalUrls,
          displaySize,
          meta: {}
        },
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        isPremiumUser: isPremium
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);
      onPostCreated({ id: docRef.id, ...newPost });
      setUploadProgress(0);
      setCaption('');
      setDescription('');
      setLocation('');
      setImages([]);
      setOriginalImages([]);
      setCroppedImages([]);
      setSuggestionText('');
      setStep(1);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  // ✅ Dynamically calculate crop aspect ratio based on grid layout shape
  const aspectRatio =
    POST_SIZE_MAP.photo[displaySize].w / POST_SIZE_MAP.photo[displaySize].h;

  return (
    <div className="space-y-4 text-white">
      {step === 1 && (
        <div className="flex flex-col items-center justify-center h-80 bg-[#1D5136] rounded-xl border border-white/10 hover:bg-[#2b7050] transition-all text-center p-6 relative">
          <img src="/earthy-icon.png" alt="Earthy" width={160} height={160} className="mb-2 animate-bounce" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-semibold bg-white text-black px-4 py-2 rounded-full border border-gray-300 shadow animate-fadeIn">
            Click or drop files to upload
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative min-h-[460px]">
            <InlineCropper
              imageUrl={stableImageUrls[activeIndex]}
              aspectRatio={aspectRatio}
              onCropComplete={handleCropComplete}
              className="rounded-xl border border-white/20 overflow-hidden"
            />

            {activeIndex > 0 && (
              <button
                onClick={() => setActiveIndex((prev) => prev - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {activeIndex < images.length - 1 && (
              <button
                onClick={() => setActiveIndex((prev) => prev + 1)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="text-white font-semibold text-sm mb-1 block">Caption</label>
              <textarea
                maxLength={300}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-white text-black border border-gray-400 rounded-md p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-white font-semibold text-sm mb-1 block">Description</label>
              <textarea
                maxLength={2200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white text-black border border-gray-400 rounded-md p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-white font-semibold text-sm mb-1 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white text-black border border-gray-400 rounded-md p-3 text-sm"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white font-semibold"
            >
              Post Photo
            </button>

            <div className="mt-2 bg-[#1b1b1b] rounded-md px-4 py-2 text-sm border border-white/10 flex justify-between items-center">
              <span>{suggestionText}</span>
              {!rerollUsed && (
                <button
                  onClick={handleReroll}
                  className="text-xs px-3 py-1 rounded-md bg-white/10 border border-white hover:bg-white/20"
                >
                  Reroll Size
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
