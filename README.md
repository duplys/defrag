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

## Deploying on Hetzner VPS with Docker

This section walks you through deploying DEFRAG on a [Hetzner](https://www.hetzner.com/)
Virtual Private Server (VPS) using Docker.

### 1. Prerequisites

- A [Hetzner Cloud](https://console.hetzner.cloud/) account
- An SSH key pair — generate one locally if you don't have one:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Upload the public key (`~/.ssh/id_ed25519.pub`) to
**Hetzner Cloud → Security → SSH Keys** before creating the server.

### 2. Create a Hetzner Cloud server

1. Open [Hetzner Cloud Console](https://console.hetzner.cloud/) and select your project.
2. Click **+ New server** and choose:
   - **Location** — pick the region closest to your users.
   - **Image** — Ubuntu 24.04 (LTS).
   - **Type** — `CX22` (2 vCPUs, 4 GB RAM) is more than enough.
   - **SSH keys** — select the key you uploaded above.
   - **Firewall** (optional but recommended) — create a firewall that allows:
     - Inbound TCP port `22` (SSH)
     - Inbound TCP port `80` (HTTP)
     - Inbound TCP port `443` (HTTPS, if you plan to add TLS)
3. Click **Create & Buy now**.  Note the server's public IP address.

### 3. Connect to the server

```bash
ssh root@<your-server-ip>
```

### 4. Install Docker

```bash
# Update package index
apt-get update && apt-get upgrade -y

# Install prerequisites
apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key and repository
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and the Compose plugin
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify the installation
docker --version
docker compose version
```

### 5. Clone the repository and deploy

```bash
# Clone the repo
git clone https://github.com/duplys/defrag.git
cd defrag

# Build the image and start the container in the background
docker compose up --build -d
```

The game is now running on port `3000`. Verify with:

```bash
docker compose ps
curl http://localhost:3000
```

Open `http://<your-server-ip>:3000` in a browser to play.

Useful operations:

```bash
docker compose logs -f        # stream container logs
docker compose down           # stop and remove the container
docker compose up --build -d  # rebuild and restart after a code change
```

### 6. (Optional) Custom domain and HTTPS with a host Nginx reverse proxy

The Docker container's Nginx already listens on port 80 internally. If you want
to serve the app at a custom domain with HTTPS, the recommended approach is to
keep the container bound to `127.0.0.1:3000` and place a host-level Nginx
reverse proxy in front of it. Certbot can then manage TLS for the host Nginx.

**a) Bind the container to localhost only**

By default `docker-compose.yml` maps `"3000:80"`, which exposes port 3000 on
**all** network interfaces. When using a reverse proxy, restrict it to
`127.0.0.1` so the container is only reachable from the host itself:

```yaml
ports:
  - "127.0.0.1:3000:80"
```

Restart the container:

```bash
docker compose down
docker compose up -d
```

**b) Install host Nginx and Certbot**

```bash
apt-get install -y nginx certbot python3-certbot-nginx
```

**c) Create an Nginx site**

```bash
cat > /etc/nginx/sites-available/defrag << 'EOF'
server {
    listen 80;
    server_name yourdomain.example.com;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/defrag /etc/nginx/sites-enabled/defrag
nginx -t && systemctl reload nginx
```

**d) Obtain a TLS certificate**

Point an A record for `yourdomain.example.com` at your server IP, then run:

```bash
certbot --nginx -d yourdomain.example.com
```

Certbot will update the host Nginx config with HTTPS and configure automatic
certificate renewal. Your DEFRAG instance will now be reachable at
`https://yourdomain.example.com`.

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

