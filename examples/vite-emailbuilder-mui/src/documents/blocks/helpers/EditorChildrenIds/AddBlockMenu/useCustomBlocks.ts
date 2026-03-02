import { create } from 'zustand';

import { TEditorConfiguration } from '../../../../editor/core';

export type TableItem = {
  label: string;
  value: string;
};

export type SlotDefinition = {
  label: string;
  type: 'text' | 'html' | 'color' | 'number' | 'table';
  defaultValue: string | number | TableItem[];
};

export type CustomBlockEntry = {
  name: string;
  config: TEditorConfiguration;
  slots: Record<string, SlotDefinition>;
};

type CustomBlocksStore = {
  customBlocks: CustomBlockEntry[];
  setCustomBlocks(blocks: CustomBlockEntry[]): void;
};

export const useCustomBlocksStore = create<CustomBlocksStore>((set) => ({
  customBlocks: [],
  setCustomBlocks: (customBlocks) => set({ customBlocks }),
}));
