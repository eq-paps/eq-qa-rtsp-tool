# RTSP Stream Tool

A lightweight, local-first RTSP streaming server for simulating camera feeds. Upload short video files and broadcast them as RTSP streams over your local network.

## Overview

- Upload video files via a modern web UI
- Extract metadata (duration, resolution, FPS) automatically
- Create multiple concurrent RTSP streams with configurable frame rate and loop settings
- Start/stop streams on demand
- Copy RTSP URLs and your machine's IPv4 for quick client setup

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, react-icons |
| Backend | Node.js 20, Express, Multer |
| Streaming | FFmpeg, MediaMTX |
| DevOps | Docker, Docker Compose |

## Prerequisites

- **Node.js** 18+ and **npm**
- **FFmpeg** (`ffprobe` must be in your PATH)
- **Docker** and **Docker Compose** (for MediaMTX and production deployment)

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to your PATH.

## Quick Start

### Development (Recommended for daily work)

The `dev.sh` script spins up everything you need locally with hot-reload:

```bash
# First-time setup
npm run setup

# Start dev mode
npm run dev
```

What happens:
1. Checks for Node.js, npm, and FFmpeg
2. Installs dependencies if needed
3. Starts MediaMTX via Docker on port `8554`
4. Starts the backend with `node --watch` on port `3000`
5. Starts the Vite frontend dev server on port `5173`

Press `Ctrl+C` to gracefully shut everything down.

| Service | URL |
|---------|-----|
| Frontend UI | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| RTSP Server | rtsp://localhost:8554 |

### Production / Full Docker

For a containerized deployment or to share the tool on another machine:

```bash
docker compose up --build
```

### Running as a Network Server (Streaming to Other Machines)

If you want other devices on your LAN (e.g., phones, tablets, smart displays) to consume the RTSP streams, follow these steps on the **host machine**.

#### 1. Pull the repo

```bash
git clone <your-repo-url>
cd rtsp-test
```

#### 2. Install prerequisites

- **Docker & Docker Compose** — [Install Docker](https://docs.docker.com/get-docker/)
- **FFmpeg** — required by the backend to transcode and push streams

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install ffmpeg
```

#### 3. Configure environment variables

The backend generates RTSP URLs using `MEDIAMTX_HOST`. By default this is `localhost`, which only works on the same machine. For remote clients, set it to your **host machine's LAN IP** (e.g., `192.168.1.42`).

You can find your IP in the app's top bar, or run:

```bash
# macOS / Linux
ipconfig getifaddr en0   # or `hostname -I`

# Windows
ipconfig
```

Create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
MEDIAMTX_HOST=192.168.1.42
MEDIAMTX_PORT=8554
EOF
```

> Replace `192.168.1.42` with your actual LAN IP.

#### 4. Start the stack

**Option A — Development mode (native Node + Docker for MediaMTX):**

```bash
source .env
./dev.sh
```

**Option B — Full Docker (easiest for sharing):**

```bash
# Pass the env vars into the containers
docker compose up --build
```

> In full Docker mode, update `docker-compose.yml` to pass `MEDIAMTX_HOST` to the backend service, or create a `docker-compose.override.yml`.

#### 5. Open firewall ports

Ensure the host machine allows inbound connections:

| Port | Protocol | Purpose |
|------|----------|---------|
| `5173` | TCP | Web UI |
| `3000` | TCP | API |
| `8554` | TCP | RTSP |
| `8888` | TCP | HLS (optional) |

**macOS:**
```bash
# Add Firewall exceptions in System Settings → Network → Firewall
# Or disable for local networks only
```

**Ubuntu (UFW):**
```bash
sudo ufw allow 5173/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8554/tcp
```

#### 6. Access from another machine

On the **client device**, open VLC or any RTSP player and use the URL shown in the web UI. It should look like:

```
rtsp://192.168.1.42:8554/stream-a1b2c3d4
```

**VLC command line:**
```bash
vlc rtsp://192.168.1.42:8554/stream-a1b2c3d4 --rtsp-tcp
```

**Tips:**
- If the URL still shows `localhost`, refresh the browser or restart the backend after updating `.env`.
- Both devices must be on the same network, or routing must be configured between subnets.
- For Wi-Fi clients, ensure the host machine is on the same SSID and not isolated (disable AP/client isolation if needed).

| Service | URL |
|---------|-----|
| Frontend UI | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| RTSP Server | rtsp://localhost:8554 |
| HLS Player | http://localhost:8888 |
| WebRTC | http://localhost:8889 |

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry
│   │   ├── routes/
│   │   │   ├── videos.js         # Upload / list / delete videos
│   │   │   ├── streams.js        # Create / start / stop / delete streams
│   │   │   └── system.js         # IPv4 discovery
│   │   └── services/
│   │       ├── storage.js        # JSON file-based DB + FFmpeg metadata
│   │       └── streamManager.js  # FFmpeg process lifecycle
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Root layout + tab switching
│   │   └── components/
│   │       ├── TopBar.jsx        # IPv4 badge + title
│   │       ├── UploadDropzone.jsx
│   │       ├── VideoLibrary.jsx / VideoCard.jsx
│   │       ├── StreamGrid.jsx / StreamCard.jsx
│   │       ├── StreamForm.jsx    # FPS / loop config modal
│   │       ├── CopyButton.jsx
│   │       └── StatusPill.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── dev.sh                        # One-command local dev script
├── mediamtx.yml                  # MediaMTX configuration
└── data/                         # Persistent uploads + app-db.json
```

## Architecture

### Data Flow

1. **Upload** → Backend stores file in `data/uploads/` and runs `ffprobe` to extract metadata. Record saved to `data/app-db.json`.
2. **Create Stream** → Backend generates a path slug (e.g., `stream-a1b2c3d4`). The RTSP URL is pre-computed using the MediaMTX host and port.
3. **Start Stream** → Backend spawns FFmpeg, pushing the video into MediaMTX at the generated path.
4. **Playback** → Any RTSP client connects to `rtsp://<host>:8554/<path-slug>`.

### Storage (v1)

File-based JSON at `data/app-db.json`. No database server required. To migrate to SQLite in the future, swap out `storage.js`.

## API Reference

### Videos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/videos` | Upload a video (multipart/form-data, field name: `video`) |
| `GET` | `/videos` | List all uploaded videos |
| `DELETE` | `/videos/:id` | Delete a video and its file |

### Streams

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/streams` | Create a stream definition |
| `GET` | `/streams` | List all streams |
| `POST` | `/streams/:id/start` | Start FFmpeg pushing to MediaMTX |
| `POST` | `/streams/:id/stop` | Kill the FFmpeg process |
| `DELETE` | `/streams/:id` | Delete stream definition and stop process |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/system/ip` | Returns `{ ipv4: "192.168.x.x" }` |

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | Backend API port |
| `MEDIAMTX_HOST` | `localhost` | Hostname for RTSP URL generation |
| `MEDIAMTX_PORT` | `8554` | RTSP port |
| `DATA_DIR` | `./data` | Path to uploads and JSON DB |
| `VITE_API_URL` | `http://localhost:3000` | Frontend → backend URL |

### MediaMTX

Edit `mediamtx.yml` to customize protocols, authentication, or encryption. By default:
- RTSP: `8554`
- RTMP: `1935`
- HLS: `8888`
- WebRTC: `8889`

## Common Tasks

### Reset all data

```bash
# Stop everything first, then:
rm -rf data/*
```

On next start, the JSON DB will be recreated empty.

### Stream to a mobile app

1. Start a stream in the UI.
2. Note the RTSP URL (e.g., `rtsp://192.168.1.42:8554/stream-a1b2c3d4`).
3. In your companion app, use that URL as the camera feed.

### Test with VLC

```bash
vlc rtsp://localhost:8554/<stream-slug>
```

Or open VLC → Media → Open Network Stream → paste the URL.

### View HLS in browser

MediaMTX exposes an HLS endpoint for every stream:

```
http://localhost:8888/<stream-slug>
```

## Troubleshooting

### "FFmpeg not found"

Ensure `ffmpeg` and `ffprobe` are in your system PATH. The backend and `dev.sh` both check for this.

### "Cannot connect to MediaMTX"

In dev mode, the script tries to start MediaMTX via Docker. If it fails:

```bash
# Check if Docker is running
docker ps

# Start MediaMTX manually
docker compose up -d mediamtx
```

### CORS errors in browser

The backend enables CORS for all origins in development. In production, update the `cors()` middleware in `backend/src/index.js` to restrict origins.

### Streams start but no video plays

1. Check the backend logs for FFmpeg errors.
2. Verify MediaMTX is reachable: `docker compose ps`
3. Ensure the uploaded video is a valid format (MP4 H.264 is safest).

## Development Tips

- The frontend uses Vite's dev server with HMR — changes reflect instantly.
- The backend uses `node --watch` — it restarts on file changes.
- Keep components small and composable. Extract logic into hooks when files grow.
- Follow the existing Tailwind + glass-panel styling pattern for consistency.

## Docker Services

| Service | Image / Build | Ports | Purpose |
|---------|--------------|-------|---------|
| `frontend` | `frontend/Dockerfile` | `5173` | React UI |
| `backend` | `backend/Dockerfile` | `3000` | Express API |
| `mediamtx` | `bluenviron/mediamtx` | `8554`, `1935`, `8888`, `8889` | RTSP/RTMP/HLS/WebRTC server |

The backend container includes FFmpeg. The `data` directory is mounted as a volume for persistence.

## Future Enhancements

- Stream scheduling (start/stop at specific times)
- Stream presets (common FPS/resolution combos)
- HLS output as first-class citizen
- WebRTC ingestion
- SQLite backend for larger deployments

## License

MIT
