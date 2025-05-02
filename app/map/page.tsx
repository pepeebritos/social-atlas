'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function MapPage() {
  const [geojsonRoutes, setGeojsonRoutes] = useState<any[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'nearby'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'routes'));
        const routes: any[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.coordinates || !Array.isArray(data.coordinates)) return;

          // Convert { lng, lat } back to [lng, lat] for GeoJSON
          const flatCoords = data.coordinates
            .filter((pt: any) => pt.lng !== undefined && pt.lat !== undefined)
            .map((pt: any) => [pt.lng, pt.lat]);

          const geojson = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: flatCoords,
                },
                properties: {
                  name: data.name,
                  difficulty: data.difficulty,
                  tags: data.tags,
                  routeId: doc.id,
                },
              },
            ],
          };

          routes.push(geojson);
        });

        setGeojsonRoutes(routes);
        setLoading(false);
      } catch (error) {
        console.error('Error loading routes:', error);
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  useEffect(() => {
    if (filterMode === 'all') {
      setFilteredRoutes(geojsonRoutes);
      return;
    }

    if (filterMode === 'nearby' && userLocation) {
      const nearby = geojsonRoutes.filter((route) => {
        const coords = route.features[0].geometry.coordinates;
        return coords.some(([lng, lat]: [number, number]) => {
          const distance = getDistanceFromLatLonInKm(
            lat,
            lng,
            userLocation[1],
            userLocation[0]
          );
          return distance < 50; // within 50km
        });
      });
      setFilteredRoutes(nearby);
    }
  }, [filterMode, userLocation, geojsonRoutes]);

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (filterMode === 'nearby') {
      getUserLocation();
    }
  }, [filterMode]);

  return (
    <div className="min-h-screen bg-amber-950 text-white px-4 py-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Backpacking Routes</h1>

      <div className="flex justify-center mb-4 gap-4">
        <button
          className={`px-4 py-2 rounded-md ${
            filterMode === 'all' ? 'bg-green-600' : 'bg-zinc-800'
          }`}
          onClick={() => setFilterMode('all')}
        >
          All Routes
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            filterMode === 'nearby' ? 'bg-green-600' : 'bg-zinc-800'
          }`}
          onClick={() => setFilterMode('nearby')}
        >
          Nearby Routes
        </button>
      </div>

      <div className="w-full h-[80vh] rounded-md overflow-hidden border border-zinc-700">
        {!loading && <Map geojsonData={filteredRoutes} focus="user" />}
      </div>
    </div>
  );
}
