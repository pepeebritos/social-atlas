'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from 'lib/firebase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user) {
    return <p className="text-white text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-[#5b4636] text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.email}</h1>
      <button
        onClick={handleSignOut}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}

