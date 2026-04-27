# Error Handling in Protox SDK

Robust error handling is critical for building reliable Web3 applications. The Protox SDK uses a standardized error format to help you catch, identify, and gracefully recover from issues.

## The SDK Error Format

Whenever an operation fails, the Protox SDK throws a standard `ProtoxError` object (or a subclass of it). This object contains a specific code, a human-readable message, and optional metadata.

```typescript
interface ProtoxError extends Error {
  name: string;      // The type of error (e.g., 'WalletError')
  code: string;      // A specific error code (e.g., 'USER_REJECTED')
  message: string;   // Developer-friendly error description
  details?: any;     // Optional raw error data from the RPC or Wallet
}
```

## Common Error Types & Examples
### 1. Wallet Errors (WalletError)
   Occur during user interactions with their Stellar wallet (e.g., Freighter).
```typescript
import { ProtoxVault, WalletError } from '@protox/sdk';

try {
  await vault.deposit(100);
} catch (error) {
  if (error instanceof WalletError) {
    switch (error.code) {
      case 'USER_REJECTED':
        console.log('Transaction cancelled by the user.');
        break;
      case 'WALLET_NOT_INSTALLED':
        console.log('Please install a Stellar wallet extension.');
        break;
      default:
        console.error('Wallet connection failed:', error.message);
    }
  }
}
```

### 2. Validation Errors (ValidationError)
   Thrown before a transaction is sent to the network if the inputs are invalid. This saves the user from paying unnecessary gas fees for guaranteed failures.
   ```typescript
   import { ProtoxVault, ValidationError } from '@protox/sdk';

try {
  await vault.withdraw(-50); // Invalid amount
} catch (error) {
  if (error instanceof ValidationError) {
    // Example: "Withdrawal amount must be greater than zero."
    console.error('Invalid input:', error.message); 
  }
}
```
### 3. Transaction Errors (TransactionError)
   Occur when the transaction is submitted to the Stellar network but fails during execution (e.g., insufficient funds, contract logic reverts).
   ```typescript
   import { ProtoxVault, TransactionError } from '@protox/sdk';

try {
  await vault.deposit(9999999);
} catch (error) {
  if (error instanceof TransactionError) {
    if (error.code === 'INSUFFICIENT_BALANCE') {
      console.log('You do not have enough tokens to complete this deposit.');
    } else {
      console.error('Transaction failed on-chain. Hash:', error.details?.txHash);
    }
  }
}
```
### 4. RPC Errors (RpcError)
Happen when the SDK cannot communicate with the Soroban RPC endpoint (e.g., rate limits, network outages).
```typescript
import { ProtoxVault, RpcError } from '@protox/sdk';

try {
  const balance = await vault.getBalance('G...');
} catch (error) {
  if (error instanceof RpcError) {
    console.error('Network issue. Please try again later.');
    // Implementing a retry logic here is recommended
  }
}
```
## Recommended UI Handling Patterns
When building frontends (like the Protox Dashboard), do not expose raw error messages directly to the user. Instead, map SDK error codes to user-friendly UI components:

1. **Inline Form Errors:** Use ValidationError to highlight specific input fields in red (e.g., "Invalid Address").

2. **Toast Notifications:** Use TransactionError and WalletError to trigger temporary popups (e.g., a yellow warning toast for "User Rejected Signature" or a red error toast for "Insufficient Funds").

3. **Global Banners:** Use RpcError to show a global warning banner indicating that network connectivity is degraded.