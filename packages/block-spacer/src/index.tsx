import React, { CSSProperties } from 'react';
import * as z from 'zod/v4';

export const SpacerPropsSchema = z.object({
  props: z
    .object({
      height: z.number().gte(0).optional().nullish(),
    })
    .optional()
    .nullable(),
});

export type SpacerProps = z.infer<typeof SpacerPropsSchema>;

export const SpacerPropsDefaults = {
  height: 16,
};

export function Spacer({ props }: SpacerProps) {
  const style: CSSProperties = {
    height: props?.height ?? SpacerPropsDefaults.height,
  };
  return <div style={style} />;
}
