'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import CommentModal from './CommentModal';
import { parseMentions } from '@/lib/parseMentions';

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

export default function PostCard({ post }: { post: Post }) {
  const [userData, setUserData] = useState<{ name: string; profilePic: string } | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = doc(db, 'users', post.authorId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData({
          name: data.name || 'Unknown',
          profilePic: data.profilePic || '/default-avatar.png',
        });
      }
    };
    fetchUser();
  }, [post.authorId]);

  useEffect(() => {
    if (Array.isArray(post.likes) && currentUser) {
      setHasLiked(post.likes.includes(currentUser.uid));
      setLikesCount(post.likes.length);
    } else {
      setHasLiked(false);
      setLikesCount(0);
    }
  }, [post.likes, currentUser]);

  if (!post.content || !userData) {
    console.warn('⛔ PostCard skipped:', { content: post.content, userData });
    return null;
  }

  const handleLike = async () => {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', post.id);

    if (hasLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid),
      });
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid),
      });
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  return (
    <div className="bg-[#2e2e2e] p-4 rounded-xl shadow-md border border-[#444]">
      {/* Avatar and name */}
      <div className="flex items-center gap-3 mb-2">
        <Image
          src={userData.profilePic}
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full object-cover border border-gray-400"
        />
        <Link href={`/profile/${post.authorId}`} className="text-sm font-semibold hover:underline">
          {userData.name}
        </Link>
      </div>

      {/* Post content */}
      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Post Type: {post.type}</p>
      <h2 className="text-lg font-bold text-orange-400">{post.content.title}</h2>
      <div className="text-sm text-gray-300">{parseMentions(post.content.description)}</div>

      {post.type === 'photo' && post.content.imageUrl && (
        <img
          src={post.content.imageUrl}
          alt={post.content.title}
          className="mt-3 rounded-lg w-full object-cover max-h-64"
        />
      )}

      {post.type === 'route' && post.content.routeGeoJSON && (
        <p className="mt-3 text-green-400 font-medium">🗺️ Route shared — check the map!</p>
      )}

      {post.type === 'article' && post.content.articleUrl && (
        <a
          href={post.content.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-blue-400 underline"
        >
          Read Article
        </a>
      )}

      {/* Like + Comment Reactions */}
      <div className="mt-3 text-sm text-gray-400 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm ${
            hasLiked ? 'text-red-400' : 'text-gray-400'
          }`}
        >
          ❤️ {likesCount}
        </button>

        <button
          onClick={() => setIsCommentModalOpen(true)}
          className="flex items-center gap-1 text-sm hover:underline"
        >
          💬 {post.comments?.length || 0} Comments
        </button>
      </div>

      {/* Preview up to 2 comments */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-4 space-y-2">
          {post.comments
            .slice(-2)
            .map((comment, idx) => (
              <div key={idx} className="text-sm text-gray-300">
                <span className="font-semibold text-orange-400">{comment.name}</span>: {comment.text}
              </div>
            ))}

          {post.comments.length > 2 && (
            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="text-sm text-blue-400 hover:underline"
            >
              View all comments
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <CommentModal
        postId={post.id}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
      />
    </div>
  );
}
