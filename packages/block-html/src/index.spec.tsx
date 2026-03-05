import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Html, HtmlPropsSchema } from '.';

describe('block-html', () => {
  it('renders with default values', () => {
    expect(render(<Html />).asFragment()).toMatchSnapshot();
  });

  it('renders with HTML contents', () => {
    expect(
      render(<Html props={{ contents: '<strong>Bold text</strong><em>Italic</em>' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with RGBA colors', () => {
    expect(
      render(
        <Html
          style={{
            color: '#33333380',
            backgroundColor: '#0000FF20',
          }}
          props={{ contents: '<p>Transparent</p>' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with Inter font family', () => {
    expect(
      render(<Html style={{ fontFamily: 'INTER' as const }} props={{ contents: '<p>Inter font</p>' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with all style properties', () => {
    expect(
      render(
        <Html
          style={{
            color: '#111111',
            backgroundColor: '#F5F5F5',
            fontFamily: 'MODERN_SERIF' as const,
            fontSize: 14,
            textAlign: 'center' as const,
            padding: { top: 8, bottom: 8, left: 16, right: 16 },
          }}
          props={{ contents: '<h2>Title</h2><p>Content</p>' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders empty div when no contents', () => {
    const { container } = render(<Html style={{ backgroundColor: '#EEEEEE' }} />);
    const div = container.querySelector('div');
    expect(div).toBeTruthy();
    expect(div?.innerHTML).toBe('');
  });

  describe('schema validation', () => {
    it('accepts 6-digit hex color', () => {
      expect(HtmlPropsSchema.safeParse({ style: { color: '#FF0000' } }).success).toBe(true);
    });

    it('accepts 8-digit hex color (RGBA)', () => {
      expect(HtmlPropsSchema.safeParse({ style: { color: '#FF000080' } }).success).toBe(true);
      expect(HtmlPropsSchema.safeParse({ style: { backgroundColor: '#00FF0040' } }).success).toBe(true);
    });

    it('rejects invalid color format', () => {
      expect(HtmlPropsSchema.safeParse({ style: { color: 'blue' } }).success).toBe(false);
    });

    it('accepts Inter font family', () => {
      expect(HtmlPropsSchema.safeParse({ style: { fontFamily: 'INTER' } }).success).toBe(true);
    });

    it('accepts all font families', () => {
      const families = [
        'MODERN_SANS',
        'BOOK_SANS',
        'ORGANIC_SANS',
        'GEOMETRIC_SANS',
        'HEAVY_SANS',
        'ROUNDED_SANS',
        'MODERN_SERIF',
        'BOOK_SERIF',
        'MONOSPACE',
        'INTER',
      ];
      for (const fontFamily of families) {
        expect(HtmlPropsSchema.safeParse({ style: { fontFamily } }).success).toBe(true);
      }
    });

    it('rejects invalid font family', () => {
      expect(HtmlPropsSchema.safeParse({ style: { fontFamily: 'COMIC_SANS' } }).success).toBe(false);
    });

    it('accepts text alignment options', () => {
      for (const textAlign of ['left', 'center', 'right']) {
        expect(HtmlPropsSchema.safeParse({ style: { textAlign } }).success).toBe(true);
      }
    });
  });
});
