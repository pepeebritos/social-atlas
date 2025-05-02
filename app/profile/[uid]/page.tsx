'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import FollowButton from '@/components/FollowButton';

export default function PublicProfilePage() {
  const { uid } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchUserData = async () => {
      const userRef = doc(db, 'users', uid as string);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData({ ...data, uid });
      }

      setLoading(false);
    };

    fetchUserData();
  }, [uid]);

  if (loading) return <p className="p-8 text-white">Loading...</p>;
  if (!userData) return <p className="p-8 text-white">User not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* Banner */}
      <div className="relative h-48 w-full rounded-md overflow-hidden">
        <Image
          src={userData.banner || '/default-banner.jpg'}
          fill
          className="object-cover"
          alt="Banner"
        />
      </div>

      {/* Profile Header */}
      <div className="relative -mt-12 flex items-center space-x-4 px-4">
        <div className="relative">
          <Image
            src={userData.profilePic || '/default-avatar.png'}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full border-4 border-white"
          />
        </div>
        <div>
          <p className="text-xl font-semibold">{userData.name}</p>
          <p className="text-sm text-gray-300">{userData.email}</p>
          <p className="text-sm text-gray-300 mt-1">
            👥 {userData.followers?.length || 0} Followers · {userData.following?.length || 0} Following
          </p>

          {/* Only show FollowButton if not your own profile */}
          {auth.currentUser?.uid !== uid && (
            <div className="mt-2">
              <FollowButton profileUserId={uid as string} />
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="mt-6 bg-[#2e5e4e] p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <label className="block text-sm mb-1">Bio</label>
          <p className="text-sm text-gray-200">{userData.bio || 'No bio yet.'}</p>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm mb-1">Interests</label>
          {userData.interests?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userData.interests.map((tag: string) => (
                <span key={tag} className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-200">No interests selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
