import { Router, Request, Response } from 'express';
import type { GenerateRequest, InverseGenerateRequest } from '@shared/types';
import { dataGeneratorService } from '../services/DataGeneratorService';
import { inverseGeneratorService } from '../services/InverseGeneratorService';

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

router.post('/inverse', (req: Request, res: Response) => {
  try {
    const { targetEnergy, count, difficulty, seed, baseHeight } = req.body as InverseGenerateRequest;

    const safeTarget = Math.max(0, Math.min(50000, targetEnergy ?? 100));
    const safeCount = Math.max(2, Math.min(500, count ?? 12));
    const safeDifficulty = difficulty ?? 'medium';
    const safeBase = Math.max(1, Math.min(5000, baseHeight ?? 20));

    const result = inverseGeneratorService.generate(
      safeTarget,
      safeCount,
      safeDifficulty,
      seed,
      safeBase
    );

    return res.json(result);
  } catch (err) {
    console.error('Inverse generate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const dataRouter = router;
