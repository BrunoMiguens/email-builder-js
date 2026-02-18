import React, { Component, useMemo } from 'react';

import { WidgetsOutlined } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { Reader } from '@usewaypoint/email-builder';

import { useCustomBlocksStore } from '../helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';

import { CustomBlockProps } from './CustomBlockPropsSchema';

// Error boundary to prevent the Reader from crashing the entire page
class ReaderErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function CustomBlockEditor({ props }: CustomBlockProps) {
  const blockName = props?.blockName;
  const customBlocks = useCustomBlocksStore((s) => s.customBlocks);

  const entry = useMemo(() => customBlocks.find((b) => b.name === blockName), [customBlocks, blockName]);

  const virtualDoc = useMemo(() => {
    if (!entry) return null;
    const config = entry.config;
    const root = config.root;
    if (!root?.data) return null;
    const childrenIds: string[] = (root.data as Record<string, unknown>)?.childrenIds as string[] ?? [];
    if (childrenIds.length === 0) return null;

    // Verify all referenced children exist
    for (const id of childrenIds) {
      if (!config[id]) return null;
    }

    // Build a virtual document with a Container as root instead of EmailLayout
    const doc: Record<string, unknown> = {};
    for (const [id, block] of Object.entries(config)) {
      if (id === 'root') continue;
      doc[id] = block;
    }
    doc['__custom_block_root'] = {
      type: 'Container',
      data: {
        style: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
        props: { childrenIds },
      },
    };
    return doc;
  }, [entry]);

  if (!blockName) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
        <Typography color="text.secondary">No custom block selected</Typography>
      </Box>
    );
  }

  if (!entry) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
        <Typography color="text.secondary">
          Custom block &quot;{blockName.replace(/\.json$/, '')}&quot; not found
        </Typography>
      </Box>
    );
  }

  const blockLabel = blockName.replace(/\.json$/, '');

  const renderFallback = () => (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <WidgetsOutlined sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
      <Typography variant="body2" color="text.secondary">
        {blockLabel}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ px: 1, py: 0.25, backgroundColor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <WidgetsOutlined sx={{ fontSize: 12, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {blockLabel}
        </Typography>
      </Stack>
      <Box sx={{ pointerEvents: 'none' }}>
        {virtualDoc ? (
          <ReaderErrorBoundary fallback={renderFallback()}>
            <Reader document={virtualDoc as never} rootBlockId="__custom_block_root" />
          </ReaderErrorBoundary>
        ) : (
          renderFallback()
        )}
      </Box>
    </Box>
  );
}
