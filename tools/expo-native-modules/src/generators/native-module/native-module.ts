import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  type Tree,
} from '@nx/devkit';
import * as path from 'path';
import type { NativeModuleGeneratorSchema } from './schema';

export default async function nativeModuleGenerator(
  tree: Tree,
  options: NativeModuleGeneratorSchema,
) {
  const projectRoot = options.directory;
  const name = options.name ?? path.basename(options.directory);
  addProjectConfiguration(tree, name, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}
