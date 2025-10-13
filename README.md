# Resume AI Creator

Empower users to craft polished resumes through an AI-assisted Next.js application that integrates proofreading, translation, and template management features. The project ships with a Farcaster mini app experience, secure Clerk authentication, and programmable APIs for external tooling.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Database & Drizzle ORM](#database--drizzle-orm)
- [MCP & Programmatic Access](#mcp--programmatic-access)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI-assisted resume builder**: Capture work history, projects, and achievements with real-time validation on `src/app/page.tsx`.
- **Proofreading & translation**: Streamlined AI endpoints in `src/app/api/(ai)/` provide grammar corrections and multilingual support via OpenRouter models.
- **Resume templates & management**: Persisted resumes, cloning, and printing flows under `src/app/resumes/` backed by Drizzle ORM.
- **Secure authentication**: Clerk-powered sign-in flows, protecting pages like `src/app/api-keys/page.tsx` and API routes.
- **API key console**: Generate and manage personal API keys for integrations through `src/app/api/api-keys/`.
- **Farcaster mini app readiness**: Metadata and manifest support in `src/app/layout.tsx` plus public assets for Farcaster clients.
- **XMCP integration**: Adapter configuration in `xmcp.config.ts` enabling conversational AI tooling within the Next.js runtime.

## Tech Stack

- **Framework**: Next.js 15 with the App Router and React 19
- **Language**: TypeScript with strict configuration (`tsconfig.json`)
- **Styling**: Tailwind CSS v4 via the new `@import "tailwindcss"` pipeline in `src/app/globals.css`
- **Auth**: Clerk Next.js SDK
- **Database**: Postgres with Drizzle ORM and migrations under `drizzle/`
- **AI Tooling**: `@ai-sdk/react`, OpenRouter models, XMCP adapter
- **Utilities**: Sonner for notifications, Ethers for blockchain utilities, Farcaster Mini App SDK

## Getting Started

### Prerequisites

- Node.js 18 or later
- Bun package manager (preferred)
- Postgres database instance for persistence

### Installation

```bash
bun install
```

If Bun is unavailable, fall back to `pnpm install`.

## Environment Setup

1. Copy the sample environment file and fill in secrets:
   ```bash
   cp .env.example .env
   ```
2. Populate credentials for services you plan to use:
   - **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - **Database**: `POSTGRES_URL`
   - **AI Providers**: `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, etc.
   - **Farcaster & Cloudflare**: `CLOUDFLARE_*`, `FARCASTER_*`, `NEYNAR_API_KEY`
   - **XMCP & Coinbase**: `CDP_*`, `AI_GATEWAY_API_KEY`
   - Optional public URLs such as `NEXT_PUBLIC_APP_DOMAIN`

Environment variables are loaded via `dotenv` in scripts like `drizzle.config.ts`.

## Project Structure

```text
src/
├─ app/
│  ├─ api/(ai)/           # AI proofread/translate and GitHub models endpoints
│  ├─ api/api-keys/       # REST endpoints for API key CRUD
│  ├─ api/resumes/        # CRUD endpoints for resumes
│  ├─ api-keys/           # API key management dashboard (client component)
│  ├─ resumes/            # Resume listing, editing, printing flows
│  ├─ mcp/                # MCP adapter route
│  ├─ layout.tsx          # Global metadata and Farcaster configuration
│  └─ page.tsx            # Main resume builder interface
├─ lib/
│  ├─ api-key-validator.ts
│  └─ db/                 # Drizzle schema and helpers
├─ prompts/               # Reserved for prompt templates
├─ tools/                 # Utility scripts usable by MCP agents
scripts/                   # Automation for asset generation, database tasks
public/                    # Static assets including Farcaster manifest
```

## Usage

- **Local development**: After installing dependencies and configuring `.env`, run the dev server manually:
  ```bash
  bun run dev
  ```
  The script runs both `xmcp dev` and `next dev --turbopack`.
- **Building for production**:
  ```bash
  bun run build
  ```
- **Linting**:
  ```bash
  bun run lint
  ```

Pages guarded by Clerk will require valid authentication; configure Clerk keys and domain settings before testing.

## Database & Drizzle ORM

- Update the schema in `src/lib/db/schema.ts` as needed.
- Generate migration SQL files:
  ```bash
  bun run db:generate
  ```
- Apply migrations to the configured Postgres database:
  ```bash
  bun run db:push
  ```
- For manual SQL review or rollback workflows, inspect the SQL files under `drizzle/`.

Ensure `POSTGRES_URL` is set before running database commands.

## MCP & Programmatic Access

- MCP (Model Context Protocol) adapter is enabled via `xmcp.config.ts` and the `/mcp` route.
- Resume creation and management APIs under `src/app/api/resumes/` expose JSON endpoints usable by automation clients.
- Personal API keys can be generated through the dashboard and are stored in the `api_keys` table defined in the Drizzle schema.

## Contributing

1. Fork and clone the repository.
2. Create a feature branch from `main`.
3. Ensure formatting and lint checks pass (`bun run lint`).
4. Add or update tests where relevant.
5. Submit a pull request with a clear summary of changes.

## License

No explicit license file is provided. All rights reserved unless otherwise noted.
