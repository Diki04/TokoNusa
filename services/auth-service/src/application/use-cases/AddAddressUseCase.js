import crypto from 'node:crypto';
import { NotFoundError } from '@tokonusa/common';

export class AddAddressUseCase {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async execute({
    userId,
    receiverName,
    phone,
    street,
    city,
    province,
    postalCode,
    isPrimary = false,
  }) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const address = await this.userRepo.addAddress({
      id: crypto.randomUUID(),
      userId,
      receiverName: receiverName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      isPrimary: Boolean(isPrimary),
    });

    return address.toJSON ? address.toJSON() : address;
  }
}
