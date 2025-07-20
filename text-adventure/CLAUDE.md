# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a browser-based text adventure game built with vanilla JavaScript, HTML, and CSS. The game simulates a sci-fi emergency response scenario where the player navigates through a research facility to contain a security breach.

## Development Commands
This is a static web project with no build process or dependencies. To run the game:

```bash
# Serve the files using any HTTP server, for example:
python3 -m http.server 8000
# Or using Node.js:
npx serve .
# Then open http://localhost:8000 in a browser
```

No build, test, or lint commands are configured as this is a simple static web project.

## Code Architecture

### Core Structure
The game is implemented as a single class `TextAdventure` in `game.js:1` with the following key responsibilities:

- **Game State Management**: Tracks player location, inventory, health, score, and mission progress in `this.gameState` (game.js:5-14)
- **Procedural Generation**: Creates random locations with descriptions, items, and exits using `generateLocation()` (game.js:142-244)
- **Mission System**: Structured mission progression with sub-missions and a final objective (game.js:399-517)
- **Keyboard Input**: Event-driven keyboard handling for game controls (game.js:55-107)

### Key Components

**Location Generation** (game.js:142-244):
- Uses predefined location types, adjectives, and contextual descriptions
- Randomly places items and creates exits
- Each location type has specific atmospheric descriptions

**Mission System** (game.js:374-517):
- Sequential sub-missions that unlock the main objective
- Collection-based missions (find specific items)
- Progress tracking with visual feedback
- Mission completion triggers unlock progression

**Text Display System** (game.js:590-620):
- Typewriter effect for immersive text output
- Color-coded text for different message types
- Automatic scrolling and terminal-style interface

### Game Flow
1. Initialize with intro sequence
2. Generate starting location
3. Process keyboard input through event handlers
4. Update game state based on actions
5. Generate new locations on movement
6. Track mission progress and unlock final objective

### Styling
Uses terminal/console aesthetic with:
- Monospace fonts and green-on-black color scheme
- CSS classes for different text colors (game.js:16-25 in style.css)
- Responsive keyboard legend and scrollable output area
- Blinking cursor animation for authentic terminal feel