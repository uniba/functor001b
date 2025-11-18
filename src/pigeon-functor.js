import { Pigeon } from "./Pigeon.js";

AFRAME.registerComponent( "pigeon-functor", {
  init() {
    this.pigeon = new Pigeon( "wss://pigeon-room-dev.deno.dev/pigeon/", 'functor' );

    setInterval( () => {
      const quaternion = new THREE.Quaternion();

      this.el.object3D.getWorldQuaternion( quaternion );

      this.pigeon.sendMsg( {
        to: 'others',
        type: 'ipad',
        body: {
          w: quaternion.w,
          x: quaternion.y,
          y: quaternion.y,
          z: quaternion.z,
        }
      } );
    }, 100 );

  },
  tick() {
  }
} );