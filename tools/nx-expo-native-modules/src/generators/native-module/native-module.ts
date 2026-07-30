import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  offsetFromRoot,
  runTasksInSerial,
  type Tree,
} from '@nx/devkit';
import { versions } from '@root/utils';
import * as path from 'path';
import type { NativeModuleGeneratorSchema } from './schema';
import { addProjectDependencies } from './utils/add-project-deps';
import { getJsonFile } from './utils/file-parser';
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

  const baseTsConfig = getJsonFile(tree, 'tsconfig.base.json');
  const customCondition = baseTsConfig.compilerOptions?.customConditions?.[0];

  const rootTsConfig = getJsonFile(tree, 'tsconfig.json');
  const references: { path: string }[] = rootTsConfig.references ?? [];
  if (!references.some(({ path }) => path === projectRoot)) {
    references.push({ path: `./${projectRoot}` });
  }
  tree.write(
    'tsconfig.json',
    JSON.stringify({ ...rootTsConfig, references }, null, 2),
  );

  const replacements = {
    projectRoot,
    projectName,
    kebabName,
    className,
    importPath: options.importPath ?? name,
    summary: options.summary ?? 'A summary',
    description: options.description ?? 'A description',
    author: options.author,
    homepage: options.homepage ?? 'https://github.com/wuguishifu/generators',
    androidNamespace: toAndroidNamespace(androidNamespace, name),
    androidNamespacePath: toNamespacePath(androidNamespace, name),
    offsetFromRoot: offsetFromRoot(projectRoot),
    buildable: options.bundler && options.bundler !== 'none',
    emitDeclarationOnly: options.bundler === 'tsc' ? false : true,
    customCondition,
    ...versions,
  };

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, replacements);

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}
