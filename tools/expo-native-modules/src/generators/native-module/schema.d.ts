export interface NativeModuleGeneratorSchema {
  directory: string;
  name?: string;
  bundler: 'tsc' | 'none';
  importPath?: string;
  useProjectJson: boolean;
}
