import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(4000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),
});