import React, { useState } from 'react';
import { ZodError } from 'zod';

import { MonitorOutlined, PhoneIphoneOutlined, RoundedCornerOutlined, WidthNormalOutlined } from '@mui/icons-material';

import EmailLayoutPropsSchema, {
  EmailLayoutProps,
} from '../../../../documents/blocks/EmailLayout/EmailLayoutPropsSchema';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import ColorInput, { NullableColorInput } from './helpers/inputs/ColorInput';
import { NullableFontFamily } from './helpers/inputs/FontFamily';
import SliderInput from './helpers/inputs/SliderInput';

type EmailLayoutSidebarFieldsProps = {
  data: EmailLayoutProps;
  setData: (v: EmailLayoutProps) => void;
};
export default function EmailLayoutSidebarFields({ data, setData }: EmailLayoutSidebarFieldsProps) {
  const [, setErrors] = useState<ZodError | null>(null);

  const updateData = (d: unknown) => {
    const res = EmailLayoutPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title="Global">
      <ColorInput
        label="Backdrop color"
        defaultValue={data.backdropColor ?? '#F5F5F5'}
        onChange={(backdropColor) => updateData({ ...data, backdropColor })}
      />
      <ColorInput
        label="Canvas color"
        defaultValue={data.canvasColor ?? '#FFFFFF'}
        onChange={(canvasColor) => updateData({ ...data, canvasColor })}
      />
      <NullableColorInput
        label="Canvas border color"
        defaultValue={data.borderColor ?? null}
        onChange={(borderColor) => updateData({ ...data, borderColor })}
      />
      <SliderInput
        iconLabel={<RoundedCornerOutlined />}
        units="px"
        step={4}
        marks
        min={0}
        max={48}
        label="Canvas border radius"
        defaultValue={data.borderRadius ?? 0}
        onChange={(borderRadius) => updateData({ ...data, borderRadius })}
      />
      <SliderInput
        iconLabel={<WidthNormalOutlined />}
        units="px"
        step={10}
        min={240}
        max={800}
        label="Canvas max width"
        defaultValue={data.maxWidth ?? 600}
        onChange={(maxWidth) => updateData({ ...data, maxWidth })}
      />
      <NullableFontFamily
        label="Font family"
        defaultValue="MODERN_SANS"
        onChange={(fontFamily) => updateData({ ...data, fontFamily })}
      />
      <ColorInput
        label="Text color"
        defaultValue={data.textColor ?? '#262626'}
        onChange={(textColor) => updateData({ ...data, textColor })}
      />
      <SliderInput
        iconLabel={<MonitorOutlined />}
        units="px"
        step={4}
        marks
        min={0}
        max={128}
        label="Desktop vertical padding"
        defaultValue={data.paddingVertical ?? 0}
        onChange={(paddingVertical) => updateData({ ...data, paddingVertical })}
      />
      <SliderInput
        iconLabel={<PhoneIphoneOutlined />}
        units="px"
        step={4}
        marks
        min={0}
        max={128}
        label="Mobile vertical padding"
        defaultValue={data.mobilePaddingVertical ?? 0}
        onChange={(mobilePaddingVertical) => updateData({ ...data, mobilePaddingVertical })}
      />
    </BaseSidebarPanel>
  );
}
