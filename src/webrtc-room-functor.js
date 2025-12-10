import { Pigeon } from "./Pigeon.js";

/**
 * WebRTC integration component for establishing connections between rooms and functors
 * This component enables WebRTC communication using the Pigeon WebSocket infrastructure
 */
AFRAME.registerComponent("webrtc-room-functor", {
  schema: {
    // Whether this component is for a room or functor
    isRoom: { type: "boolean", default: false },

    // Whether to capture canvas as video stream
    captureCanvasStream: { type: "boolean", default: false }
  },

  init() {
    // Initialize Pigeon for WebSocket communication - matching existing pattern
    this.pigeon = new Pigeon(
      "wss://172.27.101.176:3001/pigeon/",
      "functor", // Default room address
    );

    // Configuration for WebRTC connection
    this.config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    }

    // WebRTC related variables
    this.peerConnection = null;
    this.isRoom = this.data.isRoom;
    this.connectionState = "disconnected";
    this.canvasStream = null;
    this.canvasCaptureComponent = null;

    // Setup Pigeon message handling to receive WebRTC signaling
    this.setupPigeonHandlers();

    if (this.isRoom) {
      this.establishConnection()
    }
  },

  setupPigeonHandlers() {
    // Listen for WebRTC messages from other peers through Pigeon
    this.pigeon.ws.addEventListener("message", (e) => {
      const receivedMsg = JSON.parse(e.data);
      const { type, body } = receivedMsg;

      // Handle WebRTC signaling messages
      switch (type) {
        case "webrtc-offer":
          this.handleOffer(body);
          break;
        case "webrtc-answer":
          this.handleAnswer(body);
          break;
        case "webrtc-ice-candidate":
          this.handleIceCandidate(body);
          break;
      }
    });
  },

  /**
   * Initialize WebRTC connection with proper configuration
   */
  async initializeWebRtc() {
    try {
      const config = {
        iceServers: this.config.iceServers,
      };

      this.peerConnection = new RTCPeerConnection(config);

      // Setup event handlers for the peer connection
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate via Pigeon to other peer
          this.pigeon.sendMsg({
            to: "others",
            type: "webrtc-ice-candidate",
            body: {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex
            }
          });
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        this.connectionState = this.peerConnection.connectionState;
        console.log("WebRTC connection state:", this.connectionState);
      };

      console.log("WebRTC initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize WebRTC:", error);
      return false;
    }
  },

  /**
   * Handle incoming WebRTC offer from other peer
   */
  async handleOffer(offer) {
    try {
      if (!this.peerConnection) {
        await this.initializeWebRtc();
      }

      // Set remote description from offer
      const remoteDesc = new RTCSessionDescription(offer);
      await this.peerConnection.setRemoteDescription(remoteDesc);

      // Create and send answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send answer via Pigeon to other peer
      this.pigeon.sendMsg({
        to: "others",
        type: "webrtc-answer",
        body: {
          sdp: answer.sdp,
          type: answer.type
        }
      });

      console.log("WebRTC offer handled successfully");
    } catch (error) {
      console.error("Error handling WebRTC offer:", error);
    }
  },

  /**
   * Handle incoming WebRTC answer from other peer
   */
  async handleAnswer(answer) {
    try {
      const remoteDesc = new RTCSessionDescription(answer);
      await this.peerConnection.setRemoteDescription(remoteDesc);
      console.log("WebRTC answer received successfully");
    } catch (error) {
      console.error("Error handling WebRTC answer:", error);
    }
  },

  /**
   * Handle incoming ICE candidate from other peer
   */
  async handleIceCandidate(candidate) {
    try {
      const iceCandidate = new RTCIceCandidate({
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex
      });

      await this.peerConnection.addIceCandidate(iceCandidate);
      console.log("ICE candidate added successfully");
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  },

  /**
   * Create and send an offer to establish WebRTC connection
   */
  async createAndSendOffer() {
    try {
      if (!this.peerConnection) {
        await this.initializeWebRtc();
      }

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer via Pigeon to other peer
      this.pigeon.sendMsg({
        to: "others",
        type: "webrtc-offer",
        body: {
          sdp: offer.sdp,
          type: offer.type
        }
      });

      console.log("WebRTC offer created and sent");
    } catch (error) {
      console.error("Error creating and sending WebRTC offer:", error);
    }
  },

  /**
   * Establish WebRTC connection with other peer
   */
  async establishConnection() {
    console.log("Attempting to establish WebRTC connection...");

    // If this is a room, initiate the connection
    if (this.isRoom) {
      await this.createAndSendOffer();

      // Set up canvas capture after connection is established
      if (this.data.captureCanvasStream) {
        this.setupCanvasCapture();
      }
    }

    console.log("WebRTC connection establishment initiated");
  },

  /**
   * Close WebRTC connection
   */
  closeWebRtc() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.connectionState = "disconnected";
      console.log("WebRTC connection closed");
    }
  },

  /**
   * Add canvas stream to WebRTC connection if available
   */
  addCanvasStreamToWebRtc() {
    if (this.canvasStream && this.peerConnection) {
      try {
        // Add the canvas stream as a video track to the peer connection
        const videoTracks = this.canvasStream.getVideoTracks();
        if (videoTracks.length > 0) {
          videoTracks.forEach(track => {
            this.peerConnection.addTrack(track, this.canvasStream);
          });
          console.log("Canvas video stream added to WebRTC connection");
        }
      } catch (error) {
        console.error("Failed to add canvas stream to WebRTC:", error);
      }
    }
  },

  /**
   * Setup canvas capture component and make stream available for WebRTC
   */
  setupCanvasCapture() {
    // If capture is enabled, try to set up canvas capture
    if (this.data.captureCanvasStream) {
      // Check if we have access to canvas capture functionality
      const scene = this.el.sceneEl;

      // Create a temporary entity to hold canvas capture if needed
      const captureEntity = document.createElement("a-entity");
      captureEntity.setAttribute("canvas-video-stream", {
        enabled: true,
        captureAsMediaStream: true
      });

      // Add it to the scene to initialize capture
      scene.appendChild(captureEntity);

      // Store reference to capture component for later use
      this.canvasCaptureComponent = captureEntity.components["canvas-video-stream"];

      // When canvas capture is ready, make the stream available
      if (this.canvasCaptureComponent) {
        // Try to get the media stream after a short delay to ensure it's ready
        setTimeout(() => {
          const mediaStream = this.canvasCaptureComponent.getMediaStream();
          if (mediaStream) {
            this.canvasStream = mediaStream;

            // Make the stream available as a DOM element for texture access
            this.makeStreamAvailableAsTexture(mediaStream);

            // Add to WebRTC connection if connected
            if (this.peerConnection && this.connectionState === "connected") {
              this.addCanvasStreamToWebRtc();
            }
          }
        }, 1000);
      }
    }
  },

  /**
   * Make the MediaStream available as a DOM element that can be used as texture
   */
  makeStreamAvailableAsTexture(mediaStream) {
    // Create a video element to hold the stream, but make it accessible as #webRtcStream
    const existingVideo = document.getElementById("webRtcStream");

    if (existingVideo) {
      // Reuse existing video element
      existingVideo.srcObject = mediaStream;
    } else {
      // Create new video element with ID for texture access
      const videoElement = document.createElement("video");
      videoElement.id = "webRtcStream";
      videoElement.srcObject = mediaStream;
      videoElement.autoplay = true;
      videoElement.muted = true; // Prevent audio feedback
      videoElement.style.display = "none"; // Hide the element as it's for texture use

      // Add to scene to ensure proper DOM handling
      this.el.sceneEl.appendChild(videoElement);
    }
  },

  /**
   * Cleanup when component is removed
   */
  remove() {
    this.closeWebRtc();

    // Clean up video element if created
    const videoElement = document.getElementById("webRtcStream");
    if (videoElement && videoElement.parentNode) {
      videoElement.parentNode.removeChild(videoElement);
    }
  }
});
