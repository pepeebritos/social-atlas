'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';
import CommentModal from './CommentModal';
import EditCaptionModal from './EditCaptionModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { parseMentions } from '@/lib/parseMentions';
import dynamic from 'next/dynamic';
import {
  ImageIcon, Video, Map, FileText, Package, Star, Heart, MessageSquare, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';
import ExpandedPostModal from './ExpandedPostModal';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { ClassicArticleCard } from './ClassicArticleCard';
import { SplitArticleCard } from './SplitArticleCard';
import { TimelineJournalCard } from './TimelineJournalCard';
import { POST_SIZE_MAP, GRID_CELL_HEIGHT } from '@/utils/LayoutEngine';
import ExpandedWriteModal from './ExpandedWriteModal';





const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const [userData, setUserData] = useState<{ name: string; profilePic: string } | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isExpandedOpen, setIsExpandedOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const content = post.content || post;
  const initialCaption = post.type === 'route' ? content.description : content.caption;
  const [caption, setCaption] = useState(initialCaption || '');

  const { ref: mapRef, inView: mapInView } = useInView({ triggerOnce: true, rootMargin: '200px' });

  const currentUser = auth.currentUser;
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const imageUrls = content.imageUrls || post.imageUrls || [];
  const isMulti = post.type === 'photo' && Array.isArray(imageUrls) && imageUrls.length > 1;

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

  useEffect(() => {
    const fetchUser = async () => {
      if (!post.authorId) return;
      try {
        const userRef = doc(db, 'users', post.authorId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData({
            name: data.name || 'Unknown',
            profilePic: data.profilePic || '/default-avatar.png',
          });
        } else {
          setUserData({ name: 'Unknown', profilePic: '/default-avatar.png' });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({ name: 'Unknown', profilePic: '/default-avatar.png' });
      }
    };
    fetchUser();
  }, [post.authorId]);

  useEffect(() => {
    if (currentUser?.uid) {
      setHasLiked(likes.includes(currentUser.uid));
      setLikesCount(likes.length);
    }
  }, [likes, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', post.id);
    try {
      if (hasLiked) {
        await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
        setHasLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
        setHasLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      window.location.reload();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (!userData || !post.authorId) return null;

  const iconMap: any = {
    photo: ImageIcon,
    video: Video,
    route: Map,
    article: FileText,
    gear: Package,
    review: Star,
    write: FileText
  };

  const TypeIcon = iconMap[post.type] || null;
  const isWritePost = post.type === 'write';
  const writeSubtype = post.subtype || content.subtype;
  const coverImageUrl = content.coverImageUrl || '';
  const bodyText = content.body || '';

  return (
    <>
      <div
        className="relative bg-[#FDFBF5] text-black p-2 rounded-2xl border border-[#e8e6df] shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-transform hover:shadow-xl hover:scale-[1.01] hover:ring-2 hover:ring-[#1D5136] cursor-pointer overflow-visible flex flex-col justify-between h-full"
        onClick={() => setIsExpandedOpen(true)}
      >
        <div className="flex items-center gap-2 mb-1 px-1 pt-1">
          <Image
            src={userData.profilePic}
            alt="Avatar"
            width={36}
            height={36}
            className="w-9 h-9 object-cover rounded-md border border-gray-400"
          />
          <Link href={`/profile/${post.authorId}`} className="text-xs font-semibold text-neutral-800 hover:underline">
            {userData.name}
          </Link>
        </div>
        {currentUser?.uid === post.authorId && (
  <div className="absolute top-2 right-2 z-30">
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 hover:bg-black/10 rounded-full"
      >
        <MoreHorizontal className="w-5 h-5 text-neutral-600" />
      </button>
      {showMenu && (
        <div
          className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md text-sm z-50 w-32"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setShowMenu(false);
              setEditModalOpen(true);
            }}
          >
            Edit Caption
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
            onClick={() => {
              setShowMenu(false);
              setDeleteConfirmOpen(true);
            }}
          >
            Delete Post
          </button>
        </div>
      )}
    </div>
  </div>
)}

        {isWritePost ? (
          <>
            {(TypeIcon || currentUser?.uid === post.authorId) && (
  <div className="absolute top-2 right-2 flex items-center gap-2 z-30">
    {TypeIcon && (
      <div className="bg-green-700 bg-opacity-90 text-white rounded-full p-1 shadow-md">
        <TypeIcon className="w-4 h-4" />
      </div>
    )}
    {currentUser?.uid === post.authorId && (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 hover:bg-black/10 rounded-full"
        >
          <MoreHorizontal className="w-5 h-5 text-neutral-600" />
        </button>
        {showMenu && (
          <div
            className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md text-sm z-50 w-32"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                setShowMenu(false);
                setEditModalOpen(true);
              }}
            >
              Edit Caption
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              onClick={() => {
                setShowMenu(false);
                setDeleteConfirmOpen(true);
              }}
            >
              Delete Post
            </button>
          </div>
        )}
      </div>
    )}
  </div>
)}


            {post.templateId === 'split-article' && (
              <SplitArticleCard
                title={post.title}
                coverImageUrl={content.coverImageUrl}
                bodyText={content.body}
              />
            )}

            {post.templateId === 'timeline-journal' && (
              <TimelineJournalCard
                title={post.title}
                bodyText={content.body}
                createdAt={post.createdAt}
              />
            )}

{(!post.templateId || post.templateId === 'classic-article') && (() => {
  const rawSize = post.displaySize;
  const size: 'small' | 'medium' | 'large' =
    rawSize === 'small' || rawSize === 'medium' || rawSize === 'large'
      ? rawSize
      : 'medium';

  const postSize = POST_SIZE_MAP['write'][size];
  const cardHeight = postSize.h * GRID_CELL_HEIGHT;

  return (
    <ClassicArticleCard
      title={content.title || post.title || ''}
      coverImageUrl={content.coverImageUrl}
      bodyText={content.body}
      displaySize={size}
      cardHeight={cardHeight}
    />
  );  
})()}



          </>
        ) : (
          <>
            {(TypeIcon || (currentUser?.uid === post.authorId)) && (
              <div className="absolute top-2 right-2 flex items-center gap-2 z-30">
                {TypeIcon && (
                  <div className="bg-green-700 bg-opacity-90 text-white rounded-full p-1 shadow-md">
                    <TypeIcon className="w-4 h-4" />
                  </div>
                )}
                {currentUser?.uid === post.authorId && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                      className="p-1 hover:bg-black/10 rounded-full"
                    >
                      <MoreHorizontal className="w-5 h-5 text-neutral-600" />
                    </button>
                    {showMenu && (
                      <div
                        className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md text-sm z-50 w-32"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setShowMenu(false);
                            setEditModalOpen(true);
                          }}
                        >
                          Edit Caption
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                          onClick={() => {
                            setShowMenu(false);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {caption && <div className="text-xs text-neutral-800 px-2 mb-1">{parseMentions(caption)}</div>}
            {post.title && <div className="text-sm font-bold text-neutral-900 px-2 mb-1">{post.title}</div>}
            {(content.location || post.location) && (
              <div className="text-[10px] text-neutral-500 px-2 mb-1">📍 {content.location || post.location}</div>
            )}

            <div className="relative w-full rounded-sm overflow-hidden flex-1">
              {isMulti ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrls[activeIndex]}
                    alt={`Image ${activeIndex}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                  {activeIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex((prev) => prev - 1);
                      }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 p-1 rounded-full"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {activeIndex < imageUrls.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex((prev) => prev + 1);
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 p-1 rounded-full"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              ) : post.type === 'route' && geojson ? (
                <div ref={mapRef} className="w-full h-full">
                  {mapInView && <MapComponent geojsonData={[geojson]} focus="route" />}
                </div>
              ) : imageUrls.length === 1 ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrls[0]}
                    alt={caption || post.title || 'Image'}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          </>
        )}

        <div className="mt-1 px-2 pb-1 text-xs text-neutral-500 flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className={`flex items-center gap-1 ${hasLiked ? 'text-red-400' : 'text-neutral-500'}`}
          >
            <Heart className="w-4 h-4" /> {likesCount}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCommentModalOpen(true);
            }}
            className="flex items-center gap-1 hover:underline"
          >
            <MessageSquare className="w-4 h-4" /> {comments.length} Comments
          </button>
        </div>
      </div>

      {isWritePost ? (
  <ExpandedWriteModal
    post={{ ...post, authorName: userData.name, authorProfilePic: userData.profilePic }}
    isOpen={isExpandedOpen}
    onClose={() => setIsExpandedOpen(false)}
  />
) : (
  <ExpandedPostModal
    post={{ ...post, authorName: userData.name, authorProfilePic: userData.profilePic }}
    isOpen={isExpandedOpen}
    onClose={() => setIsExpandedOpen(false)}
  />
)}

      <CommentModal
        postId={post.id}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
      />
      <EditCaptionModal
        postId={post.id}
        postType={post.type}
        initialCaption={initialCaption || ''}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onCaptionSave={(newCaption) => setCaption(newCaption)}
      />
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
