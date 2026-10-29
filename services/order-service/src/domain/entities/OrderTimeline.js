import crypto from 'node:crypto';
import { ValidationError } from '@tokonusa/common';

export class OrderTimeline {
  constructor({
    id,
    orderId = null,
    order_id = null,
    status,
    title,
    description,
    timestamp = new Date().toISOString(),
  }) {
    const finalOrderId = orderId || order_id;

    if (!status || typeof status !== 'string' || status.trim().length === 0) {
      throw new ValidationError('Timeline status is required');
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationError('Timeline title is required');
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new ValidationError('Timeline description is required');
    }

    this.id = id || crypto.randomUUID();
    this.orderId = finalOrderId;
    this.status = status.trim();
    this.title = title.trim();
    this.description = description.trim();
    this.timestamp = timestamp;
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      status: this.status,
      title: this.title,
      description: this.description,
      timestamp: this.timestamp,
    };
  }
}
