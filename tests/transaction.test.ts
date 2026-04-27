import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { TransactionFetcher, TransactionRecord } from '../src/utils/transactionFetcher';
import { NETWORKS, DEFAULT_NETWORK } from '../src/utils/networkConfig';

const mockRecords = [
  {
    id: 'tx-001',
    hash: 'abc123',
    created_at: '2026-04-28T00:00:00Z',
    source_account: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    operation_count: 1,
    successful: true,
    memo: 'deposit',
    fee_charged: '100',
  },
  {
    id: 'tx-002',
    hash: 'def456',
    created_at: '2026-04-27T00:00:00Z',
    source_account: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    operation_count: 2,
    successful: false,
    fee_charged: '200',
  },
];

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

function buildMockResponse(records: object[]) {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({ _embedded: { records } }),
  } as Response);
}

describe('TransactionFetcher', () => {
  let fetcher: TransactionFetcher;
  const testAddress = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

  beforeEach(() => {
    fetcher = new TransactionFetcher(NETWORKS.TESTNET);
    mockFetch.mockReset();
  });

  // Acceptance Criteria 1: Developers can fetch transaction history
  test('getTransactions returns normalized records for a given address', async () => {
    mockFetch.mockReturnValueOnce(buildMockResponse(mockRecords));
    const results = await fetcher.getTransactions(testAddress);
    expect(results).toHaveLength(2);
  });

  // Acceptance Criteria 2: Response shape is documented
  test('each record matches the TransactionRecord shape', async () => {
    mockFetch.mockReturnValueOnce(buildMockResponse(mockRecords));
    const results: TransactionRecord[] = await fetcher.getTransactions(testAddress);

    const first = results[0];
    expect(first).toHaveProperty('id', 'tx-001');
    expect(first).toHaveProperty('hash', 'abc123');
    expect(first).toHaveProperty('createdAt', '2026-04-28T00:00:00Z');
    expect(first).toHaveProperty('sourceAccount');
    expect(first).toHaveProperty('operationCount', 1);
    expect(first).toHaveProperty('successful', true);
    expect(first).toHaveProperty('memo', 'deposit');
    expect(first).toHaveProperty('feeCharged', '100');
  });

  test('optional memo field is omitted when not present', async () => {
    mockFetch.mockReturnValueOnce(buildMockResponse(mockRecords));
    const results = await fetcher.getTransactions(testAddress);
    expect(results[1].memo).toBeUndefined();
  });

  // Acceptance Criteria 3: Tests mock history responses
  test('calls Horizon with correct URL, limit, and order', async () => {
    mockFetch.mockReturnValueOnce(buildMockResponse(mockRecords));
    await fetcher.getTransactions(testAddress, { limit: 5, order: 'asc' });

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toContain(testAddress);
    expect(calledUrl.searchParams.get('limit')).toBe('5');
    expect(calledUrl.searchParams.get('order')).toBe('asc');
  });

  test('passes cursor param when provided', async () => {
    mockFetch.mockReturnValueOnce(buildMockResponse([]));
    await fetcher.getTransactions(testAddress, { cursor: 'token-xyz' });

    const calledUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('cursor')).toBe('token-xyz');
  });

  test('throws when Horizon returns a non-OK response', async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' } as Response)
    );
    await expect(fetcher.getTransactions(testAddress)).rejects.toThrow(
      'Horizon request failed: 404 Not Found'
    );
  });

  test('throws when network has no horizonUrl configured', () => {
    expect(
      () => new TransactionFetcher({ networkPassphrase: 'custom', rpcUrl: 'https://rpc.example.com' })
    ).toThrow('has no horizonUrl configured');
  });

  test('defaults to testnet when no network is provided', () => {
    const defaultFetcher = new TransactionFetcher();
    expect(defaultFetcher['horizonUrl']).toBe(DEFAULT_NETWORK.horizonUrl);
  });
});