import crypto from 'node:crypto';
import { ConflictError } from '@tokonusa/common';
import { User } from '../../domain/entities/User.js';

export class RegisterUserUseCase {
  constructor({ userRepo, passwordHasher, tokenProvider }) {
    this.userRepo = userRepo;
    this.passwordHasher = passwordHasher;
    this.tokenProvider = tokenProvider;
  }

  async execute({ name, email, password, role = 'BUYER', phone = null, avatarUrl = null }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userRepo.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const userId = crypto.randomUUID();

    const user = await this.userRepo.create({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      phone,
      avatarUrl,
    });

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
