import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';

import Reader, { TReaderDocument } from '../Reader/core';

type TOptions = {
  rootBlockId: string;
  fontUrl?: string;
};

function buildResponsiveStyles(document: TReaderDocument, rootBlockId: string): string | null {
  const rootBlock = document[rootBlockId];
  if (!rootBlock || rootBlock.type !== 'EmailLayout') {
    return null;
  }
  const data = rootBlock.data as Record<string, unknown>;
  const mobilePaddingVertical = data?.mobilePaddingVertical;
  if (mobilePaddingVertical == null) {
    return null;
  }
  return `@media only screen and (max-width: 600px) { .email-layout-root { padding: ${mobilePaddingVertical}px 0 !important; } }`;
}

export default function renderToStaticMarkup(document: TReaderDocument, { rootBlockId, fontUrl }: TOptions) {
  const responsiveCss = buildResponsiveStyles(document, rootBlockId);
  return (
    '<!DOCTYPE html>' +
    baseRenderToStaticMarkup(
      <html>
        <head>
          {fontUrl && <link rel="stylesheet" href={fontUrl} />}
          {responsiveCss && <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />}
        </head>
        <body>
          <Reader document={document} rootBlockId={rootBlockId} />
        </body>
      </html>
    )
  );
}
