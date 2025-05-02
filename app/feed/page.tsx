'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';

interface Post {
  id: string;
  type: string;
  authorId: string;
  content?: {
    title: string;
    description: string;
    imageUrl?: string;
    routeGeoJSON?: string;
    articleUrl?: string;
  };
  likes: string[];
  comments: {
    userId: string;
    name: string;
    text: string;
    createdAt: any;
  }[];
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchInitialPosts = async () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
    setPosts(allPosts);
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#143F2B] text-white h-screen sticky top-0 p-6 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo-pin-white.png" alt="Social Atlas" width={220} height={220} className="rounded-xl" />
            <span className="text-xl font-bold tracking-tight">Social Atlas</span>
          </div>
          <nav className="mt-8 space-y-4">
            <Link href="/" className="block hover:text-green-300">Home</Link>
            <Link href="/map" className="block hover:text-green-300">Map</Link>
            <Link href="/explore" className="block hover:text-green-300">Explore</Link>
            <Link href="/profile" className="block hover:text-green-300">Profile</Link>
          </nav>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg"
        >
          + Create Post
        </button>
      </aside>

      {/* Main Feed Grid */}
      <main className="flex-1 px-4 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Top Right Avatar */}
          <div className="flex justify-end mb-6">
            <div className="h-10 w-10 rounded-full bg-gray-500" title="Your Profile" />
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Loading feed...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-400">No posts yet.</p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Mobile Create Post Floating Button */}
      <button
        className="fixed bottom-6 left-6 z-50 md:hidden bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Plus />
      </button>
    </div>
  );
}
