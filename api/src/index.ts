import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { algorithmRouter } from './controllers/AlgorithmController';
import { dataRouter } from './controllers/DataController';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api', algorithmRouter);
app.use('/api', dataRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export { app };
