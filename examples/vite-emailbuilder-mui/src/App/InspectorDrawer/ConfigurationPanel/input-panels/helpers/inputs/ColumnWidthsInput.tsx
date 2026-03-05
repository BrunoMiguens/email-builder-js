import React, { useState } from 'react';

import { Stack } from '@mui/material';

import TextDimensionInput from './TextDimensionInput';

type TWidthValue = number | null | undefined;
type FixedWidths = TWidthValue[];
type ColumnsLayoutInputProps = {
  columnsCount: number;
  defaultValue: FixedWidths | null | undefined;
  onChange: (v: FixedWidths | null | undefined) => void;
};
export default function ColumnWidthsInput({ columnsCount, defaultValue, onChange }: ColumnsLayoutInputProps) {
  const [currentValue, setCurrentValue] = useState<TWidthValue[]>(() => {
    if (defaultValue) {
      return defaultValue;
    }
    return Array.from({ length: columnsCount }, () => null);
  });

  const setIndexValue = (index: number, value: number | null | undefined) => {
    const nValue = [...currentValue];
    // Pad if needed
    while (nValue.length < columnsCount) {
      nValue.push(null);
    }
    nValue[index] = value;
    setCurrentValue(nValue);
    onChange(nValue);
  };

  return (
    <Stack direction="row" spacing={1}>
      {Array.from({ length: columnsCount }, (_, i) => (
        <TextDimensionInput
          key={i}
          label={`Column ${i + 1}`}
          defaultValue={currentValue?.[i]}
          onChange={(v) => {
            setIndexValue(i, v);
          }}
        />
      ))}
    </Stack>
  );
}
