/**
 * @jest-environment node
 */

import { describe, expect, it } from '@jest/globals';

import { CustomBlockEntry } from './customBlocks/types';
import renderEmailToHtml from './renderEmailToHtml';

describe('renderEmailToHtml', () => {
  it('renders a simple document without custom blocks', () => {
    const result = renderEmailToHtml({
      root: {
        type: 'Container',
        data: { props: { childrenIds: [] } },
      },
    });
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<div></div>');
  });

  it('defaults rootBlockId to root', () => {
    const result = renderEmailToHtml({
      root: {
        type: 'Container',
        data: { props: { childrenIds: [] } },
      },
    });
    expect(result).toContain('<html>');
  });

  it('accepts custom rootBlockId', () => {
    const result = renderEmailToHtml(
      {
        myRoot: {
          type: 'Container',
          data: { props: { childrenIds: [] } },
        },
      },
      { rootBlockId: 'myRoot' }
    );
    expect(result).toContain('<div></div>');
  });

  it('resolves CustomBlocks before rendering', () => {
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Banner',
        config: {
          root: { data: { childrenIds: ['h1'] } },
          h1: { type: 'Heading', data: { props: { text: 'Welcome!', level: 'h1' } } },
        },
        slots: {},
      },
    ];
    const result = renderEmailToHtml(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['cb1'] } },
        },
        cb1: {
          type: 'CustomBlock',
          data: { props: { blockName: 'Banner' } },
        },
      },
      { customBlocks }
    );
    expect(result).toContain('Welcome!');
    expect(result).toContain('<h1');
  });

  it('resolves CustomBlocks with slot substitution', () => {
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
    const result = renderEmailToHtml(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['cb1'] } },
        },
        cb1: {
          type: 'CustomBlock',
          data: { props: { blockName: 'Greeting', slotValues: { name: 'Alice' } } },
        },
      },
      { customBlocks }
    );
    expect(result).toContain('Hello Alice!');
    expect(result).not.toContain('{{name}}');
  });

  it('passes fontUrl through to renderer', () => {
    const result = renderEmailToHtml(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: [] } },
        },
      },
      { fontUrl: 'https://fonts.example.com/inter.css' }
    );
    expect(result).toContain('href="https://fonts.example.com/inter.css"');
  });

  it('resolves CustomBlocks with color slot applied to styles', () => {
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Banner',
        config: {
          root: { data: { childrenIds: ['h1'] } },
          h1: {
            type: 'Heading',
            data: {
              style: { color: '{{textColor}}' },
              props: { text: 'Colorful', level: 'h2' },
            },
          },
        },
        slots: {
          textColor: { label: 'Text Color', type: 'color', defaultValue: '#000000' },
        },
      },
    ];
    const result = renderEmailToHtml(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['cb1'] } },
        },
        cb1: {
          type: 'CustomBlock',
          data: { props: { blockName: 'Banner', slotValues: { textColor: '#E91E63' } } },
        },
      },
      { customBlocks }
    );
    expect(result).toContain('Colorful');
    expect(result).toContain('#E91E63');
  });

  it('resolves CustomBlocks with table slot rendered as HTML', () => {
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
    const result = renderEmailToHtml(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['cb1'] } },
        },
        cb1: {
          type: 'CustomBlock',
          data: {
            props: {
              blockName: 'Receipt',
              slotValues: {
                items: [
                  { label: 'Subtotal', value: '$80.00' },
                  { label: 'Tax', value: '$6.40' },
                  { label: 'Total', value: '$86.40' },
                ],
              },
            },
          },
        },
      },
      { customBlocks }
    );
    expect(result).toContain('<table');
    expect(result).toContain('Subtotal');
    expect(result).toContain('$80.00');
    expect(result).toContain('Tax');
    expect(result).toContain('$86.40');
  });

  it('renders same custom block multiple times with different values', () => {
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Badge',
        config: {
          root: { data: { childrenIds: ['t1'] } },
          t1: { type: 'Text', data: { props: { text: '{{label}}' } } },
        },
        slots: {
          label: { label: 'Label', type: 'text', defaultValue: 'Badge' },
        },
      },
    ];
    const result = renderEmailToHtml(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['cb1', 'cb2'] } },
        },
        cb1: {
          type: 'CustomBlock',
          data: { props: { blockName: 'Badge', slotValues: { label: 'Active' } } },
        },
        cb2: {
          type: 'CustomBlock',
          data: { props: { blockName: 'Badge', slotValues: { label: 'Pending' } } },
        },
      },
      { customBlocks }
    );
    expect(result).toContain('Active');
    expect(result).toContain('Pending');
  });

  it('renders a full email with EmailLayout, custom blocks, and all block types', () => {
    const customBlocks: CustomBlockEntry[] = [
      {
        name: 'Hero',
        config: {
          root: { data: { childrenIds: ['img1', 'h1'] } },
          img1: {
            type: 'Image',
            data: { style: { opacity: 0.8 }, props: { url: 'https://example.com/hero.png' } },
          },
          h1: {
            type: 'Heading',
            data: { style: { fontWeight: '600' }, props: { text: '{{title}}', level: 'h1' } },
          },
        },
        slots: {
          title: { label: 'Title', type: 'text', defaultValue: 'Default Title' },
        },
      },
    ];
    const result = renderEmailToHtml(
      {
        root: {
          type: 'EmailLayout',
          data: {
            backdropColor: '#F5F5F5',
            canvasColor: '#FFFFFF',
            textColor: '#333333',
            fontFamily: 'INTER',
            paddingVertical: 32,
            paddingHorizontal: 16,
            mobilePaddingVertical: 8,
            mobilePaddingHorizontal: 4,
            childrenIds: ['cb1', 'divider', 'spacer'],
          },
        },
        cb1: {
          type: 'CustomBlock',
          data: { props: { blockName: 'Hero', slotValues: { title: 'Welcome Aboard' } } },
        },
        divider: {
          type: 'Divider',
          data: { props: { lineColor: '#EEEEEE', lineHeight: 2 } },
        },
        spacer: {
          type: 'Spacer',
          data: { props: { height: 32 } },
        },
      },
      { customBlocks, fontUrl: 'https://fonts.example.com/inter.css' }
    );
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Welcome Aboard');
    expect(result).toContain('opacity:0.8');
    expect(result).toContain('font-weight:600');
    expect(result).toContain('#EEEEEE');
    expect(result).toContain('height:32px');
    expect(result).toContain('@media only screen and (max-width: 600px)');
    expect(result).toContain('padding: 8px 4px !important');
    expect(result).toContain('href="https://fonts.example.com/inter.css"');
  });
});
