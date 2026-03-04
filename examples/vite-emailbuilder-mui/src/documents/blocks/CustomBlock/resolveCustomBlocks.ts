import { TEditorBlock, TEditorConfiguration } from '../../editor/core';
import { CustomBlockEntry, TableItem } from '../helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';

/**
 * Resolves all CustomBlock references in a document by replacing them with
 * the actual block content. Used before passing to Reader or renderToStaticMarkup.
 *
 * If the custom block defines __slots__ and the CustomBlock instance provides
 * slotValues, all `{{slotName}}` placeholders in the resolved blocks are
 * replaced with the corresponding values.
 */
export default function resolveCustomBlocks(
  document: TEditorConfiguration,
  customBlocks: CustomBlockEntry[]
): TEditorConfiguration {
  const resolved: TEditorConfiguration = { ...document };
  let hasCustomBlocks = false;

  for (const [id, block] of Object.entries(resolved)) {
    if (block.type === 'CustomBlock') {
      hasCustomBlocks = true;
      const blockName = block.data?.props?.blockName;
      const slotValues: Record<string, unknown> =
        ((block.data?.props as Record<string, unknown>)?.slotValues as Record<string, unknown>) ?? {};
      const entry = customBlocks.find((b) => b.name === blockName);
      if (!entry) {
        resolved[id] = {
          type: 'Container',
          data: {
            style: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
            props: { childrenIds: [] },
          },
        };
        continue;
      }

      const config = entry.config;
      const root = config.root;
      const childrenIds: string[] = ((root?.data as Record<string, unknown>)?.childrenIds as string[]) ?? [];
      if (childrenIds.length === 0) {
        resolved[id] = {
          type: 'Container',
          data: {
            style: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
            props: { childrenIds: [] },
          },
        };
        continue;
      }

      // Build the effective values map: slot defaults merged with instance overrides
      const effectiveValues: Record<string, unknown> = {};
      if (entry.slots) {
        for (const [key, def] of Object.entries(entry.slots)) {
          effectiveValues[key] = def.defaultValue;
        }
      }
      for (const [key, val] of Object.entries(slotValues)) {
        if (val !== undefined && val !== null) {
          effectiveValues[key] = val;
        }
      }

      // Convert table-type slot values from array to HTML string
      if (entry.slots) {
        for (const [key, def] of Object.entries(entry.slots)) {
          if (def.type === 'table' && Array.isArray(effectiveValues[key])) {
            effectiveValues[key] = generateTableHtml(effectiveValues[key] as TableItem[]);
          }
        }
      }

      const idPrefix = `cb-${id}-`;

      // Build old→new ID mapping
      const idMap = new Map<string, string>();
      for (const oldId of Object.keys(config)) {
        if (oldId === 'root') {
          continue;
        }
        idMap.set(oldId, `${idPrefix}${oldId}`);
      }

      // Replace the CustomBlock with a Container
      const newChildrenIds = childrenIds.map((cid) => idMap.get(cid) ?? cid);
      resolved[id] = {
        type: 'Container',
        data: {
          style: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
          props: { childrenIds: newChildrenIds },
        },
      };

      // Copy all child blocks with namespaced IDs, remapping internal references
      const hasSlots = Object.keys(effectiveValues).length > 0;
      for (const [oldId, childBlock] of Object.entries(config)) {
        if (oldId === 'root') {
          continue;
        }
        const newId = idMap.get(oldId)!;
        const cloned: TEditorBlock = structuredClone(childBlock);

        remapChildrenIds(cloned, idMap);

        // Substitute slot placeholders in all string values
        if (hasSlots) {
          substituteSlotValues(cloned, effectiveValues);
        }

        resolved[newId] = cloned;
      }
    }
  }

  // If no custom blocks were found, return original to avoid unnecessary object creation
  if (!hasCustomBlocks) {
    return document;
  }
  return resolved;
}

function remapChildrenIds(block: TEditorBlock, idMap: Map<string, string>): void {
  if (block.type === 'Container' && block.data?.props?.childrenIds) {
    block.data.props.childrenIds = block.data.props.childrenIds.map((id: string) => idMap.get(id) ?? id);
  }
  if (block.type === 'ColumnsContainer' && block.data?.props?.columns) {
    for (const col of block.data.props.columns) {
      if (col.childrenIds) {
        col.childrenIds = col.childrenIds.map((id: string) => idMap.get(id) ?? id);
      }
    }
  }
}

/**
 * Recursively walks a block's data and replaces all `{{key}}` patterns
 * in string values with the corresponding slot value.
 */
function substituteSlotValues(obj: unknown, values: Record<string, unknown>): void {
  if (obj === null || obj === undefined) {
    return;
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        obj[i] = resolveSlotValue(obj[i], values);
      } else if (typeof obj[i] === 'object') {
        substituteSlotValues(obj[i], values);
      }
    }
    return;
  }
  if (typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const val = record[key];
      if (typeof val === 'string') {
        record[key] = resolveSlotValue(val, values);
      } else if (typeof val === 'object' && val !== null) {
        substituteSlotValues(val, values);
      }
    }
  }
}

function resolveSlotValue(str: string, values: Record<string, unknown>): unknown {
  const singleMatch = str.match(/^\{\{(\w+)\}\}$/);
  if (singleMatch && singleMatch[1] in values) {
    return values[singleMatch[1]];
  }
  return replaceSlotPlaceholders(str, values);
}

function replaceSlotPlaceholders(str: string, values: Record<string, unknown>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in values) {
      return String(values[key]);
    }
    return match;
  });
}

/**
 * Converts an array of {label, value} items into an HTML receipt-style table.
 */
export function generateTableHtml(items: TableItem[]): string {
  if (items.length === 0) {
    return '';
  }

  const labelStyle =
    'color:#808080;font-size:16px;line-height:22px;letter-spacing:-0.18px;padding:0;vertical-align:middle;';
  const valueStyle =
    'color:#111111;font-size:16px;line-height:22px;letter-spacing:-0.18px;padding:0;text-align:right;vertical-align:middle;white-space:nowrap;';
  const spacerRow = '<tr><td height="16" style="height:16px;line-height:16px;font-size:16px;" colspan="2"></td></tr>';

  const rows = items
    .map((item, i) => {
      const row = `<tr><td style="${labelStyle}">${item.label}</td><td style="${valueStyle}">${item.value}</td></tr>`;
      return i < items.length - 1 ? row + spacerRow : row;
    })
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">${rows}</table>`;
}
