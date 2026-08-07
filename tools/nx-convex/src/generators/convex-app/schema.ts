import * as path from 'path';
import z from 'zod';

export const convexAppGeneratorSchema = z
  .object({
    appDirectory: z.string(),
    appName: z.string().optional(),
    contractLibDirectory: z.string(),
    contractLibName: z.string().optional(),
    importPath: z.string().optional(),
    enableAiFiles: z.boolean().default(false),
    deferConvexSetup: z.boolean().default(false),
  })
  .transform((data) => {
    const appName = data.appName ?? path.basename(data.appDirectory);
    const contractLibName =
      data.contractLibName ?? path.basename(data.contractLibDirectory);
    const importPath = data.importPath ?? contractLibName;
    return { ...data, appName, contractLibName, importPath };
  });

export type ConvexAppGeneratorSchema = z.infer<typeof convexAppGeneratorSchema>;
