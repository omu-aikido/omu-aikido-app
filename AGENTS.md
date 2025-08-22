# AGENTS.md

## Build/Lint/Test Commands

- Build: `pnpm build`
- Lint: `pnpm lint` or `pnpm lint:fix`
- Format: `pnpm format` or `pnpm format:check`
- Unit Tests: `pnpm test:unit`
- E2E Tests: `pnpm test:e2e`
- Run single test: `pnpm test:unit --reporter=verbose path/to/test-file`

## Code Style Guidelines

- Use Prettier for formatting with 2-space indents, no semicolons, trailing commas
- Follow TypeScript strict mode with proper type annotations
- Use React Router for routing and Clerk for authentication
- Import paths starting with `@/` resolve to root directory
- Use Zod for input validation and Drizzle ORM for database operations
- Follow Tailwind CSS utility classes for styling
- Use lowercase kebab-case for component filenames
- All components should be properly typed with TypeScript interfaces
- Use React Router's type generation for route types
- Use kebab-case for file names and PascalCase for component names
- Prefer relative imports within the app directory
