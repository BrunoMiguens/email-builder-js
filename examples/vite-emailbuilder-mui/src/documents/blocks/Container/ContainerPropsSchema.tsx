import * as z from 'zod/v4';

import { ContainerPropsSchema as BaseContainerPropsSchema } from '@push-labs/block-container';

const ContainerPropsSchema = z.object({
  style: BaseContainerPropsSchema._zod.def.shape.style,
  props: z
    .object({
      childrenIds: z.array(z.string()).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export default ContainerPropsSchema;

export type ContainerProps = z.infer<typeof ContainerPropsSchema>;
