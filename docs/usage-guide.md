# Protox SDK Usage Guide

This guide explains how to use the Protox SDK to interact with Protox smart contracts on the Stellar network.

## Prerequisites

- Node.js 18+
- TypeScript 4.5+
- A Stellar Testnet account with some XLM for fees.

## Installation

```bash
npm install @protox/sdk
```

## Step 1: Initialize the Stellar Client

The `StellarClient` is the main entry point for connecting to the Stellar network.

```typescript
import { StellarClient, NETWORKS } from '@protox/sdk';

// Use Testnet for development
const client = new StellarClient(NETWORKS.TESTNET);
```

## Step 2: Set Up Your Wallet

The SDK supports various wallet providers. For development, you can use a private key:

```typescript
import { PrivateKeyWallet, WalletConnector } from '@protox/sdk';

const signer = new PrivateKeyWallet('S... (your secret key)');
const wallet = new WalletConnector(signer);
```

## Step 3: Connect to the Protox Vault

Initialize a `ProtoxVault` instance with the contract address and the client.

```typescript
import { ProtoxVault } from '@protox/sdk';

const contractAddress = 'CD... (vault contract ID)';
const vault = new ProtoxVault(contractAddress, client, wallet);
```

## Step 4: Perform Vault Operations

### Deposit Tokens

```typescript
const amount = 1000n; // Amount in atomic units (i128)
try {
  const result = await vault.deposit(amount);
  console.log('Deposit successful:', result.hash);
} catch (error) {
  console.error('Deposit failed:', error);
}
```

### Check Your Balance

```typescript
const userAddress = await wallet.getAddress();
const balance = await vault.getBalance(userAddress);
console.log(`Your vault balance: ${balance}`);
```

### Withdraw Tokens

```typescript
const amountToWithdraw = 500n;
const result = await vault.withdraw(amountToWithdraw);
console.log('Withdrawal successful:', result.hash);
```

## Best Practices

- **Atomic Units**: Always use atomic units for token amounts (e.g., 10000000 for 1 token if it has 7 decimals).
- **Error Handling**: Wrap all contract calls in `try...catch` blocks to handle network or simulation errors.
- **Network Awareness**: Always ensure your `StellarClient` and wallet are configured for the same network (Testnet or Mainnet).
- **Simulations**: The SDK automatically simulates transactions for fee estimation. For read-only calls, it uses simulations for performance.

## Next Steps

- Explore the [Architecture Overview](sdk-overview.md) for deeper integration details.
- Check out the [Examples](../examples) directory for full-featured scripts.

## Utilities

### Formatting Token Balances
The SDK provides a safe utility to convert raw smart contract integer balances into readable strings without running into JavaScript floating-point precision issues.

```typescript
import { formatTokenBalance } from '@protox/sdk';

// Default Stellar formatting (7 decimals)
const xlmbulance = formatTokenBalance('15000000');
console.log(xlmbulance); // "1.5"

// Custom decimals (e.g., 18 decimals)
const customToken = formatTokenBalance('2500000000000000000', 18);
console.log(customToken); // "2.5"
```