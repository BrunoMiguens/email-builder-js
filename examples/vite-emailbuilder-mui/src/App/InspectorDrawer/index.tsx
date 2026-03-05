import React from 'react';

import { Box, Drawer, Tab, Tabs } from '@mui/material';

import { setSidebarTab, useInspectorDrawerOpen, useSelectedSidebarTab } from '../../documents/editor/EditorContext';
import { useFileSystem } from '../TemplatePanel/FileSystem/FileSystemContext';

import ConfigurationPanel from './ConfigurationPanel';
import SlotDefinitionsPanel from './SlotDefinitionsPanel';
import StylesPanel from './StylesPanel';

export const INSPECTOR_DRAWER_WIDTH = 320;

export default function InspectorDrawer() {
  const selectedSidebarTab = useSelectedSidebarTab();
  const inspectorDrawerOpen = useInspectorDrawerOpen();
  const { editingMode } = useFileSystem();

  const effectiveTab = selectedSidebarTab === 'slots' && editingMode !== 'block' ? 'styles' : selectedSidebarTab;

  const renderCurrentSidebarPanel = () => {
    switch (effectiveTab) {
      case 'block-configuration':
        return <ConfigurationPanel />;
      case 'slots':
        return <SlotDefinitionsPanel />;
      case 'styles':
        return <StylesPanel />;
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={inspectorDrawerOpen}
      sx={{
        width: inspectorDrawerOpen ? INSPECTOR_DRAWER_WIDTH : 0,
      }}
    >
      <Box sx={{ width: INSPECTOR_DRAWER_WIDTH, height: 49, borderBottom: 1, borderColor: 'divider' }}>
        <Box px={2}>
          <Tabs value={effectiveTab} onChange={(_, v) => setSidebarTab(v)}>
            <Tab value="styles" label="Styles" />
            <Tab value="block-configuration" label="Inspect" />
            {editingMode === 'block' && <Tab value="slots" label="Slots" />}
          </Tabs>
        </Box>
      </Box>
      <Box sx={{ width: INSPECTOR_DRAWER_WIDTH, height: 'calc(100% - 49px)', overflow: 'auto' }}>
        {renderCurrentSidebarPanel()}
      </Box>
    </Drawer>
  );
}
