import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Divider, DividerPropsSchema } from '.';

describe('Divider', () => {
  it('renders with default values', () => {
    expect(render(<Divider />).asFragment()).toMatchSnapshot();
  });

  it('renders with props', () => {
    expect(
      render(
        <Divider
          style={{
            padding: { top: 1, left: 2, bottom: 3, right: 4 },
            backgroundColor: '#fff000',
          }}
          props={{ lineColor: '#444222', lineHeight: 10 }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with RGBA background color', () => {
    expect(render(<Divider style={{ backgroundColor: '#FF000033' }} />).asFragment()).toMatchSnapshot();
  });

  it('renders with RGBA line color', () => {
    expect(render(<Divider props={{ lineColor: '#99999980', lineHeight: 2 }} />).asFragment()).toMatchSnapshot();
  });

  describe('schema validation', () => {
    it('accepts 6-digit hex colors', () => {
      expect(DividerPropsSchema.safeParse({ style: { backgroundColor: '#FF0000' } }).success).toBe(true);
      expect(DividerPropsSchema.safeParse({ props: { lineColor: '#333333' } }).success).toBe(true);
    });

    it('accepts 8-digit hex colors (RGBA)', () => {
      expect(DividerPropsSchema.safeParse({ style: { backgroundColor: '#FF000080' } }).success).toBe(true);
      expect(DividerPropsSchema.safeParse({ props: { lineColor: '#33333380' } }).success).toBe(true);
    });

    it('rejects invalid color format', () => {
      expect(DividerPropsSchema.safeParse({ style: { backgroundColor: 'red' } }).success).toBe(false);
      expect(DividerPropsSchema.safeParse({ props: { lineColor: '#F00' } }).success).toBe(false);
    });

    it('accepts line height', () => {
      expect(DividerPropsSchema.safeParse({ props: { lineHeight: 5 } }).success).toBe(true);
    });
  });
});
