/**
 * @jest-environment node
 */

import { describe, expect, it } from '@jest/globals';

import resolveCustomBlocks, { generateTableHtml } from './resolveCustomBlocks';
import { CustomBlockEntry } from './types';

describe('resolveCustomBlocks', () => {
  it('returns document unchanged when no custom blocks array is empty', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['block1'] } } },
      block1: { type: 'Text', data: { props: { text: 'Hello' } } },
    };
    const result = resolveCustomBlocks(doc, []);
    expect(result).toBe(doc);
  });

  it('returns document unchanged when no CustomBlock types exist', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['block1'] } } },
      block1: { type: 'Text', data: { props: { text: 'Hello' } } },
    };
    const customBlocks: CustomBlockEntry[] = [
      { name: 'MyBlock', config: {}, slots: {} },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    expect(result).toBe(doc);
  });

  it('replaces unmatched CustomBlock with empty Container', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: { type: 'CustomBlock', data: { props: { blockName: 'NonExistent' } } },
    };
    const result = resolveCustomBlocks(doc, [{ name: 'Other', config: {}, slots: {} }]);
    expect(result.cb1.type).toBe('Container');
    expect((result.cb1.data as Record<string, unknown>).props).toEqual({ childrenIds: [] });
  });

  it('replaces CustomBlock with empty root childrenIds with empty Container', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: { type: 'CustomBlock', data: { props: { blockName: 'MyBlock' } } },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'MyBlock',
        config: { root: { data: { childrenIds: [] } } },
        slots: {},
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    expect(result.cb1.type).toBe('Container');
    expect((result.cb1.data as Record<string, unknown>).props).toEqual({ childrenIds: [] });
  });

  it('resolves CustomBlock with child blocks and namespaces IDs', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: { type: 'CustomBlock', data: { props: { blockName: 'Banner' } } },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Banner',
        config: {
          root: { data: { childrenIds: ['heading1', 'text1'] } },
          heading1: { type: 'Heading', data: { props: { text: 'Title' } } },
          text1: { type: 'Text', data: { props: { text: 'Body' } } },
        },
        slots: {},
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);

    // cb1 replaced with Container pointing to namespaced children
    expect(result.cb1.type).toBe('Container');
    const cb1Props = (result.cb1.data as Record<string, unknown>).props as Record<string, unknown>;
    expect(cb1Props.childrenIds).toEqual(['cb-cb1-heading1', 'cb-cb1-text1']);

    // Namespaced child blocks exist
    expect(result['cb-cb1-heading1'].type).toBe('Heading');
    expect(result['cb-cb1-text1'].type).toBe('Text');
  });

  it('substitutes text slot values in resolved blocks', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: {
        type: 'CustomBlock',
        data: { props: { blockName: 'Greeting', slotValues: { name: 'Alice' } } },
      },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Greeting',
        config: {
          root: { data: { childrenIds: ['t1'] } },
          t1: { type: 'Text', data: { props: { text: 'Hello {{name}}!' } } },
        },
        slots: {
          name: { label: 'Name', type: 'text', defaultValue: 'World' },
        },
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    const textData = result['cb-cb1-t1'].data as Record<string, unknown>;
    const textProps = textData.props as Record<string, unknown>;
    expect(textProps.text).toBe('Hello Alice!');
  });

  it('uses slot default values when no override provided', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: {
        type: 'CustomBlock',
        data: { props: { blockName: 'Greeting' } },
      },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Greeting',
        config: {
          root: { data: { childrenIds: ['t1'] } },
          t1: { type: 'Text', data: { props: { text: 'Hello {{name}}!' } } },
        },
        slots: {
          name: { label: 'Name', type: 'text', defaultValue: 'World' },
        },
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    const textData = result['cb-cb1-t1'].data as Record<string, unknown>;
    const textProps = textData.props as Record<string, unknown>;
    expect(textProps.text).toBe('Hello World!');
  });

  it('preserves type for single placeholder slot values (number)', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: {
        type: 'CustomBlock',
        data: { props: { blockName: 'Card', slotValues: { width: 300 } } },
      },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Card',
        config: {
          root: { data: { childrenIds: ['img1'] } },
          img1: { type: 'Image', data: { props: { width: '{{width}}' } } },
        },
        slots: {
          width: { label: 'Width', type: 'number', defaultValue: 200 },
        },
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    const imgData = result['cb-cb1-img1'].data as Record<string, unknown>;
    const imgProps = imgData.props as Record<string, unknown>;
    expect(imgProps.width).toBe(300);
    expect(typeof imgProps.width).toBe('number');
  });

  it('converts table slot values to HTML', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: {
        type: 'CustomBlock',
        data: {
          props: {
            blockName: 'Receipt',
            slotValues: {
              items: [
                { label: 'Item A', value: '$10' },
                { label: 'Item B', value: '$20' },
              ],
            },
          },
        },
      },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Receipt',
        config: {
          root: { data: { childrenIds: ['html1'] } },
          html1: { type: 'Html', data: { props: { contents: '{{items}}' } } },
        },
        slots: {
          items: { label: 'Items', type: 'table', defaultValue: [] },
        },
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    const htmlData = result['cb-cb1-html1'].data as Record<string, unknown>;
    const htmlProps = htmlData.props as Record<string, unknown>;
    expect(htmlProps.contents).toContain('<table');
    expect(htmlProps.contents).toContain('Item A');
    expect(htmlProps.contents).toContain('$10');
    expect(htmlProps.contents).toContain('Item B');
    expect(htmlProps.contents).toContain('$20');
  });

  it('remaps childrenIds in nested Container blocks', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: { type: 'CustomBlock', data: { props: { blockName: 'Nested' } } },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Nested',
        config: {
          root: { data: { childrenIds: ['container1'] } },
          container1: {
            type: 'Container',
            data: { props: { childrenIds: ['text1'] } },
          },
          text1: { type: 'Text', data: { props: { text: 'Nested text' } } },
        },
        slots: {},
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    const containerData = result['cb-cb1-container1'].data as Record<string, unknown>;
    const containerProps = containerData.props as Record<string, unknown>;
    expect(containerProps.childrenIds).toEqual(['cb-cb1-text1']);
  });

  it('remaps childrenIds in nested ColumnsContainer blocks', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: { type: 'CustomBlock', data: { props: { blockName: 'TwoCol' } } },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'TwoCol',
        config: {
          root: { data: { childrenIds: ['cols1'] } },
          cols1: {
            type: 'ColumnsContainer',
            data: {
              props: {
                columnsCount: 2,
                columns: [{ childrenIds: ['left1'] }, { childrenIds: ['right1'] }],
              },
            },
          },
          left1: { type: 'Text', data: { props: { text: 'Left' } } },
          right1: { type: 'Text', data: { props: { text: 'Right' } } },
        },
        slots: {},
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    const colsData = result['cb-cb1-cols1'].data as Record<string, unknown>;
    const colsProps = colsData.props as Record<string, unknown>;
    const columns = colsProps.columns as Array<{ childrenIds: string[] }>;
    expect(columns[0].childrenIds).toEqual(['cb-cb1-left1']);
    expect(columns[1].childrenIds).toEqual(['cb-cb1-right1']);
  });

  it('skips __slots__ key from config when building child blocks', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: { type: 'CustomBlock', data: { props: { blockName: 'WithSlots' } } },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'WithSlots',
        config: {
          root: { data: { childrenIds: ['t1'] } },
          __slots__: { title: { label: 'Title', type: 'text', defaultValue: 'Hi' } },
          t1: { type: 'Text', data: { props: { text: 'Content' } } },
        },
        slots: {},
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);
    expect(result['cb-cb1-__slots__']).toBeUndefined();
    expect(result['cb-cb1-t1']).toBeDefined();
  });

  it('handles multiple CustomBlocks in the same document', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1', 'cb2'] } } },
      cb1: { type: 'CustomBlock', data: { props: { blockName: 'A' } } },
      cb2: { type: 'CustomBlock', data: { props: { blockName: 'B' } } },
    };
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'A',
        config: {
          root: { data: { childrenIds: ['t1'] } },
          t1: { type: 'Text', data: { props: { text: 'From A' } } },
        },
        slots: {},
      },
      {
        name: 'B',
        config: {
          root: { data: { childrenIds: ['t1'] } },
          t1: { type: 'Heading', data: { props: { text: 'From B' } } },
        },
        slots: {},
      },
    ];
    const result = resolveCustomBlocks(doc, customBlocks);

    // Each CustomBlock gets its own namespace
    expect(result['cb-cb1-t1'].type).toBe('Text');
    expect(result['cb-cb2-t1'].type).toBe('Heading');
    // No ID collisions
    const textData = result['cb-cb1-t1'].data as Record<string, unknown>;
    const headingData = result['cb-cb2-t1'].data as Record<string, unknown>;
    expect((textData.props as Record<string, unknown>).text).toBe('From A');
    expect((headingData.props as Record<string, unknown>).text).toBe('From B');
  });

  it('does not mutate the original document', () => {
    const doc = {
      root: { type: 'Container', data: { props: { childrenIds: ['cb1'] } } },
      cb1: { type: 'CustomBlock', data: { props: { blockName: 'Test' } } },
    };
    const original = JSON.stringify(doc);
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Test',
        config: {
          root: { data: { childrenIds: ['t1'] } },
          t1: { type: 'Text', data: { props: { text: 'Hello' } } },
        },
        slots: {},
      },
    ];
    resolveCustomBlocks(doc, customBlocks);
    expect(JSON.stringify(doc)).toBe(original);
  });
});

describe('generateTableHtml', () => {
  it('returns empty string for empty items', () => {
    expect(generateTableHtml([])).toBe('');
  });

  it('generates table HTML for single item', () => {
    const html = generateTableHtml([{ label: 'Amount', value: '$100' }]);
    expect(html).toContain('<table');
    expect(html).toContain('Amount');
    expect(html).toContain('$100');
    expect(html).toContain('role="presentation"');
    expect(html).toContain('border-collapse:collapse');
    expect(html).not.toContain('height:16px'); // no spacer for single row
  });

  it('generates table HTML with spacer rows between items', () => {
    const html = generateTableHtml([
      { label: 'Item 1', value: '$10' },
      { label: 'Item 2', value: '$20' },
      { label: 'Item 3', value: '$30' },
    ]);
    expect(html).toContain('Item 1');
    expect(html).toContain('$10');
    expect(html).toContain('Item 2');
    expect(html).toContain('$20');
    expect(html).toContain('Item 3');
    expect(html).toContain('$30');
    // Spacer rows between items (2 spacers for 3 items)
    const spacerCount = (html.match(/colspan="2"/g) || []).length;
    expect(spacerCount).toBe(2);
  });

  it('applies correct styles to label and value columns', () => {
    const html = generateTableHtml([{ label: 'Tax', value: '$5' }]);
    expect(html).toContain('color:#808080'); // label color
    expect(html).toContain('color:#111111'); // value color
    expect(html).toContain('text-align:right'); // value alignment
    expect(html).toContain('vertical-align:middle');
  });
});
