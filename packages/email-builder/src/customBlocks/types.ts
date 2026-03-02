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
  config: Record<string, unknown>;
  slots: Record<string, SlotDefinition>;
};
