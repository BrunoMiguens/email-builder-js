import React, { useMemo } from 'react';

import { Reader } from '@push-labs/email-builder';
import { MonitorOutlined, PhoneIphoneOutlined } from '@mui/icons-material';
import { Box, Stack, SxProps, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

import resolveCustomBlocks from '../../documents/blocks/CustomBlock/resolveCustomBlocks';
import { useCustomBlocksStore } from '../../documents/blocks/helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';
import EditorBlock from '../../documents/editor/EditorBlock';
import {
  setSelectedScreenSize,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
} from '../../documents/editor/EditorContext';
import ToggleInspectorPanelButton from '../InspectorDrawer/ToggleInspectorPanelButton';
import ToggleSamplesPanelButton from '../SamplesDrawer/ToggleSamplesPanelButton';

import DownloadJson from './DownloadJson';
import HtmlPanel from './HtmlPanel';
import ImportJson from './ImportJson';
import JsonPanel from './JsonPanel';
import MainTabsGroup from './MainTabsGroup';
import ShareButton from './ShareButton';

export default function TemplatePanel() {
  const document = useDocument();
  const customBlocks = useCustomBlocksStore((s) => s.customBlocks);
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const resolvedDocument = useMemo(() => {
    const doc = resolveCustomBlocks(document, customBlocks);
    if (selectedScreenSize !== 'mobile') {
      return doc;
    }
    const rootBlock = doc['root'];
    if (!rootBlock || rootBlock.type !== 'EmailLayout') {
      return doc;
    }
    const data = rootBlock.data as Record<string, unknown>;
    return {
      ...doc,
      root: {
        ...rootBlock,
        data: {
          ...data,
          paddingVertical: data.mobilePaddingVertical ?? data.paddingVertical,
          paddingHorizontal: data.mobilePaddingHorizontal ?? data.paddingHorizontal,
        },
      },
    };
  }, [document, customBlocks, selectedScreenSize]);

  let mainBoxSx: SxProps = {
    minHeight: '100%',
  };
  if (selectedScreenSize === 'mobile') {
    mainBoxSx = {
      ...mainBoxSx,
      margin: '32px auto',
      width: 370,
      height: 800,
      boxShadow:
        'rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px',
    };
  }

  const handleScreenSizeChange = (_: unknown, value: unknown) => {
    switch (value) {
      case 'mobile':
      case 'desktop':
        setSelectedScreenSize(value);
        return;
      default:
        setSelectedScreenSize('desktop');
    }
  };

  const renderMainPanel = () => {
    switch (selectedMainTab) {
      case 'editor':
        return (
          <>
            <Box sx={mainBoxSx}>
              <EditorBlock id="root" />
            </Box>
            <div style={{ height: 64, flexShrink: 0 }} />
          </>
        );
      case 'preview':
        return (
          <>
            <Box sx={mainBoxSx}>
              <Reader document={resolvedDocument as never} rootBlockId="root" />
            </Box>
            <div style={{ height: 64, flexShrink: 0 }} />
          </>
        );
      case 'html':
        return <HtmlPanel />;
      case 'json':
        return <JsonPanel />;
    }
  };

  return (
    <>
      <Stack
        sx={{
          height: 49,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          px: 1,
        }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <ToggleSamplesPanelButton />
        <Stack px={2} direction="row" gap={2} width="100%" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <MainTabsGroup />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <DownloadJson />
            <ImportJson />
            <ToggleButtonGroup value={selectedScreenSize} exclusive size="small" onChange={handleScreenSizeChange}>
              <ToggleButton value="desktop">
                <Tooltip title="Desktop view">
                  <MonitorOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Mobile view">
                  <PhoneIphoneOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <ShareButton />
          </Stack>
        </Stack>
        <ToggleInspectorPanelButton />
      </Stack>
      <Box sx={{ height: 'calc(100vh - 49px)', overflow: 'auto', minWidth: 370 }}>{renderMainPanel()}</Box>
    </>
  );
}
