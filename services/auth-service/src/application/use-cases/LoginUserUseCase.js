import { UnauthorizedError } from '@tokonusa/common';

export class LoginUserUseCase {
  constructor({ userRepo, passwordHasher, tokenProvider }) {
    this.userRepo = userRepo;
    this.passwordHasher = passwordHasher;
    this.tokenProvider = tokenProvider;
  }

  async execute({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.tokenProvider.generate({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toSafeObject ? user.toSafeObject() : user,
      token,
    };
  }
}
