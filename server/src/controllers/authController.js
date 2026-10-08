import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/tokens.js';

function authPayload(user) {
  return { token: signToken(user), user: user.toJSON() };
}

export async function register(request, response) {
  const { name, email, password, role } = request.body;
  if (!name || !email || !password || !role) {
    throw new AppError('Name, email, password, and role are required', 400);
  }
  const user = await User.create({ name, email, password, role });
  response.status(201).json(authPayload(user));
}

export async function login(request, response) {
  const { email, password } = request.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new AppError('This account has been deactivated', 403);
  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  response.json(authPayload(user));
}

export async function getMe(request, response) {
  response.json({ user: request.user });
}

export async function logout(_request, response) {
  response.json({ message: 'Logged out successfully' });
}

