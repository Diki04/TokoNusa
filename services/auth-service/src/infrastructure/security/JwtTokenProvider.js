import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@tokonusa/common';

export class JwtTokenProvider {
  constructor(secret = 'tokonusa-jwt-secret-key-super-secure', expiresIn = '24h') {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  generate(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }
  }
}
