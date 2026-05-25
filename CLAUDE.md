# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Pages repository containing multiple web applications and projects:

- **Portfolio Site Root**: Static hosting for multiple web applications
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

### ICD Diagnostics (`/icdiags/`)
Blazor WebAssembly application with pre-built output. No build commands available in current setup.

### Flashcards App (`/flashcards/`)
Flutter web application with pre-built output. No build commands available in current setup.

## Code Architecture

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

- ICD Diagnostics: `icdiags/index.html` (Blazor entry point)
- Flashcards: `flashcards/index.html` (Flutter entry point)
- Local server: `server.js` (development server)
