import * as path from 'path';
import { z } from 'zod';

// Stage names become CDK construct ids and CloudFormation stack name prefixes,
// so they must be valid in both: letters, digits, and hyphens, starting with a
// letter.
const stageName = z
  .string()
  .regex(
    /^[A-Za-z][A-Za-z0-9-]*$/,
    'Stage names may only contain letters, digits, and hyphens, and must start with a letter.',
  );

export const cdkAppGeneratorSchema = z
  .object({
    directory: z.string(),
    name: z.string().optional(),
    stages: z
      .array(stageName)
      .min(1)
      .default(['staging', 'production'])
      .refine((stages) => new Set(stages).size === stages.length, {
        message: 'Stage names must be unique.',
      }),
    region: z.string().default('us-east-1'),
    exampleStack: z.string().default('example'),
  })
  .transform((data) => ({
    ...data,
    name: data.name ?? path.basename(data.directory),
  }));

export type CdkAppGeneratorSchema = z.infer<typeof cdkAppGeneratorSchema>;
