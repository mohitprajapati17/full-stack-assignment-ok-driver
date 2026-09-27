import { User } from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signAccessToken } from '../../utils/token.js';

// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const dummyHashPromise = hashPassword('timing-attack-mitigation');

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  const passwordMatches = await verifyPassword(
    password,
    user?.passwordHash ?? (await dummyHashPromise),
  );

  if (!user || !passwordMatches || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return { token: signAccessToken(user), user: user.toJSON() };
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user.toJSON();
}
