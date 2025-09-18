import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Transfer, AllowlistUpdated, Deposit, Withdraw, Paused, Unpaused } from "../generated/templates/GroupVault/GroupVault"
import { Vault, VaultMember, Deposit as DepositEntity, Withdrawal, AllowlistUpdate, User } from "../generated/schema"

export function handleTransfer(event: Transfer): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) {
    return
  }

  // Handle mint (from zero address)
  if (event.params.from.equals(Bytes.fromHexString("0x0000000000000000000000000000000000000000"))) {
    vault.totalSupply = vault.totalSupply.plus(event.params.value)
  }
  
  // Handle burn (to zero address)
  if (event.params.to.equals(Bytes.fromHexString("0x0000000000000000000000000000000000000000"))) {
    vault.totalSupply = vault.totalSupply.minus(event.params.value)
  }

  // Update user balances
  updateUserBalance(vault, event.params.to, event.params.value, true)
  updateUserBalance(vault, event.params.from, event.params.value, false)

  vault.updatedAt = event.block.timestamp
  vault.save()
}

export function handleAllowlistUpdated(event: AllowlistUpdated): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) {
    return
  }

  // Create allowlist update entity
  let allowlistUpdate = new AllowlistUpdate(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  allowlistUpdate.vault = vault.id
  allowlistUpdate.user = event.params.user
  allowlistUpdate.allowed = event.params.allowed
  allowlistUpdate.timestamp = event.block.timestamp
  allowlistUpdate.blockNumber = event.block.number
  allowlistUpdate.transactionHash = event.transaction.hash
  allowlistUpdate.save()

  // Update vault member entity
  let memberId = vault.id + "-" + event.params.user.toHexString()
  let member = VaultMember.load(memberId)
  if (member == null) {
    member = new VaultMember(memberId)
    member.vault = vault.id
    member.user = event.params.user
    member.balance = BigInt.fromI32(0)
    member.shares = BigInt.fromI32(0)
    member.joinedAt = event.block.timestamp
  }
  member.isAllowed = event.params.allowed
  member.lastUpdated = event.block.timestamp
  member.save()

  // Create or update user entity
  let user = User.load(event.params.user.toHexString())
  if (user == null) {
    user = new User(event.params.user.toHexString())
    user.address = event.params.user
  }
  user.save()

  vault.updatedAt = event.block.timestamp
  vault.save()
}

export function handleDeposit(event: Deposit): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) {
    return
  }

  // Update vault total assets
  vault.totalAssets = vault.totalAssets.plus(event.params.assets)
  vault.updatedAt = event.block.timestamp
  vault.save()

  // Create deposit entity
  let deposit = new DepositEntity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  deposit.vault = vault.id
  deposit.user = event.params.owner
  deposit.assets = event.params.assets
  deposit.shares = event.params.shares
  deposit.timestamp = event.block.timestamp
  deposit.blockNumber = event.block.number
  deposit.transactionHash = event.transaction.hash
  deposit.save()

  // Create or update user entity
  let user = User.load(event.params.owner.toHexString())
  if (user == null) {
    user = new User(event.params.owner.toHexString())
    user.address = event.params.owner
  }
  user.save()
}

export function handleWithdraw(event: Withdraw): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault == null) {
    return
  }

  // Update vault total assets
  vault.totalAssets = vault.totalAssets.minus(event.params.assets)
  vault.updatedAt = event.block.timestamp
  vault.save()

  // Create withdrawal entity
  let withdrawal = new Withdrawal(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  withdrawal.vault = vault.id
  withdrawal.user = event.params.owner
  withdrawal.assets = event.params.assets
  withdrawal.shares = event.params.shares
  withdrawal.timestamp = event.block.timestamp
  withdrawal.blockNumber = event.block.number
  withdrawal.transactionHash = event.transaction.hash
  withdrawal.save()

  // Create or update user entity
  let user = User.load(event.params.owner.toHexString())
  if (user == null) {
    user = new User(event.params.owner.toHexString())
    user.address = event.params.owner
  }
  user.save()
}

export function handlePaused(event: Paused): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault != null) {
    vault.isPaused = true
    vault.updatedAt = event.block.timestamp
    vault.save()
  }
}

export function handleUnpaused(event: Unpaused): void {
  let vault = Vault.load(event.address.toHexString())
  if (vault != null) {
    vault.isPaused = false
    vault.updatedAt = event.block.timestamp
    vault.save()
  }
}

function updateUserBalance(vault: Vault, userAddress: Bytes, amount: BigInt, isIncrease: boolean): void {
  let memberId = vault.id + "-" + userAddress.toHexString()
  let member = VaultMember.load(memberId)
  
  if (member == null) {
    member = new VaultMember(memberId)
    member.vault = vault.id
    member.user = userAddress
    member.balance = BigInt.fromI32(0)
    member.shares = BigInt.fromI32(0)
    member.isAllowed = false
    member.joinedAt = BigInt.fromI32(0)
  }
  
  if (isIncrease) {
    member.shares = member.shares.plus(amount)
  } else {
    member.shares = member.shares.minus(amount)
  }
  
  member.lastUpdated = BigInt.fromI32(0) // Will be set by the calling function
  member.save()
}
