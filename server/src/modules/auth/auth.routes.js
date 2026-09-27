import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import * as authController from './auth.controller.js';
import { loginSchema } from './auth.validation.js';

const router = Router();

router.post('/login', validate({ body: loginSchema }), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
