import { marked, Renderer } from 'marked';
import React, { CSSProperties, useMemo } from 'react';
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS: string[] = [
  'a',
  'article',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'del',
  'details',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'ins',
  'kbd',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'section',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];
const GENERIC_ALLOWED_ATTRIBUTES = ['style', 'title'];
const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

/**
 * True when a URL is safe to emit in an href/src.
 *
 * sanitize-html's own allowedSchemes only rejects values whose scheme it recognises, so a
 * payload like `'javascript:alert(1)` — where a stray quote makes the scheme unparseable —
 * is treated as a relative URL and kept. Browsers will not execute it, but the sanitizer it
 * replaced (insane) dropped it, and we do not ship a weaker filter than the one before.
 */
function isSafeUrl(value: string): boolean {
  if (value === '') {
    return true;
  }
  // Everything before the first "/", "?" or "#" is the scheme candidate when it ends in ":".
  const scheme = /^([^/?#]*):/.exec(value);
  if (scheme === null) {
    return true; // relative URL — no scheme to validate
  }
  return ALLOWED_SCHEMES.includes(scheme[1].toLowerCase());
}

function dropUnsafeUrl(attribute: 'href' | 'src') {
  return (tagName: string, attribs: Record<string, string>) => {
    if (attribs[attribute] !== undefined && !isSafeUrl(attribs[attribute])) {
      delete attribs[attribute];
    }
    return { tagName, attribs };
  };
}

function sanitizer(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedSchemes: ALLOWED_SCHEMES,
    transformTags: {
      a: dropUnsafeUrl('href'),
      img: dropUnsafeUrl('src'),
    },
    allowedAttributes: {
      ...ALLOWED_TAGS.reduce<Record<string, string[]>>((res, tag) => {
        res[tag] = [...GENERIC_ALLOWED_ATTRIBUTES];
        return res;
      }, {}),
      img: ['src', 'alt', 'width', 'height', ...GENERIC_ALLOWED_ATTRIBUTES],
      table: ['width', ...GENERIC_ALLOWED_ATTRIBUTES],
      td: ['align', 'width', ...GENERIC_ALLOWED_ATTRIBUTES],
      th: ['align', 'width', ...GENERIC_ALLOWED_ATTRIBUTES],
      a: ['href', 'target', ...GENERIC_ALLOWED_ATTRIBUTES],
      ol: ['start', ...GENERIC_ALLOWED_ATTRIBUTES],
      ul: ['start', ...GENERIC_ALLOWED_ATTRIBUTES],
    },
    // Inline styles are emitted by the markdown renderer itself and must survive
    // untouched; sanitize-html only filters style values when allowedStyles is set.
    allowedStyles: undefined,
    // The markdown renderer emits well-formed HTML, so entity re-encoding is not needed.
    disallowedTagsMode: 'discard',
  });
}

function createCustomRenderer(linkColor?: string) {
  const renderer = new Renderer();

  renderer.table = (header: string, body: string) => {
    return `<table width="100%">
<thead>
${header}</thead>
<tbody>
${body}</tbody>
</table>`;
  };

  renderer.paragraph = (text: string) => {
    return `<p style="margin:0;">${text}</p>`;
  };

  renderer.link = (href: string, title: string | null, text: string) => {
    const titleAttr = title ? ` title="${title}"` : '';
    if (linkColor) {
      return `<a href="${href}"${titleAttr} target="_blank" style="color: ${linkColor}; text-decoration: underline;"><span style="color: ${linkColor};">${text}</span></a>`;
    }
    return `<a href="${href}"${titleAttr} target="_blank">${text}</a>`;
  };

  return renderer;
}

function renderMarkdownString(str: string, linkColor?: string): string {
  const html = marked.parse(str, {
    async: false,
    breaks: true,
    gfm: true,
    pedantic: false,
    silent: false,
    renderer: createCustomRenderer(linkColor),
  });
  if (typeof html !== 'string') {
    throw new Error('marked.parse did not return a string');
  }
  return sanitizer(html);
}

type Props = {
  style: CSSProperties;
  markdown: string;
  linkColor?: string;
};
export default function EmailMarkdown({ markdown, linkColor, ...props }: Props) {
  const data = useMemo(() => renderMarkdownString(markdown, linkColor), [markdown, linkColor]);
  return <div {...props} dangerouslySetInnerHTML={{ __html: data }} />;
}
