import React from 'react';

import { WidgetsOutlined } from '@mui/icons-material';
import { Box, Divider, Menu, Typography } from '@mui/material';

import { TEditorBlock } from '../../../../editor/core';

import BlockButton from './BlockButton';
import { BUTTONS } from './buttons';
import { useCustomBlocksStore } from './useCustomBlocks';

type BlocksMenuProps = {
  anchorEl: HTMLElement | null;
  setAnchorEl: (v: HTMLElement | null) => void;
  onSelect: (block: TEditorBlock) => void;
};
export default function BlocksMenu({ anchorEl, setAnchorEl, onSelect }: BlocksMenuProps) {
  const { customBlocks } = useCustomBlocksStore();

  const onClose = () => {
    setAnchorEl(null);
  };

  const onClick = (block: TEditorBlock) => {
    onSelect(block);
    setAnchorEl(null);
  };

  if (anchorEl === null) {
    return null;
  }

  return (
    <Menu
      open
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        {BUTTONS.map((k, i) => (
          <BlockButton key={i} label={k.label} icon={k.icon} onClick={() => onClick(k.block())} />
        ))}
      </Box>
      {customBlocks.length > 0 && (
        <>
          <Divider />
          <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block' }} color="text.secondary">
            Custom Blocks
          </Typography>
          <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
            {customBlocks.map((cb) => (
              <BlockButton
                key={cb.name}
                label={cb.name.replace(/\.json$/, '')}
                icon={<WidgetsOutlined />}
                onClick={() =>
                  onClick({
                    type: 'CustomBlock',
                    data: { props: { blockName: cb.name } },
                  })
                }
              />
            ))}
          </Box>
        </>
      )}
    </Menu>
  );
}
