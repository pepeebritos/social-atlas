'use client';

import { useEffect, useState, useRef } from 'react';
import {
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from 'lib/firebase';
import CreatePostModal from 'components/CreatePostModal';
import GridFeed from 'components/GridFeed';
import UploadProgressBar from 'components/ui/UploadProgressBar';
import FloatingFilterButton from 'components/ui/FloatingFilterButton';
import TopBar from 'components/TopBar';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const POSTS_BATCH_SIZE = 20;
const MAX_POSTS_IN_DOM = 200;

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postType, setPostType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadBar, setShowUploadBar] = useState(false);
  const [userPhoto, setUserPhoto] = useState('/default-avatar.png');
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingMore = useRef(false);
  const router = useRouter();

  const fetchPosts = async (initial = false) => {
    if (isFetchingMore.current) return;
    isFetchingMore.current = true;

    const baseQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      ...(lastDoc ? [startAfter(lastDoc)] : []),
      limit(POSTS_BATCH_SIZE)
    );

    const snap = await getDocs(baseQuery);
    if (snap.empty) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const newPosts = snap.docs
      .map((doc) => {
        const data = doc.data();
        if (!data) return null;

        const base = {
          id: doc.id,
          type: data.type,
          authorId: data.authorId,
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
          isPremiumUser: data.isPremiumUser || false,
          likes: Array.isArray(data.likes) ? data.likes : [],
          comments: Array.isArray(data.comments) ? data.comments : [],
        };

        if (data.content && Object.keys(data.content).length > 0) {
          return {
            ...base,
            content: data.content,
            displaySize: data.content?.displaySize || 'auto'
          };
        }

        if (data.type === 'write') {
          return {
            ...base,
            content: {
              title: data.title,
              body: data.body,
              caption: data.caption,
              location: data.location,
              coverImageUrl: data.coverImageUrl || '',
              pdfUrl: data.pdfUrl || '',
              displaySize: data.displaySize || 'medium',
              subtype: data.subtype || 'article'
            },
            displaySize: data.displaySize || 'medium'
          };
        }

        return null;
      })
      .filter((post) => post !== null);

    setPosts((prev) => {
      const combined = [...prev, ...newPosts];
      return combined.slice(-MAX_POSTS_IN_DOM);
    });

    setLastDoc(snap.docs[snap.docs.length - 1]);
    setLoading(false);
    isFetchingMore.current = false;
  };

  useEffect(() => {
    const savedY = sessionStorage.getItem('feedScrollY');
    if (savedY) {
      window.scrollTo(0, parseInt(savedY, 10));
      sessionStorage.removeItem('feedScrollY');
    }
  }, []);

  useEffect(() => {
    fetchPosts(true);

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const cachedPic = localStorage.getItem('profilePic');
      if (cachedPic) {
        setUserPhoto(cachedPic);
        return;
      }

      try {
        const userDocs = await getDocs(collection(db, 'users'));
        userDocs.forEach((doc) => {
          if (doc.id === user.uid) {
            const data = doc.data();
            if (data?.profilePic) {
              localStorage.setItem('profilePic', data.profilePic);
              setUserPhoto(data.profilePic);
            }
          }
        });
      } catch (error) {
        console.error('Failed to fetch profilePic from Firestore:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col bg-[#FDFBF5] text-black font-sans min-h-screen">
      <TopBar
        onCreatePost={() => {
          setPostType(null);
          setIsCreateModalOpen(true);
        }}
        userPhoto={userPhoto}
      />

      <main className="flex-grow w-full px-6 relative overflow-visible z-0">
        {loading && posts.length === 0 ? (
          <p className="text-center text-gray-500">Loading feed...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet.</p>
        ) : (
          <GridFeed posts={posts} onLoadMore={hasMore ? fetchPosts : undefined} />
        )}

        <FloatingFilterButton onClick={() => console.log('Filter clicked')} />
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setPostType(null);
        }}
        onPostCreated={(newPost) => {
          sessionStorage.setItem('feedScrollY', window.scrollY.toString());
          setPosts((prev) => {
            const filtered = prev.filter((p) => p.id !== 'loading');
            return [newPost, ...filtered].slice(0, MAX_POSTS_IN_DOM);
          });
        }}
        initialType={postType}
        setUploadProgress={(percent) => {
          setUploadProgress(percent);
          if (percent > 0 && percent < 100) {
            setShowUploadBar(true);
          } else if (percent === 100) {
            setTimeout(() => {
              setShowUploadBar(false);
              setUploadProgress(0);
            }, 1000);
          }
        }}
      />

      <button
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-xl"
        onClick={() => {
          setPostType(null);
          setIsCreateModalOpen(true);
        }}
      >
        <Plus />
      </button>

      {showUploadBar && (
        <UploadProgressBar percent={uploadProgress} />
      )}
    </div>
  );
}
