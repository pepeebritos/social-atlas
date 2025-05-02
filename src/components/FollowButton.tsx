'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

interface FollowButtonProps {
  profileUserId: string; // ID of the user whose profile we're looking at
}

export default function FollowButton({ profileUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentUser || !profileUserId) return;

      const currentUserRef = doc(db, 'users', currentUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);
      const data = currentUserSnap.data();

      if (data?.following?.includes(profileUserId)) {
        setIsFollowing(true);
      }

      setLoading(false);
    };

    checkFollowingStatus();
  }, [currentUser, profileUserId]);

  const handleFollow = async () => {
    if (!currentUser || !profileUserId) return;

    const currentUserRef = doc(db, 'users', currentUser.uid);
    const targetUserRef = doc(db, 'users', profileUserId);

    try {
      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(profileUserId),
        });
        await updateDoc(targetUserRef, {
          followers: arrayRemove(currentUser.uid),
        });
        setIsFollowing(false);
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(profileUserId),
        });
        await updateDoc(targetUserRef, {
          followers: arrayUnion(currentUser.uid),
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('❌ Error following/unfollowing:', error);
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={handleFollow}
      className={`px-4 py-2 rounded font-medium ${
        isFollowing ? 'bg-gray-500' : 'bg-orange-500'
      }`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
