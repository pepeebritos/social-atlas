// app/[username]/page.tsx

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import FollowButton from '@/components/FollowButton';

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const cleanUsername = decodeURIComponent(params.username).replace(/^@/, '');

  console.log('✅ PUBLIC PROFILE ROUTE HIT:', cleanUsername);

  const usernameRef = doc(db, 'usernames', cleanUsername);
  const usernameSnap = await getDoc(usernameRef);

  if (!usernameSnap.exists()) {
    return <div className="p-8 text-white">User not found 😢</div>;
  }

  const { uid } = usernameSnap.data() as { uid: string };

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return <div className="p-8 text-white">User data not found 😢</div>;
  }

  const user = userSnap.data() as {
    name: string;
    profilePic?: string;
    banner?: string;
    bio?: string;
    followers?: string[];
    following?: string[];
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <div className="relative h-48 w-full rounded-md overflow-hidden mb-6">
        <Image
          src={user.banner || '/default-banner.jpg'}
          fill
          className="object-cover"
          alt="Banner"
        />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Image
          src={user.profilePic || '/default-avatar.png'}
          alt="Profile"
          width={96}
          height={96}
          className="rounded-full border-4 border-white"
        />
        <div>
          <p className="text-2xl font-semibold">{user.name}</p>
          <p className="text-sm text-gray-400">@{cleanUsername}</p>
          <p className="text-sm text-gray-400 mt-1">
            👥 {user.followers?.length || 0} Followers · {user.following?.length || 0} Following
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-6">{user.bio || 'No bio yet.'}</p>

      <FollowButton profileUserId={uid} />
    </div>
  );
}
