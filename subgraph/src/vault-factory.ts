import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { VaultCreated, VaultJoined } from "../generated/VaultFactory/VaultFactory"
import { VaultFactory as VaultFactoryEntity, Vault, User } from "../generated/schema"
import { GroupVault } from "../generated/templates"

export function handleVaultCreated(event: VaultCreated): void {
  // Create or update factory entity
  let factory = VaultFactoryEntity.load("VaultFactory")
  if (factory == null) {
    factory = new VaultFactoryEntity("VaultFactory")
    factory.address = event.address
    factory.totalVaults = BigInt.fromI32(0)
  }
  factory.totalVaults = factory.totalVaults.plus(BigInt.fromI32(1))
  factory.save()

  // Create vault entity
  let vault = new Vault(event.params.vault.toHexString())
  vault.address = event.params.vault
  vault.owner = event.params.owner
  vault.asset = event.params.asset
  vault.name = event.params.name
  vault.symbol = event.params.symbol
  vault.allowlistEnabled = event.params.allowlistEnabled
  vault.depositCap = event.params.depositCap
  vault.minDeposit = event.params.minDeposit
  vault.totalAssets = BigInt.fromI32(0)
  vault.totalSupply = BigInt.fromI32(0)
  vault.isPaused = false
  vault.createdAt = event.block.timestamp
  vault.updatedAt = event.block.timestamp
  vault.save()

  // Create or update user entity
  let user = User.load(event.params.owner.toHexString())
  if (user == null) {
    user = new User(event.params.owner.toHexString())
    user.address = event.params.owner
  }
  user.save()

  // Start indexing the vault contract
  GroupVault.create(event.params.vault)
}

export function handleVaultJoined(event: VaultJoined): void {
  // This event is emitted when someone joins a vault
  // We can use this to track vault activity
  let vault = Vault.load(event.params.vault.toHexString())
  if (vault != null) {
    vault.updatedAt = event.block.timestamp
    vault.save()
  }
}
