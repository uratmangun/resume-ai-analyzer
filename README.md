# Resume AI Creator (MCP)

A powerful AI-driven resume creation and management platform built with Next.js, featuring Model Context Protocol (MCP) integration for intelligent resume building through conversational AI.

## 🚀 Features

- **AI-Powered Resume Creation**: Create professional resumes using natural language through MCP tools
- **Structured Resume Management**: Organize work history, projects, and achievements with a relational database
- **Multi-Provider AI Support**: Integrates with OpenRouter, Google Gemini, and OpenAI
- **Secure Authentication**: Auth0-based authentication with session management
- **API Key Management**: Secure API key storage and validation for external integrations
- **Real-time Updates**: Modern React-based UI with real-time data synchronization
- **Database Migrations**: Automated schema management with Drizzle ORM
- **MCP Server Integration**: Expose resume tools via Model Context Protocol for AI agent access

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.5** - React framework with App Router
- **React 19.2.0** - UI library
- **TailwindCSS 4.1.14** - Utility-first CSS framework
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **PostgreSQL** - Relational database (Neon)
- **Auth0** - Authentication and authorization

### AI & MCP
- **xmcp 0.3.4** - Model Context Protocol server implementation
- **AI SDK** - Vercel AI SDK for multi-provider support
- **OpenRouter** - AI model routing
- **Google Gemini** - Google's AI models
- **Zod** - Schema validation for AI tool parameters

### Development
- **TypeScript 5.9.3** - Type-safe development
- **ESLint** - Code linting
- **Bun** - Fast JavaScript runtime and package manager

## 📋 Prerequisites

- **Bun** (recommended) or Node.js 20+
- PostgreSQL database (Neon recommended)
- Auth0 account for authentication
- API keys for AI providers (OpenRouter, Gemini, etc.)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd resume-ai-analyzer
```

2. **Install dependencies**
```bash
# Using Bun (recommended)
bun install

# Or using pnpm
pnpm install

# Or using yarn
yarn install

# Or using npm
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and configure the following:

```bash
# Database
POSTGRES_URL=postgresql://user:password@host/database

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=your-secret-key
AUTH0_AUDIENCE=urn:mcp
AUTH0_SCOPE=openid profile email
APP_BASE_URL=http://localhost:3000

# AI Provider API Keys
OPENROUTER_API_KEY=your-openrouter-key
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Optional: Blockchain & Web3
CDP_API_KEY_ID=your-cdp-key-id
CDP_API_KEY_SECRET=your-cdp-secret
ZORA_API_KEY=your-zora-key
NEXT_PUBLIC_BASE_CHAIN_ID=84532
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org

# Optional: Farcaster Integration
FARCASTER_FID=your-fid
FARCASTER_CUSTODY_ADDRESS=your-address
FARCASTER_CUSTODY_PRIVATE_KEY=your-private-key
FARCASTER_BEARER_TOKEN=your-bearer-token
NEYNAR_API_KEY=your-neynar-key

# Optional: Other Services
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
BROWSERLESS_API_URL=your-browserless-url
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
```

4. **Set up the database**

```bash
# Generate migration files
bun run db:generate

# Push schema to database
bun run db:push

# Or run migrations manually
bun run db:migrate
```

5. **Start the development server**

```bash
# Start MCP server and Next.js dev server
bun run dev

# Or start separately
bun run xmcp dev
bun run next dev --turbopack
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
resume-ai-analyzer/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── resumes/           # Resume management pages
│   │   ├── api-keys/          # API key management
│   │   └── mcp/               # MCP server endpoints
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   │   ├── db/               # Database schema and queries
│   │   ├── auth0.ts          # Auth0 configuration
│   │   └── api-key-validator.ts
│   ├── tools/                 # MCP tools for AI agents
│   │   ├── create-resume.ts
│   │   ├── update-resume.ts
│   │   ├── get-resume.ts
│   │   ├── list-resumes.ts
│   │   └── delete-resume.ts
│   └── config/                # Application configuration
├── drizzle/                   # Database migrations
├── scripts/                   # Utility scripts
├── public/                    # Static assets
├── .windsurf/                 # Windsurf AI workflows
├── drizzle.config.ts          # Drizzle ORM configuration
├── xmcp.config.ts             # MCP server configuration
├── middleware.ts              # Next.js middleware (Auth)
└── package.json
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

### `resumes`
- `id` (UUID, Primary Key)
- `userId` (Text, Foreign Key to Auth0 user)
- `title` (Text)
- `name` (Text)
- `email` (Text)
- `github` (Text, Optional)
- `description` (Text, Optional)
- `createdAt`, `updatedAt` (Timestamps)

### `work_history`
- `id` (UUID, Primary Key)
- `resumeId` (UUID, Foreign Key → resumes)
- `companyName`, `role`, `dateOfWork`, `description` (Text)
- `createdAt` (Timestamp)

### `projects`
- `id` (UUID, Primary Key)
- `resumeId` (UUID, Foreign Key → resumes)
- `projectName`, `projectUrl`, `projectDescription` (Text)
- `createdAt` (Timestamp)

### `achievements`
- `id` (UUID, Primary Key)
- `resumeId` (UUID, Foreign Key → resumes)
- `achievementName`, `achievementUrl`, `achievementDescription` (Text)
- `createdAt` (Timestamp)

### `api_keys`
- `id` (UUID, Primary Key)
- `userId` (Text, Unique)
- `name`, `key` (Text)
- `lastUsed`, `createdAt` (Timestamps)

## 🤖 MCP Tools

The application exposes the following tools via Model Context Protocol:

### `create-resume`
Create a new resume with structured data including work history, projects, and achievements.

**Parameters:**
- `name` (required): Full name
- `title` (optional): Resume title
- `email` (optional): Email address
- `github` (optional): GitHub profile URL
- `description` (optional): Professional summary
- `workHistory` (optional): Array of work experiences
- `projects` (optional): Array of projects
- `achievements` (optional): Array of achievements

### `update-resume`
Update an existing resume by ID with partial or complete data.

### `get-resume`
Retrieve a specific resume by ID with all related data.

### `list-resumes`
List all resumes for the authenticated user.

### `delete-resume`
Delete a resume and all associated data (cascading delete).

### `draft-create-resume`
Create a draft resume for preview before final creation.

## 🔐 Authentication

The application uses Auth0 for authentication with the following flow:

1. Users authenticate via Auth0 login
2. Session is stored in encrypted cookies
3. Protected routes check for valid session via middleware
4. API routes validate user identity before database operations

### Protected Routes
- `/api/resumes/*` - Resume CRUD operations
- `/api/api-keys/*` - API key management
- `/resumes/*` - Resume management UI

## 🚀 Deployment

### Build for Production

```bash
# Build MCP server and Next.js app
bun run build

# Start production server
bun run start
```

### Environment Variables

Ensure all required environment variables are set in your production environment:
- Database connection (`POSTGRES_URL`)
- Auth0 credentials
- AI provider API keys
- Application base URL

### Database Migrations

Run migrations before deploying:

```bash
bun run db:migrate
```

## 🧪 Development Scripts

```bash
# Development
bun run dev              # Start dev server with MCP
bun run lint             # Run ESLint

# Database
bun run db:generate      # Generate migration files
bun run db:push          # Push schema to database
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio

# Build
bun run build            # Build for production
bun run start            # Start production server
```

## 🔧 Configuration

### MCP Server (`xmcp.config.ts`)
```typescript
{
  http: true,              // Enable HTTP transport
  stdio: false,            // Disable STDIO transport
  experimental: {
    adapter: "nextjs"      // Use Next.js adapter
  }
}
```

### Drizzle ORM (`drizzle.config.ts`)
```typescript
{
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Format

Follow the conventional commit format with emojis:

```
<emoji> <type>(<scope>): <description>

✨ feat(resume): add export to PDF functionality
🔧 fix(auth): resolve session timeout issue
📚 docs(readme): update installation instructions
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- MCP integration via [xmcp](https://github.com/modelcontextprotocol/xmcp)
- Database management with [Drizzle ORM](https://orm.drizzle.team/)
- Authentication by [Auth0](https://auth0.com/)
- AI capabilities powered by [Vercel AI SDK](https://sdk.vercel.ai/)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Note**: This is an AI-powered application. Ensure you have valid API keys for the AI providers you wish to use. The application supports multiple providers for flexibility and redundancy.
