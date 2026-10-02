import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import boardRoutes from './board.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy'
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/boards', boardRoutes);

export default router;
