# AGENTS.md

This project follows specific guidelines for AI coding agents to ensure consistent development practices.

## Setup Commands

- Install dependencies: `pnpm install`
- Start development server: `pnpm dev`
- Run tests: `pnpm test`

## Development Server Policy

**MANDATORY**: Never automatically start development servers for web applications. Always let the user start them manually.

### Prohibited Actions

- Do not run `npm start`, `bun dev`, `pnpm dev`, or similar commands automatically
- Do not execute `yarn start`, `npm run dev`, or framework-specific dev commands
- Do not start servers for React, Vue, Angular, Next.js, Vite, or other web frameworks
- Do not automatically run `serve`, `http-server`, or local server commands

### Permitted Actions

- Suggest the appropriate command to start the server
- Provide instructions on how to start the development server
- Offer to create or update start scripts in package.json
- Help configure server settings and environment variables

## Shell Execution Standards

**MANDATORY**: Use fish shell syntax for ALL terminal commands. Never use bash syntax.

### Core Syntax Rules

- **Variables**: `set VAR_NAME value` (not `export VAR=value`)
- **Environment**: `set -x VAR value` (exported variables)
- **Conditionals**: `if test condition; command; end`
- **Logic**: Use `; and` and `; or` (not `&&` and `||`)

### Common Bash to Fish Conversions

| Bash | Fish |
|------|------|
| `export VAR=value` | `set -x VAR value` |
| `cmd1 && cmd2` | `cmd1; and cmd2` |
| `cmd1 \|\| cmd2` | `cmd1; or cmd2` |
| `if [ condition ]` | `if test condition` |

## Node.js Package Manager Standards

**MANDATORY**: Use `pnpm` as the primary package manager, with `yarn` as fallback only if pnpm doesn't exist or encounters errors. Never use `npm` or `bun`.

### Preferred Order
1. **pnpm** - Efficient disk usage, strict dependency resolution, fast performance
2. **yarn** - Fallback option when pnpm is unavailable or fails

### Installation Commands

```bash
# Using pnpm (preferred)
pnpm install
pnpm add <package>
pnpm remove <package>
pnpm run <script>

# Using yarn (fallback only)
yarn install
yarn add <package>
yarn remove <package>
yarn run <script>
```

### Script Execution

Always use the detected package manager for running scripts:
- `pnpm dev` (preferred)
- `yarn dev` (fallback only)

## UI Color Palette Preference

**MANDATORY**: Prefer non-purple as the primary UI color. Use purple only as a secondary/accent.

### Palette Priorities

- Primary (preferred): blue, teal, cyan, green, neutral/gray
- Secondary: orange, amber, slate
- Accent only (low priority): purple/violet/fuchsia

### Good Examples

```css
:root {
  /* Good: primary not purple */
  --color-primary: #0ea5e9;   /* blue-500 */
  --color-secondary: #a855f7; /* violet-500 (accent) */
}
```

```tsx
// Good (React/Tailwind example)
<button className="bg-sky-600 hover:bg-sky-700 text-white">Action</button>
```

### Bad Examples

```css
:root {
  /* Bad: purple as primary */
  --color-primary: #8b5cf6; /* violet-500 */
}
```

```tsx
// Bad
<button className="bg-purple-600 hover:bg-purple-700 text-white">Action</button>