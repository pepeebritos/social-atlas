'use client';

import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface EditCaptionModalProps {
  postId: string;
  initialCaption: string;
  isOpen: boolean;
  onClose: () => void;
  postType: 'photo' | 'route' | string;
  onCaptionSave: (newCaption: string) => void;
}

export default function EditCaptionModal({
  postId,
  initialCaption,
  isOpen,
  onClose,
  postType,
  onCaptionSave
}: EditCaptionModalProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!caption.trim()) return;
    setSaving(true);
    try {
      const ref = doc(db, 'posts', postId);
      const fieldToUpdate = postType === 'route' ? 'content.description' : 'content.caption';
      await updateDoc(ref, {
        [fieldToUpdate]: caption.trim(),
      });
      onCaptionSave(caption.trim());
      onClose();
    } catch (error) {
      console.error('Error updating caption:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />
        <div className="relative bg-[#1D5136] text-black rounded-xl shadow-xl p-6 w-full max-w-md z-50">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>

          <Dialog.Title className="text-lg font-semibold mb-4 text-white">
            {postType === 'route' ? 'Edit Description' : 'Edit Caption'}
          </Dialog.Title>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full h-32 p-2 border border-white/30 rounded-md resize-none bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-beige"
            placeholder={postType === 'route' ? 'Update your trail description...' : 'Update your caption...'}
          />

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md bg-white text-black hover:bg-neutral-200"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-md bg-beige text-black hover:bg-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
