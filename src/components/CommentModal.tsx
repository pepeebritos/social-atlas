'use client';

import { useEffect, useState, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  doc,
  getDocs,
  updateDoc,
  Timestamp,
  collection,
  addDoc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { Dialog } from '@headlessui/react';
import { parseMentions } from '@/lib/parseMentions';
import MentionInput from '@/components/MentionInput';

interface CommentModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Comment {
  id: string;
  userId: string;
  name: string;
  text: string;
  createdAt: Timestamp;
  parentId?: string | null;
  likes?: string[];
}

const getTimeAgo = (timestamp: Timestamp) => {
  const seconds = (Date.now() - timestamp.toMillis()) / 1000;
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function CommentModal({ postId, isOpen, onClose }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const topLevel: Comment[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as Comment;
      const id = docSnap.id;
      topLevel.push({ ...data, id });
      const repliesRef = collection(db, 'posts', postId, 'comments', id, 'replies');
      const repliesSnap = await getDocs(query(repliesRef, orderBy('createdAt', 'asc')));
      const replyList = repliesSnap.docs.map((r) => ({ ...(r.data() as Comment), id: r.id }));
      setReplies((prev) => ({ ...prev, [id]: replyList }));
    }

    setComments(topLevel);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen, postId, fetchComments]);

  const handleAddComment = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || newComment.trim() === '') return;

    const commentData = {
      userId: currentUser.uid,
      name: currentUser.displayName || 'Anonymous',
      text: newComment,
      createdAt: Timestamp.now(),
      likes: [],
    };

    if (replyingTo) {
      const repliesRef = collection(db, 'posts', postId, 'comments', replyingTo, 'replies');
      await addDoc(repliesRef, commentData);
    } else {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, { ...commentData, parentId: null });
    }

    setNewComment('');
    setReplyingTo(null);
    fetchComments();
  };

  const toggleLike = async (comment: Comment, isReply = false, parentId?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !comment.id) return;

    const baseRef = isReply
      ? doc(db, 'posts', postId, 'comments', parentId!, 'replies', comment.id)
      : doc(db, 'posts', postId, 'comments', comment.id);

    const hasLiked = comment.likes?.includes(currentUser.uid);
    const updatedLikes = hasLiked
      ? comment.likes?.filter((uid) => uid !== currentUser.uid)
      : [...(comment.likes || []), currentUser.uid];

    await updateDoc(baseRef, { likes: updatedLikes });

    if (isReply && parentId) {
      setReplies((prev) => ({
        ...prev,
        [parentId]: prev[parentId].map((r) =>
          r.id === comment.id ? { ...r, likes: updatedLikes } : r
        ),
      }));
    } else {
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, likes: updatedLikes } : c))
      );
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="relative bg-[#2e2e2e] text-white rounded-lg w-full max-w-md mx-auto p-6 z-50">
        <Dialog.Title className="text-lg font-semibold mb-4">💬 Comments</Dialog.Title>

        {loading ? (
          <p className="text-sm text-gray-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-400">No comments yet.</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {comments.map((comment) => {
              const repliesForComment = replies[comment.id] || [];
              const isExpanded = expandedComments.includes(comment.id);
              const visibleReplies = isExpanded ? repliesForComment : repliesForComment.slice(0, 2);
              const isLiked = comment.likes?.includes(auth.currentUser?.uid || '');

              return (
                <div key={comment.id} className="border-b border-gray-700 pb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-orange-400">
                      @{comment.name}
                      <span className="text-xs text-gray-400 ml-2">• {getTimeAgo(comment.createdAt)}</span>
                    </p>
                    <button
                      onClick={() => toggleLike(comment)}
                      className="text-sm text-gray-400 hover:text-red-500 transition"
                    >
                      {isLiked ? '❤️' : '🤍'} {comment.likes?.length || 0}
                    </button>
                  </div>

                  <div className="text-sm text-gray-200">{parseMentions(comment.text)}</div>
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-gray-400 hover:text-orange-400 transition"
                  >
                    Reply
                  </button>

                  <div className="ml-4 mt-2 space-y-1">
                    {visibleReplies.map((reply) => {
                      const isReplyLiked = reply.likes?.includes(auth.currentUser?.uid || '');
                      return (
                        <div key={reply.id}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-orange-300">
                              @{reply.name}
                              <span className="text-xs text-gray-400 ml-2">• {getTimeAgo(reply.createdAt)}</span>
                            </p>
                            <button
                              onClick={() => toggleLike(reply, true, comment.id)}
                              className="text-sm text-gray-400 hover:text-red-500 transition"
                            >
                              {isReplyLiked ? '❤️' : '🤍'} {reply.likes?.length || 0}
                            </button>
                          </div>
                          <div className="text-sm text-gray-300">{parseMentions(reply.text)}</div>
                        </div>
                      );
                    })}

                    {!isExpanded && repliesForComment.length > 2 && (
                      <button
                        onClick={() => setExpandedComments((prev) => [...prev, comment.id])}
                        className="text-xs text-gray-400 hover:text-orange-400 mt-1 transition"
                      >
                        View all replies ({repliesForComment.length})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 relative">
          <MentionInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleAddComment}
            placeholder={replyingTo ? 'Replying...' : 'Write a comment...'}
            buttonText={replyingTo ? 'Reply' : 'Post'}
          />
        </div>
      </div>
    </Dialog>
  );
}
