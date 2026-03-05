import React, { useState } from 'react';

import { InputLabel, MenuItem, Select, Stack } from '@mui/material';

const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
];

const FONT_WEIGHT_TO_NUMERIC: Record<string, string> = {
  normal: '400',
  bold: '700',
};

function normalizeValue(value: string): string {
  return FONT_WEIGHT_TO_NUMERIC[value] ?? value;
}

type Props = {
  label: string;
  defaultValue: string;
  onChange: (value: string) => void;
};
export default function FontWeightInput({ label, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(normalizeValue(defaultValue));
  return (
    <Stack alignItems="flex-start">
      <InputLabel shrink>{label}</InputLabel>
      <Select
        fullWidth
        size="small"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          onChange(v);
        }}
      >
        {FONT_WEIGHT_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
