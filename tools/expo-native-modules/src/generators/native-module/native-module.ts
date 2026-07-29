import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  runTasksInSerial,
  type Tree,
} from '@nx/devkit';
import * as path from 'path';
import type { NativeModuleGeneratorSchema } from './schema';
import { addProjectDependencies } from './utils/add-project-deps';
import { initRootBabelConfig } from './utils/init-root-babel-config';
import { toClassName, toKebabCase } from './utils/naming';

export default async function nativeModuleGenerator(
  tree: Tree,
  options: NativeModuleGeneratorSchema,
) {
  const projectRoot = options.directory;
  const name = options.name ?? path.basename(options.directory);
  console.log({ projectRoot, name });

  const tasks: GeneratorCallback[] = [];

  tasks.push(addProjectDependencies(tree, options));

  initRootBabelConfig(tree);

  const kebabName = toKebabCase(name);
  const className = toClassName(name);

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    kebabName,
    className,
  });

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}
