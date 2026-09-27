import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/token.js';

export async function authenticate(req, _res, next) {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  // Looked up on every request so that deactivated users lose access immediately.
  const user = await User.findById(payload.sub).lean();
  if (!user || !user.isActive) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  req.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  next();
}
