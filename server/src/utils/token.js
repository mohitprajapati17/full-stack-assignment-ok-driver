import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ALGORITHM = 'HS256';

export function signAccessToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user._id.toString(),
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: ALGORITHM,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
}
