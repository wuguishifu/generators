import { addDependenciesToPackageJson, Tree } from '@nx/devkit';
import {
  nitrogenVersion,
  reactNativeVersion,
  reactVersion,
  rnNitroModulesVersion,
  tsLibVersion,
  typesNodeVersion,
} from '@root/utils';
import { NitroModuleGeneratorSchema } from '../schema';

export function addProjectDependencies(
  tree: Tree,
  options: NitroModuleGeneratorSchema,
) {
  const dependencies: Record<string, string> = {
    react: reactVersion,
    'react-native': reactNativeVersion,
    'react-native-nitro-modules': rnNitroModulesVersion,
  };

  const devDependencies: Record<string, string> = {
    nitrogen: nitrogenVersion,
    '@types/node': typesNodeVersion,
  };

  if (options.bundler === 'tsc') {
    devDependencies.tslib = tsLibVersion;
  }

  return addDependenciesToPackageJson(
    tree,
    dependencies,
    devDependencies,
    undefined,
    true,
  );
}
