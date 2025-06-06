import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import FollowButton from '@/components/FollowButton';
import { notFound } from 'next/navigation';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username).replace(/^@/, '');
  console.log('✅ PUBLIC PROFILE ROUTE HIT:', cleanUsername);

  const usernameRef = doc(db, 'usernames', cleanUsername);
  const usernameSnap = await getDoc(usernameRef);

  if (!usernameSnap.exists()) return notFound();

  const { uid } = usernameSnap.data() as { uid: string };

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return notFound();

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
      {/* Banner */}
      <div className="relative h-48 w-full rounded-md overflow-hidden mb-6">
        <Image
          src={user.banner || '/default-banner.jpg'}
          fill
          className="object-cover"
          alt="Banner"
        />
      </div>

      {/* Profile Header */}
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
