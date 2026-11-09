// Generators are loaded by Nx through generators.json. They aren't re-exported
// here because bundling them into dist/index.js would break the template paths
// they resolve from `__dirname`.
export type { CdkAppGeneratorSchema } from './generators/cdk-app/options';
export type { StackGeneratorSchema } from './generators/stack/options';
