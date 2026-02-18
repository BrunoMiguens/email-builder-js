import React from 'react';

import { EditOutlined } from '@mui/icons-material';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { CustomBlockProps } from '../../../../documents/blocks/CustomBlock/CustomBlockPropsSchema';
import { useCustomBlocksStore } from '../../../../documents/blocks/helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';
import { useFileSystem } from '../../../TemplatePanel/FileSystem/FileSystemContext';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';

type CustomBlockSidebarPanelProps = {
  data: CustomBlockProps;
  setData: (v: CustomBlockProps) => void;
};

export default function CustomBlockSidebarPanel({ data, setData }: CustomBlockSidebarPanelProps) {
  const { customBlocks } = useCustomBlocksStore();
  const { selectBlock } = useFileSystem();
  const blockName = data.props?.blockName ?? '';

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
    </BaseSidebarPanel>
  );
}
