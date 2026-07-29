import { join } from 'path';

export const nxVersion = require(join('@nx/js', 'package.json')).version;
export const typesNodeVersion = '^22.0.0';

// expo
export const expoVersion = '~56.0.0';
export const expoCliVersion = '~56.1.14'; // @expo/cli
export const babelPresetExpoVersion = '~56.0.14';
export const expoMetroVersion = '~56.0.0'; // @expo/metro (SDK 55+ Metro)
export const metroConfigVersion = '~56.0.13'; // @expo/metro-config
export const metroRuntimeVersion = '~56.0.14';
export const reactVersion = '^19.2.0';
export const reactDomVersion = '^19.2.0';
export const typesReactVersion = '^19.2.0';
export const reactNativeVersion = '0.85.3';
export const metroVersion = '~0.84.3';
