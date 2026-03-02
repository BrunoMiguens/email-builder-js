import React, { useMemo } from 'react';

import { AddOutlined, DeleteOutline, EditOutlined } from '@mui/icons-material';
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

import { CustomBlockProps } from '../../../../documents/blocks/CustomBlock/CustomBlockPropsSchema';
import {
  SlotDefinition,
  TableItem,
  useCustomBlocksStore,
} from '../../../../documents/blocks/helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';
import { useFileSystem } from '../../../TemplatePanel/FileSystem/FileSystemContext';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import TextInput from './helpers/inputs/TextInput';

type CustomBlockSidebarPanelProps = {
  data: CustomBlockProps;
  setData: (v: CustomBlockProps) => void;
};

export default function CustomBlockSidebarPanel({ data, setData }: CustomBlockSidebarPanelProps) {
  const { customBlocks } = useCustomBlocksStore();
  const { selectBlock } = useFileSystem();
  const blockName = data.props?.blockName ?? '';
  const slotValues = (data.props?.slotValues ?? {}) as Record<string, unknown>;

  const entry = useMemo(() => customBlocks.find((cb) => cb.name === blockName), [customBlocks, blockName]);
  const slots = entry?.slots ?? {};
  const slotEntries = Object.entries(slots);

  const updateSlotValue = (key: string, value: unknown) => {
    const newSlotValues = { ...slotValues, [key]: value };
    setData({ props: { blockName, slotValues: newSlotValues } });
  };

  return (
    <BaseSidebarPanel title="Custom block">
      <FormControl fullWidth size="small">
        <InputLabel>Block</InputLabel>
        <Select
          value={blockName}
          label="Block"
          onChange={(e) => {
            setData({ props: { blockName: e.target.value } });
          }}
        >
          {customBlocks.map((cb) => (
            <MenuItem key={cb.name} value={cb.name}>
              {cb.name.replace(/\.json$/, '')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {blockName && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditOutlined />}
          onClick={() => selectBlock(blockName)}
        >
          Edit block
        </Button>
      )}

      {slotEntries.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Slot values
          </Typography>
          {slotEntries.map(([key, def]) => (
            <SlotFieldInput
              key={key}
              slotKey={key}
              definition={def}
              value={slotValues[key]}
              onChange={(v) => updateSlotValue(key, v)}
            />
          ))}
        </>
      )}
    </BaseSidebarPanel>
  );
}

type SlotFieldInputProps = {
  slotKey: string;
  definition: SlotDefinition;
  value: unknown;
  onChange: (v: unknown) => void;
};

function SlotFieldInput({ slotKey, definition, value, onChange }: SlotFieldInputProps) {
  const effectiveValue = value ?? definition.defaultValue;

  switch (definition.type) {
    case 'text':
      return (
        <TextInput
          label={definition.label}
          defaultValue={String(effectiveValue)}
          onChange={(v) => onChange(v)}
        />
      );
    case 'html':
      return (
        <TextInput
          label={definition.label}
          rows={5}
          defaultValue={String(effectiveValue)}
          onChange={(v) => onChange(v)}
        />
      );
    case 'color':
      return (
        <TextInput
          label={definition.label}
          placeholder="#000000"
          defaultValue={String(effectiveValue)}
          onChange={(v) => onChange(v)}
        />
      );
    case 'number':
      return (
        <TextInput
          label={definition.label}
          defaultValue={String(effectiveValue)}
          onChange={(v) => {
            const n = parseFloat(v);
            onChange(isNaN(n) ? v : n);
          }}
        />
      );
    case 'table': {
      const items: TableItem[] = Array.isArray(effectiveValue)
        ? (effectiveValue as TableItem[])
        : (definition.defaultValue as TableItem[]) ?? [];
      return <TableItemsInput label={definition.label} items={items} onChange={onChange} />;
    }
    default:
      return (
        <TextInput
          label={`${definition.label} (${slotKey})`}
          defaultValue={String(effectiveValue)}
          onChange={(v) => onChange(v)}
        />
      );
  }
}

type TableItemsInputProps = {
  label: string;
  items: TableItem[];
  onChange: (items: TableItem[]) => void;
};

function TableItemsInput({ label, items, onChange }: TableItemsInputProps) {
  const addRow = () => onChange([...items, { label: '', value: '' }]);
  const removeRow = (index: number) => onChange(items.filter((_, i) => i !== index));
  const updateRow = (index: number, field: 'label' | 'value', val: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      {items.map((item, i) => (
        <Stack key={i} direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
          <TextField
            size="small"
            variant="standard"
            value={item.label}
            onChange={(e) => updateRow(i, 'label', e.target.value)}
            placeholder="Label"
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            variant="standard"
            value={item.value}
            onChange={(e) => updateRow(i, 'value', e.target.value)}
            placeholder="Value"
            sx={{ flex: 1 }}
          />
          <IconButton size="small" onClick={() => removeRow(i)}>
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button size="small" startIcon={<AddOutlined />} onClick={addRow}>
        Add row
      </Button>
    </Box>
  );
}
