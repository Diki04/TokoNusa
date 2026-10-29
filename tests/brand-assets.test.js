import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Brand Logo Assets', () => {
  it('symbol.svg exists and contains clean valid SVG geometry', () => {
    const symbolPath = path.resolve('apps/web/public/brand/symbol.svg');
    expect(fs.existsSync(symbolPath)).toBe(true);
    const content = fs.readFileSync(symbolPath, 'utf8');
    expect(content).toContain('viewBox="0 0 256 256"');
    expect(content).toContain('#03AC0E');
    expect(content).not.toContain('<image'); // zero raster
  });

  it('horizontal lockup contains brand wordmark and symbol', () => {
    const lockupPath = path.resolve('apps/web/public/brand/toko-nusa-horizontal.svg');
    expect(fs.existsSync(lockupPath)).toBe(true);
    const content = fs.readFileSync(lockupPath, 'utf8');
    expect(content).toContain('TokoNusa');
  });

  it('favicon.svg exists and is valid 64x64 SVG icon', () => {
    const faviconPath = path.resolve('apps/web/public/brand/favicon.svg');
    expect(fs.existsSync(faviconPath)).toBe(true);
    const content = fs.readFileSync(faviconPath, 'utf8');
    expect(content).toContain('viewBox="0 0 64 64"');
  });
});
