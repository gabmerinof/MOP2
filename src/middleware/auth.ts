import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { createErrorResponse } from '../types/ApiResponse';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        username: string;
    };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header('authorization');
        if (!authHeader)
            throw new Error('Header de autorización no presente');

        if (!authHeader.startsWith('Bearer '))
            throw new Error('Formato de autorización inválido. Use: Bearer <token>');

        const token = authHeader.replace('Bearer ', '');
        if (!token) throw new Error('Token no proporcionado');

        const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JwtPayload;
        req.user = { userId: decoded['userId'], username: decoded['username']};

        next();

    } catch (err) {
        let errorMessage = 'Error de autenticación';

        if (err instanceof jwt.TokenExpiredError) {
            errorMessage = 'Token expirado. Por favor, inicie sesión nuevamente';
        } else if (err instanceof jwt.JsonWebTokenError) {
            errorMessage = 'Token inválido. Verifique sus credenciales';
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }

        res.status(401).json(
            createErrorResponse(
                'TOKEN_ERROR',
                errorMessage
            )
        );
    }
};