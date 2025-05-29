// app/lib/simplifyGeoJSON.ts
export default function simplifyGeoJSON(geojson: any) {
  if (!geojson || !geojson.features) return null;

  const simplifiedFeatures = geojson.features.map((feature: any) => {
    const { geometry, properties } = feature;

    return {
      type: 'Feature',
      geometry: {
        type: geometry.type,
        coordinates: geometry.coordinates, // still an array, but allowed as long as it's not too deeply nested
      },
      properties: {
        name: properties?.name || '',
        desc: properties?.desc || '',
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features: simplifiedFeatures,
  };
}

  