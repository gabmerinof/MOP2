import { EntityProperty, Platform, Type } from "@mikro-orm/core";
import { Point, Geometry } from "geojson";
import wkx from 'wkx';

export class GeoJsonGeometryType extends Type<Geometry | undefined, string> {

    override getColumnType(prop: EntityProperty, platform: Platform): string {
        return "geometry";
    }

    override convertToDatabaseValue(value: Geometry, platform: Platform): string {
        if (!value)
            return '';

        return wkx.Geometry.parseGeoJSON(value).toWkb().toString('hex');
    }

    override convertToJSValue(value: string | undefined, platform: Platform): Geometry | undefined {
        if (!value)
            return undefined;
        
        return wkx.Geometry.parse(Buffer.from(value, 'hex')).toGeoJSON() as Geometry
    }
}