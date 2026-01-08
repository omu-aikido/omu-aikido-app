# AGENTS.md - Development Guidelines for Vue 3 + Hono Application

## Build Commands

### Development

- `pnpm dev` - Start development server with hot module replacement
- `pnpm build` - Build for production (runs type-check and cf-typegen)
- `pnpm preview` - Preview production build locally

### Code Quality

- `pnpm lint` - Run oxlint for code quality checks
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with oxfmt
- `pnpm type-check` - Run TypeScript type checking with vue-tsc

### Testing

- `pnpm test` - Run all tests with Vitest
- `pnpm test:ui` - Run tests with Vitest UI interface
- `pnpm test:coverage` - Run tests with coverage report (80% threshold)
- `vitest run path/to/test.test.ts` - Run single test file
- `vitest run --reporter=verbose path/to/test.test.ts` - Run single test with verbose output

### Database

- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:generate` - Generate migration files
- `pnpm db:check` - Check database schema

### Deployment

- `pnpm deploy` - Build and deploy to Cloudflare Workers (dry-run)
- `pnpm cf-typegen` - Generate Cloudflare Worker types

## Code Style Guidelines

### TypeScript Configuration

- Strict mode enabled with comprehensive type checking
- No implicit any types - use explicit types everywhere
- Exact optional properties enabled
- No unchecked indexed access
- Force consistent file naming casing

### Import Organization

```typescript
// 1. Vue ecosystem imports
import { ref, computed } from "vue"
import { useRouter } from "vue-router"

// 2. External library imports
import { tv } from "tailwind-variants"
import hc from "@/src/lib/honoClinet"

// 3. Internal imports (use @ alias)
import type { UserResource } from "@clerk/types"
import { useAuth } from "@/src/composable/useAuth"
```

### Component Structure

- Use `<script setup lang="ts">` for all components
- Define props with TypeScript interfaces
- Use tailwind-variants for styling consistency
- Separate business logic into composables

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Files**: kebab-case for utilities, camelCase for composables
- **Variables**: camelCase, descriptive names
- **Constants**: UPPER_SNAKE_CASE for exports

### Error Handling

```typescript
// API calls with proper error handling
async function fetchData() {
  try {
    const response = await hc.api.endpoint.$get()
    if (!response.ok) throw new Error("Failed to fetch data")
    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    // Return fallback or re-throw with context
    return null
  }
}
```

### Styling Guidelines

- Use Tailwind CSS with tailwind-variants for component styles
- Define base styles in UI components (Card.vue pattern)
- Dark mode support with `dark:` prefixes
- Responsive design with `sm:`, `md:`, `lg:` prefixes

### State Management

- Use Vue 3 Composition API with `ref` and `computed`
- Centralize authentication state in `useAuth` composable
- Server state fetching with proper loading states
- Immutable state updates - avoid direct mutations

### Testing Guidelines

- Test files: `*.test.ts` or `*.spec.ts`
- Use Vitest with happy-dom environment
- Mock external dependencies in `tests/setup.ts`
- Component testing with @testing-library/vue
- Coverage threshold: 80% for all metrics

### API Integration

- Use Hono client with type-safe endpoints
- Proper error handling for network requests
- Loading states for async operations
- Runtime type validation with Arktype

### Database Operations

- Use Drizzle ORM with TypeScript types
- Transactions for complex operations
- Proper error handling for database failures
- Schema validation with Arktype integration

## Development Workflow

1. **Before committing**: Run `pnpm lint` and `pnpm type-check`
2. **Before pushing**: Run `pnpm test` to ensure all tests pass
3. **Code formatting**: Use `pnpm format` or configure editor to format on save
4. **Database changes**: Generate migrations with `pnpm db:generate`
5. **Type safety**: Always run `pnpm type-check` after TypeScript changes

## File Structure Patterns

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── pages/        # Page-specific components
│   └── providers/    # Context providers
├── composable/       # Vue composables
├── lib/             # Utility functions
├── router/          # Route definitions
├── styles/          # Global styles
└── views/           # Page components
```

## Security Guidelines

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs on both client and server
- Implement proper authentication checks with Clerk
- Use HTTPS for all API communications

## Performance Considerations

- Lazy load routes with Vue Router
- Use `shallowRef` for large objects that don't need deep reactivity
- Implement proper loading states for async operations
- Optimize bundle size with dynamic imports
- Use Vue DevTools for component inspection
