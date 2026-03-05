import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Heading, HeadingPropsSchema } from '.';

describe('Heading', () => {
  it('renders with default values', () => {
    expect(render(<Heading />).asFragment()).toMatchSnapshot();
  });

  it('renders with style', () => {
    const style = {
      backgroundColor: '#444333',
      color: '#101010',
      fontFamily: 'HEAVY_SANS' as const,
      fontWeight: '400' as const,
      padding: {
        top: 15,
        bottom: 10,
        left: 24,
        right: 8,
      },
      textAlign: 'center' as const,
    };
    const props = {
      text: 'Hello world!',
      level: 'h1' as const,
    };
    expect(render(<Heading style={style} props={props} />).asFragment()).toMatchSnapshot();
  });

  it('renders h1 with font weight 700', () => {
    expect(
      render(
        <Heading style={{ fontWeight: '700' }} props={{ text: 'Bold heading', level: 'h1' as const }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders h2 with font weight 300 (light)', () => {
    expect(
      render(
        <Heading style={{ fontWeight: '300' }} props={{ text: 'Light heading', level: 'h2' as const }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders h3 with font weight 500 (medium)', () => {
    expect(
      render(
        <Heading style={{ fontWeight: '500' }} props={{ text: 'Medium heading', level: 'h3' as const }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight 600 (semibold)', () => {
    expect(
      render(<Heading style={{ fontWeight: '600' }} props={{ text: 'Semibold heading' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight bold (legacy)', () => {
    expect(
      render(<Heading style={{ fontWeight: 'bold' }} props={{ text: 'Bold legacy heading' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight normal (legacy)', () => {
    expect(
      render(<Heading style={{ fontWeight: 'normal' }} props={{ text: 'Normal weight heading' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with RGBA colors', () => {
    expect(
      render(
        <Heading
          style={{
            color: '#00000080',
            backgroundColor: '#FF000033',
          }}
          props={{ text: 'Transparent heading' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with all style properties', () => {
    expect(
      render(
        <Heading
          style={{
            color: '#333333',
            backgroundColor: '#F5F5F5',
            fontFamily: 'MODERN_SERIF' as const,
            fontWeight: '500',
            textAlign: 'right' as const,
            letterSpacing: 2,
            lineHeight: 40,
            padding: { top: 20, bottom: 20, left: 10, right: 10 },
          }}
          props={{ text: 'Fully styled heading', level: 'h1' as const }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  describe('schema validation', () => {
    it('accepts 6-digit hex color', () => {
      const result = HeadingPropsSchema.safeParse({ style: { color: '#FF0000' } });
      expect(result.success).toBe(true);
    });

    it('accepts 8-digit hex color (RGBA)', () => {
      const result = HeadingPropsSchema.safeParse({ style: { color: '#FF000080' } });
      expect(result.success).toBe(true);
    });

    it('rejects invalid color format', () => {
      expect(HeadingPropsSchema.safeParse({ style: { color: 'red' } }).success).toBe(false);
      expect(HeadingPropsSchema.safeParse({ style: { color: '#GG0000' } }).success).toBe(false);
    });

    it('accepts all numeric font weight values', () => {
      for (const weight of ['300', '400', '500', '600', '700']) {
        expect(HeadingPropsSchema.safeParse({ style: { fontWeight: weight } }).success).toBe(true);
      }
    });

    it('accepts bold and normal font weight', () => {
      expect(HeadingPropsSchema.safeParse({ style: { fontWeight: 'bold' } }).success).toBe(true);
      expect(HeadingPropsSchema.safeParse({ style: { fontWeight: 'normal' } }).success).toBe(true);
    });

    it('rejects invalid font weight', () => {
      expect(HeadingPropsSchema.safeParse({ style: { fontWeight: '200' } }).success).toBe(false);
      expect(HeadingPropsSchema.safeParse({ style: { fontWeight: '800' } }).success).toBe(false);
    });

    it('accepts all heading levels', () => {
      for (const level of ['h1', 'h2', 'h3']) {
        expect(HeadingPropsSchema.safeParse({ props: { level } }).success).toBe(true);
      }
    });

    it('rejects invalid heading level', () => {
      expect(HeadingPropsSchema.safeParse({ props: { level: 'h4' } }).success).toBe(false);
    });
  });
});
