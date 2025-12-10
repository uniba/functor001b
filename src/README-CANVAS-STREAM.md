# A-Frame Canvas Video Stream Integration

This document explains how to capture the A-Frame main camera canvas as a video stream for use in WebRTC connections and other applications.

## Overview

The `canvas-video-stream` component allows you to extract the rendered A-Frame scene as a MediaStream, which can then be used for WebRTC communication or other video processing applications.

## Component Usage

### Basic Setup

To use the canvas video stream component in your A-Frame scene:

```html
<a-scene>
  <!-- Your A-Frame content -->
  <a-entity position="0 0 -5">
    <a-box position="0 0 0" color="red"></a-box>
  </a-entity>

  <!-- Add the canvas video stream component -->
  <a-entity webrtc-room-functor="isRoom: true; captureCanvasStream: true"></a-entity>
</a-scene>
```

### Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | true | Whether to enable canvas capture |
| `frameRate` | number | 30 | Frame rate for capturing the canvas |
| `captureAsMediaStream` | boolean | true | Whether to capture as a MediaStream for WebRTC |
| `quality` | number | 0.8 | Canvas quality settings (0.0 to 1.0) |
| `waitForSceneReady` | boolean | true | Whether to capture only when scene is ready |

## Integration with WebRTC

The canvas video stream component integrates seamlessly with the existing `webrtc-room-functor` component:

```html
<a-entity webrtc-room-functor="isRoom: true; captureCanvasStream: true"></a-entity>
```

When `captureCanvasStream` is set to true, the component will:
1. Capture the rendered A-Frame scene as a video stream
2. Make it available for WebRTC connections
3. Automatically add the video track to the WebRTC peer connection

## Implementation Details

The component works by:

1. Accessing the A-Frame scene's renderer canvas via `this.el.sceneEl.renderer.domElement`
2. Creating a MediaStream from the canvas content
3. Supporting both modern browsers (with native `captureStream` support) and older browsers (using frame-by-frame capture)
4. Properly handling cleanup to prevent memory leaks

## Browser Support

The canvas capture functionality has different behavior depending on the browser:

### Modern Browsers
- Support `canvas.captureStream()` natively
- Provides optimal performance for video capture

### Legacy Browsers
- Fall back to frame-by-frame capture using `setInterval`
- May have lower performance due to JavaScript-based rendering

## Usage Example

Here's a complete example of how to set up the canvas capture for WebRTC:

```html
<!DOCTYPE html>
<html>
<head>
  <title>A-Frame Canvas Stream Example</title>
  <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-webrtc-component@1.0.0/dist/webrtc-room-functor.js"></script>
  <script src="https://unpkg.com/aframe-webrtc-component@1.0.0/dist/canvas-video-stream.js"></script>
</head>
<body>
  <a-scene>
    <!-- Scene content -->
    <a-entity position="0 0 -5">
      <a-box position="0 0 0" color="red"></a-box>
      <a-sphere position="2 0 0" color="blue"></a-sphere>
      <a-cylinder position="-2 0 0" color="green"></a-cylinder>
    </a-entity>

    <!-- WebRTC component with canvas capture -->
    <a-entity 
      webrtc-room-functor="isRoom: true; captureCanvasStream: true"
      canvas-video-stream="enabled: true; frameRate: 15">
    </a-entity>
  </a-scene>
</body>
</html>
```

## Troubleshooting

### Canvas Not Available
If you encounter "Canvas not available from A-Frame renderer" errors:
1. Ensure the component is added after the scene has been initialized
2. Check that A-Frame is properly loaded before initializing components

### WebRTC Connection Issues
If canvas streams aren't being added to WebRTC connections:
1. Verify that the `webrtc-room-functor` component is properly initialized
2. Confirm that the WebRTC peer connection exists before attempting to add tracks

## Performance Considerations

- Higher frame rates consume more CPU and bandwidth
- For mobile or low-performance devices, consider reducing `frameRate`
- The canvas capture adds additional overhead to rendering
- For production use, monitor performance and adjust settings accordingly

## Security Notes

When capturing canvas content for WebRTC:
- Ensure proper permissions are granted for media capture
- Be aware that canvas content may include sensitive information
- The captured stream will be available to all connected peers in the WebRTC network