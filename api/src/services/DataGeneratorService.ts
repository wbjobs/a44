import type { DistributionType, GenerateResponse } from '@shared/types';

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export class DataGeneratorService {
  generate(
    count: number,
    minHeight: number,
    maxHeight: number,
    distribution: DistributionType,
    seed?: number
  ): GenerateResponse {
    const actualSeed = seed ?? Math.floor(Math.random() * 2 ** 31);
    const random = seededRandom(actualSeed);

    const heights: number[] = [];
    const range = Math.max(1, maxHeight - minHeight + 1);

    switch (distribution) {
      case 'random':
        for (let i = 0; i < count; i++) {
          heights.push(Math.floor(random() * range) + minHeight);
        }
        break;

      case 'increasing':
        for (let i = 0; i < count; i++) {
          const base = minHeight + Math.floor((i / Math.max(1, count - 1)) * (maxHeight - minHeight));
          const jitter = Math.floor(random() * Math.min(range * 0.1, 10));
          heights.push(Math.min(maxHeight, base + jitter));
        }
        break;

      case 'decreasing':
        for (let i = 0; i < count; i++) {
          const base = maxHeight - Math.floor((i / Math.max(1, count - 1)) * (maxHeight - minHeight));
          const jitter = Math.floor(random() * Math.min(range * 0.1, 10));
          heights.push(Math.max(minHeight, base - jitter));
        }
        break;

      case 'peak':
        const peakIndex = Math.floor(count * 0.4 + random() * count * 0.2);
        for (let i = 0; i < count; i++) {
          let progress: number;
          if (i <= peakIndex) {
            progress = peakIndex === 0 ? 1 : i / peakIndex;
          } else {
            progress = count - 1 === peakIndex ? 1 : (count - 1 - i) / (count - 1 - peakIndex);
          }
          const base = minHeight + Math.floor(progress * (maxHeight - minHeight));
          const jitter = Math.floor(random() * Math.min(range * 0.08, 8));
          heights.push(Math.min(maxHeight, Math.max(minHeight, base + jitter - 4)));
        }
        break;
    }

    return { heights, seed: actualSeed };
  }
}

export const dataGeneratorService = new DataGeneratorService();
