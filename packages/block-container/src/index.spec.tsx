import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Container, ContainerPropsSchema } from '.';

describe('block-container', () => {
  it('renders with default values', () => {
    expect(render(<Container />).asFragment()).toMatchSnapshot();
  });

  it('renders with children', () => {
    expect(
      render(
        <Container>
          <p>First child</p>
          <p>Second child</p>
        </Container>
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with RGBA background color', () => {
    expect(
      render(
        <Container style={{ backgroundColor: '#FF000080' }}>
          <span>Content</span>
        </Container>
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with RGBA border color', () => {
    expect(
      render(
        <Container style={{ borderColor: '#0000FF40' }}>
          <span>Bordered</span>
        </Container>
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with all style properties', () => {
    expect(
      render(
        <Container
          style={{
            backgroundColor: '#EEEEEE',
            borderColor: '#CCCCCC',
            borderRadius: 12,
            padding: { top: 16, bottom: 16, left: 24, right: 24 },
          }}
        >
          <span>Fully styled</span>
        </Container>
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders without children (self-closing div)', () => {
    expect(
      render(
        <Container style={{ backgroundColor: '#F5F5F5' }} />
      ).asFragment()
    ).toMatchSnapshot();
  });

  describe('schema validation', () => {
    it('accepts 6-digit hex color', () => {
      expect(ContainerPropsSchema.safeParse({ style: { backgroundColor: '#FF0000' } }).success).toBe(true);
    });

    it('accepts 8-digit hex color (RGBA)', () => {
      expect(ContainerPropsSchema.safeParse({ style: { backgroundColor: '#FF000080' } }).success).toBe(true);
    });

    it('accepts RGBA border color', () => {
      expect(ContainerPropsSchema.safeParse({ style: { borderColor: '#00FF0040' } }).success).toBe(true);
    });

    it('rejects invalid color format', () => {
      expect(ContainerPropsSchema.safeParse({ style: { backgroundColor: 'red' } }).success).toBe(false);
      expect(ContainerPropsSchema.safeParse({ style: { borderColor: '#XYZ' } }).success).toBe(false);
    });

    it('accepts padding object', () => {
      expect(
        ContainerPropsSchema.safeParse({
          style: { padding: { top: 10, bottom: 10, left: 20, right: 20 } },
        }).success
      ).toBe(true);
    });

    it('accepts borderRadius', () => {
      expect(ContainerPropsSchema.safeParse({ style: { borderRadius: 8 } }).success).toBe(true);
    });
  });
});
