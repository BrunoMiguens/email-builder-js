import React, { CSSProperties } from 'react';
import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/)
  .nullable()
  .optional();

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const FIXED_WIDTHS_SCHEMA = z
  .array(z.number().nullish())
  .max(6)
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

export const ColumnsContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      fixedWidths: FIXED_WIDTHS_SCHEMA,
      columnsCount: z
        .union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
        .optional()
        .nullable(),
      columnsGap: z.number().optional().nullable(),
      contentAlignment: z.enum(['top', 'middle', 'bottom']).optional().nullable(),
    })
    .optional()
    .nullable(),
});

type TColumn = JSX.Element | JSX.Element[] | null;
export type ColumnsContainerProps = z.infer<typeof ColumnsContainerPropsSchema> & {
  columns?: TColumn[];
};

const ColumnsContainerPropsDefaults = {
  columnsCount: 2,
  columnsGap: 0,
  contentAlignment: 'middle',
} as const;

export function ColumnsContainer({ style, columns, props }: ColumnsContainerProps) {
  const wStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    padding: getPadding(style?.padding),
  };

  const blockProps = {
    columnsCount: props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount,
    columnsGap: props?.columnsGap ?? ColumnsContainerPropsDefaults.columnsGap,
    contentAlignment: props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment,
    fixedWidths: props?.fixedWidths,
  };

  return (
    <div style={wStyle}>
      <table
        align="center"
        cellPadding="0"
        border={0}
        style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
      >
        <tbody style={{ width: '100%' }}>
          <tr style={{ width: '100%' }}>
            {Array.from({ length: blockProps.columnsCount }, (_, i) => (
              <TableCell key={i} index={i} props={blockProps} columns={columns} />
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  props: {
    fixedWidths: z.infer<typeof FIXED_WIDTHS_SCHEMA>;
    columnsCount: 2 | 3 | 4 | 5 | 6;
    columnsGap: number;
    contentAlignment: 'top' | 'middle' | 'bottom';
  };
  index: number;
  columns?: TColumn[];
};
function TableCell({ index, props, columns }: Props) {
  const contentAlignment = props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment;
  const columnsCount = props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount;

  const fixedWidth = props.fixedWidths?.[index];
  const hasAnyFixedWidth = props.fixedWidths?.some((w) => w != null) ?? false;
  const equalWidth = `${+(100 / columnsCount).toFixed(4)}%`;
  const width = fixedWidth != null ? fixedWidth : hasAnyFixedWidth ? undefined : equalWidth;
  const style: CSSProperties = {
    boxSizing: 'border-box',
    verticalAlign: contentAlignment,
    paddingLeft: getColumnPaddingLeft(index, props),
    paddingRight: getColumnPaddingRight(index, props),
    width,
    overflowWrap: 'break-word',
  };
  const children = (columns && columns[index]) ?? null;
  return <td style={style}>{children}</td>;
}

function getColumnPaddingLeft(index: number, { columnsGap, columnsCount }: Props['props']) {
  return (index * columnsGap) / columnsCount;
}

function getColumnPaddingRight(index: number, { columnsGap, columnsCount }: Props['props']) {
  return ((columnsCount - 1 - index) * columnsGap) / columnsCount;
}
