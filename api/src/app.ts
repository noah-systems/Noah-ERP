import cors, { type CorsOptions } from 'cors';
import express from 'express';

import { allowedOrigins, env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import routes from './routes';

export function createApp() {
  const app = express();

  const corsOptions: CorsOptions = {
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  app.use(errorHandler);

  return app;
}

export const port = env.PORT;
