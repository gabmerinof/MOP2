import { injectable } from 'inversify';
import { DatabaseMikro } from '../config/database';
import { GeoPoint, PointType } from '../entities/geo-point.entity';
import { User } from '../entities/user.entity';
import { GeoPointRepository, ProximityFilter } from '../repositories/geo-point.repository';
import { GeoJSONFeatureCollection } from '../types/geojson.types';
import { AppError } from '../utils/AppError';

export interface CreatePointData {
  latitude: number;
  longitude: number;
  type: PointType;
  description?: string;
  user: User;
}

export interface UpdatePointData {
  latitude?: number;
  longitude?: number;
  type?: PointType;
  description?: string;
}

@injectable('Request')
export class GeoPointService {

  async createPoint(data: CreatePointData): Promise<GeoPoint> {
    const point = GeoPoint.create(
      data.latitude,
      data.longitude,
      data.type,
      data.user,
      data.description
    );

    await this.getRepository().insert(point);
    return point;
  }

  async findAll(filter?: ProximityFilter): Promise<GeoPoint[] | undefined> {
    if (filter)
      return this.getRepository().findWithProximity(filter);

    return this.getRepository().findAllWithUser();
  }

  async findById(geopintid: string): Promise<GeoPoint> {
    const point = await this.getRepository().findByIdWithUser(geopintid);
    if (!point) {
      throw new AppError('GEOPOINT_ERROR', 'Punto no encontrado', 404);
    }
    return point;
  }

  async updatePoint(pointId: string, userId: string, data: UpdatePointData): Promise<GeoPoint> {
    const point = await this.getRepository().findByIdWithUser(pointId);
    if (!point) {
      throw new AppError('GEOPOINT_ERROR', 'Punto no encontrado', 404);
    }

    if (point.user.userid !== userId) {
      throw new AppError('GEOPOINT_ERROR', 'No está autorizado para actualizar éste punto.', 403);
    }

    if (data.latitude !== undefined || data.longitude !== undefined) {
      const newLongitude = data.longitude !== undefined ? data.longitude : point.longitude;
      const newLatitude = data.latitude !== undefined ? data.latitude : point.latitude;

      point.geom = {
        type: 'Point',
        coordinates: [newLongitude, newLatitude]
      };
    }

    if (data.type !== undefined) point.type = data.type;
    if (data.description !== undefined) point.description = data.description;

    await this.getRepository().getEntityManager().flush();

    return point;
  }

  async deletePoint(id: string, userId: string): Promise<void> {
    const deleted = await this.getRepository().deleteUserPoint(id, userId);
    if (!deleted) {
      throw new AppError('GEOPOINT_ERROR', 'Punto no encontrado o no autorizado', 404);
    }
  }

  async getGeoJSON(): Promise<GeoJSONFeatureCollection | undefined> {

    return this.getRepository().findAllAsGeoJSON();
  }

  async getGeoJSOByUser(userid: string): Promise<GeoPoint[] | undefined> {

    return this.getRepository().findAllAsGeoJSONByUser(userid);
  }

  public getRepository(): GeoPointRepository{
  
      return DatabaseMikro.getRepository(GeoPoint) as GeoPointRepository
    }

}