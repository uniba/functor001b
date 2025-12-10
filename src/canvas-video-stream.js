/**
 * A-Frame component to capture the main camera canvas as a video stream
 * This component extracts the rendered A-Frame scene and makes it available as a MediaStream
 * for use in WebRTC connections or other video processing applications
 */

AFRAME.registerComponent("canvas-video-stream", {
  schema: {
    // Whether to enable canvas capture
    enabled: { type: "boolean", default: true },

    // Frame rate for capturing the canvas
    frameRate: { type: "number", default: 30 },

    // Whether to capture as a MediaStream for WebRTC
    captureAsMediaStream: { type: "boolean", default: true },

    // Canvas quality settings (0.0 to 1.0)
    quality: { type: "number", default: 0.8 },

    // Whether to capture only when scene is ready
    waitForSceneReady: { type: "boolean", default: true }
  },

  init() {
    this.stream = null;
    this.mediaStream = null;
    this.isCapturing = false;
    this.originalCanvas = null;
    this.captureInterval = null;
    this.streamReadyCallback = null;

    if (this.data.enabled) {
      // Wait for scene to be ready before setting up capture
      if (this.data.waitForSceneReady) {
        // Listen for scene ready event
        this.el.sceneEl.addEventListener('render-start', () => {
          this.setupCanvasCapture();
        });
      } else {
        this.setupCanvasCapture();
      }
    }
  },

  /**
   * Setup canvas capture for the A-Frame scene
   */
  setupCanvasCapture() {
    try {
      // Get the A-Frame scene's renderer canvas
      const scene = this.el.sceneEl;

      if (!scene || !scene.renderer) {
        console.warn("A-Frame scene or renderer not available");
        return;
      }

      // Access the canvas from A-Frame's renderer
      const canvas = scene.renderer.domElement;

      if (!canvas) {
        console.warn("Canvas not available from A-Frame renderer");
        return;
      }

      // Store original canvas reference
      this.originalCanvas = canvas;

      if (this.data.captureAsMediaStream) {
        // Create a MediaStream from the canvas
        this.createCanvasStream(canvas);
      }

      console.log("Canvas capture component initialized");
    } catch (error) {
      console.error("Error setting up canvas capture:", error);
    }
  },

  /**
   * Create a MediaStream from the canvas for WebRTC
   */
  createCanvasStream(canvas) {
    try {
      // Check if CanvasCaptureMediaStream is supported (modern browsers)
      if (typeof canvas.captureStream === 'function') {
        // Modern browsers support captureStream directly
        this.mediaStream = canvas.captureStream(this.data.frameRate);
        console.log("Canvas capture stream created successfully");

        // Notify any callbacks that the stream is ready
        if (this.streamReadyCallback) {
          this.streamReadyCallback(this.mediaStream);
        }
      } else {
        // For browsers that don't support captureStream,
        // we'll set up frame-by-frame capture
        console.warn("Canvas capture not supported in this browser");
        this.setupFrameCapture(canvas);
      }

      // If we have a stream, make it available to the component
      if (this.mediaStream) {
        this.stream = this.mediaStream;
      }

    } catch (error) {
      console.error("Failed to create canvas stream:", error);
    }
  },

  /**
   * Set up frame-by-frame capture for browsers without native capture support
   */
  setupFrameCapture(canvas) {
    try {
      // Create a new canvas for capture (this will be used to generate the MediaStream)
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = canvas.width;
      captureCanvas.height = canvas.height;

      const ctx = captureCanvas.getContext('2d');

      // Create a MediaStream from the capture canvas
      if (captureCanvas.captureStream) {
        this.mediaStream = captureCanvas.captureStream(this.data.frameRate);
      } else {
        // Fallback - create an empty MediaStream for compatibility
        this.mediaStream = new MediaStream();
      }

      // Set up periodic capture of the main canvas content
      this.captureInterval = setInterval(() => {
        if (this.isCapturing && captureCanvas) {
          try {
            // Copy content from the A-Frame canvas to our capture canvas
            ctx.clearRect(0, 0, captureCanvas.width, captureCanvas.height);
            ctx.drawImage(canvas, 0, 0);
          } catch (e) {
            console.warn("Error during frame capture:", e);
          }
        }
      }, 1000 / this.data.frameRate);

      console.log("Frame capture setup complete");

    } catch (error) {
      console.error("Error setting up frame capture:", error);
    }
  },

  /**
   * Get the current MediaStream (if available)
   */
  getMediaStream() {
    return this.mediaStream || null;
  },

  /**
   * Set callback to be notified when stream is ready
   */
  setStreamReadyCallback(callback) {
    this.streamReadyCallback = callback;

    // If stream is already ready, call immediately
    if (this.mediaStream && callback) {
      callback(this.mediaStream);
    }
  },

  /**
   * Start capturing the canvas frames
   */
  startCapture() {
    if (this.data.enabled && this.originalCanvas) {
      this.isCapturing = true;
      console.log("Starting canvas capture...");

      if (this.data.captureAsMediaStream) {
        console.log("Canvas capture ready for WebRTC");
      }
    }
  },

  /**
   * Stop capturing the canvas frames
   */
  stopCapture() {
    this.isCapturing = false;

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    if (this.mediaStream && this.mediaStream.active) {
      // Stop all tracks in the media stream
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      console.log("Canvas capture stopped");
    }
  },

  /**
   * Update the component with new configuration
   */
  update(oldData) {
    if (this.data.enabled !== oldData.enabled ||
      this.data.captureAsMediaStream !== oldData.captureAsMediaStream) {

      if (this.data.enabled) {
        this.setupCanvasCapture();
      } else {
        this.stopCapture();
      }
    }
  },

  /**
   * Cleanup when component is removed
   */
  remove() {
    this.stopCapture();

    // Reset any references
    this.stream = null;
    this.mediaStream = null;
    this.originalCanvas = null;
    this.streamReadyCallback = null;
  }
});
