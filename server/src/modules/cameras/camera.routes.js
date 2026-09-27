import { Router } from 'express';
import { USER_ROLES } from '../../constants/enums.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import * as cameraController from './camera.controller.js';
import {
  cameraIdParamsSchema,
  createCameraSchema,
  listCamerasQuerySchema,
  updateCameraSchema,
  updateCameraStatusSchema,
} from './camera.validation.js';

const router = Router();
const adminOnly = authorize(USER_ROLES.ADMIN);
const withId = validate({ params: cameraIdParamsSchema });

router.use(authenticate);

router.get('/', validate({ query: listCamerasQuerySchema }), cameraController.listCameras);
router.get('/filter-options', cameraController.getFilterOptions);
router.get('/locations', cameraController.listCameraLocations);
router.get('/:id', withId, cameraController.getCamera);

router.post('/', adminOnly, validate({ body: createCameraSchema }), cameraController.createCamera);
router.put(
  '/:id',
  adminOnly,
  validate({ params: cameraIdParamsSchema, body: updateCameraSchema }),
  cameraController.updateCamera,
);
router.patch(
  '/:id/status',
  adminOnly,
  validate({ params: cameraIdParamsSchema, body: updateCameraStatusSchema }),
  cameraController.updateCameraStatus,
);
router.delete('/:id', adminOnly, withId, cameraController.disableCamera);

export default router;
