import express from 'express';
import { createErrorResponse, createSuccessResponse } from '../types/ApiResponse';

export const responseFormatter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const originalJson = res.json;
    const originalSend = res.send;

    res.json = (body?: any) => {
        let response = body;
        if (body && typeof body === 'object' && !body?.success)
            response = body?.error ? createErrorResponse(body.error, body.message) : createSuccessResponse(body);

        return originalJson.call(res, response);
    };

    res.send = (body?: any) => originalSend.call(res, body);
    next();
};