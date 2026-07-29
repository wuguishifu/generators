import { addDependenciesToPackageJson, Tree } from '@nx/devkit';
import {
  expoCliVersion,
  expoModulesCoreVersion,
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
          'expo-modules-core': expoModulesCoreVersion,
        },
        {
          '@nx/react': nxVersion,
          '@nx/expo': nxVersion,
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
