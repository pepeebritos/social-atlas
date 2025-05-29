'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from 'lib/firebase';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Clear cached profile pic so new users don't see the old one
      localStorage.removeItem('profilePic');

      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mt-4"
    >
      Sign Out
    </button>
  );
}
