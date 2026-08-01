import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  offsetFromRoot,
  runTasksInSerial,
  type Tree,
} from '@nx/devkit';
import {
  getJsonFile,
  initRootBabelConfig,
  toClassName,
  toCxxNamespace,
  toKebabCase,
  versions,
} from '@root/utils';
import * as path from 'path';
import type { NitroModuleGeneratorSchema } from './schema';
import { addProjectDependencies } from './utils/add-project-deps';

export default async function nitroModuleGenerator(
  tree: Tree,
  options: NitroModuleGeneratorSchema,
) {
  const projectRoot = options.directory;
  const projectName = path.basename(projectRoot);
  const name = options.name ?? projectName;

  const tasks: GeneratorCallback[] = [];
  tasks.push(addProjectDependencies(tree, options));

  initRootBabelConfig(tree);

  const kebabName = toKebabCase(name);
  const className = toClassName(name);
  const cxxName = toCxxNamespace(name);

  // Nitrogen expects autolinked Kotlin implementations (and its own generated
  // code) to live under `com.margelo.nitro.<ns>`; only the Gradle namespace
  // (AAR manifest package/BuildConfig) is user-configurable.
  const nitroNamespaces = [cxxName];
  const androidNamespace = (
    options.androidNamespace ?? `com.wuguishifu.${cxxName}`
  ).toLowerCase();

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
    cxxName,
    importPath: options.importPath ?? name,
    summary: options.summary ?? 'A summary',
    description: options.description ?? 'A description',
    author: options.author ?? 'unknown',
    homepage: options.homepage ?? 'https://github.com/wuguishifu/generators',
    androidNamespace,
    nitroPackage: ['com', 'margelo', 'nitro', ...nitroNamespaces].join('.'),
    androidNamespacePath: [
      'java',
      'com',
      'margelo',
      'nitro',
      ...nitroNamespaces,
    ].join('/'),
    androidNamespaceJson: JSON.stringify(nitroNamespaces),
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
