import { Pigeon } from "./Pigeon.js";

AFRAME.registerComponent( "pigeon-functor", {
  init() {
    this.pigeon = new Pigeon( "wss://vmb207.circuitlab.team:3001/pigeon/", 'functor' );

    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;

    this.emojiA = document.querySelector( "#emojiA" );
    this.emojiB = document.querySelector( "#emojiB" );
    this.emojiC = document.querySelector( "#emojiC" );
    this.emojiD = document.querySelector( "#emojiD" );
    this.emojiE = document.querySelector( "#emojiE" );

    document.addEventListener( "emojis", ( e ) => {
      const aq = new THREE.Quaternion( e.detail.a.quaternion.x, e.detail.a.quaternion.y, e.detail.a.quaternion.z, e.detail.a.quaternion.w );
      const bq = new THREE.Quaternion( e.detail.b.quaternion.x, e.detail.b.quaternion.y, e.detail.b.quaternion.z, e.detail.b.quaternion.w );
      const cq = new THREE.Quaternion( e.detail.c.quaternion.x, e.detail.c.quaternion.y, e.detail.c.quaternion.z, e.detail.c.quaternion.w );
      const dq = new THREE.Quaternion( e.detail.d.quaternion.x, e.detail.d.quaternion.y, e.detail.d.quaternion.z, e.detail.d.quaternion.w );
      const eq = new THREE.Quaternion( e.detail.e.quaternion.x, e.detail.e.quaternion.y, e.detail.e.quaternion.z, e.detail.e.quaternion.w );

      this.emojiA.object3D.setRotationFromQuaternion( aq );
      this.emojiA.object3D.position.set( e.detail.a.position.x, e.detail.a.position.y, e.detail.a.position.z );
      this.emojiB.object3D.setRotationFromQuaternion( bq );
      this.emojiB.object3D.position.set( e.detail.c.position.x, e.detail.b.position.y, e.detail.b.position.z );
      this.emojiC.object3D.setRotationFromQuaternion( cq );
      this.emojiC.object3D.position.set( e.detail.c.position.x, e.detail.c.position.y, e.detail.c.position.z );
      this.emojiD.object3D.setRotationFromQuaternion( dq );
      this.emojiD.object3D.position.set( e.detail.d.position.x, e.detail.d.position.y, e.detail.d.position.z );
      this.emojiE.object3D.setRotationFromQuaternion( eq );
      this.emojiE.object3D.position.set( e.detail.e.position.x, e.detail.e.position.y, e.detail.e.position.z );

    } );
  },
  tick() {
    const quaternion = new THREE.Quaternion();

    this.el.object3D.getWorldQuaternion( quaternion );

    if (
      Math.abs( this.x - quaternion.x ) > 0.005 ||
      Math.abs( this.y - quaternion.y ) > 0.005 ||
      Math.abs( this.z - quaternion.z ) > 0.005 ||
      Math.abs( this.w - quaternion.w ) > 0.005
    ) {
      this.x = quaternion.x;
      this.y = quaternion.y;
      this.z = quaternion.z;
      this.w = quaternion.w;

      this.pigeon.sendMsg( {
        to: 'others',
        type: 'ipad',
        body: {
          x: this.x,
          y: this.y,
          z: this.z,
          w: this.w,
        }
      } );
    }
  }
} );