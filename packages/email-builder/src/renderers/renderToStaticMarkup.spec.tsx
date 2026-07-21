/**
 * @jest-environment node
 */

import { describe, expect, it } from '@jest/globals';

import renderToStaticMarkup from './renderToStaticMarkup';

describe('renderToStaticMarkup', () => {
  it('renders into a string', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: {
              childrenIds: [],
            },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toEqual('<!DOCTYPE html><html><head></head><body><div></div></body></html>');
  });

  it('renders an image with opacity', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['img1'] },
          },
        },
        img1: {
          type: 'Image',
          data: {
            style: { opacity: 0.5 },
            props: { url: 'https://example.com/logo.png', alt: 'Logo' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('opacity:0.5');
    expect(result).toContain('src="https://example.com/logo.png"');
    expect(result).toContain('alt="Logo"');
  });

  it('renders an image without opacity when not set', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['img1'] },
          },
        },
        img1: {
          type: 'Image',
          data: {
            props: { url: 'https://example.com/photo.png' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).not.toContain('opacity');
    expect(result).toContain('src="https://example.com/photo.png"');
  });

  it('renders an image with link wrapping', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['img1'] },
          },
        },
        img1: {
          type: 'Image',
          data: {
            props: { url: 'https://example.com/banner.png', linkHref: 'https://example.com' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('src="https://example.com/banner.png"');
  });

  it('renders a button with numeric font weight', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['btn1'] },
          },
        },
        btn1: {
          type: 'Button',
          data: {
            style: { fontWeight: '600' },
            props: { text: 'Click me', url: 'https://example.com' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('font-weight:600');
    expect(result).toContain('Click me');
  });

  it('renders a button with bold font weight', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['btn1'] },
          },
        },
        btn1: {
          type: 'Button',
          data: {
            style: { fontWeight: 'bold' },
            props: { text: 'Bold button', url: 'https://example.com' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('font-weight:700');
  });

  it('renders a heading with numeric font weight', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['h1'] },
          },
        },
        h1: {
          type: 'Heading',
          data: {
            style: { fontWeight: '300' },
            props: { text: 'Light heading', level: 'h1' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('font-weight:300');
    expect(result).toContain('<h1');
    expect(result).toContain('Light heading');
  });

  it('renders a heading with all levels', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['h1', 'h2', 'h3'] },
          },
        },
        h1: {
          type: 'Heading',
          data: { props: { text: 'H1 Title', level: 'h1' } },
        },
        h2: {
          type: 'Heading',
          data: { props: { text: 'H2 Title', level: 'h2' } },
        },
        h3: {
          type: 'Heading',
          data: { props: { text: 'H3 Title', level: 'h3' } },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('<h1');
    expect(result).toContain('H1 Title');
    expect(result).toContain('font-size:32');
    expect(result).toContain('<h2');
    expect(result).toContain('H2 Title');
    expect(result).toContain('font-size:24');
    expect(result).toContain('<h3');
    expect(result).toContain('H3 Title');
    expect(result).toContain('font-size:20');
  });

  it('renders text with numeric font weight', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['t1'] },
          },
        },
        t1: {
          type: 'Text',
          data: {
            style: { fontWeight: '500' },
            props: { text: 'Medium weight text' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('font-weight:500');
    expect(result).toContain('Medium weight text');
  });

  it('renders text without font weight when not set', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: ['t1'] },
          },
        },
        t1: {
          type: 'Text',
          data: {
            props: { text: 'Default weight' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).not.toContain('font-weight');
    expect(result).toContain('Default weight');
  });

  it('renders with RGBA background colors', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            style: { backgroundColor: '#FF000080' },
            props: { childrenIds: [] },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('background-color:#FF000080');
  });

  it('renders EmailLayout with responsive mobile padding', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            backdropColor: '#F5F5F5',
            canvasColor: '#FFFFFF',
            textColor: '#262626',
            paddingVertical: 32,
            paddingHorizontal: 0,
            mobilePaddingVertical: 16,
            mobilePaddingHorizontal: 8,
            childrenIds: [],
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('@media only screen and (max-width: 600px)');
    expect(result).toContain('.email-layout-root');
    expect(result).toContain('padding: 16px 8px !important');
    expect(result).toContain('padding:32px 0px');
  });

  it('renders EmailLayout without responsive styles when no mobile padding', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            childrenIds: [],
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).not.toContain('@media');
    expect(result).not.toContain('<style');
  });

  it('renders EmailLayout with RGBA border and backdrop colors', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            backdropColor: '#00000033',
            borderColor: '#CCCCCC80',
            canvasColor: '#FFFFFFEE',
            childrenIds: [],
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('background-color:#00000033');
    expect(result).toContain('1px solid #CCCCCC80');
    expect(result).toContain('background-color:#FFFFFFEE');
  });

  it('renders with font URL', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: { childrenIds: [] },
          },
        },
      },
      { rootBlockId: 'root', fontUrl: 'https://fonts.googleapis.com/css?family=Inter' }
    );
    expect(result).toContain('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter"/>');
  });

  it('renders a complex document with multiple block types', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            backdropColor: '#F0F0F0',
            canvasColor: '#FFFFFF',
            textColor: '#333333',
            childrenIds: ['heading', 'image', 'text', 'button', 'divider', 'spacer'],
          },
        },
        heading: {
          type: 'Heading',
          data: {
            style: { fontWeight: '600', color: '#111111' },
            props: { text: 'Welcome', level: 'h1' },
          },
        },
        image: {
          type: 'Image',
          data: {
            style: { opacity: 0.9, textAlign: 'center' },
            props: { url: 'https://example.com/hero.png', alt: 'Hero' },
          },
        },
        text: {
          type: 'Text',
          data: {
            style: { fontWeight: '400', fontSize: 16 },
            props: { text: 'Thank you for joining us.' },
          },
        },
        button: {
          type: 'Button',
          data: {
            style: { fontWeight: '700' },
            props: { text: 'Get Started', url: 'https://example.com/start' },
          },
        },
        divider: {
          type: 'Divider',
          data: {
            props: { lineColor: '#DDDDDD', lineHeight: 1 },
          },
        },
        spacer: {
          type: 'Spacer',
          data: {
            props: { height: 24 },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html>');
    expect(result).toContain('Welcome');
    expect(result).toContain('opacity:0.9');
    expect(result).toContain('font-weight:600');
    expect(result).toContain('font-weight:400');
    expect(result).toContain('font-weight:700');
    expect(result).toContain('Thank you for joining us.');
    expect(result).toContain('Get Started');
    expect(result).toContain('https://example.com/start');
    expect(result).toContain('height:24px');
    expect(result).toContain('#DDDDDD');
  });

  it('renders Container with nested children', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            style: { backgroundColor: '#EEEEEE', borderColor: '#CCCCCC', borderRadius: 8 },
            props: { childrenIds: ['t1', 't2'] },
          },
        },
        t1: {
          type: 'Text',
          data: { props: { text: 'First child' } },
        },
        t2: {
          type: 'Text',
          data: { props: { text: 'Second child' } },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('First child');
    expect(result).toContain('Second child');
    expect(result).toContain('background-color:#EEEEEE');
    expect(result).toContain('1px solid #CCCCCC');
    expect(result).toContain('border-radius:8');
  });

  it('renders ColumnsContainer with children in columns', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['cols1'] } },
        },
        cols1: {
          type: 'ColumnsContainer',
          data: {
            props: {
              columnsCount: 2,
              columns: [{ childrenIds: ['left'] }, { childrenIds: ['right'] }, { childrenIds: [] }],
            },
          },
        },
        left: { type: 'Text', data: { props: { text: 'Left column' } } },
        right: { type: 'Text', data: { props: { text: 'Right column' } } },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('Left column');
    expect(result).toContain('Right column');
    expect(result).toContain('<table');
  });

  it('renders EmailLayout with horizontal and vertical padding', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            paddingVertical: 40,
            paddingHorizontal: 20,
            childrenIds: [],
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('padding:40px 20px');
  });

  it('renders EmailLayout with default zero padding', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            childrenIds: [],
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('padding:0px 0px');
  });

  it('renders EmailLayout with Inter font family', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            fontFamily: 'INTER',
            childrenIds: [],
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('Inter');
    expect(result).toContain('BlinkMacSystemFont');
  });

  it('renders EmailLayout with maxWidth and borderRadius', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            maxWidth: 480,
            borderRadius: 12,
            childrenIds: [],
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('max-width:480px');
    expect(result).toContain('border-radius:12');
  });

  it('renders markdown text with zero-margin paragraphs', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['t1'] } },
        },
        t1: {
          type: 'Text',
          data: {
            props: { text: 'First paragraph\n\nSecond paragraph', markdown: true },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    // The sanitiser re-serialises CSS declarations, so assert the rule rather than its spacing.
    expect(result).toMatch(/<p style="margin:\s*0;?">/);
    expect(result).toContain('First paragraph');
    expect(result).toContain('Second paragraph');
  });

  it('renders markdown with link color', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['t1'] } },
        },
        t1: {
          type: 'Text',
          data: {
            style: { linkColor: '#0066CC' },
            props: { text: '[Click here](https://example.com)', markdown: true },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toMatch(/color:\s*#0066CC/);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('Click here');
  });

  it('renders Html block with contents', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['html1'] } },
        },
        html1: {
          type: 'Html',
          data: {
            style: { fontFamily: 'INTER', fontSize: 14 },
            props: { contents: '<strong>Custom HTML</strong>' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('<strong>Custom HTML</strong>');
    expect(result).toContain('Inter');
    expect(result).toContain('font-size:14');
  });

  it('renders Container with RGBA border color', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            style: { borderColor: '#FF000080' },
            props: { childrenIds: [] },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('1px solid #FF000080');
  });

  it('renders Divider with RGBA line color', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['d1'] } },
        },
        d1: {
          type: 'Divider',
          data: {
            style: { backgroundColor: '#00FF0033' },
            props: { lineColor: '#99999980', lineHeight: 3 },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('#99999980');
    expect(result).toContain('3px solid');
    expect(result).toContain('background-color:#00FF0033');
  });

  it('renders EmailLayout with only mobilePaddingVertical (fallback paddingHorizontal to 0)', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'EmailLayout',
          data: {
            paddingVertical: 24,
            paddingHorizontal: 16,
            mobilePaddingVertical: 8,
            childrenIds: [],
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('@media only screen and (max-width: 600px)');
    expect(result).toContain('padding: 8px 16px !important');
  });

  it('renders Avatar block', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: { props: { childrenIds: ['a1'] } },
        },
        a1: {
          type: 'Avatar',
          data: {
            style: { textAlign: 'center' },
            props: { imageUrl: 'https://example.com/avatar.png', size: 48, shape: 'circle' },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toContain('src="https://example.com/avatar.png"');
    expect(result).toContain('border-radius:48');
    expect(result).toContain('width:48');
    expect(result).toContain('height:48');
  });
});
