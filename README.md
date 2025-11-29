# Shooter.io
A lightweight realtime 2D multiplayer shooter built using **vanilla JavaScript**, **Node.js**, and **WebSockets**.

## Quick Start
1. Clone the repo:
```bash
git clone <repo-url>
cd Shooter.io
```
2. Start the server:
```bash
cd server
npm install
nodemon index.js
```
3. Start the client:
- Open the `client` folder in VS Code
- Right‑click `index.html` → **Open with Live Server**

Your game is ready.

## Key Features
- **Multiplayer support** using WebSockets
- **CPU bot with A* tracking** and obstacle-aware pathfinding
- **Custom collision detection** (players, bullets, obstacles)
- **Lightweight OOP architecture** for players, bullets, AI, and map
- **Low-latency updates** with a server‑authoritative game loop


## Tech Stack
- JavaScript (Vanilla)
- Node.js + ws
- HTML5 Canvas

## Additional Details
### How It Works
- It's a client side authorative game
- All validation happens on client-side ( in future it would be migrated to server-side authorization)
- server manages socket connection and brodcasting updated events to other clients

### CPU Bot (A* Pathfinding)
- Map is converted into a grid.
- Bot computes shortest path to the player.
- Recalculates when obstacles or player movement change.
- Moves smoothly along generated path.

### Running Multiple Clients
- Open multiple browser tabs
- Each tab becomes a new player connected to the server
- CPU bot tracks closest human player dynamically

- Sample Video of how the 2d shooter game looks

- [screen-capture (1).webm](https://github.com/user-attachments/assets/5060690a-132e-4922-9b98-3771e9936dd5)


## License
MIT
