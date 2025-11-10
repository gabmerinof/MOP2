import { EntityRepository } from '@mikro-orm/postgresql';
import { GeoPoint, PointType } from '../entities/geo-point.entity';
import { GeoJSONFeature, GeoJSONFeatureCollection } from '../types/geojson.types';

export interface ProximityFilter {
  lat: number;
  lng: number;
  radius: number; // in kilometers
  type?: PointType;
}

export class GeoPointRepository extends EntityRepository<GeoPoint> {

  async findWithProximity(filter: ProximityFilter): Promise<GeoPoint[]> {
    const { lat, lng, radius, type } = filter;

    let query = `SELECT 
                        gp.*,
                        u.username,
                        u.email,
                        ST_Distance(
                        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                        ST_SetSRID(ST_MakePoint(gp.longitude, gp.latitude), 4326)::geography
                        ) as distance
                    FROM geo_points gp
                    INNER JOIN users u ON gp.userid = u.userid
                    WHERE ST_DWithin(
                        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                        ST_SetSRID(ST_MakePoint(gp.longitude, gp.latitude), 4326)::geography,
                        $3 * 1000
                    )`;

    const params: any[] = [lng, lat, radius * 1000]; // Convert to meters
    let paramCount = 3;

    if (type) {
      paramCount++;
      query += ` AND gp.type = $${paramCount}`;
      params.push(type);
    }

    query += ` ORDER BY distance ASC`;

    const result = await this.getEntityManager().execute(query, params);

    return result.map((row: any) => {
      const point = this.getEntityManager().map(GeoPoint, row);
      (point as any).distance = row.distance;

      return point;
    });
  }

  async findByIdWithUser(pointId: string): Promise<GeoPoint | null> {
    return this.findOne({ geopointid: pointId }, { populate: ['user'] });
  }

  async findAllWithUser(): Promise<GeoPoint[]> {
    return this.findAll({ populate: ['user'] });
  }

  async userOwnsPoint(pointId: string, userid: string): Promise<boolean> {
    const point = await this.findOne({ geopointid: pointId });
    return point?.user.userid === userid;
  }

  async deleteUserPoint(pointId: string, userId: string): Promise<boolean> {
    const point = await this.findOne({ geopointid: pointId });
    if (point?.user.userid === userId) {
      await this.em.removeAndFlush(point);

      return true;
    }

    return false;
  }

  async findAllAsGeoJSON(): Promise<GeoJSONFeatureCollection> {
    const points = await this.findAllWithUser();

    return {
      type: 'FeatureCollection',
      features: points.map(point => point.toGeoJSONFeature()) as GeoJSONFeature[]
    };
  }

  async findAllAsGeoJSONByUser(userid: string): Promise<GeoPoint[]> {
    const points = await this.find({ user: { userid: userid } });

    return points.map(data => ({
      ...data
    })) as GeoPoint[]
  }
}