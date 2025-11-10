import { BeforeCreate, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { Geometry } from "geojson";
import { v4 as uuidv4 } from 'uuid';
import { GeoPointRepository } from '../repositories/geo-point.repository';
import { GeoJsonGeometryType } from '../types/GeoJsonGeometryType';
import { User } from './user.entity';

export enum PointType {
  ACCIDENT = 'accidente',
  CONGESTION = 'congestión',
  OBSTRUCTION = 'obstrucción',
  OTHER = 'otro'
}

@Entity({ tableName: 'geo_points', repository: () => GeoPointRepository })
export class GeoPoint {
  @PrimaryKey({ type: 'uuid' })
  geopointid: string = uuidv4();

  @Property({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Property({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  @Property({ type: GeoJsonGeometryType, columnType: 'geometry' })
  geom!: Geometry;

  @Property({ type: 'string' })
  type!: PointType;

  @Property({ nullable: true })
  description?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @ManyToOne(() => User, {
    fieldName: 'userid',
    joinColumn: 'userid',
  })
  user!: User;

  @BeforeCreate()
  beforeCreate() {
    if (!this.geopointid) {
      this.geopointid = uuidv4();
    }
  }

  toGeoJSONFeature() {
    return {
      type: 'Feature',
      geometry: this.geom,
      properties: {
        geopointid: this.geopointid,
        type: this.type,
        longitude: this.longitude,
        latitude: this.latitude,
        description: this.description,
        userid: this.user.userid,
        username: this.user.username,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    };
  }

  toJSON() {
    return {
      geopointid: this.geopointid,
      latitude: this.latitude,
      longitude: this.longitude,
      geom: this.geom,
      type: this.type,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user.toJSON()
    };
  }

  // Constructor estático para crear puntos fácilmente
  static create(
    latitude: number,
    longitude: number,
    type: PointType,
    user: User,
    description?: string
  ): GeoPoint {
    const point = new GeoPoint();
    point.latitude = latitude;
    point.longitude = longitude;
    point.geom = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    point.type = type;
    point.user = user;
    point.description = description;

    return point;
  }
}