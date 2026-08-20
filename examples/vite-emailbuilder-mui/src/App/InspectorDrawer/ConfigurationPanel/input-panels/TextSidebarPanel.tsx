import React, { useState } from 'react';
import { ZodError } from 'zod';

import { TextProps, TextPropsSchema } from '@push-labs/block-text';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import containsPlaceholders from './helpers/containsPlaceholders';
import BooleanInput from './helpers/inputs/BooleanInput';
import TextInput from './helpers/inputs/TextInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type TextSidebarPanelProps = {
  data: TextProps;
  setData: (v: TextProps) => void;
};
export default function TextSidebarPanel({ data, setData }: TextSidebarPanelProps) {
  const [, setErrors] = useState<ZodError | null>(null);

  const updateData = (d: unknown) => {
    if (containsPlaceholders(d)) {
      setData(d as TextProps);
      setErrors(null);
      return;
    }
    const res = TextPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title="Text block">
      <TextInput
        label="Content"
        rows={5}
        defaultValue={data.props?.text ?? ''}
        onChange={(text) => updateData({ ...data, props: { ...data.props, text } })}
      />
      <BooleanInput
        label="Markdown (GitHub flavored)"
        defaultValue={data.props?.markdown ?? false}
        onChange={(markdown) => updateData({ ...data, props: { ...data.props, markdown } })}
      />

      <MultiStylePropertyPanel
        names={[
          'color',
          'linkColor',
          'backgroundColor',
          'fontFamily',
          'fontSize',
          'fontWeight',
          'letterSpacing',
          'lineHeight',
          'textAlign',
          'padding',
        ]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
