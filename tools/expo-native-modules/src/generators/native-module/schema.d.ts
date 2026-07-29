export interface NativeModuleGeneratorSchema {
  directory: string;
  name?: string;
  bundler: 'tsc' | 'none';
  importPath?: string;
  useProjectJson: boolean;

  // ios module properties
  summary?: string;
  description?: string;
  author?: string;
  homepage: string;

  // android module properties
  androidNamespace?: string;
}
