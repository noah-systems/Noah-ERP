import cors, { type CorsOptions } from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './lib/config';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';

const app = express();

const corsOptions: CorsOptions = config.corsOrigins.length
  ? { origin: config.corsOrigins, credentials: true }
  : { origin: true, credentials: true };

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;
