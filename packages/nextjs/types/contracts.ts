import { Address } from "viem";

// GroupVault ABI
export const GroupVaultABI = [
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "admin", type: "address" },
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "allowlistEnabled", type: "bool" },
      { name: "depositCap", type: "uint256" },
      { name: "minDeposit", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "caller", type: "address" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "assets", type: "uint256" },
      { indexed: false, name: "shares", type: "uint256" },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "receiver", type: "address" },
      { indexed: false, name: "assets", type: "uint256" },
      { indexed: false, name: "shares", type: "uint256" },
      { indexed: true, name: "relayer", type: "address" },
    ],
    name: "GaslessDeposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "allowed", type: "bool" },
    ],
    name: "AllowlistUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "relayer", type: "address" },
      { indexed: false, name: "authorized", type: "bool" },
    ],
    name: "RelayerAuthorized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "fee", type: "uint256" },
    ],
    name: "RelayerFeeSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "caller", type: "address" },
      { indexed: true, name: "receiver", type: "address" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "assets", type: "uint256" },
      { indexed: false, name: "shares", type: "uint256" },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "p", type: "tuple" },
      { name: "sig", type: "tuple" },
    ],
    name: "depositWithPermit2",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "p", type: "tuple" },
      { name: "sig", type: "tuple" },
    ],
    name: "depositWithPermit2Relayed",
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "deposits", type: "tuple[]" },
    ],
    name: "batchDepositWithPermit2Relayed",
    outputs: [{ name: "shares", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "isAllowed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "allowlistEnabled",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "asset",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "depositCap",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minDeposit",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "relayer", type: "address" }],
    name: "authorizedRelayers",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "relayerFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "allowed", type: "bool" },
    ],
    name: "setAllowlist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "cap", type: "uint256" }],
    name: "setDepositCap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "min", type: "uint256" }],
    name: "setMinDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "relayer", type: "address" },
      { name: "authorized", type: "bool" },
    ],
    name: "setRelayerAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "fee", type: "uint256" }],
    name: "setRelayerFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalAssets",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// VaultFactory ABI
export const VaultFactoryABI = [
  {
    inputs: [
      { name: "implementation", type: "address" },
      { name: "permit2", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "vault", type: "address" },
      { indexed: true, name: "admin", type: "address" },
      { indexed: false, name: "asset", type: "address" },
      { indexed: false, name: "name", type: "string" },
      { indexed: false, name: "symbol", type: "string" },
    ],
    name: "VaultCreated",
    type: "event",
  },
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "admin", type: "address" },
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "allowlistEnabled", type: "bool" },
      { name: "depositCap", type: "uint256" },
      { name: "minDeposit", type: "uint256" },
    ],
    name: "createVault",
    outputs: [{ name: "vault", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "permit2",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Factory classes
export class GroupVault__factory {
  static readonly abi = GroupVaultABI;
  
  static connect(address: Address) {
    return {
      address,
      abi: this.abi,
    };
  }
}

export class VaultFactory__factory {
  static readonly abi = VaultFactoryABI;
  
  static connect(address: Address) {
    return {
      address,
      abi: this.abi,
    };
  }
}

// Permit2 types
export interface IPermit2 {
  permit(
    owner: Address,
    permitSingle: PermitSingle,
    signature: Signature
  ): Promise<void>;
  
  transferFrom(
    from: Address,
    to: Address,
    amount: bigint,
    token: Address
  ): Promise<void>;
}

export interface PermitSingle {
  token: Address;
  amount: bigint;
  expiration: bigint;
  nonce: bigint;
  spender: Address;
}

export interface Signature {
  r: string;
  s: string;
  v: number;
}

export interface DepositData {
  owner: Address;
  assets: bigint;
  receiver: Address;
  permit: PermitSingle;
  signature: Signature;
}
