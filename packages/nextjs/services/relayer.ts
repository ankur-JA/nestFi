import { ethers } from 'ethers';
import { GroupVault__factory } from '../types/contracts';

export interface RelayerConfig {
  rpcUrl: string;
  privateKey: string;
  vaultAddress: string;
  permit2Address: string;
}

export interface DepositRequest {
  owner: string;
  assets: string;
  receiver: string;
  permit: {
    token: string;
    amount: string;
    expiration: string;
    nonce: string;
    spender: string;
    sigDeadline: string;
  };
  signature: {
    v: number;
    r: string;
    s: string;
  };
}

export class NestFiRelayer {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private vaultContract: GroupVault__factory;

  constructor(config: RelayerConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.vaultContract = GroupVault__factory.connect(config.vaultAddress, this.wallet);
  }

  /**
   * Process a single gasless deposit
   */
  async processGaslessDeposit(request: DepositRequest) {
    try {
      const permitData = {
        token: request.permit.token,
        amount: request.permit.amount,
        expiration: request.permit.expiration,
        nonce: request.permit.nonce,
        spender: request.permit.spender,
        sigDeadline: request.permit.sigDeadline,
      };

      const signatureData = {
        v: request.signature.v,
        r: request.signature.r,
        s: request.signature.s,
      };

      const tx = await this.vaultContract.depositWithPermit2Relayed(
        request.owner,
        request.assets,
        request.receiver,
        permitData,
        signatureData,
        {
          gasLimit: 300000, // Adjust based on network
        }
      );

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
      };
    } catch (error) {
      console.error('Relayer deposit failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process multiple gasless deposits in batch
   */
  async processBatchDeposits(requests: DepositRequest[]) {
    try {
      const depositData = requests.map(request => ({
        owner: request.owner,
        assets: request.assets,
        receiver: request.receiver,
        permit: {
          token: request.permit.token,
          amount: request.permit.amount,
          expiration: request.permit.expiration,
          nonce: request.permit.nonce,
          spender: request.permit.spender,
          sigDeadline: request.permit.sigDeadline,
        },
        signature: {
          v: request.signature.v,
          r: request.signature.r,
          s: request.signature.s,
        },
      }));

      const tx = await this.vaultContract.batchDepositWithPermit2Relayed(
        depositData,
        {
          gasLimit: 500000 * requests.length, // Adjust based on batch size
        }
      );

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
        depositsProcessed: requests.length,
      };
    } catch (error) {
      console.error('Batch relayer deposit failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get relayer balance
   */
  async getBalance() {
    return await this.wallet.getBalance();
  }

  /**
   * Estimate gas cost for a deposit
   */
  async estimateGasCost(request: DepositRequest) {
    try {
      const permitData = {
        token: request.permit.token,
        amount: request.permit.amount,
        expiration: request.permit.expiration,
        nonce: request.permit.nonce,
        spender: request.permit.spender,
        sigDeadline: request.permit.sigDeadline,
      };

      const signatureData = {
        v: request.signature.v,
        r: request.signature.r,
        s: request.signature.s,
      };

      const gasEstimate = await this.vaultContract.estimateGas.depositWithPermit2Relayed(
        request.owner,
        request.assets,
        request.receiver,
        permitData,
        signatureData
      );

      const gasPrice = await this.provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);

      return {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        gasCost: gasCost.toString(),
        gasCostEth: ethers.utils.formatEther(gasCost),
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return {
        error: error.message,
      };
    }
  }
}

// Example usage:
export const createRelayer = (config: RelayerConfig) => {
  return new NestFiRelayer(config);
};
