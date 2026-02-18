import React from 'react';

import { AddOutlined, FolderOpenOutlined, RefreshOutlined } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, MenuItem, Select, SelectChangeEvent, Tooltip, Typography } from '@mui/material';

import { useFileSystem } from './FileSystemContext';

export default function FileSystemFolder() {
  const { folderName, files, activeFileName, saveStatus, openFolder, refreshFiles, selectFile, createFile } =
    useFileSystem();

  const handleSelectChange = (ev: SelectChangeEvent) => {
    selectFile(ev.target.value);
  };

  let statusEl = null;
  if (saveStatus === 'saving') {
    statusEl = <CircularProgress size={12} />;
  } else if (saveStatus === 'saved') {
    statusEl = (
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        Saved
      </Typography>
    );
  } else if (saveStatus === 'unsaved') {
    statusEl = (
      <Typography variant="caption" color="warning.main" sx={{ whiteSpace: 'nowrap' }}>
        Unsaved
      </Typography>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Tooltip title={folderName ? `Folder: ${folderName} — click to change` : 'Open folder'}>
        <IconButton size="small" onClick={openFolder}>
          <FolderOpenOutlined fontSize="small" />
        </IconButton>
      </Tooltip>

      {folderName !== null && (
        <>
          <Select
            size="small"
            displayEmpty
            value={activeFileName}
            onChange={handleSelectChange}
            sx={{ fontSize: 12, minWidth: 140, height: 32 }}
            renderValue={(v) => v || (files.length === 0 ? 'No JSON files' : 'Select file…')}
          >
            {files.map((f) => (
              <MenuItem key={f} value={f} sx={{ fontSize: 12 }}>
                {f}
              </MenuItem>
            ))}
          </Select>

          <Tooltip title="New file">
            <IconButton size="small" onClick={createFile}>
              <AddOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh file list">
            <IconButton size="small" onClick={refreshFiles}>
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}

      {statusEl}
    </Box>
  );
}
