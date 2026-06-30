import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';
import { withTransaction } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import * as repository from './repository';
import type { PublicAccess, PublicSessionUser } from './middleware';

const googleClient = new OAuth2Client();

export interface PublicAuthResult {
  sessionUser: PublicSessionUser;
  access: PublicAccess;
  claimedOrders: number;
}

export async function verifyGoogleAndLogin(
  credential: string,
): Promise<PublicAuthResult> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError(
      500,
      'GOOGLE_NOT_CONFIGURED',
      'Google login has not been configured',
    );
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError(
      401,
      'GOOGLE_TOKEN_INVALID',
      'Google credential is invalid or expired',
    );
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new AppError(
      401,
      'GOOGLE_ACCOUNT_INVALID',
      'Google account must have a verified email',
    );
  }

  const identity = {
    subject: payload.sub,
    email: payload.email,
    fullName: payload.name,
    avatarUrl: payload.picture,
  };

  return withTransaction(async (client) => {
    await repository.lockGoogleEmail(client, identity.email);

    let user = await repository.findIdentity(client, identity.subject);
    let claimedOrders = 0;

    if (!user) {
      user = await repository.findUserByEmailForUpdate(client, identity.email);
      if (!user) user = await repository.insertUser(client, identity);

      await repository.insertIdentity(
        client,
        user.id,
        identity.subject,
        identity.email,
      );
    }

    if (user.status !== 'active') {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Tài khoản đã bị vô hiệu hóa');
    }

    await repository.assignCustomerRole(client, user.id);
    claimedOrders = await repository.claimGuestOrders(
      client,
      user.id,
      identity.email,
    );
    await repository.touchLogin(client, user.id, identity);

    const refreshedUser = await repository.findUserById(client, user.id);
    if (!refreshedUser) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Tài khoản không tồn tại');
    }

    return {
      sessionUser: repository.toSessionUser(refreshedUser),
      access: await repository.loadUserAccess(client, user.id),
      claimedOrders,
    };
  });
}

export async function getPublicSessionData(
  userId: number,
): Promise<{ user: PublicSessionUser; access: PublicAccess }> {
  return withTransaction(async (client) => {
    const user = await repository.findUserById(client, userId);
    if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');
    if (user.status !== 'active') {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Tài khoản đã bị vô hiệu hóa');
    }

    return {
      user: repository.toSessionUser(user),
      access: await repository.loadUserAccess(client, user.id),
    };
  });
}
