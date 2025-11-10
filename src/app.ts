import { RequestContext } from '@mikro-orm/postgresql';
import compression from 'compression';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import nocache from 'nocache';
import { corsMiddleware } from './config/cors';
import { DatabaseMikro } from './config/database';
import { IController } from './controllers/Interfaces/IController';
import { ContainerConfig } from './inversify.config';
import { responseFormatter } from './middleware/responseFormater';

const API_PREFIX = '/api';
const app = express();
app.use(nocache());
app.use(helmet());
app.use(compression());
app.use(corsMiddleware);
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({
    extended: true,
    inflate: true,
    limit: "1mb",
    parameterLimit: 5000,
    type: "application/x-www-form-urlencoded",
}));
app.use(responseFormatter);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.get('/', (req, res) => {
    res.send('Sistema de gestión de tráfico georeferencial');
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Traffic Geo API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

const startServer = async () => {
    try {
        await DatabaseMikro.Initialize();
        
        const containerConfig = new ContainerConfig();
        await containerConfig.configure();
        const controllers = containerConfig.getAllControllers();

        app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            RequestContext.create(DatabaseMikro.getServices()!.em, next);
        });

        controllers.forEach((controller: IController) =>  app.use(`${API_PREFIX}${controller.getPath()}`, controller.getRoute()))
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || 500).json({
                error: err.codeError || 'ERROR',
                message: err.message
            });
        });

        app.all('/{*any}', (req: express.Request, res: express.Response) => {
            res.status(404).json({
                error: 'ERROR',
                message: 'Ruta no encontrada'
            });
        });

        const PORT = process.env['PORT'];
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`Documentación disponible en http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();