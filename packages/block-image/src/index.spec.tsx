import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Image, ImagePropsSchema } from '.';

describe('block-image', () => {
  it('renders with default values', () => {
    expect(render(<Image />).asFragment()).toMatchSnapshot();
  });

  it('renders with opacity', () => {
    expect(
      render(
        <Image
          style={{ opacity: 0.5 }}
          props={{ url: 'https://example.com/logo.png', alt: 'Logo' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with full opacity (1)', () => {
    expect(
      render(
        <Image
          style={{ opacity: 1 }}
          props={{ url: 'https://example.com/logo.png' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with zero opacity', () => {
    expect(
      render(
        <Image
          style={{ opacity: 0 }}
          props={{ url: 'https://example.com/logo.png' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with RGBA background color', () => {
    expect(
      render(
        <Image
          style={{ backgroundColor: '#FF000080' }}
          props={{ url: 'https://example.com/image.png' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with link wrapping', () => {
    expect(
      render(
        <Image
          props={{ url: 'https://example.com/image.png', linkHref: 'https://example.com' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with all style and props', () => {
    expect(
      render(
        <Image
          style={{
            padding: { top: 10, bottom: 10, left: 20, right: 20 },
            backgroundColor: '#CCCCCC',
            textAlign: 'center',
            opacity: 0.8,
          }}
          props={{
            width: 200,
            height: 100,
            url: 'https://example.com/banner.png',
            alt: 'Banner',
            linkHref: 'https://example.com',
            contentAlignment: 'top',
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  describe('schema validation', () => {
    it('accepts 6-digit hex color', () => {
      const result = ImagePropsSchema.safeParse({ style: { backgroundColor: '#FF0000' } });
      expect(result.success).toBe(true);
    });

    it('accepts 8-digit hex color (RGBA)', () => {
      const result = ImagePropsSchema.safeParse({ style: { backgroundColor: '#FF000080' } });
      expect(result.success).toBe(true);
    });

    it('rejects invalid color format', () => {
      const result = ImagePropsSchema.safeParse({ style: { backgroundColor: 'red' } });
      expect(result.success).toBe(false);
    });

    it('rejects 3-digit hex color', () => {
      const result = ImagePropsSchema.safeParse({ style: { backgroundColor: '#F00' } });
      expect(result.success).toBe(false);
    });

    it('accepts valid opacity values', () => {
      expect(ImagePropsSchema.safeParse({ style: { opacity: 0 } }).success).toBe(true);
      expect(ImagePropsSchema.safeParse({ style: { opacity: 0.5 } }).success).toBe(true);
      expect(ImagePropsSchema.safeParse({ style: { opacity: 1 } }).success).toBe(true);
    });

    it('rejects opacity out of range', () => {
      expect(ImagePropsSchema.safeParse({ style: { opacity: -0.1 } }).success).toBe(false);
      expect(ImagePropsSchema.safeParse({ style: { opacity: 1.1 } }).success).toBe(false);
    });

    it('accepts null and undefined opacity', () => {
      expect(ImagePropsSchema.safeParse({ style: { opacity: null } }).success).toBe(true);
      expect(ImagePropsSchema.safeParse({ style: {} }).success).toBe(true);
    });
  });
});
