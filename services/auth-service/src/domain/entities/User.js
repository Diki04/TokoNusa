export class User {
  constructor({
    id,
    name,
    email,
    passwordHash,
    role = 'BUYER',
    phone = null,
    avatarUrl = null,
    createdAt = new Date(),
    updatedAt = new Date(),
    addresses = [],
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.phone = phone;
    this.avatarUrl = avatarUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.addresses = addresses;
  }

  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      phone: this.phone,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      addresses: this.addresses.map((addr) =>
        addr.toJSON ? addr.toJSON() : addr
      ),
    };
  }

  toJSON() {
    return this.toSafeObject();
  }
}
