import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Button, ButtonPropsSchema } from '.';

describe('block-button', () => {
  it('renders with default values', () => {
    expect(render(<Button />).asFragment()).toMatchSnapshot();
  });

  it('renders with font weight bold', () => {
    expect(
      render(
        <Button style={{ fontWeight: 'bold' }} props={{ text: 'Click me', url: 'https://example.com' }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight 300 (light)', () => {
    expect(
      render(
        <Button style={{ fontWeight: '300' }} props={{ text: 'Light button', url: 'https://example.com' }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight 500 (medium)', () => {
    expect(
      render(
        <Button style={{ fontWeight: '500' }} props={{ text: 'Medium button', url: 'https://example.com' }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight 600 (semibold)', () => {
    expect(
      render(
        <Button style={{ fontWeight: '600' }} props={{ text: 'Semibold button', url: 'https://example.com' }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight normal', () => {
    expect(
      render(
        <Button style={{ fontWeight: 'normal' }} props={{ text: 'Normal button', url: 'https://example.com' }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with RGBA background color', () => {
    expect(
      render(
        <Button
          style={{ backgroundColor: '#0000FF80' }}
          props={{
            text: 'Transparent BG',
            url: 'https://example.com',
            buttonBackgroundColor: '#FF000099',
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with full style and props', () => {
    expect(
      render(
        <Button
          style={{
            backgroundColor: '#EEEEEE',
            fontSize: 18,
            fontFamily: 'MODERN_SERIF' as const,
            fontWeight: '600',
            textAlign: 'center' as const,
            padding: { top: 10, bottom: 10, left: 20, right: 20 },
          }}
          props={{
            text: 'Styled button',
            url: 'https://example.com/action',
            buttonBackgroundColor: '#336699',
            buttonTextColor: '#FFFFFF',
            buttonStyle: 'pill' as const,
            fullWidth: true,
            size: 'large' as const,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  describe('schema validation', () => {
    it('accepts 6-digit hex color', () => {
      const result = ButtonPropsSchema.safeParse({ style: { backgroundColor: '#FF0000' } });
      expect(result.success).toBe(true);
    });

    it('accepts 8-digit hex color (RGBA)', () => {
      const result = ButtonPropsSchema.safeParse({ style: { backgroundColor: '#FF000080' } });
      expect(result.success).toBe(true);
    });

    it('accepts RGBA for button colors', () => {
      const result = ButtonPropsSchema.safeParse({
        props: {
          buttonBackgroundColor: '#33669980',
          buttonTextColor: '#FFFFFFCC',
        },
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid color format', () => {
      const result = ButtonPropsSchema.safeParse({ style: { backgroundColor: 'rgb(255,0,0)' } });
      expect(result.success).toBe(false);
    });

    it('accepts all numeric font weight values', () => {
      for (const weight of ['300', '400', '500', '600', '700']) {
        const result = ButtonPropsSchema.safeParse({ style: { fontWeight: weight } });
        expect(result.success).toBe(true);
      }
    });

    it('accepts bold and normal font weight', () => {
      expect(ButtonPropsSchema.safeParse({ style: { fontWeight: 'bold' } }).success).toBe(true);
      expect(ButtonPropsSchema.safeParse({ style: { fontWeight: 'normal' } }).success).toBe(true);
    });

    it('rejects invalid font weight', () => {
      expect(ButtonPropsSchema.safeParse({ style: { fontWeight: '800' } }).success).toBe(false);
      expect(ButtonPropsSchema.safeParse({ style: { fontWeight: 'lighter' } }).success).toBe(false);
    });
  });
});
