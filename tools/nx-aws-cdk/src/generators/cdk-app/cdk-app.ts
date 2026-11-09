import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  type GeneratorCallback,
  joinPathFragments,
  logger,
  offsetFromRoot,
  runTasksInSerial,
  type TargetConfiguration,
  type Tree,
  updateJson,
  writeJson,
} from '@nx/devkit';
import {
  awsCdkCliVersion,
  awsCdkLibVersion,
  constructsVersion,
  esbuildVersion,
  tsxVersion,
  typesAwsLambdaVersion,
  typesNodeVersion,
} from '@root/utils';
import { readFileSync } from 'fs';
import * as path from 'path';
import { stackGenerator } from '../stack/stack';
import { isProductionStage, readCustomCondition } from '../../utils/workspace';
import { cdkAppGeneratorSchema, type CdkAppGeneratorSchema } from './options';

export async function cdkAppGenerator(tree: Tree, unsafeOptions: unknown) {
  const options = cdkAppGeneratorSchema.parse(unsafeOptions);
  const projectRoot = options.directory;

  if (tree.exists(projectRoot) && tree.children(projectRoot).length > 0) {
    throw new Error(
      `Cannot create a CDK app in ${projectRoot}: the directory is not empty.`,
    );
  }

  const customCondition = readCustomCondition(tree);

  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    projectType: 'application',
    tags: [],
    targets: createTargets(projectRoot, options.stages),
  });

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    projectName: options.name,
    offsetFromRoot: offsetFromRoot(projectRoot),
    stages: options.stages.map((name) => ({
      name,
      isProduction: isProductionStage(name),
    })),
    region: options.region,
    customCondition,
  });

  if (!tree.exists('eslint.config.mjs')) {
    tree.delete(joinPathFragments(projectRoot, 'eslint.config.mjs'));
  }

  writeJson(tree, joinPathFragments(projectRoot, 'cdk.json'), {
    // tsx runs the app straight from source. It does not typecheck, which is
    // why the synth/diff/deploy targets depend on `typecheck`.
    app: customCondition
      ? `npx tsx --conditions=${customCondition} src/main.ts`
      : 'npx tsx src/main.ts',
    context: readRecommendedFeatureFlags(),
  });

  addTsConfigReference(tree, projectRoot);

  if (options.exampleStack) {
    await stackGenerator(tree, {
      name: options.exampleStack,
      project: options.name,
      skipFormat: true,
    });
  }

  await formatFiles(tree);

  const tasks: GeneratorCallback[] = [
    addDependenciesToPackageJson(
      tree,
      {
        'aws-cdk-lib': awsCdkLibVersion,
        constructs: constructsVersion,
      },
      {
        'aws-cdk': awsCdkCliVersion,
        tsx: tsxVersion,
        esbuild: esbuildVersion,
        '@types/aws-lambda': typesAwsLambdaVersion,
        '@types/node': typesNodeVersion,
      },
      undefined,
      true,
    ),
    () => logNextSteps(options),
  ];

  return runTasksInSerial(...tasks);
}

function createTargets(
  projectRoot: string,
  stages: string[],
): Record<string, TargetConfiguration> {
  const cwd = projectRoot;
  const [defaultStage] = stages;

  // A target with one configuration per stage, defaulting to the first stage.
  const perStage = (
    command: (stage: string) => string,
  ): TargetConfiguration => ({
    executor: 'nx:run-commands',
    dependsOn: ['typecheck'],
    defaultConfiguration: defaultStage,
    options: { cwd, command: command(defaultStage) },
    configurations: Object.fromEntries(
      stages.map((stage) => [stage, { command: command(stage) }]),
    ),
  });

  return {
    cdk: {
      executor: 'nx:run-commands',
      options: { cwd, command: 'cdk', forwardAllArgs: true },
    },
    synth: {
      executor: 'nx:run-commands',
      dependsOn: ['typecheck'],
      options: { cwd, command: 'cdk synth' },
    },
    diff: perStage((stage) => `cdk diff '${stage}/*'`),
    // Production deploys keep the CLI's default approval prompt for changes
    // that broaden IAM permissions or security groups.
    deploy: perStage((stage) =>
      isProductionStage(stage)
        ? `cdk deploy '${stage}/*'`
        : `cdk deploy '${stage}/*' --require-approval=never`,
    ),
    bootstrap: {
      executor: 'nx:run-commands',
      options: { cwd, command: 'cdk bootstrap', forwardAllArgs: true },
    },
  };
}

// A snapshot of `aws-cdk-lib/recommended-feature-flags.json` for the version in
// `awsCdkLibVersion`. It is what `cdk init` writes into cdk.json.
function readRecommendedFeatureFlags(): Record<string, unknown> {
  return JSON.parse(
    readFileSync(
      path.join(__dirname, 'recommended-feature-flags.json'),
      'utf-8',
    ),
  );
}

function addTsConfigReference(tree: Tree, projectRoot: string) {
  if (!tree.exists('tsconfig.json')) return;
  updateJson(tree, 'tsconfig.json', (json) => {
    const references: { path: string }[] = json.references ?? [];
    const referencePath = `./${projectRoot}`;
    if (!references.some(({ path }) => path === referencePath)) {
      references.push({ path: referencePath });
    }
    return { ...json, references };
  });
}

function logNextSteps(options: CdkAppGeneratorSchema) {
  logger.info(
    [
      '',
      `Next steps for ${options.name}:`,
      `  1. Set the AWS account ID for each stage in ${options.directory}/src/config.ts.`,
      `  2. Bootstrap each account/region once: nx bootstrap ${options.name} -- --profile <profile>`,
      `  3. Deploy: nx deploy ${options.name} -- --profile <profile>`,
      '',
    ].join('\n'),
  );
}

export default cdkAppGenerator;
