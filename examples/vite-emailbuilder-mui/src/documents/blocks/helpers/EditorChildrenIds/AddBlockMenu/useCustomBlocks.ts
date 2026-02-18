import { create } from 'zustand';

import { TEditorConfiguration } from '../../../../editor/core';

export type CustomBlockEntry = {
  name: string;
  config: TEditorConfiguration;
};

type CustomBlocksStore = {
  customBlocks: CustomBlockEntry[];
  setCustomBlocks(blocks: CustomBlockEntry[]): void;
};

export const useCustomBlocksStore = create<CustomBlocksStore>((set) => ({
  customBlocks: [],
  setCustomBlocks: (customBlocks) => set({ customBlocks }),
}));
