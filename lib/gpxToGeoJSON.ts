// lib/gpxToGeoJSON.ts
import { DOMParser } from '@xmldom/xmldom';
import toGeoJSON from '@mapbox/togeojson';

function fixFlatCoordinates(geojson: any) {
  if (
    geojson &&
    geojson.features &&
    Array.isArray(geojson.features)
  ) {
    geojson.features.forEach((feature: any) => {
      if (
        feature.geometry &&
        feature.geometry.type === 'LineString' &&
        Array.isArray(feature.geometry.coordinates)
      ) {
        const coords = feature.geometry.coordinates;
        if (typeof coords[0] === 'number') {
          const fixedCoords = [];
          for (let i = 0; i < coords.length; i += 3) {
            fixedCoords.push([coords[i], coords[i + 1], coords[i + 2]]);
          }
          feature.geometry.coordinates = fixedCoords;
        }
      }
    });
  }
  return geojson;
}

export function parseGpx(gpxString: string) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxString, 'application/xml');
  const rawGeojson = toGeoJSON.gpx(xml);
  
  console.log("✅ Raw GeoJSON from GPX:\n", JSON.stringify(rawGeojson, null, 2)); // 👈 Log for debugging

  const fixedGeojson = fixFlatCoordinates(rawGeojson);
  return fixedGeojson;
}
