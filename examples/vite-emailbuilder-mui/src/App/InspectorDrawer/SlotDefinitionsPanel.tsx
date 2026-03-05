import React from 'react';

import { AddOutlined, DeleteOutline } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { SlotDefinition } from '../../documents/blocks/helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';
import { useFileSystem } from '../TemplatePanel/FileSystem/FileSystemContext';

const SLOT_TYPES: SlotDefinition['type'][] = ['text', 'html', 'color', 'number', 'table'];

export default function SlotDefinitionsPanel() {
  const { activeBlockSlots, setActiveBlockSlots, editingMode } = useFileSystem();

  if (editingMode !== 'block') {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          Slot definitions are only available when editing a block.
        </Typography>
      </Box>
    );
  }

  const slots = (activeBlockSlots ?? {}) as Record<string, SlotDefinition>;
  const entries = Object.entries(slots);

  const updateSlots = (updated: Record<string, SlotDefinition>) => {
    setActiveBlockSlots(Object.keys(updated).length > 0 ? updated : null);
  };

  const addSlot = () => {
    const name = window.prompt('Slot name (e.g. "title"):');
    if (!name || name.trim() === '') {
      return;
    }
    const key = name.trim();
    if (slots[key]) {
      alert(`Slot "${key}" already exists.`);
      return;
    }
    updateSlots({ ...slots, [key]: { label: key, type: 'text', defaultValue: '' } });
  };

  const removeSlot = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...rest } = slots;
    updateSlots(rest);
  };

  const updateSlotField = (key: string, field: keyof SlotDefinition, value: unknown) => {
    const current = slots[key];
    if (!current) {
      return;
    }

    if (field === 'type') {
      const newType = value as SlotDefinition['type'];
      let defaultValue: SlotDefinition['defaultValue'] = '';
      if (newType === 'number') {
        defaultValue = 0;
      }
      if (newType === 'table') {
        defaultValue = [];
      }
      updateSlots({ ...slots, [key]: { ...current, type: newType, defaultValue } });
    } else {
      updateSlots({ ...slots, [key]: { ...current, [field]: value } });
    }
  };

  const renameSlot = (oldKey: string) => {
    const newKey = window.prompt('New slot name:', oldKey);
    if (!newKey || newKey.trim() === '' || newKey.trim() === oldKey) {
      return;
    }
    const trimmed = newKey.trim();
    if (slots[trimmed]) {
      alert(`Slot "${trimmed}" already exists.`);
      return;
    }
    const rebuilt: Record<string, SlotDefinition> = {};
    for (const [k, v] of Object.entries(slots)) {
      rebuilt[k === oldKey ? trimmed : k] = k === oldKey ? { ...v, label: v.label === oldKey ? trimmed : v.label } : v;
    }
    updateSlots(rebuilt);
  };

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Slot definitions
        </Typography>
        <Button size="small" startIcon={<AddOutlined />} onClick={addSlot}>
          Add
        </Button>
      </Stack>

      {entries.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No slots defined. Add a slot to make parts of this block configurable when used in templates.
        </Typography>
      )}

      <Stack spacing={2}>
        {entries.map(([key, def]) => (
          <Box key={key} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => renameSlot(key)}
              >
                {key}
              </Typography>
              <IconButton size="small" onClick={() => removeSlot(key)} color="error">
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Label"
                value={def.label}
                onChange={(e) => updateSlotField(key, 'label', e.target.value)}
                fullWidth
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={def.type} label="Type" onChange={(e) => updateSlotField(key, 'type', e.target.value)}>
                  {SLOT_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DefaultValueInput definition={def} onChange={(v) => updateSlotField(key, 'defaultValue', v)} />
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Use <code>{`{{${key}}}`}</code> in the block to reference this slot.
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

type DefaultValueInputProps = {
  definition: SlotDefinition;
  onChange: (value: SlotDefinition['defaultValue']) => void;
};

function DefaultValueInput({ definition, onChange }: DefaultValueInputProps) {
  switch (definition.type) {
    case 'number':
      return (
        <TextField
          size="small"
          label="Default value"
          type="number"
          value={definition.defaultValue}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onChange(isNaN(n) ? 0 : n);
          }}
          fullWidth
        />
      );
    case 'table':
      return (
        <Typography variant="caption" color="text.secondary">
          Table defaults are configured when the block is used in a template.
        </Typography>
      );
    default:
      return (
        <TextField
          size="small"
          label="Default value"
          value={String(definition.defaultValue ?? '')}
          onChange={(e) => onChange(e.target.value)}
          multiline={definition.type === 'html'}
          rows={definition.type === 'html' ? 3 : 1}
          fullWidth
        />
      );
  }
}
