'use client';

import { useEffect, useState } from 'react';
import { auth, db, storage } from 'lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import FollowButton from 'components/FollowButton';
import { parseMentions } from 'lib/parseMentions';
import SignOutButton from 'components/SignOutButton';

const SUGGESTED_TAGS = [
  'Backpacker',
  'Trail Runner',
  'City Explorer',
  'Vanlifer',
  'Remote Worker',
  'Digital Nomad',
];

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData({ ...data, uid: user.uid });
          setBio(data.bio || '');
          setInterests(data.interests || []);
        }
        setLoading(false);
      } else {
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, { bio, interests });
    setEditing(false);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profilePic' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const user = auth.currentUser;
    if (!user) return;
    const filePath = `users/${user.uid}/${type}`;
    try {
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { [type]: downloadURL });
      setUserData((prev: any) => ({ ...prev, [type]: downloadURL }));
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  };

  const addInterest = (tag: string) => {
    if (!tag || interests.includes(tag)) return;
    setInterests([...interests, tag]);
    setNewInterest('');
  };

  const removeInterest = (tag: string) => {
    setInterests(interests.filter((t) => t !== tag));
  };

  const handleNewInterestKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest(newInterest.trim());
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="relative h-48 w-full rounded-md overflow-hidden">
        <Image src={userData?.banner || '/default-banner.jpg'} fill className="object-cover" alt="Banner" />
        <label className="absolute top-2 right-2 bg-black/60 text-sm px-3 py-1 rounded cursor-pointer">
          Change Banner
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} />
        </label>
      </div>

      <div className="relative -mt-12 flex items-center space-x-4 px-4">
        <div className="relative">
          <Image
            src={userData?.profilePic || '/default-avatar.png'}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full border-4 border-white"
          />
          <label className="absolute bottom-0 right-0 bg-black/60 text-xs px-2 py-1 rounded cursor-pointer">
            ✎
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profilePic')} />
          </label>
        </div>
        <div>
          <p className="text-xl font-semibold">{userData?.name}</p>
          <p className="text-sm text-gray-300">{userData?.email}</p>
          <p className="text-sm text-gray-300 mt-1">
            👥 {userData?.followers?.length || 0} Followers · {userData?.following?.length || 0} Following
          </p>
          {auth.currentUser?.uid !== userData?.uid && (
            <div className="mt-2">
              <FollowButton profileUserId={userData.uid} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-[#2e5e4e] p-6 rounded-lg shadow-lg space-y-6">
        <div>
          <label className="block text-sm mb-1">Bio</label>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 rounded text-black"
            />
          ) : (
            <div className="text-sm text-gray-200">{parseMentions(bio || 'No bio yet.')}</div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Interests</label>
          {editing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {interests.map((tag) => (
                  <span
                    key={tag}
                    className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full cursor-pointer"
                    onClick={() => removeInterest(tag)}
                  >
                    {tag} ✕
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={handleNewInterestKey}
                placeholder="Add interest and press Enter"
                className="w-full p-2 rounded text-black"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addInterest(tag)}
                    className="bg-gray-600 text-sm px-3 py-1 rounded-full hover:bg-orange-500 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interests.map((tag) => (
                <span key={tag} className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-200">No interests selected.</p>
          )}
        </div>

        <div className="flex space-x-4">
          {editing ? (
            <button onClick={handleSave} className="bg-orange-500 px-4 py-2 rounded">
              Save
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-orange-500 px-4 py-2 rounded">
              Edit Bio + Interests
            </button>
          )}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
