import { Router, Request, Response } from 'express';
import type { GenerateRequest } from '@shared/types';
import { dataGeneratorService } from '../services/DataGeneratorService';

const router = Router();

router.post('/generate', (req: Request, res: Response) => {
  try {
    const { count, minHeight, maxHeight, distribution, seed } = req.body as GenerateRequest;

    const safeCount = Math.max(2, Math.min(500, count ?? 10));
    const safeMin = Math.max(1, minHeight ?? 1);
    const safeMax = Math.min(10000, Math.max(safeMin + 1, maxHeight ?? 100));
    const safeDist = distribution ?? 'random';

    const result = dataGeneratorService.generate(
      safeCount,
      safeMin,
      safeMax,
      safeDist,
      seed
    );

    return res.json(result);
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const dataRouter = router;
