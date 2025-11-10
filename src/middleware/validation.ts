import { AppError } from '../utils/AppError';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3).max(50),
    password: Joi.string().required().min(6),
    email: Joi.string().email().optional(),
  }).messages({
    'any.required': '{{#label}} es requerido.',
    'string.min': '{{#label}} debe de contener al menos {{#limit}} caracteres.',
    'string.max': '{{#label}} debe de contener máximo {{#limit}} caracteres.',
    'string.empty': '{{#label}} no puede ser vacío.',
    'string.email': '{{#label}} debe ser un correo válido',
  });

  const { error } = schema.validate(req.body);
  if (error)
    throw new AppError('VALIDATION_ERROR', error?.details[0]?.message ?? '', 400);

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).messages({
    'any.required': '{{#label}} es requerido.',
    'string.empty': '{{#label}} no puede ser vacío.'
  });

  const { error } = schema.validate(req.body);
  if (error)
    throw new AppError('VALIDATION_ERROR', error?.details[0]?.message ?? '', 400);

  next();
};

export const validateGeoPoint = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    type: Joi.string().valid('accidente', 'congestión', 'obstrucción', 'otro').required(),
    description: Joi.string().max(500).optional(),
    userid: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error)
    throw new AppError('VALIDATION_ERROR', error?.details[0]?.message ?? '', 400);

  next();
};

export const validateProximityFilter = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    type: Joi.string().valid('accidente', 'congestión', 'obstrucción', 'otro').optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    long: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().min(0.1).max(100).optional(),
  });

  const { error } = schema.validate(req.query);
  if (error)
    throw new AppError('VALIDATION_ERROR', error?.details[0]?.message ?? '', 400);

  next();
};