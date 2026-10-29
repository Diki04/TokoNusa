import { NotFoundError } from '@tokonusa/common';

export class GetUserProfileUseCase {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async execute(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const addresses = await this.userRepo.getAddressesByUserId(userId);
    const safeUser = user.toSafeObject ? user.toSafeObject() : user;

    return {
      ...safeUser,
      addresses: addresses.map((addr) => (addr.toJSON ? addr.toJSON() : addr)),
    };
  }
}
