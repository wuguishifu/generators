import { z } from 'zod';

export const stackGeneratorSchema = z.object({
  name: z.string().min(1),
  project: z.string().min(1),
  skipFormat: z.boolean().default(false),
});

export type StackGeneratorSchema = z.input<typeof stackGeneratorSchema>;
