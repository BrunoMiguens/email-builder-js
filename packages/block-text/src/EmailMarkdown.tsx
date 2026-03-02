import insane, { AllowedTags } from 'insane';
import { marked, Renderer } from 'marked';
import React, { CSSProperties, useMemo } from 'react';

const ALLOWED_TAGS: AllowedTags[] = [
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

function sanitizer(html: string): string {
  return insane(html, {
    allowedTags: ALLOWED_TAGS,
    allowedSchemes: ['http', 'https', 'mailto'],
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
    filter: (token) => {
      if (token.tag === 'a' && 'href' in token.attrs && token.attrs.href === undefined) {
        token.attrs.href = '';
      }
      if (token.tag === 'img' && 'src' in token.attrs && token.attrs.src === undefined) {
        token.attrs.src = '';
      }
      return true;
    },
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
