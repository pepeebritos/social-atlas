'use client';

import { Dialog } from '@headlessui/react';
import Image from 'next/image';

interface ExpandedWriteModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpandedWriteModal({ post, isOpen, onClose }: ExpandedWriteModalProps) {
  if (!isOpen || !post) return null;

  const content = post.content || post;
  const title = content.title || post.title;
  const coverImageUrl = content.coverImageUrl;
  const body = content.body;
  const pdfUrl = content.pdfUrl;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl max-h-[90vh] bg-[#FDFBF5] text-black rounded-xl shadow-xl overflow-hidden">
          <div className="flex flex-col gap-6 p-6 overflow-y-auto max-h-[90vh] relative">

            {/* Author Info - Top Left */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {post.authorProfilePic && (
                <Image
                  src={post.authorProfilePic}
                  alt="Author"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-md object-cover border"
                />
              )}
              <div className="text-sm font-medium text-neutral-700">
                {post.authorName || 'Unknown'}
              </div>
            </div>

            {/* Close Button - Top Right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-sm bg-black/10 hover:bg-black/20 text-black rounded-full px-3 py-1"
            >
              ✕
            </button>

            {/* Title */}
            {title && (
              <h1 className="text-xl font-bold text-[#1D5136] mt-12">{title}</h1>
            )}

            {/* Cover Image */}
            {coverImageUrl && (
              <div className="w-full rounded-md overflow-hidden">
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  width={1200}
                  height={600}
                  className="object-cover w-full h-auto rounded-md"
                />
              </div>
            )}

            {/* Body Text */}
            {body && (
              <div className="whitespace-pre-wrap text-sm text-neutral-800 leading-relaxed">
                {body}
              </div>
            )}

            {/* PDF Preview */}
            {pdfUrl && (
              <div className="mt-4">
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  className="w-full h-[400px] border rounded"
                />
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
