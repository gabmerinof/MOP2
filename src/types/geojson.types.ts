import { Point } from "geojson";

export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: Point;
  properties: Record<string, any>;
  geopointid?: string | number;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}