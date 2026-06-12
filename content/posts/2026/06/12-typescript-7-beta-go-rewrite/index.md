---
slug: typescript-7-beta-go-rewrite
title: "TypeScript 7.0 Beta: The Compiler Rewritten in Go and What It Means for Your Projects"
excerpt: "TypeScript 7.0 Beta swaps the bootstrapped TypeScript compiler for a native Go port—and claims roughly 10× faster builds. But the real story is more nuanced than the headline. Here's what changed, what hasn't, and when it actually makes sense to try it."
featuredImage: /images/content/typescript-7-beta-go-rewrite/featured.png
tags:
  - Development
  - TypeScript
  - Developer Tools
  - JavaScript
author: joseph-crawford
publishedAt: "2026-06-12"
featured: true
---

# TypeScript 7.0 Beta: The Compiler Rewritten in Go and What It Means for Your Projects

Here's the pitch: the TypeScript team rewrote the compiler in Go, and type-checking is roughly ten times faster. Here's the reality: it's a genuine, careful port — not a hackathon demo — and it's already running in production at companies with millions of lines of TypeScript. But it's also still a beta with real gaps, and jumping in blind will cost you an afternoon you could have spent shipping features.

I've read through the [official announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/), the [typescript-go repository](https://github.com/microsoft/typescript-go), and the community write-ups. Here's my take on what matters, what's missing, and when it makes sense to make the switch.

## Why Go, Why Now

For a decade, the TypeScript compiler has been eating its own cooking: written in TypeScript, compiled to JavaScript, executed on V8. That's a beautiful idea — the compiler lives in the same language it compiles, so any TypeScript developer can read, modify, and contribute to it. But it comes with a ceiling. V8 is an incredible JavaScript engine, and the TypeScript team has squeezed years of clever optimizations out of it — incremental compilation, project references, solution-style configs, smarter caching. Those are genuine improvements. But they're improvements within a fundamental constraint: a single-threaded, garbage-collected JavaScript runtime is not the right tool for parsing and type-checking millions of lines of code in parallel.

Go breaks through that ceiling three ways. First, the compiler ships as a native binary — no V8 startup cost, no JIT warm-up, no interpreting overhead. Second, goroutines give the compiler genuine shared-memory parallelism across OS threads, meaning parsing, type-checking, and emitting can happen concurrently without the cooperative multitasking overhead of JavaScript promises. Third, Go's runtime uses a garbage collector designed for low-latency concurrent workloads, which matters when you're churning through large type graphs.

The payoff scales with your codebase. On a small-to-medium project, you might see your type-check drop from 8 seconds to 2 — nice, but not life-changing. On a large monorepo where `tsc --noEmit` takes 45 seconds, dropping to 4 or 5 seconds changes how you work. You stop thinking about type-checking as a build step and start treating it like instant feedback.

## Same Type System, Faster Answers

The thing I want to stress early: **the type system hasn't changed.** TypeScript 7.0 produces the same errors, the same inferences, the same strict-mode behavior as 6.0. The Go port was done structurally — the type-checking logic was ported line by line, not redesigned from scratch. If you see a different error between 6.0 and 7.0, that's a bug, not a feature.

This is what makes the beta safe to experiment with today. You're not adopting a new language variant. You're getting the same answers, faster.

## New Defaults You'll Need to Adjust

TypeScript 7.0 carries forward every default change from 6.0, and some things that were deprecation warnings in 6.0 are now hard errors. If you're already on 6.0 with `strict: true` and modern module settings, the jump is small. If you're upgrading from 5.x, there's more to untangle.

The changes that are most likely to bite you:

**`strict` is on by default.** If you've been running without it, you'll see new errors everywhere. This is a good thing long-term, but it means upgrade day involves fixing a lot of `any` escapes.

**`module` defaults to `esnext` and `target` defaults to the current stable ECMAScript version.** The days of `target: es5` and `module: commonjs` being the default are over. If your build pipeline assumes CommonJS output, you'll need to set these explicitly or update your bundler config.

**`rootDir` now defaults to `./` instead of being inferred.** If your project root contains the `tsconfig.json` but your source lives inside `packages/app/src/`, you'll get unexpected output directory structures unless you set `rootDir` explicitly:

```json
{
  "compilerOptions": {
    "rootDir": "packages/app/src"
  },
  "include": ["packages/app/src"]
}
```

**`types` defaults to `[]` instead of auto-discovering every `@types/*` package.** This one is going to catch a lot of people off guard. If your code relies on globals from `@types/node` (like `process.env`) or `@types/jest` (like `describe` and `it`), you need to opt in explicitly now:

```json
{
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

Honestly, I think this is a healthier default. Auto-discovering `@types` packages has been a source of subtle breakage for years — the wrong package gets hoisted by your package manager, and suddenly you have phantom globals you never intended. Explicit is better. But the migration will feel like a speed bump if your project has been relying on implicit discovery.

**`stableTypeOrdering` is on by default and can't be turned off.** This makes error messages and type representations consistent across runs. Good for reproducibility, and honestly you probably won't notice it unless you were relying on non-deterministic ordering in tests.

A handful of older options are now hard errors rather than deprecation warnings: `target: es5`, `downlevelIteration`, `moduleResolution: node` (use `bundler` or `nodenext`), `module: amd/umd/system`, and `baseUrl` for path aliases (use `paths` instead). The full list is in the [CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md).

## Parallelism: The Real Payoff

The single biggest technical advantage of the Go rewrite is that type-checking can actually run in parallel. The old compiler was constrained to a single thread. TypeScript 7.0 spins up multiple checker workers that divide the work across files.

You control this with `--checkers N`, defaulting to 4. On an 8-core machine checking a monorepo, bumping it to 8 can cut another 30–40% off build time at the cost of more memory. On a 2-core CI runner, dropping it to 2 avoids wasting cycles on coordination overhead. There's also `--builders N` for parallel project reference builds — particularly useful in monorepos — and `--singleThreaded` if you need deterministic output for debugging or benchmarking.

One subtlety: because checker workers divide files slightly differently depending on the count, varying `--checkers` can theoretically produce different error orderings across machines. If your CI pipeline asserts on exact diagnostic output, pin the number.

## JavaScript Gets Straightened Out

TypeScript's handling of `.js` files has always been a bit of a second-class citizen, built on JSDoc conventions and Closure Compiler patterns that don't map cleanly onto TypeScript's type system. Version 7.0 tightens this up:

- You can't use a value where a type is expected anymore. Instead of `/** @type {MyClass} */`, you write `/** @type {typeof MyClass} */`.
- `@enum` is gone — use TypeScript's `enum` or a `const` object with `as const`.
- Closure-style function syntax (`function(string): void`) is no longer supported. Use TypeScript shorthand: `(s: string) => void`.
- `@class` doesn't convert a function into a constructor. Use an actual `class` declaration.
- Postfix `!` in JSDoc isn't supported. Use the type `T` directly.

If your project is pure TypeScript, you won't notice these changes. If you run `checkJs: true` or maintain a large JavaScript codebase with JSDoc type annotations, expect some cleanup.

## Installing and Running the Beta

The beta ships under a temporary package name so it doesn't collide with your existing TypeScript install:

```bash
npm install -D @typescript/native-preview@beta
```

Instead of `tsc`, you run `tsgo`:

```bash
npx tsgo --project tsconfig.json
```

When TypeScript 7.0 goes stable, the package name will switch back to `typescript` and the command back to `tsc`. The temporary naming is just to make coexistence easy during the beta period.

If your toolchain depends on the TypeScript 6 API — and right now, `typescript-eslint` does — you can keep both versions around. Microsoft publishes a compatibility package called `@typescript/typescript6` that exposes a `tsc6` command. Using an npm alias, you can pin `typescript` to the 6.x line while running `tsgo` separately:

```json
{
  "devDependencies": {
    "typescript": "npm:@typescript/typescript6@^6.0.0",
    "@typescript/native-preview": "beta"
  }
}
```

This way, tools that import from the `typescript` package get TS 6, while your CI type-check step can call `tsgo` directly.

## Editor Support

There's a [TypeScript Native Preview extension for VS Code](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview) that wires up the Go-based language server. The core editing features work — diagnostics, hover information, go-to-definition, completions, refactorings. Multiple large teams have been running it as their primary TypeScript extension for months without major issues.

A handful of features haven't landed yet: semantic token highlighting based on type information, granular import management (separate "sort imports" and "remove unused imports" commands — right now you only get the combined "organize imports"), and "find file references" from the explorer sidebar. None of these are dealbreakers for day-to-day editing, but if you have muscle memory for any of them, you'll notice.

The language server speaks LSP, so it works outside VS Code too. Neovim, Helix, and any other editor with LSP support can point at the `tsgo` binary.

## Where It's Not Ready Yet

The beta has real boundaries, and they matter more than the speed numbers for most teams:

**No programmatic API.** If your tooling imports from the `typescript` package to walk the AST, inspect types, or build custom transforms, it can't use TS 7 yet. This blocks `typescript-eslint`, `ts-morph`, and a long tail of build plugins. The team plans a stable API for 7.1 or later.

**Framework plugins don't load.** Next.js, Vue, and other frameworks ship TypeScript plugins that hook into the compiler. `tsgo` doesn't support the plugin system yet. If your project depends on these for accurate type information, you'll get incomplete diagnostics.

**Project references are partial.** Simple `--noEmit` checks on a single project work great. Monorepos with composite projects and inter-project references will hit edge cases. If your setup is `tsc --build` with a complex project graph, wait.

**It checks types, it doesn't produce output.** If your build pipeline runs `tsc` to emit `.js` files, `tsgo` can't replace that step yet. It's built for `--noEmit` type-checking — the kind of check you run in CI to catch type errors before merge. For actual compilation, you'll still need the original `tsc` or a tool like `esbuild` or `swc`.

**Watch mode and declaration emit from JS files are still in progress.** These are coming but not in the beta.

## When to Make the Move

The honest answer depends on what's slow and what your project depends on.

If you're running `tsc --noEmit` as a standalone CI step and it's the bottleneck in your pipeline — anything over two or three minutes — this is exactly the scenario `tsgo` was built for. The `--noEmit` type-check is the most mature path through the new compiler, and it's where the speed gains are most dramatic.

The safest way to try it is to add a parallel CI job that runs `tsgo` alongside your existing `tsc` check, with `continue-on-error: true` so it can't break your pipeline:

```yaml
typecheck-tsgo:
  runs-on: ubuntu-latest
  continue-on-error: true
  steps:
    - uses: actions/checkout@v4
    - run: npm install -D @typescript/native-preview@beta
    - run: time npx tsgo --project tsconfig.json
```

Let it run for a week. Compare the diagnostics to what `tsc` produces. If they match and `tsgo` is dramatically faster, you've got a data-driven case for switching the primary job.

If your type-check finishes in under a minute, there's no urgency. The improvement is real but not transformative at that scale. Let the beta stabilize.

If your project depends on framework-specific TypeScript plugins — Next.js is the obvious example — hold off. `tsgo` can't load those plugins yet, which means you'd be running type-checks without the framework-aware diagnostics that catch real bugs.

If you're in a monorepo with composite projects and `tsc --build`, the project reference support is still partial. The parallel builder is promising, but you'll hit edge cases in anything beyond a straightforward single-project setup.

## Why This Matters Beyond Speed

The "10× faster" number is what gets shared on social media, but the architectural shift is the real story.

TypeScript has been constrained by its own runtime for years. Every clever optimization — incremental builds, project references, solution-style configs — was a way to work around the fact that a single-threaded JavaScript runtime is not the right tool for compiling millions of lines of code in parallel. The team squeezed impressive gains out of that constraint, but the constraint was still there.

Go removes it. Not incrementally — structurally. The ceiling on what the toolchain can do just moved up significantly. Faster builds make stricter type configurations practical at scale. Faster editor feedback makes TypeScript-first development feel more fluid. And the headroom means the team can add more sophisticated type-level analyses in the future without making developers pay for it in wait time.

There's also a signal in the priorities. The TypeScript team could have spent a year building new type system features. Instead, they invested it in the compiler's foundation. That's a bet that the experience of waiting for your tools matters more than any single language feature. I think they're right.

## What Comes Next

The stable release of TypeScript 7.0 is planned within roughly two months. A release candidate will ship a few weeks before that, at which point the behavior is expected to be finalized.

After 7.0, the next milestone is a stable programmatic API — likely in 7.1 — which will unblock the ecosystem of tools that depend on compiler internals. Until then, `typescript-eslint` and similar tools will continue using TS 6.

If you want to track progress, the [microsoft/typescript-go repository](https://github.com/microsoft/typescript-go) has open issues and public milestones. The [CHANGES.md](https://github.com/microsoft/typescript-go/blob/main/CHANGES.md) file is the definitive reference for behavioral differences between 6.0 and 7.0.

## Quick Start

```bash
# Install
npm install -D @typescript/native-preview@beta

# Type-check
npx tsgo --project tsconfig.json

# VS Code: install the "TypeScript Native Preview" extension
```

The package will become `typescript` and the command will become `tsc` at stable release. For now, `@typescript/native-preview` and `tsgo` keep the two versions cleanly separated.

---

The speed gains are real and the engineering is solid. But the honest take is that the beta's sweet spot is `--noEmit` type-checking on straightforward projects — and that's already enough to matter for a lot of CI pipelines. For everything else, the ecosystem needs to catch up: plugins, programmatic API, project references, and watch mode. That's coming, but it's not here yet.

The direction isn't in question. The TypeScript compiler is going native. The question is when your project is ready to follow.