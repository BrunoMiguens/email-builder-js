import * as z from 'zod/v4';

import { ColumnsContainerPropsSchema as BaseColumnsContainerPropsSchema } from '@push-labs/block-columns-container';

const BasePropsShape = BaseColumnsContainerPropsSchema.shape.props.unwrap().unwrap().shape;

const ColumnsContainerPropsSchema = z.object({
  style: BaseColumnsContainerPropsSchema.shape.style,
  props: z
    .object({
      ...BasePropsShape,
      columns: z
        .array(z.object({ childrenIds: z.array(z.string()) }))
        .min(2)
        .max(6),
    })
    .optional()
    .nullable(),
});

export default ColumnsContainerPropsSchema;
export type ColumnsContainerProps = z.infer<typeof ColumnsContainerPropsSchema>;
