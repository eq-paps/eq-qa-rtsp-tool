RTSP Stream Tool – Build Specification

1. Overview

A local RTSP streaming tool that allows uploading short video files and broadcasting them as RTSP streams over a local network.

Primary use case: simulate camera feeds for companion apps.

⸻

2. Core Features

2.1 Video Upload

* Upload short video files via UI
* Store on server disk
* Extract metadata using FFmpeg (duration, resolution, FPS)

2.2 Stream Creation

* Select uploaded video
* Configure:
    * Frame rate (5 FPS → native FPS)
    * Loop (on/off)
* Generate RTSP stream

2.3 Stream Playback

* Start / Stop streams
* One-shot or loop
* Multiple concurrent streams supported

2.4 RTSP URL + IPv4 Display

* Display RTSP URL per stream
* Display machine IPv4 address globally
* Copy-to-clipboard actions

⸻

3. Tech Stack

Frontend

* React + Vite
* Tailwind CSS
* Framer Motion (motion)
* react-icons
* Native fetch

Backend

* Node.js + Express
* FFmpeg (video processing)
* RTSP server: MediaMTX (recommended)

DevOps

* Docker + Docker Compose

⸻

4. UI / UX Requirements

Design Language

* Modern “liquid glass” aesthetic
* Soft blur backgrounds
* Semi-transparent panels
* Rounded corners (2xl)
* Subtle motion + transitions

Layout Sections

* Top bar (IPv4 display)
* Upload panel
* Video library
* Stream dashboard

Component Strategy

Keep files small and modular:

* AppShell
* TopBar
* Ipv4Badge
* UploadDropzone
* VideoLibrary
* VideoCard
* StreamGrid
* StreamCard
* StreamForm
* CopyButton
* StatusPill

Rules

* No oversized TSX files
* Prefer composition over complexity
* Extract logic into hooks

⸻

5. Backend Architecture

Services

* Upload service
* Video metadata service (FFmpeg)
* Stream manager
* Storage service
* System info service

Storage (v1)

File-based persistence:

/data/uploads
/data/app-db.json

Why this approach

* Simple
* No DB setup
* Portable
* Perfect for local tool

Future upgrade

* SQLite (optional)

⸻

6. Data Models

VideoAsset

{
  id: string
  originalName: string
  storedName: string
  filePath: string
  durationSeconds: number
  width: number
  height: number
  nativeFps: number
  createdAt: string
}

StreamDefinition

{
  id: string
  name: string
  sourceVideoId: string
  pathSlug: string
  fpsMode: 'native' | 'custom'
  customFps?: number
  loop: boolean
  status: 'idle' | 'running' | 'stopped'
  rtspUrl: string
  createdAt: string
}

⸻

7. Streaming Engine

Approach

Use FFmpeg to push video into MediaMTX RTSP server.

Example

ffmpeg -re -stream_loop -1 -i input.mp4 \
  -vf "fps=10" \
  -c:v libx264 \
  -f rtsp rtsp://mediamtx:8554/stream1

Controls

* Loop: -stream_loop -1
* FPS: -vf fps=X

⸻

8. API Endpoints

Videos

* POST /videos (upload)
* GET /videos
* DELETE /videos/:id

Streams

* POST /streams
* GET /streams
* POST /streams/:id/start
* POST /streams/:id/stop
* DELETE /streams/:id

System

* GET /system/ip

⸻

9. Docker Setup

Services

* frontend
* backend
* mediamtx

docker-compose.yml (simplified)

version: '3.9'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
  mediamtx:
    image: bluenviron/mediamtx
    ports:
      - "8554:8554"

⸻

10. Run Instructions

On new machine

1. Install Docker
2. Clone repo
3. Run:

docker compose up --build

Access

* UI: http://localhost:5173
* RTSP: rtsp://:8554/

⸻

11. Key Principles

* Keep it simple
* Keep code modular
* Avoid overengineering
* Prioritize reliability over features
* Make it easy to run anywhere

⸻

12. Future Enhancements

* Stream scheduling
* Presets
* HLS output
* WebRTC support
* SQLite upgrade

⸻

13. Summary

This is a lightweight, local-first RTSP streaming tool designed for speed, simplicity, and portability.

The architecture avoids unnecessary complexity while staying flexible enough to scale if needed.
