import { Pigeon } from "./Pigeon.js";

AFRAME.registerComponent("pigeon-receiver", {
  init() {
    this.pigeon = new Pigeon("wss://192.168.100.26:3001/pigeon/", 'functor');

    // Setup WebRTC integration
    this.webrtc = null;

    document.addEventListener("ipad", (e) => {
      const quaternion = new THREE.Quaternion(e.detail.x, e.detail.y, e.detail.z, e.detail.w);

      this.el.object3D.setRotationFromQuaternion(quaternion);
    });

    // Listen for WebRTC connection state changes
    document.addEventListener("webrtc-connection-changed", (e) => {
      console.log("Receiver WebRTC connection state:", e.detail.state);
    });
  },
  tick() {
  }
});
