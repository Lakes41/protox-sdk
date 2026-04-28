import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { StellarClient, ProtoxVault, NETWORKS } from '../src';
import { SorobanRpc, xdr, nativeToScVal, Account, Address } from '@stellar/stellar-sdk';

jest.mock('@stellar/stellar-sdk', () => {
  const actual = jest.requireActual('@stellar/stellar-sdk') as any;
  return {
    ...actual,
    Contract: jest.fn().mockImplementation((address: any) => {
      return {
        address: () => ({ toString: () => address }),
        call: jest.fn().mockReturnValue(new actual.xdr.Operation({
          sourceAccount: null,
          body: actual.xdr.OperationBody.invokeHostFunction(
            new actual.xdr.InvokeHostFunctionOp({
              hostFunction: actual.xdr.HostFunction.hostFunctionTypeInvokeContract(
                new actual.xdr.InvokeContractArgs({
                  contractAddress: actual.xdr.ScAddress.scAddressTypeContract(Buffer.alloc(32)),
                  functionName: 'get_balance',
                  args: [],
                })
              ),
              auth: [],
            })
          ),
        })),
      };
    }),
    SorobanRpc: {
      Server: jest.fn().mockImplementation(() => ({
        getAccount: (jest.fn() as any).mockResolvedValue(new actual.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '1')),
        simulateTransaction: (jest.fn() as any).mockResolvedValue({
          result: { retval: actual.nativeToScVal(100n, { type: 'i128' }) },
        }),
      })),
      Api: actual.SorobanRpc.Api,
    },
  };
});

describe('ProtoxVault SDK Tests', () => {
  let client: StellarClient;
  let vault: ProtoxVault;
  const contractAddress = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7';
  const userAddress = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

  beforeEach(() => {
    client = new StellarClient(NETWORKS.TESTNET);
    vault = new ProtoxVault(contractAddress, client);
  });

  test('Should initialize vault with contract address', () => {
    expect(vault.contract.address().toString()).toBe(contractAddress);
  });

  test('Should fetch user balance via simulation', async () => {
    const balance = await vault.getBalance(userAddress);
    expect(balance).toBe(100n);
  });

  test('Should fetch total shares via simulation', async () => {
    const totalShares = await vault.getTotalShares();
    expect(totalShares).toBe(100n);
  });

  test('Should throw error when depositing without wallet', async () => {
    await expect(vault.deposit(1000n)).rejects.toThrow('Wallet not connected');
  });
});
