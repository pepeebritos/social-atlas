'use client';

import { useEffect, useRef, useState, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type MapProps = {
  geojsonData: any[];
  focus: 'user' | 'route';
};

const Map = ({ geojsonData, focus }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [lighting, setLighting] = useState<'day' | 'dawn' | 'dusk' | 'night'>('dusk');
  const [show3D, setShow3D] = useState(true);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/standard');
  const [isTilted, setIsTilted] = useState(false);

  const cameraStateRef = useRef({
    center: [-120.2, 38.9],
    zoom: 6,
    pitch: 0,
    bearing: 0,
  });

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyLightingAnd3D = () => {
      map.setConfigProperty('basemap', 'lightPreset', lighting);
      map.setConfigProperty('basemap', 'show3dObjects', show3D);
    };

    if (!map.isStyleLoaded()) {
      map.once('style.load', applyLightingAnd3D);
    } else {
      applyLightingAnd3D();
    }
  }, [lighting, show3D]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      pitch: isTilted ? 60 : 0,
      bearing: isTilted ? 30 : 0,
      duration: 1000,
    });
  }, [isTilted]);

  useEffect(() => {
    if (!mapContainer.current || geojsonData.length === 0) return;

    const stableData = JSON.stringify(geojsonData);

    if (mapRef.current) {
      const map = mapRef.current;
      cameraStateRef.current = {
        center: map.getCenter().toArray(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      };
      map.remove();
      mapRef.current = null;
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: cameraStateRef.current.center as [number, number],
      zoom: cameraStateRef.current.zoom,
      pitch: cameraStateRef.current.pitch,
      bearing: cameraStateRef.current.bearing,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: 14,
      });

      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      map.setFog({
        color: 'rgba(186, 210, 235, 0.5)',
        'high-color': '#add8e6',
        'horizon-blend': 0.3,
        'space-color': '#d8f2ff',
        'star-intensity': 0.5,
      });

      geojsonData.forEach((route, index) => {
        const sourceId = `route-${index}`;
        const layerId = `route-layer-${index}`;

        map.addSource(sourceId, {
          type: 'geojson',
          data: route,
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#FF9900',
            'line-width': 4,
          },
          slot: 'top',
        });
      });

      if (focus === 'user') {
        const geolocate = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserLocation: true,
          fitBoundsOptions: { maxZoom: 12 },
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(geolocate);
        map.once('idle', () => geolocate.trigger());
      }

      if (focus === 'route' && geojsonData.length === 1) {
        try {
          const coords = geojsonData[0].features[0].geometry.coordinates;
          const bounds = coords.reduce(
            (b: mapboxgl.LngLatBounds, coord: [number, number]) =>
              b.extend(coord),
            new mapboxgl.LngLatBounds(coords[0], coords[0])
          );

          map.fitBounds(bounds, {
            padding: 40,
            linear: true,
          });
        } catch (err) {
          console.warn('Could not fit bounds to route:', err);
        }
      }

      map.setConfigProperty('basemap', 'lightPreset', lighting);
      map.setConfigProperty('basemap', 'show3dObjects', show3D);
    });

    // we only want this to re-run when geojson data actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(geojsonData), focus, mapStyle]);

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden">
      {/* UI Controls */}
      <div className="absolute top-2 left-2 z-10 bg-gray-800 bg-opacity-90 text-white p-3 rounded-xl shadow-md space-y-3 text-sm">
        <div>
          <label className="block text-xs font-semibold mb-1">Lighting</label>
          <select
            value={lighting}
            onChange={(e) => setLighting(e.target.value as any)}
            className="text-sm px-2 py-1 rounded bg-gray-700 text-white w-full"
          >
            <option value="day">Day</option>
            <option value="dawn">Dawn</option>
            <option value="dusk">Dusk</option>
            <option value="night">Night</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Map Style</label>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="text-sm px-2 py-1 rounded bg-gray-700 text-white w-full"
          >
            <option value="mapbox://styles/mapbox/standard">Standard</option>
            <option value="mapbox://styles/mapbox/standard-satellite">Satellite</option>
            <option value="mapbox://styles/mapbox/outdoors-v11">Outdoors</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold">3D Buildings</label>
          <input
            type="checkbox"
            checked={show3D}
            onChange={(e) => setShow3D(e.target.checked)}
            className="form-checkbox text-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold">3D View</label>
          <input
            type="checkbox"
            checked={isTilted}
            onChange={(e) => setIsTilted(e.target.checked)}
            className="form-checkbox text-blue-500"
          />
        </div>
      </div>

      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default memo(Map);
