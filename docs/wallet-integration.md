# Wallet Integration Guide

This guide explains how to connect frontend applications to the Protox SDK using various wallet providers and how the transaction signing flow works.

## Overview

The Protox SDK uses a provider-agnostic approach to wallet integration. At its core is the `WalletSigner` interface, which can be implemented to support any Stellar wallet (Freighter, Albedo, xBull, etc.).

## The Wallet Connector Flow

1.  **Signer Implementation**: A `WalletSigner` handles low-level cryptographic operations (getting the public key and signing XDR).
2.  **WalletConnector**: A wrapper that provides a unified interface for the SDK to interact with the signer.
3.  **Contract Interaction**: The SDK builds a transaction, passes it to the `WalletConnector`, which uses the `WalletSigner` to sign it, and then returns the signed transaction for submission.

## Requirements

To integrate a wallet, you need to implement the `WalletSigner` interface:

```typescript
interface WalletSigner {
  getPublicKey(): Promise<string>;
  signTransaction(txXdr: string, network?: string): Promise<string>;
}
```

### Expected Wallet Response Shape

- **`getPublicKey()`**: Should return a `Promise<string>` containing the G-address of the user (e.g., `G...`).
- **`signTransaction()`**: Should return a `Promise<string>` containing the signed transaction in **base64 XDR format**.

## Frontend Usage Example (Freighter)

Here is how you can implement a `WalletSigner` for [Freighter](https://www.freighter.app/):

```typescript
import { isConnected, getPublicKey, signTransaction } from "@stellar/freighter-api";
import { WalletConnector, StellarClient, NETWORKS, createProtoxVault } from "@protox/sdk";

// 1. Implement the Signer for Freighter
const freighterSigner = {
  async getPublicKey() {
    if (!(await isConnected())) {
      throw new Error("Freighter not connected");
    }
    return await getPublicKey();
  },
  async signTransaction(txXdr: string, network?: string) {
    return await signTransaction(txXdr, { network });
  }
};

// 2. Initialize the WalletConnector
const wallet = new WalletConnector(freighterSigner, NETWORKS.TESTNET);

// 3. Use it with a Vault
const client = new StellarClient(NETWORKS.TESTNET);
const vault = createProtoxVault("CD...", client, wallet);

async function handleDeposit() {
  try {
    const tx = await vault.deposit(100n);
    console.log("Transaction submitted:", tx.hash);
  } catch (e) {
    console.error("Signing or submission failed", e);
  }
}
```

## Common Errors

| Error | Cause | Solution |
| :--- | :--- | :--- |
| `User declined signing` | The user rejected the transaction in their wallet UI. | Handle this gracefully in your UI with a notification. |
| `Wallet not connected` | `getPublicKey` was called before the user authorized the app. | Ensure you call a "Connect Wallet" method first. |
| `Network mismatch` | The wallet is set to Mainnet but the SDK is using Testnet. | Check the `network` parameter in `signTransaction`. |
| `Invalid XDR` | The transaction XDR passed to the wallet is malformed. | Ensure you are using the `WalletConnector` to wrap the signer. |

## Best Practices

- **Lazy Loading**: Only initialize the `WalletConnector` when the user clicks "Connect".
- **Network Validation**: Always check that the user's wallet is set to the correct network before attempting to sign.
- **Loading States**: Signing transactions in browser wallets is an asynchronous process that requires user interaction; always show a loading indicator.
