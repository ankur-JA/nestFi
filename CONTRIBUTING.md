# Contributing to NestFi

Thanks for your interest in contributing! This guide explains how to set up your environment, propose changes, and follow the project’s engineering standards.

## Project Setup
1. Fork the repo and clone your fork
2. Install dependencies at the repo root:
   ```bash
   yarn install
   ```
3. Contracts (Foundry):
   ```bash
   cd packages/foundry
   cp .env.example .env
   # Fill env values (USDC, PERMIT2, etc.)
   yarn deploy --reset
   forge test
   ```
4. Frontend (Next.js):
   ```bash
   cd packages/nextjs
   cp .env.example .env.local
   yarn dev
   ```

## Issues & Proposals
- Use GitHub Issues for bug reports and feature requests
- Include reproduction steps, logs, and environment info
- For features, describe UX, API, and acceptance criteria

## Branching & Commits
- Branch naming: `feat/<scope>-<short>`, `fix/<scope>-<short>`, `chore/<scope>-<short>`
- Conventional Commits examples:
  - `feat: add aave v3 strategy adapter`
  - `fix: prevent deposit when paused`
  - `docs: update readme env keys`

## Pull Requests
- PR title follows Conventional Commits
- Keep PRs focused
- Include:
  - What & Why
  - Screenshots for UI changes
  - Manual test notes (steps/results)
- Checklist:
  - [ ] Contracts: `forge test`
  - [ ] Frontend: `yarn lint` + `yarn typecheck`
  - [ ] No console.log in production paths
  - [ ] Env keys documented

## Code Style
### General
- Prefer clarity over cleverness; early returns; explicit error handling

### Solidity
- ^0.8.x, OpenZeppelin where possible
- CEI pattern; ReentrancyGuard for external calls
- Events on state changes; custom errors for gas efficiency
- Natspec on public/external functions

### TypeScript/React
- Strict TypeScript; avoid `any`
- Functional components with hooks
- Keep components small; extract presentation where helpful
- Use Wagmi/Viem; Tailwind for styles

## Testing & QA
- Contracts: unit tests (Foundry); add invariants for critical math
- Frontend: component tests/smoke tests for critical flows
- Manual QA checklist:
  - Create vault → visible on dashboard
  - Deposit/Withdraw → balances update
  - Admin controls (pause, allowlist, caps)
  - Set strategy / invest / divest works

## Security Disclosure
- Don’t open public issues for vulnerabilities
- Privately disclose with steps and impact

Thank you for contributing! 🙌

