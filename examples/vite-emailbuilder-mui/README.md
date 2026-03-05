# Email Builder – Vite + MUI Example

A self-hosted email builder powered by [EmailBuilder.js](https://github.com/nickel-org/email-builder-js), built with React, Vite, and Material UI.

## Features

- **Visual email editor** – drag-and-drop blocks (text, image, button, heading, divider, avatar, spacer, HTML, columns) to compose email templates.
- **File System API integration** – open, save, and manage template and block files directly from the browser using the native File System Access API.
- **Custom block editing** – create reusable blocks with configurable **slot definitions** (text, HTML, color, number, table). Slots make parts of a block dynamic so they can be filled in when the block is placed inside a template.
- **Live preview** – switch between editor, HTML source, JSON, and rendered preview tabs.
- **Responsive testing** – toggle between desktop and mobile viewport sizes.
- **Inspector drawer** – three sidebar tabs:
  - **Styles** – global document styles (background color, font family, etc.).
  - **Inspect** – block-level property configuration for the selected block.
  - **Slots** – define and manage slot definitions when editing a custom block.

## Getting started

```bash
cd examples/vite-emailbuilder-mui
npm install
npx vite
```

Open http://localhost:5173/email-builder-js/ once the dev server is running.

## Project structure

```
src/
├── App/
│   ├── InspectorDrawer/       # Sidebar with Styles, Inspect, and Slots tabs
│   │   ├── ConfigurationPanel.tsx
│   │   ├── SlotDefinitionsPanel.tsx
│   │   └── StylesPanel.tsx
│   ├── SamplesDrawer/         # Built-in sample templates
│   └── TemplatePanel/         # Main editor area & file system integration
│       └── FileSystem/        # File open/save/block management via FS Access API
├── documents/
│   ├── blocks/                # Block registration & rendering
│   └── editor/                # Editor state (Zustand store)
└── index.tsx
```
