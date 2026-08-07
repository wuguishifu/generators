import { generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { ConvexAppGeneratorSchema } from '../schema';

export function generateProjectFiles(
  tree: Tree,
  options: ConvexAppGeneratorSchema,
) {
  const replacements = {
    appName: options.appName,
    libName: options.contractLibName,
    appDirectory: options.appDirectory,
    libDirectory: options.contractLibDirectory,
    importPath: options.importPath,
    enableAiFiles: options.enableAiFiles.toString(),
  };

  generateAppFiles(tree, options, replacements);
  generateLibFiles(tree, options, replacements);

  if (options.deferConvexSetup) {
    generateGeneratedFiles(tree, options);
  }
}

function generateAppFiles(
  tree: Tree,
  options: ConvexAppGeneratorSchema,
  replacements: Record<string, string>,
) {
  generateFiles(
    tree,
    path.join(__dirname, '..', 'files', 'app'),
    options.appDirectory,
    replacements,
  );
}

function generateLibFiles(
  tree: Tree,
  options: ConvexAppGeneratorSchema,
  replacements: Record<string, string>,
) {
  generateFiles(
    tree,
    path.join(__dirname, '..', 'files', 'lib'),
    options.contractLibDirectory,
    replacements,
  );
}

function generateGeneratedFiles(tree: Tree, options: ConvexAppGeneratorSchema) {
  generateFiles(
    tree,
    path.join(__dirname, '..', 'files', 'generated'),
    path.join(options.appDirectory, 'convex'),
    {},
  );
}
