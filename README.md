# Foundry Planner

A browser-based planning tool for laying out teams and annotations on the Foundry battle map.

**Live:** https://nickmacdona.github.io/foundry-planner/

## What it does

- **30 Join + 20 Sub slots** in a roster you can rename, assign an icon to (Shield / Swords / Plus / Shovel), and drag onto the map.
- **Zoomable, pannable map** with a 20 px grid snap. The Foundry v1.0 map art is the background; placed icons and annotations live in map-space so they scale/pan together.
- **Annotations** — arrows, boxes, circles, and text — with select / move / resize / recolor / delete. Double-click text to edit.
- **Color picker** with 9 presets (amber, red, green, blue, purple, pink, cyan, white, black) and a hex input for custom colors. The active color applies to new annotations and, if something is selected, to that annotation too.
- **Export / Import** the full state as a base64 string so a plan can be copied to someone else or saved off-line.
- **Auto-save** to `localStorage` so refreshes don't lose work.
- **Mobile layout** — below 768 px the right blade and bottom toolbar collapse into a single bottom panel (~33 vh) with Join / Sub / Annotate tabs.

## How state is stored

All persisted state lives under the `foundry-planner` key in `localStorage`, versioned so the schema can evolve without wiping saves. A migration pass currently handles the v1 → v2 jump (adding the 20 dedicated Sub slots).

Export/Import round-trips the full state (players, placements, annotations, active tab, current color) as UTF-8-safe base64 JSON. Imports are shape-validated before they replace state.

## Tech stack

- **Vite + React + TypeScript**
- **Tailwind CSS v3** for styling
- **[@dnd-kit/core](https://dndkit.com/)** + `@dnd-kit/modifiers` for drag-and-drop (centered-on-cursor DragOverlay preview)
- **[react-zoom-pan-pinch](https://github.com/BetterTyped/react-zoom-pan-pinch)** for the zoomable map surface
- **[zustand](https://github.com/pmndrs/zustand)** with the `persist` middleware for state + localStorage auto-save
- **[lucide-react](https://lucide.dev/)** for icons

## Local development

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # type-check + production build into dist/
```

## Project layout

```
src/
├── App.tsx                  # DndContext, layout switch (desktop grid vs mobile panel)
├── types.ts                 # Player / Placement / Annotation / AppState + constants
├── store/useAppStore.ts     # zustand + persist middleware + v2 migration
├── lib/
│   ├── grid.ts              # snap + screenToMap coord conversion
│   ├── serialize.ts         # base64 export / import w/ shape validation
│   ├── useIsMobile.ts       # matchMedia hook (<768 px)
│   └── ids.ts               # tiny id generator
└── components/
    ├── MapSurface.tsx       # TransformWrapper + droppable + MapContext
    ├── MapGrid.tsx          # Foundry map image + overlay grid lines
    ├── PlacedIcon.tsx       # Draggable icon + name label on the map
    ├── AnnotationLayer.tsx  # SVG overlay + arrowhead marker def
    ├── AnnotationItem.tsx   # Select / move / resize / edit / color
    ├── AnnotationColorPicker.tsx
    ├── RosterBlade.tsx      # Desktop right blade
    ├── RosterItem.tsx       # Row w/ inline rename + icon picker + drag
    ├── RosterTabs.tsx       # Join | Sub segmented control
    ├── BottomToolbar.tsx    # Desktop bottom bar (tools + color + export/import)
    ├── MobilePanel.tsx      # Combined mobile panel w/ Join/Sub/Annotate tabs
    ├── DragPreview.tsx      # DragOverlay contents
    ├── ExportImportBar.tsx  # Desktop export/import/reset
    ├── IconPicker.tsx       # Shield → Swords → Plus → Shovel cycle
    └── MapContext.tsx       # Shares MapSurfaceHandle with nested children
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds with `npm ci && npm run build` and publishes `dist/` to GitHub Pages. Vite's `base` is set to `/foundry-planner/` so assets resolve correctly under the subpath.
