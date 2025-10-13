# AGENTS.md

## Project Overview

This project follows specific development standards and workflows designed for optimal AI agent collaboration. All rules and guidelines outlined below are mandatory and should be strictly followed.

## Package Management

### Required Package Managers

**MANDATORY**: Use `bun` as the primary package manager, with fallbacks to `pnpm`, then `yarn`, and finally `npm` as last resort.

#### Preferred Order

1. **bun** - Ultra-fast package manager with built-in runtime and superior performance
2. **pnpm** - Efficient disk usage, strict dependency resolution, fast performance
3. **yarn** - Reliable package manager with good performance
4. **npm** - Last resort fallback when other package managers are unavailable

#### Installation Commands

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

#### Project Detection Logic

- If `bun.lockb` exists, use `bun`
- If `pnpm-lock.yaml` exists and bun is unavailable, use `pnpm`
- If `yarn.lock` exists and bun/pnpm are unavailable, use `yarn`
- If `package-lock.json` exists and all others are unavailable, use `npm`
- Always try `bun` first, then fallback to `pnpm`, `yarn`, and finally `npm`

## Shell Command Standards

### Fish Shell Requirement

**MANDATORY**: Use fish shell syntax for ALL terminal commands. Never use bash syntax.

#### Core Syntax Rules

- **Variables**: `set VAR_NAME value` (not `export VAR=value`)
- **Environment**: `set -x VAR value` (exported variables)
- **Conditionals**: `if test condition; command; end`
- **Logic**: Use `; and` and `; or` (not `&&` and `||`)

#### Essential Fish Commands

```fish
# Variable assignment
set PROJECT_ID (grep "^project_id" config.toml | cut -d"\"" -f2)

# Conditional execution
if test -f file.txt; echo "exists"; end

# Environment variables
set -x NODE_ENV production

# Universal variables (persistent)
set -U EDITOR vim
```

#### Common Bash to Fish Conversions

| Bash | Fish |
|------|------|
| `export VAR=value` | `set -x VAR value` |
| `cmd1 && cmd2` | `cmd1; and cmd2` |
| `cmd1 \|\| cmd2` | `cmd1; or cmd2` |
| `if [ condition ]` | `if test condition` |

## Development Server Policy

### Manual Start Only

**MANDATORY**: Never automatically start development servers. Always let the user start them manually.

#### Prohibited Actions

- Do not run `npm start`, `bun dev`, `pnpm dev`, or similar commands automatically
- Do not execute `yarn start`, `npm run dev`, or framework-specific dev commands
- Do not start servers for React, Vue, Angular, Next.js, Vite, or other web frameworks
- Do not automatically run `serve`, `http-server`, or local server commands

#### Permitted Actions

- Suggest the appropriate command to start the server
- Provide instructions on how to start the development server
- Offer to create or update start scripts in package.json
- Help configure server settings and environment variables

## Git Workflow Standards

### Auto Commit and Push Workflow

**MANDATORY**: When performing automatic Git operations, follow this standardized workflow for staging changes, generating conventional commit messages with emojis, and pushing to remote.

#### Workflow Steps

1. **Status Check**: Run `git status` to see what files have been modified
2. **Stage Changes**: Use `git add .` to include all modified files
3. **Analyze Changes**: Use `git status --porcelain` to get a clean list of modified files, then read the content of modified files to understand what has been changed
4. **Generate Commit Message**: Create a conventional commit message with appropriate emoji
5. **Commit**: Execute `git commit -m "your message here"`
6. **Push**: Execute `git push` to remote repository
7. **Report**: Provide a summary of operations performed

#### Commit Message Format

```
<emoji> <type>(<scope>): <description>
[optional body]
[optional footer(s)]
```

#### Types and Emojis

- ✨ feat: A new feature
- 🔧 fix: A bug fix
- 📚 docs: Documentation only changes
- 💎 style: Changes that do not affect the meaning of the code
- ♻️ refactor: A code change that neither fixes a bug nor adds a feature
- ⚡ perf: A code change that improves performance
- ✅ test: Adding missing tests or correcting existing tests
- 📦 build: Changes that affect the build system or external dependencies
- ⚙️ ci: Changes to CI configuration files and scripts
- 🔨 chore: Other changes that don't modify src or test files
- ⏪ revert: Reverts a previous commit

#### Commit Message Rules

1. Use lowercase for type and description
2. Keep the description under 50 characters when possible
3. Use imperative mood ("add" not "added" or "adds")
4. Include scope when relevant (component, module, or area affected)
5. Always start with the appropriate emoji
6. No period at the end of the description
7. Use body for additional context if needed (separate with blank line)

#### Breaking Changes

For breaking changes, add `!` after the type/scope and include `BREAKING CHANGE:` in the footer.

#### Example Usage

```bash
git status
git add .
git status --porcelain
git commit -m "✨ feat(auth): add user authentication system"
git push
```

## UI Design Standards

### Color Palette Preferences

**MANDATORY**: Prefer non-purple as the primary UI color. Use purple only as a secondary/accent color.

#### Palette Priorities

- Primary (preferred): blue, teal, cyan, green, neutral/gray
- Secondary: orange, amber, slate
- Accent only (low priority): purple/violet/fuchsia

#### Code Examples

```css
:root {
  /* Good: primary not purple */
  --color-primary: #0ea5e9;   /* blue-500 */
  --color-secondary: #a855f7; /* violet-500 (accent) */
}

/* Bad: purple as primary */
:root {
  --color-primary: #8b5cf6; /* violet-500 */
}
```

```tsx
// Good (React/Tailwind example)
<button className="bg-sky-600 hover:bg-sky-700 text-white">Action</button>

// Bad
<button className="bg-purple-600 hover:bg-purple-700 text-white">Action</button>
```

#### Additional Guidelines

- Do not set purple as the default brand color or primary theme token
- Purple may be used for highlights, badges, or low-emphasis accents
- Prefer accessible contrast: meet WCAG AA at minimum for text and UI controls
- If brand guidelines mandate purple as primary, explicitly note the exception in the PR

## Summary

This project prioritizes:
- **Bun** for package management with systematic fallbacks
- **Fish shell** syntax for all terminal commands
- **Manual server startup** to maintain control
- **Conventional commits** with emojis for clear history
- **Non-purple primary colors** for UI consistency

All guidelines are mandatory and ensure consistent, predictable behavior across different development environments and AI coding agents.
