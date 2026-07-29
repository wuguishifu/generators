import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import * as path from 'path';
import type { NativeModuleGeneratorSchema } from './schema';
import { addProjectDependencies } from './utils/add-project-deps';
import { initRootBabelConfig } from './utils/init-root-babel-config';

export default async function nativeModuleGenerator(
  tree: Tree,
  options: NativeModuleGeneratorSchema,
) {
  const projectRoot = options.directory;
  const name = options.name ?? path.basename(options.directory);
  console.log({ projectRoot, name });

  addProjectDependencies(tree, options);

  initRootBabelConfig(tree);

  generateFiles(tree, path.join(__dirname, 'files/src'), projectRoot, {});

  await formatFiles(tree);
}
