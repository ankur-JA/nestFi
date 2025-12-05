import React from 'react';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    connector: null,
  }),
  useConnect: () => ({
    connect: vi.fn(),
    connectors: [],
    pendingConnector: null,
  }),
  useDisconnect: () => ({
    disconnect: vi.fn(),
  }),
  useWriteContract: () => ({
    writeContract: vi.fn(),
    data: null,
    isPending: false,
    error: null,
  }),
  useTransaction: () => ({
    isLoading: false,
    isSuccess: false,
    data: null,
    error: null,
  }),
  useReadContract: () => ({
    data: null,
    refetch: vi.fn(),
    error: null,
  }),
  usePublicClient: () => null,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  BanknotesIcon: () => <div data-testid="banknotes-icon" />,
  UsersIcon: () => <div data-testid="users-icon" />,
  ChartBarIcon: () => <div data-testid="chart-bar-icon" />,
  StarIcon: () => <div data-testid="star-icon" />,
  UserIcon: () => <div data-testid="user-icon" />,
  ArrowPathIcon: () => <div data-testid="arrow-path-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="exclamation-triangle-icon" />,
  CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
  XCircleIcon: () => <div data-testid="x-circle-icon" />,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_CHAIN_ID = '11155111';
process.env.NEXT_PUBLIC_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/test';
