import React, { useMemo } from 'react';

import { renderToStaticMarkup } from '@push-labs/email-builder';

import resolveCustomBlocks from '../../documents/blocks/CustomBlock/resolveCustomBlocks';
import { useCustomBlocksStore } from '../../documents/blocks/helpers/EditorChildrenIds/AddBlockMenu/useCustomBlocks';
import { useDocument } from '../../documents/editor/EditorContext';

import HighlightedCodePanel from './helper/HighlightedCodePanel';

export default function HtmlPanel() {
  const document = useDocument();
  const customBlocks = useCustomBlocksStore((s) => s.customBlocks);
  const resolvedDocument = useMemo(() => resolveCustomBlocks(document, customBlocks), [document, customBlocks]);
  const code = useMemo(
    () => renderToStaticMarkup(resolvedDocument as never, { rootBlockId: 'root' }),
    [resolvedDocument]
  );
  return <HighlightedCodePanel type="html" value={code} />;
}
