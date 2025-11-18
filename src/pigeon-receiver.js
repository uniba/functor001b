import { Pigeon } from "./Pigeon.js";

AFRAME.registerComponent( "pigeon-receiver", {
  init() {
    this.pigeon = new Pigeon( "wss://pigeon-room-dev.deno.dev/pigeon/", 'functor' );

    document.addEventListener( "ipad", ( e ) => {
      console.log( e.detail );

      const quaternion = new THREE.Quaternion( e.detail.x, e.detail.y, e.detail.z, e.detail.w );

      this.el.object3D.applyQuaternion( quaternion );
    } );
  },
  tick() {
  }
} );