import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  offsetFromRoot,
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
  const projectName = path.basename(projectRoot);
  const name = options.name ?? projectName;
  const androidNamespace = options.androidNamespace ?? 'com.example';

  const tasks: GeneratorCallback[] = [];

  tasks.push(addProjectDependencies(tree, options));

  initRootBabelConfig(tree);

  const kebabName = toKebabCase(name);
  const className = toClassName(name);

  const replacements = {
    projectRoot,
    projectName,
    kebabName,
    className,
    summary: options.summary,
    description: options.description,
    author: options.author,
    homepage: options.homepage,
    androidNamespace: toAndroidNamespace(androidNamespace, name),
    androidNamespacePath: toNamespacePath(androidNamespace, name),
    offsetFromRoot: offsetFromRoot(projectRoot),
    buildable: options.bundler && options.bundler !== 'none',
    emitDeclarationOnly: options.bundler === 'tsc' ? false : true,
  };

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, replacements);

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}
