import React from 'react';

import { FormatLineSpacingOutlined, RoundedCornerOutlined, SpaceBarOutlined } from '@mui/icons-material';

import { TStyle } from '../../../../../../documents/blocks/helpers/TStyle';
import { NullableColorInput } from '../inputs/ColorInput';
import { NullableFontFamily } from '../inputs/FontFamily';
import FontSizeInput from '../inputs/FontSizeInput';
import FontWeightInput from '../inputs/FontWeightInput';
import PaddingInput from '../inputs/PaddingInput';
import SliderInput from '../inputs/SliderInput';
import TextAlignInput from '../inputs/TextAlignInput';

type StylePropertyPanelProps = {
  name: keyof TStyle;
  value: TStyle;
  onChange: (style: TStyle) => void;
};
export default function SingleStylePropertyPanel({ name, value, onChange }: StylePropertyPanelProps) {
  const defaultValue = value[name] ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (v: any) => {
    onChange({ ...value, [name]: v });
  };

  switch (name) {
    case 'backgroundColor':
      return <NullableColorInput label="Background color" defaultValue={defaultValue} onChange={handleChange} />;
    case 'borderColor':
      return <NullableColorInput label="Border color" defaultValue={defaultValue} onChange={handleChange} />;
    case 'borderRadius':
      return (
        <SliderInput
          iconLabel={<RoundedCornerOutlined />}
          units="px"
          step={4}
          marks
          min={0}
          max={48}
          label="Border radius"
          defaultValue={defaultValue}
          onChange={handleChange}
        />
      );
    case 'color':
      return <NullableColorInput label="Text color" defaultValue={defaultValue} onChange={handleChange} />;
    case 'linkColor':
      return <NullableColorInput label="Link color" defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontFamily':
      return <NullableFontFamily label="Font family" defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontSize':
      return <FontSizeInput label="Font size" defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontWeight':
      return <FontWeightInput label="Font weight" defaultValue={defaultValue} onChange={handleChange} />;
    case 'letterSpacing':
      return (
        <SliderInput
          iconLabel={<SpaceBarOutlined />}
          units="px"
          step={0.1}
          min={-2}
          max={8}
          label="Letter spacing"
          defaultValue={defaultValue ?? 0}
          onChange={handleChange}
        />
      );
    case 'lineHeight':
      return (
        <SliderInput
          iconLabel={<FormatLineSpacingOutlined />}
          units="px"
          step={1}
          min={10}
          max={60}
          label="Line height"
          defaultValue={defaultValue ?? 20}
          onChange={handleChange}
        />
      );
    case 'textAlign':
      return <TextAlignInput label="Alignment" defaultValue={defaultValue} onChange={handleChange} />;
    case 'padding':
      return <PaddingInput label="Padding" defaultValue={defaultValue} onChange={handleChange} />;
  }
}
