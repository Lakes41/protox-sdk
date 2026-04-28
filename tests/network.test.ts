import { describe, expect, test } from '@jest/globals';
import { StellarClient } from '../src/client/stellarClient';
import { WalletConnector, PrivateKeyWallet } from '../src/wallet/walletConnector';
import { DEFAULT_NETWORK, NETWORKS } from '../src/utils/networkConfig';
import { Networks, Keypair } from '@stellar/stellar-sdk';


describe('Default Network Behavior', () => {
  // Acceptance Criteria 1: Testnet is used by default
  test('DEFAULT_NETWORK resolves to testnet passphrase', () => {
    expect(DEFAULT_NETWORK.networkPassphrase).toBe(Networks.TESTNET);
  });

  test('DEFAULT_NETWORK resolves to testnet RPC URL', () => {
    expect(DEFAULT_NETWORK.rpcUrl).toBe('https://soroban-testnet.stellar.org');
  });

  // Acceptance Criteria 2: No module uses an undefined network state
  test('StellarClient defaults to testnet when no network is provided', () => {
    const client = new StellarClient();
    expect(client.network.networkPassphrase).toBe(Networks.TESTNET);
    expect(client.network.rpcUrl).toBe(DEFAULT_NETWORK.rpcUrl);
  });

  test('StellarClient uses provided network when explicitly set', () => {
    const client = new StellarClient(NETWORKS.MAINNET);
    expect(client.network.networkPassphrase).toBe(Networks.PUBLIC);
  });

test('WalletConnector defaults to testnet when no network is provided', () => {
  const wallet = new PrivateKeyWallet(Keypair.random().secret());
  const connector = new WalletConnector(wallet);
  expect(connector.network.networkPassphrase).toBe(Networks.TESTNET);
});

test('WalletConnector uses provided network when explicitly set', () => {
  const wallet = new PrivateKeyWallet(Keypair.random().secret());
  const connector = new WalletConnector(wallet, NETWORKS.MAINNET);
  expect(connector.network.networkPassphrase).toBe(Networks.PUBLIC);
});

  // Acceptance Criteria 3: NETWORKS map contains no undefined entries
  test('All NETWORKS entries have defined passphrase and rpcUrl', () => {
    for (const [name, config] of Object.entries(NETWORKS)) {
      expect(config.networkPassphrase).toBeDefined();
      expect(config.rpcUrl).toBeDefined();
      expect(config.networkPassphrase.length).toBeGreaterThan(0);
    }
  });
});