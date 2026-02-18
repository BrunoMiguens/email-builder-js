import { z } from 'zod';

const CustomBlockPropsSchema = z.object({
  props: z
    .object({
      blockName: z.string(),
    })
    .optional()
    .nullable(),
});

export type CustomBlockProps = z.infer<typeof CustomBlockPropsSchema>;
export default CustomBlockPropsSchema;
