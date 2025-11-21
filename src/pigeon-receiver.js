import { Pigeon } from "./Pigeon.js";

AFRAME.registerComponent( "pigeon-receiver", {
  init() {
    this.pigeon = new Pigeon( "wss://vmb207.circuitlab.team:3001/pigeon/", 'functor' );

    document.addEventListener( "ipad", ( e ) => {
      const quaternion = new THREE.Quaternion( e.detail.x, e.detail.y, e.detail.z, e.detail.w );

      this.el.object3D.setRotationFromQuaternion( quaternion );
    } );

    console.dir( this );

    this.emojiA = document.querySelector( "#emojiA" );
    this.emojiB = document.querySelector( "#emojiB" );
    this.emojiC = document.querySelector( "#emojiC" );
    this.emojiD = document.querySelector( "#emojiD" );
    this.emojiE = document.querySelector( "#emojiE" );

    setInterval( () => {
      const data = {};

      data.a = this.currentPos( this.emojiA.object3D );
      data.b = this.currentPos( this.emojiB.object3D );
      data.c = this.currentPos( this.emojiC.object3D );
      data.d = this.currentPos( this.emojiD.object3D );
      data.e = this.currentPos( this.emojiE.object3D );

      this.pigeon.sendMsg( {
        to: 'others',
        type: 'emojis',
        body: data
      } );
    }, 66 );
  },
  currentPos( emoji ) {
    const current = {};
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();

    const p = emoji.getWorldPosition( position );
    const q = emoji.getWorldQuaternion( quaternion );

    current.position = { x: p.x, y: p.y, z: p.z };
    current.quaternion = { x: q.x, y: q.y, z: q.z, w: q.w };

    return current;
  },
  tick() {
  }
} );