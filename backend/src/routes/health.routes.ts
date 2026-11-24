import { Router, Request, Response } from 'express';
import { llmAdapter } from '../ai/llm-adapter';
import os from 'os';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const freeMemMB = Math.round(os.freemem() / (1024 * 1024));
  const totalMemMB = Math.round(os.totalmem() / (1024 * 1024));

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      freeMemMB,
      totalMemMB,
      nodeHeapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
      nodeRssMB: Math.round(memoryUsage.rss / (1024 * 1024)),
      isLowMemoryEnvironment: totalMemMB <= 2500 // Windows 2GB RAM optimization flag
    },
    ai: {
      availableFreeProviders: llmAdapter.getAvailableProviders(),
      zeroCostGuarantee: true
    }
  });
});

export default router;
