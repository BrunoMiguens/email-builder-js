import React from 'react';

import { AddOutlined, ArrowBackOutlined, FolderOpenOutlined, RefreshOutlined, WidgetsOutlined } from '@mui/icons-material';
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';

import { useSamplesDrawerOpen } from '../../documents/editor/EditorContext';
import { useFileSystem } from '../TemplatePanel/FileSystem/FileSystemContext';

import SidebarButton from './SidebarButton';
import logo from './waypoint.svg';

export const SAMPLES_DRAWER_WIDTH = 240;

export default function SamplesDrawer() {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  const {
    folderName,
    files,
    activeFileName,
    saveStatus,
    openFolder,
    selectFile,
    createFile,
    refreshFiles,
    blockFiles,
    activeBlockFileName,
    blockSaveStatus,
    editingMode,
    selectBlock,
    createBlock,
    refreshBlockFiles,
    switchToTemplateMode,
  } = useFileSystem();

  const renderFileList = () => (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={0.75}>
        <Tooltip title={`Folder: ${folderName} — click to change`}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}
            onClick={openFolder}
          >
            {folderName}
          </Typography>
        </Tooltip>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {saveStatus === 'saving' && <CircularProgress size={10} />}
          {saveStatus === 'saved' && (
            <Typography variant="caption" color="text.secondary">
              Saved
            </Typography>
          )}
          {saveStatus === 'unsaved' && (
            <Typography variant="caption" color="warning.main">
              Unsaved
            </Typography>
          )}
          <Tooltip title="New file">
            <IconButton size="small" onClick={createFile}>
              <AddOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={refreshFiles}>
              <RefreshOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack alignItems="flex-start" sx={{ '& .MuiButtonBase-root': { width: '100%', justifyContent: 'flex-start' } }}>
        {files.length === 0 ? (
          <Typography variant="body2" color="text.secondary" px={0.75}>
            No JSON files in folder.
          </Typography>
        ) : (
          files.map((f) => (
            <Button
              key={f}
              size="small"
              onClick={() => selectFile(f)}
              sx={{ fontWeight: f === activeFileName && editingMode === 'template' ? 'bold' : 'normal' }}
            >
              {f.replace(/\.json$/, '')}
            </Button>
          ))
        )}
      </Stack>
    </Stack>
  );

  const renderBlockList = () => (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={0.75}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold">
          Custom Blocks
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {blockSaveStatus === 'saving' && <CircularProgress size={10} />}
          {blockSaveStatus === 'saved' && (
            <Typography variant="caption" color="text.secondary">
              Saved
            </Typography>
          )}
          {blockSaveStatus === 'unsaved' && (
            <Typography variant="caption" color="warning.main">
              Unsaved
            </Typography>
          )}
          <Tooltip title="New block">
            <IconButton size="small" onClick={createBlock}>
              <AddOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh blocks">
            <IconButton size="small" onClick={refreshBlockFiles}>
              <RefreshOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack alignItems="flex-start" sx={{ '& .MuiButtonBase-root': { width: '100%', justifyContent: 'flex-start' } }}>
        {blockFiles.length === 0 ? (
          <Typography variant="body2" color="text.secondary" px={0.75}>
            No custom blocks yet.
          </Typography>
        ) : (
          blockFiles.map((f) => (
            <Button
              key={f}
              size="small"
              onClick={() => selectBlock(f)}
              startIcon={<WidgetsOutlined sx={{ fontSize: 14 }} />}
              sx={{ fontWeight: f === activeBlockFileName && editingMode === 'block' ? 'bold' : 'normal' }}
            >
              {f.replace(/\.json$/, '')}
            </Button>
          ))
        )}
      </Stack>

      {editingMode === 'block' && (
        <Button size="small" startIcon={<ArrowBackOutlined />} onClick={switchToTemplateMode} sx={{ mt: 0.5 }}>
          Back to templates
        </Button>
      )}
    </Stack>
  );

  const renderBuiltInSamples = () => (
    <Stack spacing={1} alignItems="flex-start" sx={{ '& .MuiButtonBase-root': { width: '100%', justifyContent: 'flex-start' } }}>
      <Button size="small" startIcon={<FolderOpenOutlined />} onClick={openFolder}>
        Open folder…
      </Button>
      <Divider flexItem />
      <SidebarButton href="#">Empty</SidebarButton>
      <SidebarButton href="#sample/welcome">Welcome email</SidebarButton>
      <SidebarButton href="#sample/one-time-password">One-time passcode (OTP)</SidebarButton>
      <SidebarButton href="#sample/reset-password">Reset password</SidebarButton>
      <SidebarButton href="#sample/order-ecomerce">E-commerce receipt</SidebarButton>
      <SidebarButton href="#sample/subscription-receipt">Subscription receipt</SidebarButton>
      <SidebarButton href="#sample/reservation-reminder">Reservation reminder</SidebarButton>
      <SidebarButton href="#sample/post-metrics-report">Post metrics</SidebarButton>
      <SidebarButton href="#sample/respond-to-message">Respond to inquiry</SidebarButton>
    </Stack>
  );

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={samplesDrawerOpen}
      sx={{
        width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0,
      }}
    >
      <Stack spacing={3} py={1} px={2} width={SAMPLES_DRAWER_WIDTH} justifyContent="space-between" height="100%">
        <Stack spacing={2}>
          <Typography variant="h6" component="h1" sx={{ p: 0.75 }}>
            EmailBuilder.js
          </Typography>

          {folderName !== null ? (
            <>
              {renderFileList()}
              <Divider />
              {renderBlockList()}
            </>
          ) : (
            renderBuiltInSamples()
          )}

          <Divider />

          <Stack>
            <Button size="small" href="https://www.usewaypoint.com/open-source/emailbuilderjs" target="_blank">
              Learn more
            </Button>
            <Button size="small" href="https://github.com/usewaypoint/email-builder-js" target="_blank">
              View on GitHub
            </Button>
          </Stack>
        </Stack>
        <Stack spacing={2} px={0.75} py={3}>
          <Link href="https://usewaypoint.com?utm_source=emailbuilderjs" target="_blank" sx={{ lineHeight: 1 }}>
            <Box component="img" src={logo} width={32} />
          </Link>
          <Box>
            <Typography variant="overline" gutterBottom>
              Looking to send emails?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Waypoint is an end-to-end email API with a &apos;pro&apos; version of this template builder with dynamic
              variables, loops, conditionals, drag and drop, layouts, and more.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ justifyContent: 'center' }}
            href="https://usewaypoint.com?utm_source=emailbuilderjs"
            target="_blank"
          >
            Learn more
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
