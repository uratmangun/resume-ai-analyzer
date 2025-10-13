---
trigger: always_on
description: "Enforces use of bun as primary package manager with pnpm, yarn, and npm as fallbacks for Node.js dependency management"
---

# Node.js Package Manager Standards

## Required Package Managers

**MANDATORY**: Use `bun` as the primary package manager, with fallbacks to `pnpm`, then `yarn`, and finally `npm` as last resort when others are unavailable or encounter errors.

### Preferred Order

1. **bun** - Ultra-fast package manager with built-in runtime and superior performance
2. **pnpm** - Efficient disk usage, strict dependency resolution, fast performance
3. **yarn** - Reliable package manager with good performance
4. **npm** - Last resort fallback when other package managers are unavailable

### Installation Commands

```bash
# Using bun (preferred)
bun install
bun add <package>
bun remove <package>
bun run <script>

# Using pnpm (fallback)
pnpm install
pnpm add <package>
pnpm remove <package>
pnpm run <script>

# Using yarn (fallback)
yarn install
yarn add <package>
yarn remove <package>
yarn run <script>

# Using npm (last resort)
npm install
npm install <package>
npm uninstall <package>
npm run <script>
```

### Project Detection

- If `bun.lockb` exists, use `bun`
- If `pnpm-lock.yaml` exists and bun is unavailable, use `pnpm`
- If `yarn.lock` exists and bun/pnpm are unavailable, use `yarn`
- If `package-lock.json` exists and all others are unavailable, use `npm`
- Always try `bun` first, then fallback to `pnpm`, `yarn`, and finally `npm`

### Script Execution

Always use the detected package manager for running scripts:

- `bun dev` (preferred)
- `pnpm dev` (fallback)
- `yarn dev` (fallback)
- `npm run dev` (last resort)

This ensures optimal performance with bun's superior speed and built-in runtime, while maintaining reliable fallback options for maximum compatibility across different environments.
