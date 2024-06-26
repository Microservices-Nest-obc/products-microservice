import 'dotenv/config';
import * as Joi from 'joi';

interface EnvConfig {
  PORT: string;
  DATABASE_URL: string;
}

export const envVarsSchema = Joi.object({
  PORT: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
}).unknown(true);

const { error, value } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvConfig = value;

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
};
