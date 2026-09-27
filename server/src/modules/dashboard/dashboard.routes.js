import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import * as dashboardController from './dashboard.controller.js';
import { feedQuerySchema, summaryQuerySchema } from './dashboard.validation.js';

const router = Router();
const withFeedQuery = validate({ query: feedQuerySchema });

router.use(authenticate);

router.get('/summary', validate({ query: summaryQuerySchema }), dashboardController.getSummary);
router.get('/active-alerts', withFeedQuery, dashboardController.listActiveAlerts);
router.get('/recent-detections', withFeedQuery, dashboardController.listRecentDetections);
router.get('/recent-activity', withFeedQuery, dashboardController.listRecentActivity);

export default router;
