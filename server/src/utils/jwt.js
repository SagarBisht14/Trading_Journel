import jwt from 'jsonwebtoken';

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export function createAuthResponse(user) {
  const token = signToken(user._id);
  return {
    token,
    user: user.toSafeJSON()
  };
}
