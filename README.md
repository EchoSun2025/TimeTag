# TimeTag

A minimalist time tracking application with intuitive timeline visualization.

## Tech Stack

- **Runtime**: Electron 28+
- **Frontend**: React 18 + TypeScript 5
- **Build Tool**: Vite 5
- **State Management**: Zustand 4
- **Styling**: Tailwind CSS 3
- **Drag & Drop**: @dnd-kit/core 6
- **Database**: Dexie.js 4 (IndexedDB)
- **Packaging**: electron-builder 24

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Lint
npm run lint
```

## Build

```bash
# Build for Windows (Portable)
npm run build:win

# Build for Linux (AppImage)
npm run build:linux

# Build for both platforms
npm run build:all
```

## Features

- **Timeline View**: Visual 24-hour timeline with drag-and-drop editing
- **Time Rounding**: Optional 15-minute rounding
- **Tag System**: Color-coded tags with filtering
- **Week Overview**: 5-day or 7-day week view
- **Keyboard Shortcuts**: Alt+X to start/stop recording
- **Cross-platform**: Windows and Linux support

## Project Structure

```
timetag/
├── electron/           # Electron main process
│   ├── main.ts
│   └── preload.ts
├── src/               # React renderer process
│   ├── components/    # UI components
│   ├── stores/        # Zustand stores
│   ├── lib/          # Utilities and database
│   ├── types/        # TypeScript types
│   ├── App.tsx       # Main app component
│   └── main.tsx      # Entry point
└── dist/             # Build output
```

## License

MIT
