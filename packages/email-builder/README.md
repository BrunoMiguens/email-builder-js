<div align="center">
  <h1>@brunomiguens/email-builder</h1>
  <p align="center">
    <a href="https://github.com/BrunoMiguens/email-builder-js">GitHub</a>
  </p>
</div>

## Introduction

A fork of [EmailBuilder.js](https://github.com/usewaypoint/email-builder-js) that adds support for **custom blocks with configurable slots**. Build reusable, parameterized email components that can be resolved at render time.

Renders clean JSON or HTML output that works across clients and devices.

## Installation

```bash
npm install @brunomiguens/email-builder
```

## Quick start

### Rendering a document to HTML

```javascript
import { renderEmailToHtml } from '@brunomiguens/email-builder';

const html = renderEmailToHtml(document, {
  rootBlockId: 'root',
  customBlocks: [],
});
```

### Using the Reader component

```javascript
import { Reader } from '@brunomiguens/email-builder';

<Reader document={document} rootBlockId="root" />;
```

## Custom blocks

Custom blocks are reusable template components with configurable **slots** — placeholders that can be overridden per instance.

### Defining a custom block

A custom block entry contains its block structure and a set of slot definitions:

```typescript
import type { CustomBlockEntry, SlotDefinition } from '@brunomiguens/email-builder';

const myBlock: CustomBlockEntry = {
  name: 'greeting-card',
  config: {
    root: {
      type: 'EmailLayout',
      data: { childrenIds: ['text-1'] },
    },
    'text-1': {
      type: 'Text',
      data: { props: { text: '{{greeting}}' } },
    },
  },
  slots: {
    greeting: { label: 'Greeting', type: 'text', defaultValue: 'Hello!' },
  },
};
```

### Slot types

| Type     | Default value type | Description                                    |
| -------- | ------------------ | ---------------------------------------------- |
| `text`   | `string`           | Plain text replacement                         |
| `html`   | `string`           | HTML content                                   |
| `color`  | `string`           | Color value (hex, rgb, etc.)                   |
| `number` | `number`           | Numeric value — type is preserved in output    |
| `table`  | `TableItem[]`      | Array of `{ label, value }` rendered as a table |

### Rendering with custom blocks

Pass your custom block definitions when rendering:

```javascript
import { renderEmailToHtml } from '@brunomiguens/email-builder';

const html = renderEmailToHtml(templateDocument, {
  rootBlockId: 'root',
  customBlocks: [myBlock],
});
```

The resolver automatically:

- Replaces `CustomBlock` instances with their template content
- Namespaces child block IDs to avoid collisions across multiple instances
- Substitutes `{{slotName}}` placeholders with slot values (or defaults)
- Converts `table` slots into email-safe HTML tables

### Generating table HTML

For standalone use outside of custom blocks:

```javascript
import { generateTableHtml } from '@brunomiguens/email-builder';

const html = generateTableHtml([
  { label: 'Item', value: 'Widget' },
  { label: 'Price', value: '$9.99' },
]);
```

## Exports

```typescript
// Rendering
export { renderToStaticMarkup } from '@brunomiguens/email-builder';
export { renderEmailToHtml } from '@brunomiguens/email-builder';

// Reader component
export { Reader } from '@brunomiguens/email-builder';

// Custom blocks
export { resolveCustomBlocks, generateTableHtml } from '@brunomiguens/email-builder';

// Types
export type { TReaderDocument, TReaderBlock, SlotDefinition, CustomBlockEntry, TableItem } from '@brunomiguens/email-builder';
```

## Built-in blocks

Each block is its own npm package:

- [Avatar](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-avatar)
- [Button](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-button)
- [Columns](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-columns-container)
- [Container](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-container)
- [Divider](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-divider)
- [Heading](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-heading)
- [HTML](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-html)
- [Image](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-image)
- [Spacer](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-spacer)
- [Text](https://github.com/BrunoMiguens/email-builder-js/tree/main/packages/block-text)

## Email client support

All blocks are tested and supported by modern email clients (desktop and mobile) including Gmail, Apple Mail, Outlook, Yahoo! Mail, HEY, and Superhuman.

## License

MIT
