import { Pigeon } from "./Pigeon.js";

AFRAME.registerComponent("pigeon-functor", {
  init() {
    this.pigeon = new Pigeon("wss://192.168.100.26:3001/pigeon/", 'functor');

    // Initialize WebRTC integration for functor
    this.webrtc = null;

    // Try to establish WebRTC connection when component initializes
    setTimeout(() => {
      // Create and initialize WebRTC component for this functor
      if (this.el.components["webrtc-room-functor"]) {
        this.webrtc = this.el.components["webrtc-room-functor"];
        // The functor can listen for connection events
        document.addEventListener("webrtc-connection-changed", (e) => {
          console.log("Functor WebRTC connection state:", e.detail.state);
        });
      }
    }, 1000);

    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;
  },
  tick() {
    const quaternion = new THREE.Quaternion();

    this.el.object3D.getWorldQuaternion(quaternion);

    if (
      Math.abs(this.x - quaternion.x) > 0.005 ||
      Math.abs(this.y - quaternion.y) > 0.005 ||
      Math.abs(this.z - quaternion.z) > 0.005 ||
      Math.abs(this.w - quaternion.w) > 0.005
    ) {
      this.x = quaternion.x;
      this.y = quaternion.y;
      this.z = quaternion.z;
      this.w = quaternion.w;

      this.pigeon.sendMsg({
        to: 'others',
        type: 'ipad',
        body: {
          x: this.x,
          y: this.y,
          z: this.z,
          w: this.w,
        }
      });
    }
  }
});
