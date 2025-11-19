import { Pigeon } from "./Pigeon.js";

AFRAME.registerComponent( "pigeon-functor", {
  init() {
    this.pigeon = new Pigeon( "wss://vmb207.circuitlab.team:3001/pigeon/", 'functor' );

    setInterval( () => {
      const quaternion = new THREE.Quaternion();

      this.el.object3D.getWorldQuaternion( quaternion );

      this.pigeon.sendMsg( {
        to: 'others',
        type: 'ipad',
        body: {
          x: quaternion.x,
          y: quaternion.y,
          z: quaternion.z,
          w: quaternion.w,
        }
      } );
    }, 66 );

  },
  tick() {
  }
} );