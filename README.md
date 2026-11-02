# Dungeon Escape

A browser-based 2D dungeon adventure built with **Phaser 3, TypeScript, React, and Vite**. Explore dungeon rooms, collect items, avoid traps, defeat enemies, and find the exit.

## Features

- **Tile-based movement** with keyboard and mobile touch controls
- **Multiple levels** with progressively more challenging layouts
- **Enemies** with patrol behavior, including Slimes and Skeletons
- **Combat system** with adjacent attacks
- **Health system** with temporary damage invulnerability
- **Collectibles and inventory** including keys, potions, and treasure
- **Traps and collision detection**
- **Level progression** and score tracking
- **Local save system** using IndexedDB
- **Pause, restart, and level transition controls**
- **Progressive Web App (PWA)** support for installation and offline use

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Application and game logic |
| Phaser 3 | 2D game engine |
| Vite | Development server and build tool |
| Zustand | State management |
| IndexedDB / idb | Local progress persistence |
| vite-plugin-pwa | PWA support |
| Vitest | Testing |

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/ElenaHeydari/dungeon-escape.git
cd dungeon-escape
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

### Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Controls

### Keyboard

| Key | Action |
|---|---|
| W / A / S / D | Move |
| Arrow keys | Move |
| Space | Attack |
| E | Interact |
| H | Use a potion |
| Esc | Pause / Resume |
| R | Restart |
| N | Go to the next level after completing a level |

### Mobile

Use the on-screen directional pad and action buttons. Touch controls are displayed on touch-oriented or smaller screens.

## Project Structure

```text
src/
├── components/       # React UI components and touch controls
├── game/
│   ├── core/         # Phaser game configuration and core systems
│   ├── entities/     # Player and enemy entities
│   ├── maps/         # Level map data
│   ├── scenes/       # Phaser scenes
│   └── systems/      # Inventory, health, saving, and level systems
├── styles/           # Application styles
└── main.tsx          # Application entry point

public/               # Static assets and PWA icons
```

*The structure above is a high-level overview; folders may evolve as development continues.*

## Save Data

Game progress is stored locally in the browser using IndexedDB. Saved progress is specific to the browser and device and is not automatically synchronized between devices.

## Progressive Web App

Dungeon Escape can be installed as a PWA on supported browsers. Once the application has been loaded and its assets cached, supported gameplay resources can be available offline.

## Deployment

```text
https://ElenaHeydari.github.io/dungeon-escape/
```


## License

No license has been assigned yet. Unless a license is added to this repository, all rights are reserved by the copyright holder.