import { Pigeon } from "./Pigeon.js";

/**
 * WebRTC integration component for establishing connections between rooms and functors
 * This component enables WebRTC communication using the Pigeon WebSocket infrastructure
 */
AFRAME.registerComponent("webrtc-room-functor", {
  schema: {
    // Whether this component is for a room or functor
    isRoom: { type: "boolean", default: false }
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
   * Cleanup when component is removed
   */
  remove() {
    this.closeWebRtc();
  }
});
