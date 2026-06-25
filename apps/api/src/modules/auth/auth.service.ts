import bcrypt from 'bcrypt';
import { findByEmail } from '../users/users.model';
import type { SessionUser } from '@konnit/types';
import { AppError } from '../../middleware/errorHandler';

export async function authenticateUser(
  email: string,
  password: string,
): Promise<SessionUser> {
  const user = await findByEmail(email);
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng');
  }

  if (user.status !== 'active') {
    throw new AppError(403, 'ACCOUNT_DISABLED', 'Tài khoản đã bị vô hiệu hóa');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as SessionUser['role'],
    fullName: user.full_name,
  };
}
