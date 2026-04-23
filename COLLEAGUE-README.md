# RTSP Stream Tool — Easy Setup Guide

This is a simple guide for running the RTSP Stream Tool using Docker. You don't need to know how to code — just follow these steps.

## What this tool does

It lets you upload video files from your computer and turn them into RTSP streams. Other devices on your network (like phones, tablets, or smart displays) can then watch those streams.

---

## Prerequisites

Make sure you have **Docker Desktop** installed and running.

- **Download Docker Desktop:** https://www.docker.com/products/docker-desktop/

Once installed, open Docker Desktop and make sure it's running (you'll see the whale icon in your menu bar / system tray).

---

## Step 1: Create the environment file

The tool needs a tiny config file called `.env` so it knows your computer's network address. Without this, other devices on your network won't be able to connect to your streams.

### 1. Find your computer's local IP address

**On macOS:**
- Open Terminal (press `Cmd + Space`, type `terminal`, press Enter)
- Run this command:
  ```
  ipconfig getifaddr en0
  ```
- It will print something like `192.168.1.42` — that's your IP. Copy it.

**On Windows:**
- Open Command Prompt (press `Win + R`, type `cmd`, press Enter)
- Run this command:
  ```
  ipconfig
  ```
- Look for the line that says `IPv4 Address` under your active network adapter (usually Wi-Fi or Ethernet). It looks like `192.168.1.42`. Copy it.

**On Linux:**
- Open a terminal
- Run:
  ```
  hostname -I
  ```
- The first IP address is usually the one you want.

### 2. Create the `.env` file

In the project folder (the same folder this README is in), create a new file named exactly `.env` (note the dot at the beginning).

Paste these three lines into it, replacing `192.168.1.42` with **your actual IP address**:

```
MEDIAMTX_HOST=192.168.1.42
MEDIAMTX_INTERNAL_HOST=mediamtx
MEDIAMTX_PORT=8554
```

Save the file.

> **Why this matters:** `MEDIAMTX_HOST` tells the tool what IP address to put in the RTSP URLs. If you leave it as the default `localhost`, only the same computer can watch the streams. Setting it to your real local IP lets phones, tablets, and other devices on the same Wi-Fi network connect.

---

## Step 2: Make the shell scripts executable

You only need to do this once.

**macOS / Linux:**
Open Terminal in the project folder and run:
```bash
chmod +x start.sh stop.sh
```

**Windows (PowerShell):**
If you're using Git Bash or WSL, run the same command as above. If using plain PowerShell, right-click each `.sh` file, choose "Run with PowerShell", or use Docker Desktop's terminal.

---

## Step 3: Start the tool

Double-click `start.sh` or run it in Terminal:

```bash
./start.sh
```

This will build and start all the services in Docker containers. The first time you run it, it may take a few minutes to download images and build.

When it's done, you'll see a message like:
```
✔  All services are running!
ℹ  Open your browser to: http://localhost:5173
```

Open that link in your browser to use the tool.

---

## Step 4: Stop the tool

When you're done, run:

```bash
./stop.sh
```

This safely shuts down all the Docker containers.

---

## What each service does

| Service | What it is | Port | URL |
|---------|-----------|------|-----|
| **frontend** | The web page you interact with | `5173` | http://localhost:5173 |
| **backend** | The API that handles uploads and streams | `3000` | http://localhost:3000 |
| **mediamtx** | The RTSP server that broadcasts video | `8554` | RTSP URLs shown in the web UI |

---

## Quick check: is it working?

1. Open http://localhost:5173 in your browser
2. Upload a short video file (MP4 works best)
3. Create a stream from that video
4. Click the **Start** button on the stream
5. Copy the RTSP URL shown (it should contain your IP, not `localhost`)
6. Open VLC (or any RTSP player) on another device on the same network and paste that URL

---

## Troubleshooting

### "Docker doesn't seem to be running"
Open Docker Desktop and wait for it to fully start before running `./start.sh`.

### "No .env file found"
Make sure you created the `.env` file in the same folder as `docker-compose.yml`. The name must be exactly `.env` (with a dot).

### The RTSP URL shows `localhost` instead of my IP
Stop the containers (`./stop.sh`), double-check your `.env` file has the correct IP, then start again (`./start.sh`).

### I can't connect from another device
1. Make sure both devices are on the **same Wi-Fi network**
2. Check that your computer's firewall isn't blocking ports `5173`, `3000`, and `8554`
3. Make sure `MEDIAMTX_HOST` in `.env` is set to your computer's real local IP (not `localhost`)

---

## Files you might care about

| File | Purpose |
|------|---------|
| `.env` | Your local network settings (you create this) |
| `start.sh` | One-click script to start everything |
| `stop.sh` | One-click script to stop everything |
| `docker-compose.yml` | Docker configuration (don't touch unless you know what you're doing) |
| `data/` | Where uploaded videos and stream info are saved |
