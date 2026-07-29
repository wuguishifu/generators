import { formatFiles, type Tree } from '@nx/devkit';
import * as path from 'path';
import type { NativeModuleGeneratorSchema } from './schema';
import { addProjectDependencies } from './utils/add-project-deps';

export default async function nativeModuleGenerator(
  tree: Tree,
  options: NativeModuleGeneratorSchema,
) {
  const projectRoot = options.directory;
  const name = options.name ?? path.basename(options.directory);
  console.log({ projectRoot, name });

  addProjectDependencies(tree, options);

  await formatFiles(tree);
}
