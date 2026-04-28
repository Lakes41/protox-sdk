import { Keypair, Transaction, xdr } from '@stellar/stellar-sdk';
import { DEFAULT_NETWORK, Network } from '../utils/networkConfig';

export interface WalletSigner {
  getPublicKey(): Promise<string>;
  signTransaction(txXdr: string, network?: string): Promise<string>;
}

export class PrivateKeyWallet implements WalletSigner {
  private keypair: Keypair;

  constructor(secretKey: string) {
    this.keypair = Keypair.fromSecret(secretKey);
  }

  async getPublicKey(): Promise<string> {
    return this.keypair.publicKey();
  }

  async signTransaction(
    txXdr: string,
    network: string = DEFAULT_NETWORK.networkPassphrase
  ): Promise<string> {
    const transaction = new Transaction(txXdr, network);
    transaction.sign(this.keypair);
    return transaction.toXDR();
  }
}

export class WalletConnector {
  private signer: WalletSigner;
  public network: Network;

  constructor(signer: WalletSigner, network: Network = DEFAULT_NETWORK) {
    this.signer = signer;
    this.network = network;
  }

  async getAddress(): Promise<string> {
    return await this.signer.getPublicKey();
  }

  async sign(transaction: Transaction): Promise<Transaction> {
    const passphrase =
      transaction.networkPassphrase ?? this.network.networkPassphrase;
    const signedXdr = await this.signer.signTransaction(
      transaction.toXDR(),
      passphrase
    );
    return new Transaction(signedXdr, passphrase);
  }
}