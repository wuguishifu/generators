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
import {
  toAndroidNamespace,
  toClassName,
  toKebabCase,
  toNamespacePath,
} from './utils/naming';

export default async function nativeModuleGenerator(
  tree: Tree,
  options: NativeModuleGeneratorSchema,
) {
  const projectRoot = options.directory;
  const name = options.name ?? path.basename(options.directory);
  const androidNamespace = options.androidNamespace ?? 'com.example';

  const tasks: GeneratorCallback[] = [];

  tasks.push(addProjectDependencies(tree, options));

  initRootBabelConfig(tree);

  const kebabName = toKebabCase(name);
  const className = toClassName(name);

  const replacements = {
    kebabName,
    className,
    summary: options.summary,
    description: options.description,
    author: options.author,
    homepage: options.homepage,
    androidNamespace: toAndroidNamespace(androidNamespace, name),
    androidNamespacePath: toNamespacePath(androidNamespace, name),
  };

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, replacements);

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}
