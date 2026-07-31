# generators

A series of [Nx](https://nx.dev) generators for Expo native code.

This is the monorepo the generators are developed in. If you just want to use
them, install the published plugin — see the package README linked below.

## Packages

| Package                                                                        | Description                                                                        |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [`@wuguishifu/nx-expo-native-modules`](tools/nx-expo-native-modules/README.md) | Nx plugin that scaffolds Expo native modules with Swift and Kotlin implementations |

Internal, unpublished libraries live in `libs/` — currently `@root/utils`, which
holds the version constants the generators write into generated projects. It is
bundled into each plugin at build time, so it never ships as a runtime
dependency.

## Layout

```plaintext
tools/    published Nx plugins
libs/     internal libraries, bundled into plugins at build time
packages/ workspace packages (reserved; empty)
```

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm build
```

Common tasks, all run from the workspace root:

```sh
pnpm build              # build every project
pnpm typecheck          # typecheck every project
pnpm lint               # lint every project
nx build <project>      # build a single project
nx graph                # explore the project graph
```

## Trying a generator locally

Nx resolves workspace plugins from their built output, so build first, then run
the generator against this workspace with `--dry-run`:

```sh
pnpm build
nx g @wuguishifu/nx-expo-native-modules:native-module libs/my-module --dry-run
```

Drop `--dry-run` to actually write the files. See the
[plugin README](tools/nx-expo-native-modules/README.md) for the full option list
and for details on what the generator changes in a workspace.

## Releasing

Publishing is handled by [`nx release`](https://nx.dev/features/manage-releases),
which builds every project, bumps the version, writes the changelog, commits and
tags, pushes, creates a GitHub release, and publishes to npm. The config lives
under `release` in `nx.json`; every project matching `@wuguishifu/*` is
releasable, so new plugins are picked up without config changes.

### From GitHub (preferred)

Run the **Release** workflow from the Actions tab
([`.github/workflows/release.yml`](.github/workflows/release.yml)). It takes four
inputs:

| Input               | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `package`           | Which package to publish, without the `@wuguishifu/` scope            |
| `version-bump-type` | `major`, `minor`, or `patch` (default `patch`)                        |
| `dry-run`           | Run the whole flow without writing, pushing, or publishing            |
| `first-release`     | Set for a package's very first release, when no git tag exists for it |

The workflow publishes via [npm trusted publishing](https://docs.npmjs.com/trusted-publishers)
(OIDC), so no npm token is stored in the repo. Each package must have this
repository and workflow filename registered as a trusted publisher on npmjs.com
under the package's Settings, and the packages set `publishConfig.access` to
`public` because scoped packages are otherwise published as restricted.

When adding a new package, add its short name to the `package` input's `options`
list in the workflow.

### Locally

```sh
pnpm release:dry-run     # preview the whole flow, changing nothing
pnpm release             # version + changelog + tag + push + publish
```

To target one package or run the steps separately:

```sh
nx release patch --projects=@wuguishifu/nx-expo-native-modules
nx release version patch   # or minor / major / an explicit version
nx release changelog <version>
nx release publish
```

A local release needs `npm login` with access to the `@wuguishifu` scope, and a
`GITHUB_TOKEN`/`GH_TOKEN` (or an authenticated `gh` CLI) to create the GitHub
release.

## License

[MIT](LICENSE)
