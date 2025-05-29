'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from 'lib/firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const claimUsername = async (uid: string, newUsername: string) => {
    const usernameRef = doc(db, 'usernames', newUsername);
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(usernameRef);
    if (docSnap.exists()) {
      throw new Error('Username is already taken.');
    }
    await setDoc(usernameRef, { uid });
    await setDoc(userRef, {
      name,
      email,
      username: newUsername,
      profilePic: '',
      bio: '',
      createdAt: new Date()
    });
  };

  const handleSignup = async () => {
    try {
      if (!username) throw new Error("Please choose a username.");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await claimUsername(user.uid, username);
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5b4636] text-white p-4">
      <div className="bg-[#2e5e4e] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded bg-[#4a7b6f] text-white placeholder-gray-300"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="w-full p-3 rounded bg-[#4a7b6f] text-white placeholder-gray-300"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-[#4a7b6f] text-white placeholder-gray-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-[#4a7b6f] text-white placeholder-gray-300"
          />

          <button
            onClick={handleSignup}
            className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}