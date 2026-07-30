import { Tree } from '@nx/devkit';

export function getJsonFile(tree: Tree, filePath: string) {
  const tsconfig = tree.read(filePath, 'utf-8');
  if (!tsconfig) throw new Error(`\`${filePath}\` not found`);
  return JSON.parse(tsconfig);
}
