# CLAUDE.md

A website generated from one company's own information, with (soon) a
chatbot that answers only from that information. This repository is changed
by an automated software factory; pull requests are reviewed by a person.

## Commands

```bash
pnpm install
pnpm lint        # Biome
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest
pnpm build       # next build
pnpm test:e2e    # Playwright, against the built app (run pnpm build first)
```

All five must pass; the factory runs them as quality gates.

## Layout

- `content/company.json`: the company's information. The site and chatbot
  must not state anything about the company that is not in here.
- `lib/`: plain TypeScript, unit-tested (`*.test.ts` next to the code).
- `app/`: Next.js App Router pages and components.
- `tests/e2e/`: Playwright end-to-end tests (`*.spec.ts`).
- `tests/regressions/`: regression tests filed by the factory's tester, each
  with its issue. Protected: never edit one to make it pass; fix the app.

## Conventions

- Put logic in `lib/` as small pure functions and test it there; keep
  components thin.
- Component tests (`*.test.tsx`) start with `// @vitest-environment jsdom`
  and use `@testing-library/react`.
- Name tests after the acceptance criterion they cover:
  `it('AC-1: shows the current year in the footer', ...)`.
- Import with the `@/` alias from the repository root.
- No new dependencies without a person: `package.json` and the lockfile are
  protected, as are CI and tool configuration.
