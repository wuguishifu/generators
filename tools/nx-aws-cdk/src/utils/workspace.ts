import { readJson, type Tree } from '@nx/devkit';

/**
 * The first `customConditions` entry in tsconfig.base.json, if any. Nx TS
 * solution workspaces use it to point workspace packages at their source, so
 * the CDK app (via tsx) and Lambda bundles (via esbuild) need it to import
 * other workspace libraries without building them first.
 */
export function readCustomCondition(tree: Tree): string | undefined {
  if (!tree.exists('tsconfig.base.json')) return undefined;
  const baseTsConfig = readJson(tree, 'tsconfig.base.json');
  return baseTsConfig.compilerOptions?.customConditions?.[0];
}

export function isProductionStage(stage: string): boolean {
  return /^prod(uction)?$/i.test(stage);
}
