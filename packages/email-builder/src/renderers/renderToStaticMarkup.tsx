import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';

import Reader, { TReaderDocument } from '../Reader/core';

type TOptions = {
  rootBlockId: string;
  fontUrl?: string;
};
export default function renderToStaticMarkup(document: TReaderDocument, { rootBlockId, fontUrl }: TOptions) {
  return (
    '<!DOCTYPE html>' +
    baseRenderToStaticMarkup(
      <html>
        <head>{fontUrl && <link rel="stylesheet" href={fontUrl} />}</head>
        <body>
          <Reader document={document} rootBlockId={rootBlockId} />
        </body>
      </html>
    )
  );
}
