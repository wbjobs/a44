import { Router, Request, Response } from 'express';
import type { SolveRequest, CompareRequest } from '@shared/types';
import { algorithmService } from '../services/AlgorithmService';

const router = Router();

router.post('/solve', (req: Request, res: Response) => {
  try {
    const { heights, algorithm } = req.body as SolveRequest;

    if (!Array.isArray(heights) || heights.length === 0) {
      return res.status(400).json({ error: 'Invalid heights array' });
    }

    if (!algorithm) {
      return res.status(400).json({ error: 'Algorithm is required' });
    }

    const result = algorithmService.solve(heights, algorithm);
    return res.json(result);
  } catch (err) {
    console.error('Solve error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/compare', (req: Request, res: Response) => {
  try {
    const { heights, algorithms } = req.body as CompareRequest;

    if (!Array.isArray(heights) || heights.length === 0) {
      return res.status(400).json({ error: 'Invalid heights array' });
    }

    if (!Array.isArray(algorithms) || algorithms.length === 0) {
      return res.status(400).json({ error: 'Algorithms array is required' });
    }

    const result = algorithmService.compare(heights, algorithms);
    return res.json(result);
  } catch (err) {
    console.error('Compare error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export const algorithmRouter = router;
