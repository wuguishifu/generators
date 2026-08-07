# @wuguishifu/nx-convex

An [Nx](https://nx.dev) plugin that scaffolds a [Convex](https://convex.dev)
backend app together with a companion contract library inside an Nx workspace.

Convex generates its client API types from your server source. In a monorepo
that's awkward: any app that wants the nice `api` types ends up pulling the
whole Convex server source graph into its TypeScript project. This plugin
scaffolds two projects instead — the Convex app itself, and a small "contract"
library that packages only the generated, client-safe artifacts (`api`,
`dataModel`, and the declaration files they reference) into a `dist/` that
other apps and libs can depend on.

## Installation

```sh
pnpm add -D @wuguishifu/nx-convex
```

## Usage

```sh
nx g @wuguishifu/nx-convex:convex-app apps/my-backend libs/my-backend-kore
```

The two positional arguments are the directory for the Convex app and the
directory for the companion contract library. Project names default to the
last segment of each path, and the contract library's import path defaults to
its name. To set things explicitly:

```sh
nx g @wuguishifu/nx-convex:convex-app apps/my-backend libs/my-backend-kore \
  --appName=my-backend \
  --contractLibName=my-backend-kore \
  --importPath=@myorg/my-backend-kore
```

Add `--dry-run` to preview the changes without writing them.

### Options

| Option                 | Type    | Default                            | Description                                                                              |
| ---------------------- | ------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `appDirectory`         | string  | _(required, first positional)_     | Directory the Convex app is created in, e.g. `apps/my-backend`.                          |
| `contractLibDirectory` | string  | _(required, second positional)_    | Directory the contract library is created in, e.g. `libs/my-backend-kore`.               |
| `appName`              | string  | basename of `appDirectory`         | Nx project name for the Convex app.                                                      |
| `contractLibName`      | string  | basename of `contractLibDirectory` | Nx project name for the contract library.                                                |
| `importPath`           | string  | `contractLibName`                  | Package name used to import the Convex api, e.g. `@myorg/my-backend-kore`.               |
| `enableAiFiles`        | boolean | `false`                            | Enable Convex generated AI files, and add an `update:ai-files` target.                   |
| `deferConvexSetup`     | boolean | `false`                            | Skip connecting to a Convex deployment; scaffold placeholder `_generated` files instead. |

## What gets generated

```plaintext
apps/my-backend/
├── .gitignore                  # ignores .env.local
├── convex.json
├── eslint.config.mjs
├── index.ts                    # re-exports only convex/_generated
├── package.json
├── project.json
├── tsconfig.json
├── tsconfig.lib.json
└── convex/
    ├── convex.config.ts
    ├── schema.ts               # example `notes` table
    └── _generated/             # only with --deferConvexSetup

libs/my-backend-kore/
├── README.md
├── package.json                # exports ./convex/_generated/{api,dataModel}
├── project.json
├── tsconfig.json
├── tsconfig.lib.json
└── scripts/
    └── build.mjs               # packages generated artifacts into dist/
```

The Convex app gets these Nx targets:

- **`serve`** — runs `convex dev` and rebuilds the contract library whenever
  the generated files change, in parallel.
- **`build`** — typechecks the app and rebuilds the contract library.
- **`convex`** — forwards arbitrary commands to the Convex CLI, e.g.
  `nx convex my-backend -- dev --once`.
- **`deploy`** — runs `convex deploy` from the app directory.
- **`clean`** — removes `dist`, `node_modules`, and `out-tsc`.

## After generation

The generator adds `convex` to the workspace `package.json`, runs `nx sync`,
builds the app, and builds the contract library. Unless `--deferConvexSetup`
is passed, it also runs `convex dev --once` first, which prompts you to log in
and create or link a Convex deployment.

Other projects then consume the backend's API through the contract library:

```ts
import { api } from '@myorg/my-backend-kore';
```

## Requirements

- Node.js >= 20
- Nx >= 23 with the `@nx/js/typescript` plugin
- pnpm (the generator's post-install steps invoke `pnpm nx ...`)
- App and library directories two levels below the workspace root
  (e.g. `apps/*`, `libs/*`)

## License

MIT
