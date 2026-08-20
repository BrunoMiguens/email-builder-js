import * as z from 'zod/v4';
import { BaseZodDictionary, BlockConfiguration, DocumentBlocksDictionary } from '../utils';

export default function buildBlockConfigurationSchema<T extends BaseZodDictionary>(
  blocks: DocumentBlocksDictionary<T>
) {
  // Use Extract<keyof T, string> to filter out symbol and number types
  const blockObjects = Object.keys(blocks).map((type) => { 
    return z.object({
      type: z.literal(type), 
      data: blocks[type].schema,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return z.discriminatedUnion('type', blockObjects as any).transform((v) => v as BlockConfiguration<T>);
}