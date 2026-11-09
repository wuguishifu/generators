# @wuguishifu/nx-aws-cdk

An [Nx](https://nx.dev) plugin that scaffolds [AWS CDK](https://aws.amazon.com/cdk/)
apps and stacks inside an Nx workspace.

The generated app models each environment (staging, production, ...) as a CDK
`Stage`. Every stage is synthesized from the same code, gets its own stack names
(`staging-Users`, `production-Users`), and is deployed with one command. Lambda
functions share one construct with the defaults set in a single place.

## Installation

```sh
pnpm add -D @wuguishifu/nx-aws-cdk
```

## Generators

### `cdk-app`

```sh
nx g @wuguishifu/nx-aws-cdk:cdk-app apps/infra
```

| Option         | Type     | Default                  | Description                                                                           |
| -------------- | -------- | ------------------------ | ------------------------------------------------------------------------------------- |
| `directory`    | string   | _(required, positional)_ | Directory the app is created in.                                                      |
| `name`         | string   | basename of `directory`  | Nx project name.                                                                      |
| `stages`       | string[] | `staging`, `production`  | One CDK Stage per entry. `production` or `prod` retains data and logs on delete.      |
| `region`       | string   | `us-east-1`              | Region for every stage. Change individual stages afterwards in `src/config.ts`.       |
| `exampleStack` | string   | `example`                | Name of an example stack with one Lambda function. Pass `--exampleStack=` to skip it. |

```plaintext
apps/infra/
├── cdk.json                    # tsx entry point + aws-cdk-lib's recommended feature flags
├── project.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── eslint.config.mjs           # only if the workspace has a root eslint.config.mjs
├── README.md
└── src/
    ├── main.ts                 # one AppStage per entry in config.ts
    ├── config.ts               # stage name, isProduction, account/region
    ├── app-stage.ts            # where stacks are instantiated
    ├── constructs/
    │   └── node-function.ts    # NodejsFunction with shared defaults
    └── stacks/example/
        ├── example-stack.ts
        └── handlers.ts
```

Targets:

| Target      | Command                                                                      |
| ----------- | ---------------------------------------------------------------------------- |
| `synth`     | `cdk synth` for every stage, after `typecheck`.                              |
| `diff`      | `cdk diff '<stage>/*'`. One configuration per stage; defaults to the first.  |
| `deploy`    | `cdk deploy '<stage>/*'`. Only production stages keep the approval prompt.   |
| `bootstrap` | `cdk bootstrap`.                                                             |
| `cdk`       | Forwards arguments to the CDK CLI: `nx cdk infra -- deploy 'staging/Users'`. |

Pass AWS options after `--`, e.g. `nx deploy infra -c production -- --profile prod`.

The generator adds `aws-cdk-lib`, `constructs`, `aws-cdk`, `tsx`, `esbuild`,
`@types/aws-lambda`, and `@types/node` to the workspace `package.json`, keeping
any versions already there.

### `stack`

```sh
nx g @wuguishifu/nx-aws-cdk:stack users --project=infra
```

Creates `src/stacks/users/users-stack.ts` and `handlers.ts`, then imports
`UsersStack` into `src/app-stage.ts` and instantiates it at the end of the
stage's constructor. If `app-stage.ts` has been restructured so it can't find
the stage class, it prints the two lines to add instead.

## Defaults and why

These are the places where the generated app differs from a plain `cdk init`
app, and from older CDK apps this plugin was based on.

- **Stages, not an environment variable.** Selecting the environment with
  `ENVIRONMENT=staging cdk deploy` means a forgotten variable falls back to a
  default, and staging and production stacks share names. Stages give each
  environment its own stack names, and `deploy` picks a stage explicitly.
- **Pin account IDs.** `src/config.ts` has a commented-out `account` per stage.
  With it set, deploying production with staging credentials fails instead of
  deploying there.
- **`tsx` instead of `ts-node` + `tsconfig-paths`.** The app runs under the
  project's own tsconfig. `tsx` doesn't typecheck, so `synth`, `diff`, and
  `deploy` depend on `typecheck`. If the workspace uses a TS custom condition
  (Nx's `@org/source`), it's passed to both `tsx` and esbuild so workspace
  libraries resolve to source.
- **esbuild installed locally.** `NodejsFunction` uses Docker to bundle when
  esbuild isn't installed. With it installed, Docker isn't needed.
- **`NodeFunction` defaults.** Node.js 24 on arm64, 256 MB, 10 s timeout, JSON
  logs, source maps, and an explicit log group. Without one, Lambda creates a
  log group that never expires and outlives the function. The log group is
  kept for 1 month and deleted with the stack in non-production stages, and
  kept for 6 months and retained in production.
- **Current feature flags.** `cdk.json` gets the recommended flags for the
  `aws-cdk-lib` version this plugin targets, the same set `cdk init` writes.
  Refresh the snapshot in `src/generators/cdk-app/recommended-feature-flags.json`
  from `https://unpkg.com/aws-cdk-lib@<version>/recommended-feature-flags.json`
  when bumping `awsCdkLibVersion` in `libs/utils`.

## Requirements

- Node.js >= 20
- Nx >= 23 with the `@nx/js/typescript` plugin (for the inferred `typecheck` target)
- `typescript` in the workspace (used to register stacks in `app-stage.ts`)

## License

MIT
