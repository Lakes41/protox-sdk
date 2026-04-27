import { formatTokenBalance } from '../src/utils/format';

describe('formatTokenBalance Helper', () => {
  it('formats standard 7 decimal Stellar amounts correctly', () => {
    expect(formatTokenBalance('10000000')).toBe('1');
    expect(formatTokenBalance('15000000')).toBe('1.5');
    expect(formatTokenBalance('12345678')).toBe('1.2345678');
  });

  it('handles values smaller than 1 token correctly', () => {
    expect(formatTokenBalance('1')).toBe('0.0000001');
    expect(formatTokenBalance('500000')).toBe('0.05');
  });

  it('handles custom decimal configurations (e.g., 18 decimals like ETH)', () => {
    expect(formatTokenBalance('1000000000000000000', 18)).toBe('1');
    expect(formatTokenBalance('1500000000000000000', 18)).toBe('1.5');
    expect(formatTokenBalance('1', 18)).toBe('0.000000000000000001');
  });

  it('handles zero correctly', () => {
    expect(formatTokenBalance('0')).toBe('0');
    expect(formatTokenBalance(0)).toBe('0');
  });

  it('handles negative balances correctly', () => {
    expect(formatTokenBalance('-15000000')).toBe('-1.5');
    expect(formatTokenBalance('-1')).toBe('-0.0000001');
  });

  it('supports multiple input types (string, number, bigint)', () => {
    expect(formatTokenBalance(15000000)).toBe('1.5');
    expect(formatTokenBalance(BigInt('15000000'))).toBe('1.5');
  });
});