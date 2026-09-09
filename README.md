# NestJS Starter

A minimal NestJS starter with TypeScript, TypeORM, MySQL, Redis caching, JWT authentication, Winston logging, and Vitest.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm migration:run
```

Requires running MySQL and Redis instances (connection settings live in `.env`).

## Development

```bash
pnpm dev
```

The app runs at `http://localhost:3001`.

## Scripts

```bash
pnpm dev                          # start the dev server (watch mode)
pnpm build                        # build for production
pnpm start                        # start the app
pnpm start:debug                  # start in debug mode
pnpm start:prod                   # run the production build
pnpm lint                         # run oxlint
pnpm test                         # run tests
pnpm test:watch                   # run tests in watch mode
pnpm migration:create <path>      # create an empty migration
pnpm migration:generate <path>    # generate a migration from entity changes
pnpm migration:run                # run pending migrations
pnpm migration:revert             # revert the last migration
pnpm migration:show               # list migrations and their status
```

## Notes

- Config loading and env validation live in `src/config`.
- Shared middleware, guards, filters, interceptors, and the logger live in `src/common`.
- Feature modules live in `src/modules` (auth, user).
- Migrations live in `src/database/migrations`. The CLI runs directly on `.ts` sources via ts-node, so no build is needed: `pnpm migration:generate src/database/migrations/add-users`.
- All responses use a unified body: `{ code, message, data, timestamp, path }`. `code` is `0` on success; on error it carries a business code from `src/common/constants/error-codes.ts`. HTTP status codes remain standard.
- Tests are picked up from `**/*.spec.ts`.
