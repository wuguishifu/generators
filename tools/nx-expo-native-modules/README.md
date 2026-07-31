# @wuguishifu/nx-expo-native-modules

An [Nx](https://nx.dev) plugin that scaffolds [Expo native modules](https://docs.expo.dev/modules/overview/) inside an Nx workspace.

Writing an Expo native module by hand means creating a Swift module, a Kotlin
module, a podspec, a Gradle build file, an `expo-module.config.json`, and the
TypeScript layer that bridges them — and then wiring all of that into the
workspace's Babel, TypeScript, and Nx configuration. This plugin does that in
one command.

## Installation

```sh
pnpm add -D @wuguishifu/nx-expo-native-modules
```

## Usage

```sh
nx g @wuguishifu/nx-expo-native-modules:native-module libs/my-module
```

The first positional argument is the `directory` the module is created in. The
module name defaults to the last segment of that path, so the command above
generates a `MyModule` native module. To set things explicitly:

```sh
nx g @wuguishifu/nx-expo-native-modules:native-module libs/my-module \
  --name=hello-world \
  --importPath=@myorg/hello-world \
  --androidNamespace=dev.expo.helloworld \
  --author="Your Name" \
  --description="Says hello from native code"
```

Add `--dry-run` to preview the changes without writing them.

## What gets generated

```plaintext
libs/my-module/
├── .babelrc.js                       # @nx/react/babel preset, babel-preset-expo for tests
├── eslint.config.mjs                 # extends the workspace root config
├── expo-module.config.json           # registers the Apple + Android modules with Expo
├── package.json                      # expo/react/react-native peer deps
├── project.json
├── tsconfig.json
├── android/
│   ├── build.gradle                  # com.android.library + expo-module-gradle-plugin
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/dev/expo/helloworld/
│           ├── HelloWorldModule.kt   # Module with a hello() function and a view
│           └── HelloWorldView.kt     # ExpoView subclass
├── ios/
│   ├── HelloWorld.podspec            # depends on ExpoModulesCore
│   ├── HelloWorldModule.swift        # Module with a hello() function and a view
│   └── HelloWorldView.swift          # ExpoView subclass
└── src/
    ├── index.ts
    ├── hello-world-module.ts         # requireNativeModule<HelloWorldModule>(...)
    └── hello-world-view.tsx          # requireNativeView(...)
```

Both platforms are generated with a matching `hello()` function and a native
view that renders a centered label, so the module works as-is and gives you a
running starting point on each platform.

## What it changes in the workspace

Beyond the new project directory, the generator also:

- **Adds a root `babel.config.json`** with `babelrcRoots: ['*']`, so per-project
  `.babelrc.js` files are picked up in a monorepo. Skipped if the workspace
  already has a `babel.config.json` or `babel.config.js`.
- **Registers the project** in the root `tsconfig.json` `references` array.
- **Adds dependencies to the root `package.json`.** With the default
  `--bundler=tsc`: `expo`, `react`, `react-dom`, and `react-native` as
  dependencies, plus `@nx/expo`, `@nx/react`, `@expo/cli`, `@types/node`,
  `metro-config`, `metro-resolver`, and `tslib` as dev dependencies. With
  `--bundler=none`, only `@types/node`. Existing versions are kept, so this
  never overwrites versions the workspace has already pinned.
- **Reads `customConditions` from `tsconfig.base.json`** and uses the first
  entry as the source condition in the generated `package.json` export map,
  matching how the rest of the workspace resolves TypeScript sources.

The generator expects a root `tsconfig.base.json` and `tsconfig.json` to exist,
and throws if either is missing.

## Options

| Option             | Type              | Default                     | Description                                                                                   |
| ------------------ | ----------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `directory`        | `string`          | — (required, positional)    | Directory the module is created in.                                                           |
| `name`             | `string`          | last segment of `directory` | Module name. `Module` is appended to the generated class name.                                |
| `bundler`          | `'tsc' \| 'none'` | `'tsc'`                     | `'none'` makes the library non-buildable and emits declarations only.                         |
| `importPath`       | `string`          | `name`                      | Package name used to import the module, e.g. `@myorg/my-module`. Required to publish it.      |
| `androidNamespace` | `string`          | `'com.example'`             | Android namespace, e.g. `dev.expo.mymodule`. The module name is appended if not already last. |
| `description`      | `string`          | `'A description'`           | Used for both `s.summary` and `s.description` in the podspec.                                 |
| `author`           | `string`          | empty                       | Used for `s.author` in the podspec.                                                           |
| `homepage`         | `string`          | this repository's URL       | Used for `s.homepage` in the podspec.                                                         |

### Naming

`name` is lowercased and split on spaces, hyphens, and underscores, then
recombined. It is **not** split on camelCase boundaries, so pass `hello-world`,
`hello_world`, or `"hello world"` to get `HelloWorldModule` — passing
`HelloWorld` yields `HelloworldModule`.

### Currently unused options

`summary` and `useProjectJson` are accepted by the schema but have no effect
yet: the podspec's summary comes from `description`, and a `project.json` is
always generated.

## Developing this plugin

From the workspace root:

```sh
nx build @wuguishifu/nx-expo-native-modules      # bundle to dist/ via esbuild
nx typecheck @wuguishifu/nx-expo-native-modules
nx lint @wuguishifu/nx-expo-native-modules
```

`generators.json` points at the **built** output in `dist/`, so rebuild after
changing anything under `src/` before running the generator locally.

Templates live in `src/generators/native-module/files/`. They are
[EJS](https://ejs.co) templates; Nx strips the trailing `.template` from
filenames and substitutes `__variable__` segments in paths. Shared version
constants for the dependencies the generator adds come from `@root/utils`,
which is bundled into `dist/` at build time rather than shipped as a runtime
dependency.

## Releasing

Releases run through `nx release` from the workspace root — see the
[root README](../../README.md#releasing).

## License

MIT
