# Resume AI Analyzer

A powerful Farcaster mini app built with Next.js that allows users to create, analyze, and optimize their resumes using AI. The application provides intelligent insights and suggestions to improve resume effectiveness and job matching.

## Features

- **AI-Powered Resume Analysis**: Leverage multiple AI providers (OpenAI, Google Gemini, Together AI) for comprehensive resume evaluation
- **Structured Resume Builder**: Create resumes with organized sections for work history, projects, and achievements
- **Farcaster Integration**: Native support for Farcaster miniapp ecosystem
- **Authentication**: Secure user authentication via Clerk
- **Real-time Collaboration**: Share and collaborate on resume improvements
- **Blockchain Integration**: Support for Base chain and CDP wallet integration

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: Clerk
- **AI Services**: OpenAI, Google Gemini, Together AI, OpenRouter
- **Blockchain**: Base Chain, CDP (Coinbase Developer Platform)
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account for authentication
- AI service API keys (OpenAI, Google Gemini, etc.)
- Farcaster account for miniapp features

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-ai-analyzer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your configuration:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   ```env
   # Database
   POSTGRES_URL=your_postgresql_connection_string

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # AI Services (choose at least one)
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   TOGETHER_API_KEY=your_together_api_key

   # Farcaster Integration
   FARCASTER_FID=your_farcaster_fid
   NEYNAR_API_KEY=your_neynar_api_key

   # Deployment
   VERCEL_TOKEN=your_vercel_token
   ```

4. **Set up the database**
   ```bash
   # Generate and apply database migrations
   pnpm db:generate
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Resume

1. **Sign In**: Use Clerk authentication to access the application
2. **Fill Basic Information**: Enter your name, email, and professional summary
3. **Add Work History**: Include your professional experience with company details, roles, and achievements
4. **Add Projects**: Showcase your key projects with descriptions and links
5. **Add Achievements**: Highlight certifications, awards, and other accomplishments
6. **AI Analysis**: Get intelligent suggestions for improving your resume

### AI Features

The application supports multiple AI providers for resume analysis:

- **Content Optimization**: Improve resume language and impact
- **Keyword Analysis**: Identify relevant keywords for your target industry
- **Format Suggestions**: Optimize layout and structure
- **Industry Matching**: Get tailored suggestions based on target roles

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── resumes/       # Resume management endpoints
│   ├── sign-in/           # Authentication pages
│   ├── sign-up/           # Registration pages
│   └── resumes/           # Resume management pages
├── lib/                   # Utility libraries
├── prompts/               # AI prompt templates
└── tools/                 # AI service integrations

drizzle/                   # Database migrations
├── 0000_initial.sql       # Base schema
├── 0001_add_user_id.sql   # User associations
└── [additional migrations]

public/                    # Static assets
└── .well-known/           # Farcaster configuration
```

## Database Schema

The application uses a structured approach to resume data:

- **resumes**: Main resume records with user associations
- **work_history**: Professional experience entries
- **projects**: Project showcase entries
- **achievements**: Awards and certifications

## Configuration

### Farcaster Miniapp Setup

1. Configure your Farcaster app in `public/.well-known/farcaster.json`
2. Set up the required environment variables for Farcaster integration
3. Deploy to a domain accessible by Farcaster

### AI Provider Configuration

Configure your preferred AI providers in the environment variables. The application supports:

- OpenAI GPT models
- Google Gemini
- Together AI
- OpenRouter (unified API)

## Development

### Database Management

```bash
# Generate new migrations
pnpm db:generate

# Apply migrations
pnpm db:push

# Open Drizzle Studio (GUI for database)
pnpm db:studio
```

### Code Quality

```bash
# Lint the codebase
pnpm lint

# Build for production
pnpm build
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | PostgreSQL database connection | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication | Yes |
| `CLERK_SECRET_KEY` | Clerk server-side secret | Yes |
| `OPENAI_API_KEY` | OpenAI API access | No* |
| `GEMINI_API_KEY` | Google Gemini API access | No* |
| `FARCASTER_FID` | Your Farcaster ID | No* |
| `NEYNAR_API_KEY` | Neynar API for Farcaster | No* |

* At least one AI provider required for resume analysis features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

Built with ❤️ using Next.js, AI, and the Farcaster ecosystem.
