export { default as renderToStaticMarkup } from './renderers/renderToStaticMarkup';
export { default as renderEmailToHtml } from './renderEmailToHtml';

export {
  ReaderBlockSchema,
  TReaderBlock,
  //
  ReaderDocumentSchema,
  TReaderDocument,
  //
  ReaderBlock,
  TReaderBlockProps,
  //
  TReaderProps,
  default as Reader,
} from './Reader/core';

export { default as resolveCustomBlocks, generateTableHtml } from './customBlocks/resolveCustomBlocks';
export type { TableItem, SlotDefinition, CustomBlockEntry } from './customBlocks/types';
