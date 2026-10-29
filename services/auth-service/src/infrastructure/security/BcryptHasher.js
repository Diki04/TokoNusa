import bcrypt from 'bcryptjs';

export class BcryptHasher {
  constructor(rounds = 10) {
    this.rounds = rounds;
  }

  async hash(plainText) {
    return bcrypt.hash(plainText, this.rounds);
  }

  async compare(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  }
}
