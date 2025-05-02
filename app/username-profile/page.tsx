// app/@username/page.tsx

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
  const usernameRef = doc(db, 'usernames', cleanUsername);
  const usernameSnap = await getDoc(usernameRef);

  if (!usernameSnap.exists()) return <div>User not found</div>;

  const { uid } = usernameSnap.data() as { uid: string };
  const userSnap = await getDoc(doc(db, 'users', uid));
  const user = userSnap.data();

  if (!user) return <div>User data not found</div>;

  return (
    <div className="text-white">{user.name}</div>
  );
}
