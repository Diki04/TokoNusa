import { describe, it, expect } from 'vitest';
import { DomainError, createApiResponse } from '../packages/common/src/index.js';

describe('Common Utilities', () => {
  it('creates standardized API success response', () => {
    const payload = { id: '123', name: 'TokoNusa' };
    const res = createApiResponse(true, payload);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(payload);
  });

  it('constructs DomainError with appropriate code', () => {
    const err = new DomainError('Invalid state', 'INVALID_STATE');
    expect(err.message).toBe('Invalid state');
    expect(err.code).toBe('INVALID_STATE');
  });
});
