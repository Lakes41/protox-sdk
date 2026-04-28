# Protox SDK Configuration Reference

This reference covers all configuration values available in the Protox SDK. Use it to set up network selection, RPC endpoints, contract IDs, and debug mode for your integration.

---

## Network Selection

The SDK ships with two built-in network presets. Pass either to `StellarClient` at initialization.

| Field | TESTNET | MAINNET |
|---|---|---|
| `networkPassphrase` | `Test SDF Network ; September 2015` | `Public Global Stellar Network ; October 2015` |
| `rpcUrl` | `https://soroban-testnet.stellar.org` | `https://soroban-rpc.stellar.org` |
| `horizonUrl` | `https://horizon-testnet.stellar.org` | `https://horizon.stellar.org` |

**Required.** If none is passed, the SDK defaults to `NETWORKS.TESTNET`.

```typescript
import { StellarClient, NETWORKS } from '@protox/sdk';

const client = new StellarClient(NETWORKS.TESTNET);  // default
const client = new StellarClient(NETWORKS.MAINNET);  // production
```

---

## RPC URL Override

To point the SDK at a custom or self-hosted Soroban RPC node, pass a `Network` object directly.

**Required fields:** `networkPassphrase`, `rpcUrl`
**Optional fields:** `horizonUrl`

```typescript
import { StellarClient } from '@protox/sdk';
import type { Network } from '@protox/sdk';

const customNetwork: Network = {
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://your-custom-rpc.example.com',
  horizonUrl: 'https://your-custom-horizon.example.com',
};

const client = new StellarClient(customNetwork);
```

> If `horizonUrl` is omitted, `TransactionFetcher` will throw when instantiated. All other SDK features remain unaffected.

---

## Contract ID Setup

Pass the deployed contract address when initializing `ProtoxVault`. The address must be a valid Stellar contract ID in strkey format (starts with `C`).

**Required.** No default is provided.

```typescript
import { ProtoxVault } from '@protox/sdk';

const vault = new ProtoxVault(
  'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  client,
  wallet
);
```

You can also connect a wallet after initialization:

```typescript
const vault = new ProtoxVault(contractAddress, client);
vault.connect(wallet);
```

---

## Debug Mode

Enable verbose output via the `DEBUG` environment variable before running your script.

```bash
DEBUG=protox:* node your-script.js
```

To add structured debug logging inside your own integration:

```typescript
const isDebug = process.env.DEBUG?.includes('protox');

const result = await vault.deposit(1000n);
if (isDebug) {
  console.log('[protox:tx] deposit result', result);
}
```

---

## Full Configuration Example

```typescript
import { StellarClient, ProtoxVault, PrivateKeyWallet, WalletConnector, NETWORKS } from '@protox/sdk';

const client = new StellarClient(NETWORKS.TESTNET);
const signer = new PrivateKeyWallet(process.env.SECRET_KEY!);
const wallet = new WalletConnector(signer);
const vault = new ProtoxVault(process.env.CONTRACT_ADDRESS!, client, wallet);

const balance = await vault.getBalance(await wallet.getAddress());
console.log('Balance:', balance);
```

---

## Configuration Field Reference

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `network.networkPassphrase` | `string` | Yes | TESTNET passphrase | Identifies the Stellar network for signing |
| `network.rpcUrl` | `string` | Yes | TESTNET RPC URL | Soroban RPC endpoint |
| `network.horizonUrl` | `string` | No | TESTNET Horizon URL | Required only for transaction history fetching |
| `contractAddress` | `string` | Yes | None | Deployed vault contract ID (C... strkey) |
| `wallet` | `WalletConnector` | No | None | Required for deposit/withdraw; optional for reads |
| `DEBUG` | env var | No | Unset | Set to `protox:*` to enable verbose logging |
