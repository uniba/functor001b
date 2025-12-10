# Emoji Boid Project

This project implements WebRTC connections between rooms and functors using the Pigeon WebSocket communication system.

## Architecture Overview

The system uses:
- **Pigeon WebSocket**: For message passing between rooms and functors
- **WebRTC**: For direct peer-to-peer communication

## Components

### WebRTC Integration Component
The `webrtc-room-functor.js` component enables:
- Establishing WebRTC connections between rooms and functors
- Handling WebRTC signaling through the Pigeon WebSocket infrastructure
- ICE candidate exchange and SDP offer/answer negotiation

### Existing Components
- `pigeon-functor-local.js`: Sends position data to other functors via Pigeon
- `pigeon-receiver-local.js`: Receives position data and updates functor positions

## Usage

### For Rooms:
```html
<a-entity webrtc-room-functor="isRoom: true"></a-entity>
```

### For Functors:
```html
<a-entity webrtc-room-functor="isRoom: false"></a-entity>
```

### Connection Flow:
1. Room component initializes WebRTC connection
2. Room sends SDP offer via Pigeon
3. Functor receives offer and responds with SDP answer
4. ICE candidates are exchanged via Pigeon
5. WebRTC connection is established for direct communication

## Implementation Details

The WebRTC integration leverages the existing Pigeon infrastructure to:
- Handle SDP offers and answers
- Exchange ICE candidates
- Manage connection state changes

All signaling messages are passed through the Pigeon WebSocket system to ensure proper coordination between rooms and functors in the distributed system.