import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { resetDocument, useDocument } from '../../../documents/editor/EditorContext';
import EMPTY_EMAIL_MESSAGE from '../../../getConfiguration/sample/empty-email-message';
import validateJsonStringValue from '../ImportJson/validateJsonStringValue';

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

// File System Access API types (Chrome/Edge only).
export type DirHandle = {
  name: string;
  values(): AsyncIterableIterator<{ kind: string; name: string }>;
  getFileHandle(name: string, opts?: { create?: boolean }): Promise<FileHandle>;
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

export async function listJsonFiles(dir: DirHandle): Promise<string[]> {
  const names: string[] = [];
  const iter = dir.values();
  let result = await iter.next();
  while (!result.done) {
    const entry = result.value;
    if (entry.kind === 'file' && entry.name.endsWith('.json')) {
      names.push(entry.name);
    }
    result = await iter.next();
  }
  names.sort();
  return names;
}

// --- Context ---

type FileSystemContextValue = {
  folderName: string | null;
  files: string[];
  activeFileName: string;
  saveStatus: SaveStatus | null;
  openFolder(): void;
  refreshFiles(): void;
  selectFile(name: string): void;
  createFile(): void;
};

const FileSystemContext = createContext<FileSystemContextValue | null>(null);

export function useFileSystem() {
  const ctx = useContext(FileSystemContext);
  if (!ctx) throw new Error('useFileSystem must be used inside FileSystemProvider');
  return ctx;
}

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const document = useDocument();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);

  const dirHandleRef = useRef<DirHandle | null>(null);
  const activeFileHandleRef = useRef<FileHandle | null>(null);
  const lastLoadedDocRef = useRef<unknown>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        const jsonFiles = await listJsonFiles(handle);
        setFolderName(handle.name);
        setFiles(jsonFiles);
      })
      .catch(() => {});
  }, []);

  // Auto-save when document changes, skipping the document we just loaded.
  useEffect(() => {
    if (!activeFileHandleRef.current || document === lastLoadedDocRef.current) {
      return;
    }

    setSaveStatus('unsaved');
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const writable = await activeFileHandleRef.current!.createWritable();
        await writable.write(JSON.stringify(document, null, 2));
        await writable.close();
        lastLoadedDocRef.current = document;
        setSaveStatus('saved');
      } catch {
        setSaveStatus('unsaved');
      }
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [document]);

  const openFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the File System Access API. Please use Chrome or Edge.');
      return;
    }
    try {
      const handle = await (
        window as unknown as { showDirectoryPicker(o: object): Promise<DirHandle> }
      ).showDirectoryPicker({ mode: 'readwrite' });

      dirHandleRef.current = handle;
      await saveHandle(handle);

      const jsonFiles = await listJsonFiles(handle);
      setFolderName(handle.name);
      setFiles(jsonFiles);
      setActiveFileName('');
      activeFileHandleRef.current = null;
      lastLoadedDocRef.current = null;
      setSaveStatus(null);
    } catch {
      // User cancelled the picker — do nothing.
    }
  };

  const refreshFiles = async () => {
    if (!dirHandleRef.current) return;
    const jsonFiles = await listJsonFiles(dirHandleRef.current);
    setFiles(jsonFiles);
  };

  const selectFile = async (name: string) => {
    if (!dirHandleRef.current) return;
    try {
      const fileHandle = await dirHandleRef.current.getFileHandle(name);
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
      resetDocument(data);
    } catch (e) {
      console.error('Failed to load file', e);
    }
  };

  const createFile = async () => {
    if (!dirHandleRef.current) return;
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
      setFiles((prev) => [...prev, fileName].sort());
      resetDocument(EMPTY_EMAIL_MESSAGE);
    } catch (e) {
      console.error('Failed to create file', e);
    }
  };

  return (
    <FileSystemContext.Provider value={{ folderName, files, activeFileName, saveStatus, openFolder, refreshFiles, selectFile, createFile }}>
      {children}
    </FileSystemContext.Provider>
  );
}
