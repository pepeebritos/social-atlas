'use client';

import { useEffect, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import dynamic from 'next/dynamic';
import * as toGeoJSON from '@mapbox/togeojson';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map = dynamic(() => import('components/Map'), {
  ssr: false,
});

export default function UploadRoutePage() {
  const [geojson, setGeojson] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [tags, setTags] = useState('');
  const [distance, setDistance] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

  const calculateStats = (trkpts: Element[]) => {
    let totalDistance = 0;
    let totalElevation = 0;

    const toRad = (value: number) => (value * Math.PI) / 180;

    for (let i = 1; i < trkpts.length; i++) {
      const prev = trkpts[i - 1];
      const curr = trkpts[i];

      const lat1 = parseFloat(prev.getAttribute('lat')!);
      const lon1 = parseFloat(prev.getAttribute('lon')!);
      const lat2 = parseFloat(curr.getAttribute('lat')!);
      const lon2 = parseFloat(curr.getAttribute('lon')!);
      const ele1 = parseFloat(prev.getElementsByTagName('ele')[0]?.textContent || '0');
      const ele2 = parseFloat(curr.getElementsByTagName('ele')[0]?.textContent || '0');

      const R = 6371; // Radius of Earth in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      totalDistance += R * c;

      const elevationDiff = ele2 - ele1;
      if (elevationDiff > 0) {
        totalElevation += elevationDiff;
      }
    }

    setDistance(totalDistance);
    setElevationGain(totalElevation);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const converted = toGeoJSON.gpx(xml);

        const trkpts = Array.from(xml.getElementsByTagName('trkpt'));
        calculateStats(trkpts);

        const features = converted.features.map((feature) => {
          if (feature.geometry.type === 'LineString') {
            const coords = feature.geometry.coordinates.map((pt: [number, number]) => [pt[0], pt[1]]);
            feature.geometry.coordinates = coords;
          }
          return feature;
        });

        setGeojson({ ...converted, features });
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!geojson) {
      setUploadError('Please upload a GPX file first.');
      return;
    }

    setSaving(true);
    setUploadError('');

    try {
      if (!user) {
        setUploadError('You must be logged in to save routes.');
        setSaving(false);
        return;
      }

      const coords = geojson.features?.[0]?.geometry?.coordinates.map(([lng, lat]: [number, number]) => ({ lng, lat })) || [];

      await addDoc(collection(db, 'routes'), {
        name,
        description,
        difficulty,
        tags: tags.split(',').map((tag) => tag.trim()),
        coordinates: coords,
        distance,
        elevationGain,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      alert('Route saved successfully!');
      setGeojson(null);
      setName('');
      setDescription('');
      setDifficulty('easy');
      setTags('');
      setDistance(0);
      setElevationGain(0);
    } catch (error: any) {
      console.error('Error saving to Firestore:', error);
      setUploadError('Error saving route. Check console for details.');
    }

    setSaving(false);
  };

  const memoizedMapPreview = useMemo(() => {
    if (!geojson) return null;
    return (
      <div className="mt-10 h-[400px] rounded-md overflow-hidden border border-zinc-700">
        <Map geojsonData={[geojson]} focus="route" />
      </div>
    );
  }, [geojson]);

  const miles = distance * 0.621371;
  const elevationFeet = elevationGain * 3.28084;

  return (
    <div className="min-h-screen bg-amber-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Upload a Route</h1>

        {/* File Upload */}
        <label className="inline-block cursor-pointer bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700">
          Upload GPX File
          <input
            type="file"
            accept=".gpx"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {/* Stats */}
        {geojson && (
          <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-4 text-sm text-amber-300">
            <p>
              <span className="font-semibold text-white">Distance:</span>{' '}
              {distance.toFixed(2)} km / {miles.toFixed(2)} mi
            </p>
            <p>
              <span className="font-semibold text-white">Elevation Gain:</span>{' '}
              {Math.round(elevationGain)} m / {Math.round(elevationFeet)} ft
            </p>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid gap-4 mt-6">
          <input
            type="text"
            placeholder="Route Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded bg-zinc-900 text-white border border-zinc-700"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded bg-zinc-900 text-white border border-zinc-700"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-3 rounded bg-zinc-900 text-white border border-zinc-700"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 rounded bg-zinc-900 text-white border border-zinc-700"
          />

          {uploadError && (
            <p className="text-red-400 text-sm">{uploadError}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Route'}
          </button>
        </div>

        {/* Memoized Map Preview */}
        {memoizedMapPreview}
      </div>
    </div>
  );
}
