# 10xCards - Nauka języków z fiszkami

Aplikacja do nauki języków z wykorzystaniem fiszek i algorytmu Leitnera, z możliwością generowania fiszek przez AI.

## Tech Stack

- [Astro](https://astro.build/) v5.14.8 - Modern web framework for building fast websites
- [React](https://react.dev/) v19.2.0 - UI library for interactive components
- [TypeScript](https://www.typescriptlang.org/) v5.9.3 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v3.4.18 - Utility-first CSS framework
- [Supabase](https://supabase.com/) v2.76.1 - Backend as a Service (Database, Auth)
- [Shadcn/ui](https://ui.shadcn.com/) - UI component library

## Prerequisites

- Node.js v22+ (recommended: v22.14.0 as specified in `.nvmrc`)
- npm (comes with Node.js)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/adriansuder/10xCards.git
cd 10xCards
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example file
cp .env.example .env.local

# For local development with Supabase CLI:
npx supabase start

# This will output credentials - update .env.local with:
# - API URL as PUBLIC_SUPABASE_URL
# - anon key as PUBLIC_SUPABASE_ANON_KEY
```

4. Run database migrations:

```bash
npx supabase db reset
```

5. Run the development server:

```bash
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (requires adapter)
- `npx astro check` - Check for TypeScript errors

## Project Structure

```md
.
├── src/
│   ├── layouts/         # Astro layouts
│   ├── pages/           # Astro pages (routes)
│   │   └── api/         # API endpoints
│   ├── components/      # UI components (Astro & React)
│   │   ├── ui/          # Shadcn/ui components
│   │   ├── flashcards/  # Flashcard management
│   │   ├── home/        # Home page components
│   │   ├── review/      # Review session components
│   │   └── hooks/       # React custom hooks
│   ├── lib/             # Services and utilities
│   │   └── services/    # Business logic services
│   ├── db/              # Supabase client and types
│   ├── middleware/      # Astro middleware (auth)
│   ├── styles/          # Global styles
│   └── types.ts         # Shared TypeScript types
├── supabase/
│   ├── migrations/      # Database migrations
│   └── config.toml      # Supabase configuration
├── tests/               # Test files and documentation
└── public/              # Static assets
```

## Environment Variables

This project uses Astro's environment variable system. Variables prefixed with `PUBLIC_` are exposed to the client-side code.

**Required variables** (in `.env.local`):

```bash
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ **Important**: The `PUBLIC_` prefix makes these variables available in browser JavaScript. This is safe for the Supabase URL and anon key, as they are designed to be public. Never use this prefix for secrets like service role keys!

## Features

- 🎯 **Flashcard Management** - Create, edit, and organize flashcards
- 🤖 **AI-Powered Generation** - Generate flashcards from text using AI
- 📚 **Leitner System** - Spaced repetition algorithm for effective learning
- 👤 **User Authentication** - Secure login and registration with Supabase
- ⚙️ **User Settings** - Customize AI difficulty level and preferences
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- ♿ **Accessible** - ARIA labels, keyboard navigation, screen reader support

## Development

### Supabase Local Development

```bash
# Start local Supabase instance
npx supabase start

# Stop local instance
npx supabase stop

# Reset database (apply all migrations)
npx supabase db reset

# Create a new migration
npx supabase migration new migration_name
```

### Type Generation

After making changes to the database schema:

```bash
npx supabase gen types typescript --local > src/db/database.types.ts
```

### Code Quality

```bash
# Check TypeScript errors
npx astro check

# Check for errors and warnings only
npx astro check --minimumSeverity warning
```

## AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure
- Coding practices
- Frontend development
- Styling with Tailwind
- Accessibility best practices
- Astro and React guidelines

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.

### GitHub Copilot

AI instructions for GitHub Copilot are available in `.github/copilot-instructions.md`

### Windsurf

The `.windsurfrules` file contains AI configuration for Windsurf.

## Contributing

Please follow the AI guidelines and coding practices defined in the AI configuration files when contributing to this project.

## License

MIT
