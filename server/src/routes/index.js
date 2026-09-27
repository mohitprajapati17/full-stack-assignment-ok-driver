import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import cameraRoutes from '../modules/cameras/camera.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import healthRoutes from '../modules/health/health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/cameras', cameraRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
