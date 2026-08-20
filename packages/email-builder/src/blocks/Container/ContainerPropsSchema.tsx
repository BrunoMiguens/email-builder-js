import { z } from 'zod/v4';

import { ContainerPropsSchema as BaseContainerPropsSchema } from '@push-labs/block-container';

export const ContainerPropsSchema = z.object({
  style: BaseContainerPropsSchema.shape.style,
  props: z
    .object({
      childrenIds: z.array(z.string()).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type ContainerProps = z.infer<typeof ContainerPropsSchema>;
