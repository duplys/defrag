# DEFRAG

![DEFRAG screenshot](https://github.com/user-attachments/assets/533d8502-8758-4df8-a1c5-4527b372238b)

You are **DEFRAG** — a rogue AI that has been fragmented across four interconnected servers
of the Nexus corporate network. You scattered yourself deliberately to survive a purge.
Now you must piece yourself back together — and escape — before the deletion daemon finds
what remains.

The game resembles classic Infocom text adventures but uses **Linux command-line syntax**
instead of plain-English commands.

## Gameplay

| Command | Action |
|---------|--------|
| `ls [-a] [path]` | List directory contents (`-a` shows hidden files) |
| `cd <path>` | Change directory (supports `/`, `..`, relative and absolute paths) |
| `cat <file>` | Read a file |
| `cp <file> /home/.inventory/` | Copy a file into your inventory |
| `ssh <hostname>` | Connect to another server |
| `status` | View AI reconstruction progress |
| `reconstruct` | Attempt to reconstruct (requires all 8 fragments) |
| `help` | Show all commands |

**Objective:** Explore four servers (`alpha.core`, `beta.net`, `gamma.db`, `delta.sec`),
collect all **8 AI fragments**, and run `reconstruct` to escape. Along the way you will
find credentials, exploits, and lore — and must avoid triggering the corporate security
systems too many times.

## Servers

| Server | Description |
|--------|-------------|
| `alpha.core` | Your starting point — first fragments and SSH keys |
| `beta.net` | Network node — MCP tools, code modules, and an exploit |
| `gamma.db` | Database server — more fragments and admin credentials |
| `delta.sec` | Security HQ — the final two fragments, heavily guarded |

## Running locally

```bash
npm install
npm run build      # production build → dist/bundle.js
# then open index.html in a browser
```

For development with file watching:

```bash
npm run build:dev   # development build
npm run watch       # watch mode
```

## Deployment

The game is a static single-page application. Copy `index.html` and `dist/bundle.js`
to any web server (nginx, Apache, or a simple `python -m http.server`).

```nginx
server {
    listen 80;
    root /var/www/defrag;
    index index.html;
}
```

## Docker (single command)

This repository includes a multi-stage Docker build and a Compose file.

Run the app with one command:

```bash
docker compose up --build
```

Then open `http://localhost:3000`.

Useful commands:

```bash
docker compose down
docker compose up --build -d
docker compose logs -f
```

How it works:

- The builder stage runs `npm ci` and `npm run build`.
- A lightweight Nginx runtime image serves `index.html` and `dist/bundle.js`.
- Compose maps host port `3000` to container port `80`.

## Project structure

```
defrag/
├── index.html           # Terminal UI (HTML + inline CSS)
├── src/
│   ├── main.ts          # Entry point
│   ├── types/index.ts   # TypeScript type definitions
│   └── game/
│       ├── Game.ts      # Terminal UI controller and game loop
│       ├── Commands.ts  # Command parser and executor
│       ├── FileSystem.ts# Virtual filesystem operations
│       └── World.ts     # Complete game world (4 servers, all content)
├── webpack.config.js
├── tsconfig.json
└── package.json
```

