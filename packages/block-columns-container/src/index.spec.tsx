import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { ColumnsContainer, ColumnsContainerPropsSchema } from '.';

describe('block-columns-container', () => {
  it('renders with default values', () => {
    expect(render(<ColumnsContainer />).asFragment()).toMatchSnapshot();
  });

  describe('columnsCount 2', () => {
    it('renders column children', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(render(<ColumnsContainer props={{ columnsCount: 2 }} columns={columns} />).asFragment()).toMatchSnapshot();
    });

    it('uses padding correctly', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(
        render(
          <ColumnsContainer
            props={{
              columnsGap: 12,
              columnsCount: 2,
            }}
            columns={columns}
          />
        ).asFragment()
      ).toMatchSnapshot();
    });
  });

  describe('columnsCount 3', () => {
    it('renders column children', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(render(<ColumnsContainer props={{ columnsCount: 3 }} columns={columns} />).asFragment()).toMatchSnapshot();
    });

    it('uses padding correctly', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(
        render(
          <ColumnsContainer
            props={{
              columnsGap: 12,
              columnsCount: 3,
            }}
            columns={columns}
          />
        ).asFragment()
      ).toMatchSnapshot();
    });
  });

  it('renders with RGBA background color', () => {
    const columns = [<>col1</>, <>col2</>];
    expect(
      render(
        <ColumnsContainer
          style={{ backgroundColor: '#0000FF80' }}
          props={{ columnsCount: 2 }}
          columns={columns}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with style padding', () => {
    const columns = [<>col1</>, <>col2</>];
    expect(
      render(
        <ColumnsContainer
          style={{
            backgroundColor: '#EEEEEE',
            padding: { top: 16, bottom: 16, left: 24, right: 24 },
          }}
          props={{ columnsCount: 2 }}
          columns={columns}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with content alignment', () => {
    const columns = [<>short</>, <>tall content that takes more space</>];
    expect(
      render(
        <ColumnsContainer
          props={{ columnsCount: 2, contentAlignment: 'middle' }}
          columns={columns}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with fixed widths', () => {
    const columns = [<>fixed</>, <>flexible</>, <>third</>];
    expect(
      render(
        <ColumnsContainer
          props={{ columnsCount: 3, fixedWidths: [200, null, 150] }}
          columns={columns}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  describe('schema validation', () => {
    it('accepts 6-digit hex color', () => {
      const result = ColumnsContainerPropsSchema.safeParse({ style: { backgroundColor: '#FF0000' } });
      expect(result.success).toBe(true);
    });

    it('accepts 8-digit hex color (RGBA)', () => {
      const result = ColumnsContainerPropsSchema.safeParse({ style: { backgroundColor: '#FF000080' } });
      expect(result.success).toBe(true);
    });

    it('rejects invalid color format', () => {
      expect(ColumnsContainerPropsSchema.safeParse({ style: { backgroundColor: 'blue' } }).success).toBe(false);
    });

    it('accepts valid columnsCount', () => {
      expect(ColumnsContainerPropsSchema.safeParse({ props: { columnsCount: 2 } }).success).toBe(true);
      expect(ColumnsContainerPropsSchema.safeParse({ props: { columnsCount: 3 } }).success).toBe(true);
    });
  });
});
