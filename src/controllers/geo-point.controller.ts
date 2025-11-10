import { Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { PointType } from '../entities/geo-point.entity';
import { User } from '../entities/user.entity';
import { auth, AuthRequest } from '../middleware/auth';
import { validateGeoPoint, validateProximityFilter } from '../middleware/validation';
import { GeoPointService } from '../services/geo-point.service';
import { AppError } from '../utils/AppError';
import { IController } from './Interfaces/IController';

@injectable('Request')
export default class GeoPointController implements IController {
  private router: Router;

  constructor(@inject(GeoPointService) private geoPointService: GeoPointService) {
    this.router = Router();
    this.routes();
  }

  getRoute(): Router {
    return this.router;
  }

  getPath(): string {
    return "/points";
  }

  private routes() {
    this.router.get('/', auth, validateProximityFilter, this.getAllPoints.bind(this));
    this.router.get('/geojson', auth, this.getGeoJSON.bind(this));
    this.router.get('/:geoPointId', auth, this.getPointById.bind(this));
    this.router.get('/user/my-points', auth, this.getUserPoints.bind(this));
    this.router.post('/', auth, validateGeoPoint, this.createPoint.bind(this));
    this.router.put('/:geoPointId', auth, validateGeoPoint, this.updatePoint.bind(this));
    this.router.delete('/:geoPointId', auth, this.deletePoint.bind(this));
  }

  private async getAllPoints(req: AuthRequest, res: Response) {
    const { type, lat, lng, radius } = req.query;

    let filter;
    if (lat && lng && radius) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = parseFloat(radius as string);

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) 
        throw new AppError('', 'Latitud, Longitud y radio deben ser números válidos', 400);
      
      filter = {
        lat: latitude,
        lng: longitude,
        radius: radiusKm,
        type: type as PointType
      };
    }

    const points = await this.geoPointService.findAll(filter);
    res.json({
      ...points
    });
  }

  private async getUserPoints(req: AuthRequest, res: Response) {
    const userid = req.user!.userId;

    try {
      const geoJSON = await this.geoPointService.getGeoJSOByUser(userid);
      res.json({
        points: geoJSON,
        count: geoJSON?.length
      });
    } catch (error: any) {
      throw new AppError('', error.message, 500);
    }
  }

  private async getGeoJSON(req: AuthRequest, res: Response) {
    try {
      const geoJSON = await this.geoPointService.getGeoJSON();
      res.json({
        ...geoJSON
      });
    } catch (error: any) {
      throw new AppError('', error.message, 500);
    }
  }

  private async getPointById(req: AuthRequest, res: Response) {
    const { geoPointId } = req.params;
    const point = await this.geoPointService.findById(geoPointId!);
    res.json({
      ...point
    });
  }

  private async createPoint(req: AuthRequest, res: Response) {
    const { latitude, longitude, type, description } = req.body;

    if (!latitude || !longitude || !type) 
      throw new AppError('', 'Latitud, longitud y tipo son requeridos', 400);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) 
      throw new AppError('', 'Latitud debe de estar entre -90 y 90', 400);

    if (isNaN(lng) || lng < -180 || lng > 180) 
      throw new AppError('', 'Longitud debe de estar entre -180 y 180', 400);

    if (!Object.values(PointType).includes(type)) 
      throw new AppError('', `Tipo debe de contener uno de éstos valores: ${Object.values(PointType).join(', ')}`, 400);

    const user = new User();
    user.userid = req.user!.userId;

    const point = await this.geoPointService.createPoint({
      latitude: lat,
      longitude: lng,
      type,
      description,
      user
    });

    res.status(201).json({
      ...point
    });
  }

  private async updatePoint(req: AuthRequest, res: Response) {
    const { geoPointId } = req.params;
    const updateData = req.body;
    const userId = req.user!.userId;

    const point = await this.geoPointService.updatePoint(geoPointId!, userId, updateData);
    res.json({
      ...point
    });
  }

  private async deletePoint(req: AuthRequest, res: Response) {
    const { geoPointId } = req.params;
    const userId = req.user!.userId;

    await this.geoPointService.deletePoint(geoPointId!, userId);
    res.json({
      message: 'Punto eliminado con éxito'
    });
  }
}