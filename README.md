# Protox SDK

Protox SDK is a developer-friendly TypeScript toolkit for interacting with Protox smart contracts on the Stellar network.

## Features

- **Soroban Integration**: High-level wrappers for Protox vault contracts.
- **Wallet Support**: Seamless integration with Stellar wallets (Freighter, Albedo, and private keys).
- **Network Management**: Easy switching between Testnet and Mainnet.
- **Transaction Helpers**: Automated fee estimation, footprint calculation, and simulation.

## Installation

```bash
npm install @protox/sdk
```

## Quick Start

```typescript
import { StellarClient, ProtoxVault, PrivateKeyWallet, WalletConnector, NETWORKS } from '@protox/sdk';

// 1. Initialize the client
const client = new StellarClient(NETWORKS.TESTNET);

// 2. Connect a wallet
const wallet = new WalletConnector(new PrivateKeyWallet('S...'));

// 3. Initialize the vault
const vault = new ProtoxVault('CD...', client, wallet);

// 4. Deposit tokens
await vault.deposit(1000);

// 5. Check balance
const balance = await vault.getBalance('G...');
console.log(`Current Balance: ${balance}`);
```

## Documentation

- [SDK Overview](docs/sdk-overview.md): Architecture and module breakdown.
- [Usage Guide](docs/usage-guide.md): Detailed examples and best practices.
- [Error Handling Guide](docs/error-handling.md): Examples for catching and handling SDK errors.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License. See [LICENSE](LICENSE) for details.
