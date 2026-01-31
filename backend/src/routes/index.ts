import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import productRoutes from './product.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/users', userRoutes);
router.use('/products', productRoutes);

export default router;
