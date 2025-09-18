# Vault Membership Feature

This document describes the comprehensive vault membership feature that allows users to check their membership status across all vaults in the NestFi DeFi platform.

## Overview

The vault membership feature provides:
- **Wallet Connection Detection**: Automatically detects when a user connects their wallet
- **Comprehensive Membership Checking**: Queries all vaults to determine user membership and admin status
- **Role-Based Display**: Shows whether the user is an Admin or Member for each vault
- **Loading and Error States**: Provides clear feedback during operations
- **Real-time Updates**: Allows manual refresh of membership status

## Architecture

### Frontend Components

#### 1. `useVaultMembership` Hook
**Location**: `hooks/useVaultMembership.ts`

A custom React hook that manages vault membership state and provides methods to:
- Check membership for specific vaults
- Discover all vault memberships for a user
- Refresh membership data
- Calculate summary statistics

**Key Features**:
- Automatic discovery when wallet connects
- Error handling and loading states
- Caching of membership data
- TypeScript interfaces for type safety

#### 2. `VaultMembershipStatus` Component
**Location**: `app/dashboard/_components/VaultMembershipStatus.tsx`

A comprehensive UI component that displays:
- Summary statistics (total vaults, admin vaults, total value locked)
- Admin vaults section
- Member vaults section
- Loading and error states
- Empty state with call-to-action buttons

**Key Features**:
- Responsive grid layout
- Role-based badges (Admin/Member)
- Vault status indicators (Paused, Allowlist status)
- Balance and asset information
- Refresh functionality

### Backend API Endpoints

#### 1. Individual Vault Membership Check
**Endpoint**: `GET /api/vault/check-membership`
**Location**: `app/api/vault/check-membership/route.ts`

Checks if a user is a member of a specific vault.

**Parameters**:
- `vaultAddress`: The vault contract address
- `userAddress`: The user's wallet address

**Response**:
```json
{
  "vaultAddress": "0x...",
  "userAddress": "0x...",
  "isOwner": true,
  "isMember": true,
  "userBalance": "1000000000",
  "isOnAllowlist": true,
  "allowlistEnabled": true,
  "vaultName": "Investment Vault",
  "vaultSymbol": "INV",
  "totalAssets": "5000000000",
  "totalSupply": "10000000000",
  "isPaused": false
}
```

#### 2. Factory Vaults List
**Endpoint**: `GET /api/vault/factory/vaults`
**Location**: `app/api/vault/factory/vaults/route.ts`

Retrieves all vaults created by the factory contract.

**Parameters**:
- `user` (optional): Filter vaults created by specific user

**Response**:
```json
{
  "factoryAddress": "0x...",
  "vaults": ["0x...", "0x..."],
  "totalVaults": 2,
  "chainId": 11155111
}
```

#### 3. User Memberships (Comprehensive)
**Endpoint**: `GET /api/vault/user-memberships`
**Location**: `app/api/vault/user-memberships/route.ts`

Comprehensive endpoint that checks membership across all vaults for a user.

**Parameters**:
- `userAddress`: The user's wallet address

**Response**:
```json
{
  "userAddress": "0x...",
  "memberships": [
    {
      "vaultAddress": "0x...",
      "vaultName": "Test Vault",
      "vaultSymbol": "TV",
      "role": "admin",
      "userBalance": "1000000000",
      "totalAssets": "5000000000",
      "totalSupply": "10000000000",
      "isPaused": false,
      "allowlistEnabled": true,
      "isOnAllowlist": true
    }
  ],
  "summary": {
    "totalVaults": 1,
    "adminVaults": 1,
    "memberVaults": 0,
    "totalValueLocked": "5000.00"
  },
  "factoryAddress": "0x...",
  "chainId": 11155111
}
```

## Membership Logic

### Determining Membership

A user is considered a member of a vault if they meet any of these criteria:

1. **Admin (Owner)**: The user is the owner of the vault contract
2. **Balance Holder**: The user has a non-zero balance of vault shares
3. **Allowlist Member**: The vault has allowlist enabled and the user is on the allowlist

### Role Assignment

- **Admin**: User is the owner of the vault
- **Member**: User has balance or is on allowlist but is not the owner

## Integration with Dashboard

The vault membership feature is integrated into the main dashboard (`app/dashboard/page.tsx`) with:

1. **New Section**: "Your Vault Memberships" section added between stats and existing vault listings
2. **Test Button**: Added "Test Memberships" button for debugging
3. **Seamless Integration**: Works alongside existing vault factory functionality

## Testing

### Test Files
- **Location**: `__tests__/vault-membership.test.ts`
- **Configuration**: `vitest.config.ts`
- **Setup**: `__tests__/setup.ts`

### Test Coverage
The test suite covers:
- Membership detection logic
- API response handling
- Error scenarios
- Summary calculations
- Address validation
- Balance formatting

### Running Tests
```bash
# Run tests in watch mode
yarn test

# Run tests once
yarn test:run

# Run tests with coverage
yarn test:coverage
```

## Usage Examples

### Using the Hook in Components

```tsx
import { useVaultMembership } from '../hooks/useVaultMembership';

function MyComponent() {
  const {
    memberships,
    adminVaults,
    memberVaults,
    loading,
    error,
    refreshMemberships
  } = useVaultMembership();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your Vaults ({memberships.length})</h2>
      {adminVaults.map(vault => (
        <div key={vault.vaultAddress}>
          {vault.vaultName} (Admin)
        </div>
      ))}
      {memberVaults.map(vault => (
        <div key={vault.vaultAddress}>
          {vault.vaultName} (Member)
        </div>
      ))}
    </div>
  );
}
```

### Manual API Testing

```bash
# Check specific vault membership
curl "http://localhost:3000/api/vault/check-membership?vaultAddress=0x123&userAddress=0xabc"

# Get all user memberships
curl "http://localhost:3000/api/vault/user-memberships?userAddress=0xabc"

# Get factory vaults
curl "http://localhost:3000/api/vault/factory/vaults"
```

## Error Handling

The feature includes comprehensive error handling:

1. **Network Errors**: Graceful handling of RPC connection issues
2. **Invalid Addresses**: Validation of Ethereum address formats
3. **Contract Errors**: Fallback when contract calls fail
4. **API Errors**: User-friendly error messages
5. **Loading States**: Clear loading indicators during operations

## Performance Considerations

1. **Batch Processing**: Multiple vault checks are processed in parallel
2. **Caching**: Membership data is cached in component state
3. **Error Recovery**: Individual vault failures don't block other checks
4. **RPC Optimization**: Efficient use of blockchain RPC calls

## Future Enhancements

Potential improvements for the feature:

1. **Real-time Updates**: WebSocket integration for live membership updates
2. **Pagination**: Handle large numbers of vaults efficiently
3. **Filtering**: Add filters for vault status, role, etc.
4. **Search**: Search functionality for vault names/addresses
5. **Notifications**: Alerts for membership changes
6. **Analytics**: Track membership patterns and statistics

## Dependencies

### New Dependencies Added
- `vitest`: Testing framework
- `@vitejs/plugin-react`: React support for Vitest
- `jsdom`: DOM environment for tests

### Existing Dependencies Used
- `wagmi`: Wallet connection and blockchain interaction
- `viem`: Ethereum utilities
- `framer-motion`: Animations
- `@heroicons/react`: Icons
- `next`: React framework

## Environment Variables

The feature uses these environment variables:
- `NEXT_PUBLIC_CHAIN_ID`: Blockchain network ID
- `NEXT_PUBLIC_RPC_URL`: RPC endpoint for blockchain queries

## Security Considerations

1. **Input Validation**: All addresses are validated before processing
2. **Error Sanitization**: Error messages don't expose sensitive information
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **Access Control**: Ensure proper access controls for admin functions

## Troubleshooting

### Common Issues

1. **No Memberships Found**: Check if user has actually joined any vaults
2. **Loading Never Completes**: Check RPC connection and network status
3. **API Errors**: Verify contract addresses and network configuration
4. **Test Failures**: Ensure all dependencies are installed

### Debug Tools

1. **Test Buttons**: Use the test buttons in the dashboard for debugging
2. **Console Logs**: Check browser console for detailed error information
3. **Network Tab**: Monitor API calls in browser developer tools
4. **Test Suite**: Run tests to verify functionality

This feature provides a comprehensive solution for vault membership management, with robust error handling, testing, and user experience considerations.
