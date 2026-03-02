import { CustomBlockEntry } from './customBlocks/types';
import resolveCustomBlocks from './customBlocks/resolveCustomBlocks';
import { TReaderDocument } from './Reader/core';
import renderToStaticMarkup from './renderers/renderToStaticMarkup';

type Options = {
  rootBlockId?: string;
  customBlocks?: CustomBlockEntry[];
  fontUrl?: string;
};

export default function renderEmailToHtml(document: Record<string, unknown>, options: Options = {}): string {
  const { rootBlockId = 'root', customBlocks = [], fontUrl } = options;
  const resolved =
    customBlocks.length > 0
      ? resolveCustomBlocks(document as Parameters<typeof resolveCustomBlocks>[0], customBlocks)
      : (document as TReaderDocument);
  return renderToStaticMarkup(resolved, { rootBlockId, fontUrl });
}
