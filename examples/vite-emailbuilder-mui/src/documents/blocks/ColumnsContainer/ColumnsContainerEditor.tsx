import React from 'react';

import { ColumnsContainer as BaseColumnsContainer } from '@usewaypoint/block-columns-container';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { setDocument, setSelectedBlockId } from '../../editor/EditorContext';
import EditorChildrenIds, { EditorChildrenChange } from '../helpers/EditorChildrenIds';

import ColumnsContainerPropsSchema, { ColumnsContainerProps } from './ColumnsContainerPropsSchema';

function makeEmptyColumns(count: number) {
  return Array.from({ length: count }, () => ({ childrenIds: [] as string[] }));
}

export default function ColumnsContainerEditor({ style, props }: ColumnsContainerProps) {
  const currentBlockId = useCurrentBlockId();

  const { columns, ...restProps } = props ?? {};
  const columnsCount = restProps.columnsCount ?? 2;
  const columnsValue = columns ?? makeEmptyColumns(columnsCount);
  // Pad if columns array is shorter than columnsCount (e.g. user increased column count)
  while (columnsValue.length < columnsCount) {
    columnsValue.push({ childrenIds: [] });
  }

  const updateColumn = (columnIndex: number, { block, blockId, childrenIds }: EditorChildrenChange) => {
    const nColumns = [...columnsValue];
    nColumns[columnIndex] = { childrenIds };
    setDocument({
      [blockId]: block,
      [currentBlockId]: {
        type: 'ColumnsContainer',
        data: ColumnsContainerPropsSchema.parse({
          style,
          props: {
            ...restProps,
            columns: nColumns,
          },
        }),
      },
    });
    setSelectedBlockId(blockId);
  };

  return (
    <BaseColumnsContainer
      props={restProps}
      style={style}
      columns={Array.from({ length: columnsCount }, (_, i) => (
        <EditorChildrenIds
          key={i}
          childrenIds={columnsValue[i]?.childrenIds}
          onChange={(change) => updateColumn(i, change)}
        />
      ))}
    />
  );
}
