
'use client';

import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { parseMentions } from '@/lib/parseMentions';

const Map = dynamic(() => import('./Map'), { ssr: false });

interface ExpandedPostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpandedPostModal({ post, isOpen, onClose }: ExpandedPostModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const content = post.content || {};
  const imageUrls = content.originalUrls || content.imageUrls || post.imageUrls || [];
  const isMulti = post.type === 'photo' && imageUrls.length > 1;

  const geojson = useMemo(() => {
    if (post.type === 'route' && content.routeGeoJSON) {
      try {
        return JSON.parse(content.routeGeoJSON);
      } catch {
        return null;
      }
    }
    return null;
  }, [post.type, content.routeGeoJSON]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-5xl bg-[#1e1e1e] text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row w-full h-full">
            {/* Media Section */}
            <div className="md:w-2/3 w-full bg-black relative max-h-[600px]">
              {isMulti ? (
                <div className="relative h-full w-full flex items-center justify-center">
                  <img
                    src={imageUrls[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="object-contain w-full max-h-[600px] rounded-none"
                  />
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full"
                    onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev < imageUrls.length - 1 ? prev + 1 : prev
                      )
                    }
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                  <div className="absolute bottom-2 right-3 text-sm text-white bg-black/50 px-2 py-1 rounded-full">
                    {currentIndex + 1}/{imageUrls.length}
                  </div>
                </div>
              ) : post.type === 'route' && geojson ? (
                <div className="h-[500px] border-r border-zinc-800">
                  <Map geojsonData={[geojson]} focus="route" />
                </div>
              ) : imageUrls.length === 1 ? (
                <img
                  src={imageUrls[0]}
                  alt="Expanded"
                  className="object-contain w-full max-h-[600px]"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No media available
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white bg-black/60 hover:bg-black/80 p-2 rounded-full"
              >
                <X />
              </button>
            </div>

            {/* Info Section */}
            <div className="md:w-1/3 w-full flex flex-col p-6 space-y-4 overflow-y-auto max-h-[600px]">
              {/* Author */}
              <div className="flex items-center gap-3">
                <Image
                  src={post.authorProfilePic || '/default-avatar.png'}
                  alt="Author"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover rounded-md border border-gray-400"
                />
                <div className="text-sm font-semibold">{post.authorName || 'Unknown'}</div>
              </div>

              {/* Caption + Metadata */}
              {content.caption && (
                <div className="text-sm text-gray-300">{parseMentions(content.caption)}</div>
              )}
              {post.title && (
                <div className="text-lg font-bold text-white">{post.title}</div>
              )}
              {content.description && (
                <div className="text-sm text-gray-300">{parseMentions(content.description)}</div>
              )}
              {content.location && (
                <div className="text-xs text-gray-400">📍 {content.location}</div>
              )}

              {/* Likes / Comments Placeholder */}
              <div className="flex gap-4 text-sm text-gray-400 pt-2 border-t border-zinc-700">
                <span>❤️ {post.likes?.length || 0} likes</span>
                <span>💬 {post.comments?.length || 0} comments</span>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
