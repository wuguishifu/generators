import { addDependenciesToPackageJson, Tree } from '@nx/devkit';
import {
  expoCliVersion,
  expoVersion,
  metroVersion,
  nxVersion,
  reactDomVersion,
  reactNativeVersion,
  reactVersion,
  typesNodeVersion,
} from '@root/utils';
import { NativeModuleGeneratorSchema } from '../schema';

export function addProjectDependencies(
  tree: Tree,
  options: NativeModuleGeneratorSchema,
) {
  switch (options.bundler) {
    case 'tsc':
      return addDependenciesToPackageJson(
        tree,
        {
          react: reactVersion,
          'react-dom': reactDomVersion,
          'react-native': reactNativeVersion,
          expo: expoVersion,
        },
        {
          '@nx/react': nxVersion,
          '@nx/expo': expoVersion,
          '@types/node': typesNodeVersion,
          '@expo/cli': expoCliVersion,
          'metro-config': metroVersion,
          'metro-resolver': metroVersion,
        },
        undefined,
        true,
      );
    default:
      return addDependenciesToPackageJson(
        tree,
        {},
        {
          '@types/node': typesNodeVersion,
        },
        undefined,
        true,
      );
  }
}
