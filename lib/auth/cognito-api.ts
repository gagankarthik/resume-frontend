import { createHmac } from 'node:crypto';
import { cognitoConfig } from './config';

/**
 * Thin client for the Cognito Identity Provider JSON API.
 *
 * Called only from server route handlers — the browser never talks to Cognito
 * directly, so a password crosses one TLS hop to our server and a second to
 * AWS, and is never written anywhere. Using the JSON API rather than the AWS
 * SDK keeps the bundle small and avoids shipping credentials-aware code into a
 * Next.js server that has no AWS credentials to use.
 */

type CognitoAction =
  | 'InitiateAuth'
  | 'RespondToAuthChallenge'
  | 'ForgotPassword'
  | 'ConfirmForgotPassword'
  | 'GlobalSignOut';

export type CognitoError = { __type: string; message: string };

export class CognitoRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'CognitoRequestError';
  }
}

async function call<T>(action: CognitoAction, body: Record<string, unknown>): Promise<T> {
  const { region } = cognitoConfig();

  const res = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const err = json as CognitoError;
    const code = (err.__type ?? 'UnknownError').split('#').pop() ?? 'UnknownError';
    throw new CognitoRequestError(code, err.message ?? 'Sign-in failed.', res.status);
  }

  return json as T;
}

/** Required only when the app client was created with a secret. */
function secretHash(username: string): string | undefined {
  const { clientId, clientSecret } = cognitoConfig();
  if (!clientSecret) return undefined;
  return createHmac('sha256', clientSecret).update(username + clientId).digest('base64');
}

export type AuthTokens = {
  IdToken: string;
  AccessToken: string;
  RefreshToken?: string;
  ExpiresIn: number;
};

export type AuthResult = {
  AuthenticationResult?: AuthTokens;
  ChallengeName?: string;
  Session?: string;
  ChallengeParameters?: Record<string, string>;
};

export function signIn(username: string, password: string): Promise<AuthResult> {
  const { clientId } = cognitoConfig();
  const hash = secretHash(username);

  return call<AuthResult>('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      ...(hash ? { SECRET_HASH: hash } : {}),
    },
  });
}

/** Completes a forced password change on a first sign-in. */
export function respondToNewPassword(
  username: string,
  newPassword: string,
  session: string,
): Promise<AuthResult> {
  const { clientId } = cognitoConfig();
  const hash = secretHash(username);

  return call<AuthResult>('RespondToAuthChallenge', {
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ClientId: clientId,
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: newPassword,
      ...(hash ? { SECRET_HASH: hash } : {}),
    },
  });
}

/** Completes a TOTP or SMS challenge. */
export function respondToMfa(
  username: string,
  code: string,
  session: string,
  challenge: 'SOFTWARE_TOKEN_MFA' | 'SMS_MFA',
): Promise<AuthResult> {
  const { clientId } = cognitoConfig();
  const hash = secretHash(username);
  const key = challenge === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA_CODE' : 'SMS_MFA_CODE';

  return call<AuthResult>('RespondToAuthChallenge', {
    ChallengeName: challenge,
    ClientId: clientId,
    Session: session,
    ChallengeResponses: {
      USERNAME: username,
      [key]: code,
      ...(hash ? { SECRET_HASH: hash } : {}),
    },
  });
}

export function refresh(refreshToken: string): Promise<AuthResult> {
  const { clientId, clientSecret } = cognitoConfig();

  return call<AuthResult>('InitiateAuth', {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: clientId,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
      ...(clientSecret ? { SECRET_HASH: clientSecret } : {}),
    },
  });
}

export function forgotPassword(username: string): Promise<unknown> {
  const { clientId } = cognitoConfig();
  const hash = secretHash(username);

  return call('ForgotPassword', {
    ClientId: clientId,
    Username: username,
    ...(hash ? { SecretHash: hash } : {}),
  });
}

export function confirmForgotPassword(
  username: string,
  code: string,
  newPassword: string,
): Promise<unknown> {
  const { clientId } = cognitoConfig();
  const hash = secretHash(username);

  return call('ConfirmForgotPassword', {
    ClientId: clientId,
    Username: username,
    ConfirmationCode: code,
    Password: newPassword,
    ...(hash ? { SecretHash: hash } : {}),
  });
}

/**
 * Cognito's error codes are precise but not written for end users. Map them to
 * something a person can act on, and never reveal whether an account exists.
 */
export function readableError(code: string): string {
  switch (code) {
    case 'NotAuthorizedException':
      return 'That email and password do not match. Check both and try again.';
    case 'UserNotFoundException':
      return 'That email and password do not match. Check both and try again.';
    case 'UserNotConfirmedException':
      return 'This account has not been confirmed yet. Check your email for the confirmation link.';
    case 'PasswordResetRequiredException':
      return 'Your password needs to be reset before you can sign in.';
    case 'TooManyRequestsException':
    case 'LimitExceededException':
      return 'Too many attempts. Wait a minute and try again.';
    case 'CodeMismatchException':
      return 'That code is not correct. Check it and try again.';
    case 'ExpiredCodeException':
      return 'That code has expired. Request a new one.';
    case 'InvalidPasswordException':
      return 'That password does not meet the requirements for this account.';
    case 'InvalidParameterException':
      return 'Something in that request was not valid. Check the fields and try again.';
    default:
      return 'Sign-in could not be completed. Try again in a moment.';
  }
}
