# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Pages repository containing multiple web applications and projects:

- **Portfolio Site Root**: Static hosting for multiple web applications
- **Text Adventure Game** (`/text-adventure/`): Browser-based sci-fi emergency response game
- **Jingler** (`/jingler/`): Web-based automatic jingle generator with musical notation
- **ICD Diagnostics** (`/icdiags/`): Blazor WebAssembly app for ICD-10 diagnostic code search
- **Flashcards App** (`/flashcards/`): Flutter web app for interactive flashcard learning

## Development Commands

### Root Level (GitHub Pages hosting)
```bash
# Start local development server
node server.js

# Or use any static file server
python3 -m http.server 8000
npx serve .
```

### Jingler Application (`/jingler/`)
```bash
cd jingler
npm install        # Install dependencies (vexflow)
npm start          # Run application (starts jingler.js)
```

### Text Adventure Game (`/text-adventure/`)
No build process required - static HTML/CSS/JS files. Serve using any HTTP server.

### ICD Diagnostics (`/icdiags/`)
Blazor WebAssembly application with pre-built output. No build commands available in current setup.

### Flashcards App (`/flashcards/`)
Flutter web application with pre-built output. No build commands available in current setup.

## Code Architecture

### Text Adventure Game
- **Single-class architecture**: `TextAdventure` class in `game.js` handles all game logic
- **Procedural generation**: Random locations with contextual descriptions and items
- **Mission system**: Sequential sub-missions leading to main objective completion
- **Keyboard-driven input**: Event-based controls with visual feedback
- **Terminal aesthetic**: Monospace fonts, green-on-black styling, typewriter effects

### Jingler Music Generator
- **Tone.js integration**: Web Audio API synthesis with 6 synthesizer types
- **VexFlow notation**: Real-time musical staff rendering and PNG export
- **Scale system**: 15 predefined musical scales (major/minor in various keys)
- **Jingle management**: Local storage, playback controls, note editing capabilities
- **Responsive UI**: Collapsible settings panel with modern CSS Grid/Flexbox

### ICD Diagnostics
- **Blazor WebAssembly**: C# application compiled to WebAssembly
- **Entity Framework**: SQLite database integration for diagnostic codes
- **Voice input**: JavaScript integration for speech recognition
- **Bootstrap styling**: Responsive UI components

### Flashcards App
- **Flutter framework**: Dart-based web application
- **Asset management**: CSV data files for various subject categories
- **Progressive Web App**: Manifest and service worker configuration

## Project Structure Conventions

Each application maintains its own:
- Self-contained directory structure
- Independent dependency management
- Specific HTML entry points
- Isolated styling and assets

The root level serves as a GitHub Pages hosting container with a simple Node.js server for local development.

## Key File Locations

- Text Adventure: `text-adventure/game.js` (main game logic)
- Jingler: `jingler/jingler.js` (music generation), `jingler/package.json` (dependencies)
- ICD Diagnostics: `icdiags/index.html` (Blazor entry point)
- Flashcards: `flashcards/index.html` (Flutter entry point)
- Local server: `server.js` (development server)