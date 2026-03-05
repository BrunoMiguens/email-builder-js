import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Text, TextPropsSchema } from '.';

describe('block-text', () => {
  it('renders with default values', () => {
    expect(render(<Text />).asFragment()).toMatchSnapshot();
  });

  it('sanitizes HTML', () => {
    expect(
      render(
        <Text
          props={{
            markdown: true,
            text: `
<script>alert(1)</script>
<img src=x onerror=alert(1) />

[a](javascript:prompt(document.cookie))
[Basic](javascript:alert('Basic'))
[Local Storage](javascript:alert(JSON.stringify(localStorage)))
[CaseInsensitive](JaVaScRiPt:alert('CaseInsensitive'))
[URL](javascript://www.google.com%0Aalert('URL'))

[In Quotes]('javascript:alert("InQuotes")')
[a](j a v a s c r i p t:prompt(document.cookie))
[a](data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K)
[a](javascript:window.onerror=alert;throw%201)
![Uh oh...]("onerror="alert('XSS'))
![Uh oh...](https://www.example.com/image.png"onload="alert('XSS'))
![Escape SRC - onload](https://www.example.com/image.png"onload="alert('ImageOnLoad'))
![Escape SRC - onerror]("onerror="alert('ImageOnError'))

<div>
<img src />
<a>link 1</a>
<a href>link 2</a>
<a href="">link 3</a>
<a title>link 4</a>
<a title="">link 5</a>
<a href="ftp://domain.name">link 6</a>
<a href="javascript:alert('hello world')">link 7</a>
</div>
`,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with safe markdown', () => {
    expect(
      render(
        <Text
          props={{
            text: `This <span onClick="alert('!')">text</span> block has the **Markdown** option *turned on*.

- One
- Two
- Three

Powered by [Waypoint](https://usewaypoint.com)`,
            markdown: true,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders without markdown', () => {
    expect(
      render(
        <Text
          props={{
            text: `## This is not <span>markdown</span>`,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight 300 (light)', () => {
    expect(
      render(<Text style={{ fontWeight: '300' }} props={{ text: 'Light text' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight 500 (medium)', () => {
    expect(
      render(<Text style={{ fontWeight: '500' }} props={{ text: 'Medium text' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight 600 (semibold)', () => {
    expect(
      render(<Text style={{ fontWeight: '600' }} props={{ text: 'Semibold text' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight 700', () => {
    expect(render(<Text style={{ fontWeight: '700' }} props={{ text: 'Bold text' }} />).asFragment()).toMatchSnapshot();
  });

  it('renders with font weight bold (legacy)', () => {
    expect(
      render(<Text style={{ fontWeight: 'bold' }} props={{ text: 'Legacy bold text' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with font weight normal (legacy)', () => {
    expect(
      render(<Text style={{ fontWeight: 'normal' }} props={{ text: 'Legacy normal text' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with RGBA colors', () => {
    expect(
      render(
        <Text
          style={{
            color: '#33333380',
            backgroundColor: '#FF000033',
            linkColor: '#0066CCAA',
          }}
          props={{ text: 'Text with transparent colors', markdown: false }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with all style properties', () => {
    expect(
      render(
        <Text
          style={{
            color: '#111111',
            backgroundColor: '#F0F0F0',
            fontSize: 18,
            fontFamily: 'BOOK_SERIF' as const,
            fontWeight: '500',
            textAlign: 'center' as const,
            letterSpacing: 1,
            lineHeight: 28,
            padding: { top: 12, bottom: 12, left: 16, right: 16 },
          }}
          props={{ text: 'Fully styled text block' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders markdown paragraphs with zero margin', () => {
    const { container } = render(<Text props={{ text: 'First paragraph\n\nSecond paragraph', markdown: true }} />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
    paragraphs.forEach((p) => {
      expect(p.style.margin).toBe('0px');
    });
  });

  it('renders markdown with link color applied to links', () => {
    const { container } = render(
      <Text style={{ linkColor: '#0066CC' }} props={{ text: '[Click](https://example.com)', markdown: true }} />
    );
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.style.color).toBe('rgb(0, 102, 204)');
  });

  it('renders with Inter font family', () => {
    expect(
      render(<Text style={{ fontFamily: 'INTER' as const }} props={{ text: 'Inter text' }} />).asFragment()
    ).toMatchSnapshot();
  });

  describe('schema validation', () => {
    it('accepts 6-digit hex color', () => {
      expect(TextPropsSchema.safeParse({ style: { color: '#FF0000' } }).success).toBe(true);
    });

    it('accepts 8-digit hex color (RGBA)', () => {
      expect(TextPropsSchema.safeParse({ style: { color: '#FF000080' } }).success).toBe(true);
    });

    it('accepts RGBA for link color', () => {
      expect(TextPropsSchema.safeParse({ style: { linkColor: '#0066CCAA' } }).success).toBe(true);
    });

    it('rejects invalid color format', () => {
      expect(TextPropsSchema.safeParse({ style: { color: 'red' } }).success).toBe(false);
      expect(TextPropsSchema.safeParse({ style: { color: '#F00' } }).success).toBe(false);
    });

    it('accepts all numeric font weight values', () => {
      for (const weight of ['300', '400', '500', '600', '700']) {
        expect(TextPropsSchema.safeParse({ style: { fontWeight: weight } }).success).toBe(true);
      }
    });

    it('accepts bold and normal font weight', () => {
      expect(TextPropsSchema.safeParse({ style: { fontWeight: 'bold' } }).success).toBe(true);
      expect(TextPropsSchema.safeParse({ style: { fontWeight: 'normal' } }).success).toBe(true);
    });

    it('rejects invalid font weight', () => {
      expect(TextPropsSchema.safeParse({ style: { fontWeight: '100' } }).success).toBe(false);
      expect(TextPropsSchema.safeParse({ style: { fontWeight: 'bolder' } }).success).toBe(false);
    });
  });
});
