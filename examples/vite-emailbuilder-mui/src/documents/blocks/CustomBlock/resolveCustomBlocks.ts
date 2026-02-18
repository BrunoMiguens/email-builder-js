import { TEditorBlock, TEditorConfiguration } from '../../editor/core';
import { CustomBlockEntry } from '../helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';

/**
 * Resolves all CustomBlock references in a document by replacing them with
 * the actual block content. Used before passing to Reader or renderToStaticMarkup.
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
      const entry = customBlocks.find((b) => b.name === blockName);
      if (!entry) {
        // Replace unresolvable CustomBlock with an empty Container so the Reader doesn't crash
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
      const childrenIds: string[] = (root?.data as Record<string, unknown>)?.childrenIds as string[] ?? [];
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

      const idPrefix = `cb-${id}-`;

      // Build old→new ID mapping
      const idMap = new Map<string, string>();
      for (const oldId of Object.keys(config)) {
        if (oldId === 'root') continue;
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
      for (const [oldId, childBlock] of Object.entries(config)) {
        if (oldId === 'root') continue;
        const newId = idMap.get(oldId)!;
        const cloned: TEditorBlock = structuredClone(childBlock);

        remapChildrenIds(cloned, idMap);
        resolved[newId] = cloned;
      }
    }
  }

  // If no custom blocks were found, return original to avoid unnecessary object creation
  if (!hasCustomBlocks) return document;
  return resolved;
}

function remapChildrenIds(block: TEditorBlock, idMap: Map<string, string>): void {
  if (block.type === 'Container' && block.data?.props?.childrenIds) {
    block.data.props.childrenIds = block.data.props.childrenIds.map(
      (id: string) => idMap.get(id) ?? id
    );
  }
  if (block.type === 'ColumnsContainer' && block.data?.props?.columns) {
    for (const col of block.data.props.columns) {
      if (col.childrenIds) {
        col.childrenIds = col.childrenIds.map((id: string) => idMap.get(id) ?? id);
      }
    }
  }
}
