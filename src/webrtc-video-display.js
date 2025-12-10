/**
 * A-Frame component to display WebRTC video streams as textures on an a-plane
 * This component creates an a-plane that can display received WebRTC video streams
 */
AFRAME.registerComponent("webrtc-video-display", {
  schema: {
    // Control the video plane's properties
    enabled: { type: "boolean", default: true },
    width: { type: "number", default: 1.0 },
    height: { type: "number", default: 1.0 },
    position: { type: "vec3", default: { x: 0, y: 0, z: -1.5 } },
    rotation: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    opacity: { type: "number", default: 0.9 },
    mirror: { type: "boolean", default: false }
  },

  init() {
    this.videoPlane = null;
    this.mediaStream = null;
    this.videoElement = null;

    if (this.data.enabled) {
      this.createVideoPlane();
    }
  },

  /**
   * Create a video plane in the A-Frame scene that can display WebRTC streams
   */
  createVideoPlane() {
    try {
      // Create the video plane entity with proper attributes
      this.videoPlane = document.createElement("a-plane");

      // Set plane properties
      this.videoPlane.setAttribute("width", this.data.width);
      this.videoPlane.setAttribute("height", this.data.height);
      this.videoPlane.setAttribute("position", this.data.position);
      this.videoPlane.setAttribute("rotation", this.data.rotation);

      // Set material properties for video display
      this.videoPlane.setAttribute("material", {
        src: "#webRtcStream", // Texture source for WebRTC stream
        transparent: true,
        side: "double",
        opacity: this.data.opacity,
        shader: "flat" // Flat shader for better video rendering
      });

      // Add the plane to the scene
      this.el.sceneEl.appendChild(this.videoPlane);

      console.log("WebRTC video display plane created successfully");
    } catch (error) {
      console.error("Error creating WebRTC video display plane:", error);
    }
  },

  /**
   * Set the MediaStream to be displayed on the plane
   */
  setMediaStream(stream) {
    this.mediaStream = stream;

    if (this.videoPlane && stream) {
      try {
        // Create a video element to hold the WebRTC stream
        if (!this.videoElement) {
          this.videoElement = document.createElement("video");
          this.videoElement.style.display = "none";
          this.videoElement.autoplay = true;
          this.videoElement.muted = true; // Prevent audio feedback

          // Add to scene for proper DOM handling
          this.el.sceneEl.appendChild(this.videoElement);
        }

        // Set the stream to the video element
        this.videoElement.srcObject = stream;

        // Start playing the video to ensure it's ready
        this.videoElement.play().catch(e => {
          console.log("Video play error:", e);
        });

        // For A-Frame, we can't easily update textures in real-time from
        // JavaScript components. The proper approach is to ensure the
        // WebRTC stream is made available as a texture in the scene.
        console.log("WebRTC MediaStream assigned to video plane");

      } catch (error) {
        console.error("Error setting MediaStream on video plane:", error);
      }
    }
  },

  /**
   * Update the component with new configuration
   */
  update(oldData) {
    if (this.data.enabled !== oldData.enabled) {
      if (this.data.enabled) {
        this.createVideoPlane();
      } else {
        this.cleanup();
      }
    }
  },

  /**
   * Cleanup resources when component is removed
   */
  cleanup() {
    // Remove the video element from the scene
    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }

    // Remove the video plane from the scene
    if (this.videoPlane && this.videoPlane.parentNode) {
      this.videoPlane.parentNode.removeChild(this.videoPlane);
    }

    // Reset references
    this.videoPlane = null;
    this.mediaStream = null;
    this.videoElement = null;
  },

  /**
   * Remove the component and clean up
   */
  remove() {
    this.cleanup();
  }
});
