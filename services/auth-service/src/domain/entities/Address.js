export class Address {
  constructor({
    id,
    userId,
    receiverName,
    phone,
    street,
    city,
    province,
    postalCode,
    isPrimary = false,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.userId = userId;
    this.receiverName = receiverName;
    this.phone = phone;
    this.street = street;
    this.city = city;
    this.province = province;
    this.postalCode = postalCode;
    this.isPrimary = Boolean(isPrimary);
    this.createdAt = createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      receiverName: this.receiverName,
      phone: this.phone,
      street: this.street,
      city: this.city,
      province: this.province,
      postalCode: this.postalCode,
      isPrimary: this.isPrimary,
      createdAt: this.createdAt,
    };
  }
}
