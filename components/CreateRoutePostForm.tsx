'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage } from 'lib/firebase';
import * as toGeoJSON from '@mapbox/togeojson';

const Map = dynamic(() => import('components/Map'), { ssr: false });

export default function CreateRoutePostForm({ onPostCreated }: { onPostCreated: (newPost: any) => void }) {
  const [user, setUser] = useState<any>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [geojson, setGeojson] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displaySize, setDisplaySize] = useState<'small' | 'medium' | 'large'>('medium');
  const [suggestionText, setSuggestionText] = useState('');
  const [rerollUsed, setRerollUsed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const isPremium = false; // Simulate free user with reroll + random sizes

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  const getRandomDisplaySize = (): 'small' | 'medium' | 'large' => {
    const sizes = ['small', 'medium', 'large'] as const;
    const index = Math.floor(Math.random() * sizes.length);
    return sizes[index];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGpxFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const converted = toGeoJSON.gpx(xml);
        setGeojson(converted);
      }
    };
    reader.readAsText(file);

    if (!isPremium) {
      const rand = getRandomDisplaySize();
      setDisplaySize(rand);
      setSuggestionText(`Random size: ${rand.toUpperCase()}`);
      setRerollUsed(false);
    }
  };

  const handleReroll = () => {
    if (isPremium || rerollUsed) return;
    const newSize = getRandomDisplaySize();
    setDisplaySize(newSize);
    setSuggestionText(`New roll: ${newSize.toUpperCase()}`);
    setRerollUsed(true);
  };

  const handleSubmit = async () => {
    if (!user || !gpxFile || !geojson || !name) {
      setError('Please fill out all required fields and upload a file.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const storageRef = ref(storage, `posts/routes/${user.uid}/${Date.now()}_${gpxFile.name}`);
      await uploadBytes(storageRef, gpxFile);
      const gpxUrl = await getDownloadURL(storageRef);

      const newPost = {
        type: 'route',
        authorId: user.uid,
        content: {
          title: name,
          description,
          displaySize,
          routeGeoJSON: JSON.stringify(geojson),
          gpxUrl
        },
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        isPremiumUser: isPremium
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);
      onPostCreated({ id: docRef.id, ...newPost });

      setGpxFile(null);
      setGeojson(null);
      setName('');
      setDescription('');
      setSuggestionText('');
    } catch (err) {
      console.error(err);
      setError('Failed to upload route.');
    } finally {
      setUploading(false);
    }
  };

  const mapPreview = useMemo(() => {
    if (!geojson) return null;
    return (
      <div className="mt-4 h-64 border border-zinc-700 rounded-lg overflow-hidden">
        <Map geojsonData={[geojson]} focus="route" />
      </div>
    );
  }, [geojson]);

  return (
    <div className="space-y-4">
      <input type="file" accept=".gpx" onChange={handleFileChange} />
      {mapPreview}

      <input
        type="text"
        placeholder="Route Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 rounded-lg text-black"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-3 rounded-lg text-black"
      />

      <div className="flex items-center justify-between text-yellow-300 text-sm px-1">
        <span>{suggestionText}</span>
        {!rerollUsed && (
          <button
            onClick={handleReroll}
            className="text-xs px-2 py-1 border border-white rounded-md bg-white/10 hover:bg-white/20"
          >
            Reroll Size
          </button>
        )}
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl"
      >
        {uploading ? 'Uploading...' : 'Post Route'}
      </button>
    </div>
  );
}
