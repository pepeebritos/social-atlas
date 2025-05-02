// NOTE: Same imports as before
'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import {
  X, ArrowLeft, ImageIcon, Video, Map, FileText, Package, Star
} from 'lucide-react';
import MentionInput from './MentionInput';
import { auth } from '@/lib/firebase';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const postTypes = [
  { label: 'Photo', icon: ImageIcon },
  { label: 'Video', icon: Video },
  { label: 'Route', icon: Map },
  { label: 'Article / Journal', icon: FileText },
  { label: 'Gear List', icon: Package },
  { label: 'Review', icon: Star },
];

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [subType, setSubType] = useState<string | null>(null);

  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [gpxFileName, setGpxFileName] = useState('');
  const [articleText, setArticleText] = useState('');
  const [reviewItem, setReviewItem] = useState('');
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleBack = () => {
    if (subType) {
      setSubType(null);
    } else {
      setSelectedType(null);
    }
    setCaption('');
    setImageUrl('');
    setGpxFileName('');
    setArticleText('');
    setReviewItem('');
    setReviewStars(0);
    setReviewText('');
  };

  const fakeSubmit = () => {
    console.log('📤 SUBMITTING POST:', {
      selectedType,
      subType,
      caption,
      imageUrl,
      gpxFileName,
      articleText,
      reviewItem,
      reviewStars,
      reviewText,
    });
    handleBack();
    onClose();
  };

  const renderSubTypeOptions = (label: string, options: string[]) => (
    <>
      <Dialog.Title className="text-lg font-semibold mb-4 text-center">
        Select {label} Type
      </Dialog.Title>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setSubType(opt)}
            className="flex flex-col items-center justify-center p-4 bg-[#1e1e1e] rounded-xl hover:bg-[#3a3a3a] transition"
          >
            <span className="text-xl mb-1">{opt.includes('Moment') ? '🎞️' : opt.includes('Full') ? '🎬' : opt.includes('Multi') ? '🖼️' : opt.includes('Draw') ? '🖊️' : opt.includes('Upload') ? '📂' : '✏️'}</span>
            <span className="text-sm text-center">{opt}</span>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-[#2e2e2e] p-6 shadow-xl text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X />
          </button>

          {/* Subtype Pickers */}
          {(selectedType && !subType && ['Photo', 'Video', 'Route', 'Article / Journal'].includes(selectedType)) ? (
            <>
              <button onClick={handleBack} className="flex items-center text-sm text-gray-400 hover:text-white mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              {selectedType === 'Photo' && renderSubTypeOptions('Photo', ['📷 Single Photo', '🖼️ Multi Photo'])}
              {selectedType === 'Video' && renderSubTypeOptions('Video', ['🎞️ Moment Clip', '🎬 Full Story'])}
              {selectedType === 'Route' && renderSubTypeOptions('Route', ['📂 Upload GPX', '🖊️ Draw Your Own'])}
              {selectedType === 'Article / Journal' && renderSubTypeOptions('Journal', ['✏️ Write In-App', '📂 Upload PDF'])}
            </>
          ) : selectedType ? (
            <>
              <button onClick={handleBack} className="flex items-center text-sm text-gray-400 hover:text-white mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>

              {/* ... All previous content blocks (Photo, Video, Route, Article, Review) ... */}

              {/* GEAR LIST */}
              {selectedType === 'Gear List' && (
                <>
                  <Dialog.Title className="text-lg font-semibold mb-4 text-center">🎒 Create a Gear List</Dialog.Title>
                  <p className="text-sm text-gray-400 mb-4 text-center">
                    We’ll build a full drag-and-drop LighterPack-style editor soon. For now, just add some text!
                  </p>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="List gear items, weights, links, etc..."
                    className="w-full h-40 p-3 rounded bg-[#1e1e1e] border border-gray-600 text-white mb-4"
                  />
                  <button
                    onClick={fakeSubmit}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded w-full"
                  >
                    Post
                  </button>
                </>
              )}

              {/* REVIEW */}
              {selectedType === 'Review' && (
                <>
                  <Dialog.Title className="text-lg font-semibold mb-4 text-center">🌟 Write a Review</Dialog.Title>
                  <input
                    type="text"
                    value={reviewItem}
                    onChange={(e) => setReviewItem(e.target.value)}
                    placeholder="What are you reviewing?"
                    className="w-full mb-3 px-3 py-2 rounded bg-[#1e1e1e] border border-gray-600 text-white"
                  />
                  <div className="flex gap-1 mb-3 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setReviewStars(star)}
                        className={`cursor-pointer text-xl ${reviewStars >= star ? 'text-yellow-400' : 'text-gray-500'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your thoughts..."
                    className="w-full h-24 p-3 rounded bg-[#1e1e1e] border border-gray-600 text-white mb-4"
                  />
                  <button
                    onClick={fakeSubmit}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded w-full"
                  >
                    Post
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <Dialog.Title className="text-xl font-semibold mb-6 text-center">
                What do you want to post?
              </Dialog.Title>
              <div className="grid grid-cols-2 gap-4">
                {postTypes.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setSelectedType(label)}
                    className="flex flex-col items-center justify-center p-4 bg-[#1e1e1e] rounded-xl hover:bg-[#3a3a3a] transition"
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{label}</span>
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
