import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import {
  CustomBlockEntry,
  useCustomBlocksStore,
} from '../../../documents/blocks/helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';
import { TEditorConfiguration } from '../../../documents/editor/core';
import { resetDocument, useDocument } from '../../../documents/editor/EditorContext';
import EMPTY_BLOCK from '../../../getConfiguration/sample/empty-block';
import EMPTY_EMAIL_MESSAGE from '../../../getConfiguration/sample/empty-email-message';
import validateJsonStringValue from '../ImportJson/validateJsonStringValue';

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

// File System Access API types (Chrome/Edge only).
export type DirHandle = {
  name: string;
  values(): AsyncIterableIterator<{ kind: string; name: string }>;
  getFileHandle(name: string, opts?: { create?: boolean }): Promise<FileHandle>;
  getDirectoryHandle(name: string, opts?: { create?: boolean }): Promise<DirHandle>;
  queryPermission(opts: { mode: string }): Promise<PermissionState>;
  requestPermission(opts: { mode: string }): Promise<PermissionState>;
};
type FileHandle = {
  getFile(): Promise<File>;
  createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void> }>;
};

// --- IndexedDB persistence ---

const DB_NAME = 'email-builder-fs';
const STORE = 'handles';
const KEY = 'directory';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHandle(handle: DirHandle): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(handle, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadHandle(): Promise<DirHandle | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve((req.result as DirHandle) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function clearHandle(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Helpers ---

async function verifyPermission(handle: DirHandle): Promise<boolean> {
  let state = await handle.queryPermission({ mode: 'readwrite' });
  if (state === 'granted') return true;
  state = await handle.requestPermission({ mode: 'readwrite' });
  return state === 'granted';
}

export async function listJsonFiles(dir: DirHandle, prefix = '', skipFolders: string[] = []): Promise<string[]> {
  const names: string[] = [];
  const iter = dir.values();
  let result = await iter.next();
  while (!result.done) {
    const entry = result.value;
    if (entry.kind === 'file' && entry.name.endsWith('.json')) {
      names.push(prefix + entry.name);
    } else if (entry.kind === 'directory' && !skipFolders.includes(entry.name)) {
      const subDir = await dir.getDirectoryHandle(entry.name);
      const subFiles = await listJsonFiles(subDir, `${prefix}${entry.name}/`, skipFolders);
      names.push(...subFiles);
    }
    result = await iter.next();
  }
  names.sort();
  return names;
}

async function getFileHandleByPath(dir: DirHandle, path: string): Promise<FileHandle> {
  const parts = path.split('/');
  let currentDir: DirHandle = dir;
  for (let i = 0; i < parts.length - 1; i++) {
    currentDir = await currentDir.getDirectoryHandle(parts[i]);
  }
  return currentDir.getFileHandle(parts[parts.length - 1]);
}

/**
 * Parse a block JSON string, extracting __slots__ metadata and returning
 * the clean config (without __slots__) plus the slots definition.
 */
function parseBlockJson(text: string): { config: Record<string, unknown>; slots: CustomBlockEntry['slots'] } | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || !parsed.root) return null;
    const slots = (parsed.__slots__ ?? {}) as CustomBlockEntry['slots'];
    const config = { ...parsed };
    delete config.__slots__;
    return { config, slots };
  } catch {
    return null;
  }
}

/**
 * Build the save payload for a block file. If the block had __slots__,
 * they are re-injected at the top of the JSON.
 */
function buildBlockSavePayload(doc: unknown, slots: Record<string, unknown> | null): string {
  if (slots && Object.keys(slots).length > 0) {
    const obj = doc as Record<string, unknown>;
    return JSON.stringify({ __slots__: slots, ...obj }, null, 2);
  }
  return JSON.stringify(doc, null, 2);
}

/**
 * Filter a list of JSON file paths, keeping only those that parse as valid JSON
 * with a "root" property (i.e. valid email builder configs or blocks).
 */
async function filterParsableFiles(dir: DirHandle, paths: string[]): Promise<string[]> {
  const parsable: string[] = [];
  for (const path of paths) {
    try {
      const fileHandle = await getFileHandleByPath(dir, path);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.root) {
        parsable.push(path);
      }
    } catch {
      // skip unparsable files
    }
  }
  return parsable;
}

async function loadAllBlockFiles(dir: DirHandle): Promise<CustomBlockEntry[]> {
  const files = await listJsonFiles(dir);
  const entries: CustomBlockEntry[] = [];
  for (const name of files) {
    try {
      const fileHandle = await dir.getFileHandle(name);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const result = parseBlockJson(text);
      if (result) {
        entries.push({ name, config: structuredClone(result.config) as TEditorConfiguration, slots: result.slots });
      }
    } catch {
      // skip invalid files
    }
  }
  return entries;
}

// --- Context ---

export type EditingMode = 'template' | 'block';

type FileSystemContextValue = {
  folderName: string | null;
  files: string[];
  activeFileName: string;
  saveStatus: SaveStatus | null;
  openFolder(): void;
  refreshFiles(): void;
  selectFile(name: string): void;
  createFile(): void;

  // Custom blocks
  blockFiles: string[];
  activeBlockFileName: string;
  blockSaveStatus: SaveStatus | null;
  editingMode: EditingMode;
  selectBlock(name: string): void;
  createBlock(): void;
  refreshBlockFiles(): void;
  switchToTemplateMode(): void;
};

const FileSystemContext = createContext<FileSystemContextValue | null>(null);

export function useFileSystem() {
  const ctx = useContext(FileSystemContext);
  if (!ctx) throw new Error('useFileSystem must be used inside FileSystemProvider');
  return ctx;
}

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const document = useDocument();

  // --- Template state ---
  const [folderName, setFolderName] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);

  const dirHandleRef = useRef<DirHandle | null>(null);
  const activeFileHandleRef = useRef<FileHandle | null>(null);
  const lastLoadedDocRef = useRef<unknown>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Custom blocks state ---
  const [blockFiles, setBlockFiles] = useState<string[]>([]);
  const [activeBlockFileName, setActiveBlockFileName] = useState<string>('');
  const [blockSaveStatus, setBlockSaveStatus] = useState<SaveStatus | null>(null);
  const [editingMode, setEditingMode] = useState<EditingMode>('template');

  const blocksDirHandleRef = useRef<DirHandle | null>(null);
  const activeBlockFileHandleRef = useRef<FileHandle | null>(null);
  const lastLoadedBlockDocRef = useRef<unknown>(null);
  const blockSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeBlockSlotsRef = useRef<Record<string, unknown> | null>(null);

  // Preserve template state when switching to block editing
  const savedTemplateDocRef = useRef<TEditorConfiguration | null>(null);
  const savedTemplateFileHandleRef = useRef<FileHandle | null>(null);
  const savedTemplateFileNameRef = useRef<string>('');
  const savedTemplateSaveStatusRef = useRef<SaveStatus | null>(null);

  // Ref for editingMode used by the auto-save effect. IMPORTANT: do NOT sync
  // this from React state on every render — zustand updates (resetDocument) can
  // trigger a re-render before the React useState commit, which would overwrite
  // the ref with the OLD mode. Instead, set the ref explicitly in every
  // mode-switching function BEFORE calling resetDocument.
  const editingModeRef = useRef<EditingMode>('template');

  // --- Flush pending saves before mode switches ---
  // When switching modes, the auto-save effect cleanup cancels the pending timer.
  // These functions flush any unsaved changes immediately before the switch.

  const flushPendingBlockSave = async () => {
    if (!blockSaveTimerRef.current) return;
    clearTimeout(blockSaveTimerRef.current);
    blockSaveTimerRef.current = null;

    const fileHandle = activeBlockFileHandleRef.current;
    if (!fileHandle || document === lastLoadedBlockDocRef.current) return;

    try {
      const writable = await fileHandle.createWritable();
      await writable.write(buildBlockSavePayload(document, activeBlockSlotsRef.current));
      await writable.close();
      lastLoadedBlockDocRef.current = document;

      // Update the custom blocks store so linked previews reflect changes
      const store = useCustomBlocksStore.getState();
      const blockName = activeBlockFileName;
      const updated = store.customBlocks.map((cb) =>
        cb.name === blockName ? { ...cb, config: structuredClone(document) as TEditorConfiguration } : cb
      );
      store.setCustomBlocks(updated);
      setBlockSaveStatus('saved');
    } catch {
      setBlockSaveStatus('unsaved');
    }
  };

  const flushPendingTemplateSave = async () => {
    if (!saveTimerRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;

    const fileHandle = activeFileHandleRef.current;
    if (!fileHandle || document === lastLoadedDocRef.current) return;

    try {
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(document, null, 2));
      await writable.close();
      lastLoadedDocRef.current = document;
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unsaved');
    }
  };

  // --- Initialize blocks subfolder ---
  const initBlocksDir = async (parentDir: DirHandle) => {
    try {
      const blocksDir = await parentDir.getDirectoryHandle('blocks', { create: true });
      blocksDirHandleRef.current = blocksDir;
      const allJsonFiles = await listJsonFiles(blocksDir);
      const jsonFiles = await filterParsableFiles(blocksDir, allJsonFiles);
      setBlockFiles(jsonFiles);

      // Load all block contents into the store
      const entries = await loadAllBlockFiles(blocksDir);
      useCustomBlocksStore.getState().setCustomBlocks(entries);
    } catch {
      // blocks subdirectory may not be supported
    }
  };

  // On mount: restore previously selected folder from IndexedDB.
  useEffect(() => {
    if (!('showDirectoryPicker' in window)) return;
    loadHandle()
      .then(async (handle) => {
        if (!handle) return;
        const granted = await verifyPermission(handle);
        if (!granted) {
          await clearHandle();
          return;
        }
        dirHandleRef.current = handle;
        const allJsonFiles = await listJsonFiles(handle, '', ['blocks']);
        const jsonFiles = await filterParsableFiles(handle, allJsonFiles);
        setFolderName(handle.name);
        setFiles(jsonFiles);

        // Also initialize blocks subfolder
        await initBlocksDir(handle);
      })
      .catch(() => {});
  }, []);

  // Auto-save when document changes, routing to the correct file handle.
  useEffect(() => {
    const isBlockMode = editingModeRef.current === 'block';
    const fileHandle = isBlockMode ? activeBlockFileHandleRef.current : activeFileHandleRef.current;
    const lastDoc = isBlockMode ? lastLoadedBlockDocRef.current : lastLoadedDocRef.current;
    const setStatus = isBlockMode ? setBlockSaveStatus : setSaveStatus;
    const timerRef = isBlockMode ? blockSaveTimerRef : saveTimerRef;

    if (!fileHandle || document === lastDoc) {
      return;
    }

    setStatus('unsaved');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      // Safety: if the mode changed since this timer was created, skip the save.
      // The new effect run (with the correct mode) will handle it.
      const currentIsBlockMode = editingModeRef.current === 'block';
      if (currentIsBlockMode !== isBlockMode) return;

      setStatus('saving');
      try {
        const writable = await fileHandle.createWritable();
        const payload = isBlockMode
          ? buildBlockSavePayload(document, activeBlockSlotsRef.current)
          : JSON.stringify(document, null, 2);
        await writable.write(payload);
        await writable.close();

        if (isBlockMode) {
          lastLoadedBlockDocRef.current = document;

          // Update the custom blocks store so editor previews update in real time
          const store = useCustomBlocksStore.getState();
          const blockName = activeBlockFileName;
          const updated = store.customBlocks.map((cb) =>
            cb.name === blockName ? { ...cb, config: structuredClone(document) as TEditorConfiguration } : cb
          );
          store.setCustomBlocks(updated);
        } else {
          lastLoadedDocRef.current = document;
        }
        setStatus('saved');
      } catch {
        setStatus('unsaved');
      }
    }, 800);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [document, activeBlockFileName, editingMode]);

  // --- Template methods ---

  const openFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the File System Access API. Please use Chrome or Edge.');
      return;
    }
    try {
      await flushPendingBlockSave();
      await flushPendingTemplateSave();
      const handle = await (
        window as unknown as { showDirectoryPicker(o: object): Promise<DirHandle> }
      ).showDirectoryPicker({ mode: 'readwrite' });

      dirHandleRef.current = handle;
      await saveHandle(handle);

      const allJsonFiles = await listJsonFiles(handle, '', ['blocks']);
      const jsonFiles = await filterParsableFiles(handle, allJsonFiles);
      setFolderName(handle.name);
      setFiles(jsonFiles);
      setActiveFileName('');
      activeFileHandleRef.current = null;
      lastLoadedDocRef.current = null;
      setSaveStatus(null);

      // Reset block editing state
      editingModeRef.current = 'template';
      setEditingMode('template');
      setActiveBlockFileName('');
      activeBlockFileHandleRef.current = null;
      lastLoadedBlockDocRef.current = null;
      activeBlockSlotsRef.current = null;
      setBlockSaveStatus(null);

      // Initialize blocks subfolder
      await initBlocksDir(handle);
    } catch {
      // User cancelled the picker — do nothing.
    }
  };

  const refreshFiles = async () => {
    if (!dirHandleRef.current) return;
    const allJsonFiles = await listJsonFiles(dirHandleRef.current, '', ['blocks']);
    const jsonFiles = await filterParsableFiles(dirHandleRef.current, allJsonFiles);
    setFiles(jsonFiles);
  };

  const selectFile = async (name: string) => {
    if (!dirHandleRef.current) return;
    try {
      await flushPendingBlockSave();
      await flushPendingTemplateSave();
      const fileHandle = await getFileHandleByPath(dirHandleRef.current, name);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const { data, error } = validateJsonStringValue(text);
      if (error || !data) {
        alert(`Could not load "${name}": ${error}`);
        return;
      }
      activeFileHandleRef.current = fileHandle;
      lastLoadedDocRef.current = data;
      setActiveFileName(name);
      setSaveStatus('saved');

      // Clear block editing state to prevent stale handles
      activeBlockFileHandleRef.current = null;
      lastLoadedBlockDocRef.current = null;
      activeBlockSlotsRef.current = null;
      setActiveBlockFileName('');
      setBlockSaveStatus(null);
      savedTemplateDocRef.current = null;
      savedTemplateFileHandleRef.current = null;
      savedTemplateFileNameRef.current = '';
      savedTemplateSaveStatusRef.current = null;

      editingModeRef.current = 'template'; // Set ref before resetDocument to prevent stale auto-save
      setEditingMode('template');
      resetDocument(data);
    } catch (e) {
      console.error('Failed to load file', e);
    }
  };

  const createFile = async () => {
    if (!dirHandleRef.current) return;
    await flushPendingBlockSave();
    await flushPendingTemplateSave();
    const raw = window.prompt('New file name:', 'untitled.json');
    if (!raw) return;
    const fileName = raw.endsWith('.json') ? raw : `${raw}.json`;
    try {
      const fileHandle = await dirHandleRef.current.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(EMPTY_EMAIL_MESSAGE, null, 2));
      await writable.close();

      activeFileHandleRef.current = fileHandle;
      lastLoadedDocRef.current = EMPTY_EMAIL_MESSAGE;
      setActiveFileName(fileName);
      setSaveStatus('saved');

      // Clear block editing state to prevent stale handles
      activeBlockFileHandleRef.current = null;
      lastLoadedBlockDocRef.current = null;
      activeBlockSlotsRef.current = null;
      setActiveBlockFileName('');
      setBlockSaveStatus(null);
      savedTemplateDocRef.current = null;
      savedTemplateFileHandleRef.current = null;
      savedTemplateFileNameRef.current = '';
      savedTemplateSaveStatusRef.current = null;

      editingModeRef.current = 'template'; // Set ref before resetDocument to prevent stale auto-save
      setEditingMode('template');
      setFiles((prev) => [...prev, fileName].sort());
      resetDocument(EMPTY_EMAIL_MESSAGE);
    } catch (e) {
      console.error('Failed to create file', e);
    }
  };

  // --- Custom block methods ---

  const refreshBlockFiles = async () => {
    if (!blocksDirHandleRef.current) return;
    const allJsonFiles = await listJsonFiles(blocksDirHandleRef.current);
    const jsonFiles = await filterParsableFiles(blocksDirHandleRef.current, allJsonFiles);
    setBlockFiles(jsonFiles);

    // Reload all block contents into the store
    const entries = await loadAllBlockFiles(blocksDirHandleRef.current);
    useCustomBlocksStore.getState().setCustomBlocks(entries);
  };

  const selectBlock = async (name: string) => {
    if (!blocksDirHandleRef.current) return;
    try {
      await flushPendingBlockSave();
      await flushPendingTemplateSave();
      const fileHandle = await blocksDirHandleRef.current.getFileHandle(name);
      const file = await fileHandle.getFile();
      const text = await file.text();
      // Parse block JSON, stripping __slots__ metadata.
      // We skip strict Zod schema validation for blocks because blocks with
      // __slots__ may contain {{placeholder}} strings in number/enum fields
      // that would fail the schema (e.g. "{{iconWidth}}" in a z.number() field).
      // The placeholders are substituted at resolve time, not at load time.
      const parsed = parseBlockJson(text);
      if (!parsed) {
        alert(`Could not load block "${name}": Invalid JSON`);
        return;
      }
      const data = parsed.config as TEditorConfiguration;
      if (!data.root) {
        alert(`Could not load block "${name}": Missing "root" node`);
        return;
      }

      // Save current template state before switching
      if (editingModeRef.current === 'template') {
        savedTemplateDocRef.current = document as TEditorConfiguration;
        savedTemplateFileHandleRef.current = activeFileHandleRef.current;
        savedTemplateFileNameRef.current = activeFileName;
        savedTemplateSaveStatusRef.current = saveStatus;
      }

      activeBlockFileHandleRef.current = fileHandle;
      lastLoadedBlockDocRef.current = data;
      activeBlockSlotsRef.current = Object.keys(parsed.slots).length > 0 ? parsed.slots as Record<string, unknown> : null;
      setActiveBlockFileName(name);
      setBlockSaveStatus('saved');
      editingModeRef.current = 'block'; // Set ref before resetDocument to prevent stale auto-save
      setEditingMode('block');
      resetDocument(data);
    } catch (e) {
      console.error('Failed to load block', e);
    }
  };

  const createBlock = async () => {
    if (!blocksDirHandleRef.current) return;
    await flushPendingBlockSave();
    await flushPendingTemplateSave();
    const raw = window.prompt('New block name:', 'untitled.json');
    if (!raw) return;
    const fileName = raw.endsWith('.json') ? raw : `${raw}.json`;
    try {
      const fileHandle = await blocksDirHandleRef.current.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(EMPTY_BLOCK, null, 2));
      await writable.close();

      // Save current template state before switching
      if (editingModeRef.current === 'template') {
        savedTemplateDocRef.current = document as TEditorConfiguration;
        savedTemplateFileHandleRef.current = activeFileHandleRef.current;
        savedTemplateFileNameRef.current = activeFileName;
        savedTemplateSaveStatusRef.current = saveStatus;
      }

      activeBlockFileHandleRef.current = fileHandle;
      lastLoadedBlockDocRef.current = EMPTY_BLOCK;
      setActiveBlockFileName(fileName);
      setBlockSaveStatus('saved');
      editingModeRef.current = 'block'; // Set ref before resetDocument to prevent stale auto-save
      setEditingMode('block');
      setBlockFiles((prev) => [...prev, fileName].sort());
      resetDocument(EMPTY_BLOCK);

      // Also add to the custom blocks store
      const store = useCustomBlocksStore.getState();
      store.setCustomBlocks([...store.customBlocks, { name: fileName, config: structuredClone(EMPTY_BLOCK), slots: {} }]);
    } catch (e) {
      console.error('Failed to create block', e);
    }
  };

  const switchToTemplateMode = async () => {
    await flushPendingBlockSave();
    editingModeRef.current = 'template'; // Set ref before resetDocument to prevent stale auto-save
    setEditingMode('template');
    setActiveBlockFileName('');
    activeBlockFileHandleRef.current = null;
    lastLoadedBlockDocRef.current = null;
    activeBlockSlotsRef.current = null;
    setBlockSaveStatus(null);

    // Restore saved template state
    if (savedTemplateDocRef.current) {
      activeFileHandleRef.current = savedTemplateFileHandleRef.current;
      lastLoadedDocRef.current = savedTemplateDocRef.current;
      setActiveFileName(savedTemplateFileNameRef.current);
      setSaveStatus(savedTemplateSaveStatusRef.current);
      resetDocument(savedTemplateDocRef.current);

      savedTemplateDocRef.current = null;
      savedTemplateFileHandleRef.current = null;
      savedTemplateFileNameRef.current = '';
      savedTemplateSaveStatusRef.current = null;
    } else {
      resetDocument(EMPTY_EMAIL_MESSAGE);
    }

    // Refresh block files so the store has the latest
    await refreshBlockFiles();
  };

  return (
    <FileSystemContext.Provider
      value={{
        folderName,
        files,
        activeFileName,
        saveStatus,
        openFolder,
        refreshFiles,
        selectFile,
        createFile,
        blockFiles,
        activeBlockFileName,
        blockSaveStatus,
        editingMode,
        selectBlock,
        createBlock,
        refreshBlockFiles,
        switchToTemplateMode,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}
