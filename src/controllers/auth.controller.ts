import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { validateLogin, validateRegister } from '../middleware/validation';
import { AuthService } from '../services/auth.service';
import { IController } from './Interfaces/IController';

@injectable('Request')
export default class AuthController implements IController {
  private router: Router;

  constructor(@inject(AuthService) private authService: AuthService) {
    this.router = Router();
    this.routes();
  }

  getRoute(): Router {
    return this.router;
  }

  getPath(): string {
    return "/auth";
  }

  private routes() {
    this.router.post('/register', validateRegister, this.register.bind(this));
    this.router.post('/login', validateLogin, this.login.bind(this));
  }

  private async register(req: Request, res: Response) {
    const user = await this.authService.register(req.body);
    res.status(201).json({
      ...user!.toJSON()
    });
  }

  private async login(req: Request, res: Response) {
    const result = await this.authService.login(req.body);
    res.json({
      ...result
    });
  }
}