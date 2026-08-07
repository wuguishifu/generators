import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  runTasksInSerial,
  type Tree,
} from '@nx/devkit';
import { execFileSync } from 'child_process';
import { convexAppGeneratorSchema } from './schema.js';
import { generateProjectFiles } from './util/generate-files';

export async function convexAppGenerator(tree: Tree, unsafeOptions: unknown) {
  const options = convexAppGeneratorSchema.parse(unsafeOptions);

  const tasks: GeneratorCallback[] = [];
  tasks.push(
    addDependenciesToPackageJson(
      tree,
      { convex: '^1.0.0' },
      {},
      undefined,
      true,
    ),
  );

  generateProjectFiles(tree, options);

  await formatFiles(tree);

  const postInstallTasks: (() => void)[] = [
    () => {
      execFileSync('pnpm', ['nx', 'sync'], {
        stdio: 'inherit',
      });
    },
    () => {
      execFileSync('pnpm', ['nx', 'build', options.appName], {
        cwd: options.appDirectory,
        stdio: 'inherit',
      });
    },
    () => {
      execFileSync(process.execPath, ['scripts/build.mjs'], {
        cwd: options.contractLibDirectory,
        stdio: 'inherit',
      });
    },
  ];

  if (!options.deferConvexSetup) {
    postInstallTasks.unshift(() => {
      execFileSync('pnpm', ['nx', 'convex', options.appName, 'dev', '--once'], {
        cwd: options.appDirectory,
        stdio: 'inherit',
      });
    });
  }

  return runTasksInSerial(...tasks, ...postInstallTasks);
}

export default convexAppGenerator;
