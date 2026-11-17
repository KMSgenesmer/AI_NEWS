# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@ui.md

## Status

Only the Next.js scaffold and dependencies are installed so far; no feature code exists yet. `PRD.md` (Korean) is the source of truth for requirements, data model, and the 8-step implementation order (§12). Read it before building any feature. `ui.md` is the UI guide (Tailwind design tokens, screen layouts, news/category card specs); follow it for any UI work.

## Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # type check (run `npx next typegen` first if LayoutProps/PageProps are missing)
npx drizzle-kit  # migrations (no drizzle.config.ts yet)
```

No test runner is configured.

## Custom commands

- `/news-workflow [브랜치 이름]` (`.claude/commands/news-workflow.md`): use it when developing a new feature. It checks the current branch (warns and asks before moving to `main`), creates the feature branch from the argument (if omitted, asks what to build and suggests a lowercase-hyphen name), and re-states the stack and conventions from this file. When the user types `완료` or `done`, it lists changed files, proposes a Korean commit message, commits after confirmation, merges into `main`, and summarizes the work. It never pushes unless asked.

## Stack and layout

- Next.js 16 (App Router, `src/` dir, alias `@/*` → `src/*`), React 19, Tailwind 4, TypeScript. This Next.js version differs from older releases; docs are local in `node_modules/next/dist/docs/` — consult them before writing code (see AGENTS.md).
- Planned per PRD: Clerk (auth, single allowed account, all pages and API routes protected), Neon + Drizzle (`categories`, `articles` tables; no user ID column), Claude API via `@anthropic-ai/sdk` (Haiku 5.5, batched Korean summarize + classify), `cheerio` for Naver ranking scraping, Notion saving through a Notion MCP server via the Claude API MCP connector.
- Keep the Naver scraper isolated in a single module (PRD §10) with delays between requests; dedupe articles by URL; store only summary + link, never full article text.
- Deleting a category must reassign its articles to "미분류" (uncategorized).
- All user-facing output is Korean. Secrets (Clerk, `DATABASE_URL`, `ANTHROPIC_API_KEY`, Notion) live in env vars, server-side only.

## Environment

- Windows; the project folder `AI_NEWS` has capital letters, so `create-next-app .` fails — package name is `ai-news`.
- The git root is `C:/Users/UserK/Desktop/AI_NEWS` (this folder). Remote `origin` is `https://github.com/KMSgenesmer/AI_NEWS.git`.
