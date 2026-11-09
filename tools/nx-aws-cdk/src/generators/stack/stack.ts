import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  readProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import * as path from 'path';
import { stackGeneratorSchema } from './options';
import { registerStack } from './utils/register-stack';

export async function stackGenerator(tree: Tree, unsafeOptions: unknown) {
  const options = stackGeneratorSchema.parse(unsafeOptions);
  const project = readProjectConfiguration(tree, options.project);

  // `users`, `users-stack`, and `UsersStack` all generate `UsersStack`.
  const baseName = options.name.replace(/[-_ ]?stack$/i, '') || options.name;
  const { className, fileName } = names(baseName);

  const stacksDir = joinPathFragments(project.root, 'src', 'stacks');
  const stackDir = joinPathFragments(stacksDir, fileName);
  if (tree.exists(stackDir)) {
    throw new Error(`Cannot create ${className}Stack: ${stackDir} exists.`);
  }

  // Resolved relative to this generator's folder rather than `__dirname`
  // directly, because the cdk-app generator bundles this code into its own
  // output folder.
  generateFiles(tree, path.join(__dirname, '..', 'stack', 'files'), stacksDir, {
    className,
    fileName,
  });

  registerStack(tree, project.root, className, fileName);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default stackGenerator;
