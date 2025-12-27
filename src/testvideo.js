
AFRAME.registerComponent( "functor-videotest", {
  init() {
    console.log( "hi i am the videotest" );

    window.addEventListener( 'arjs-video-loaded', function ( event ) {

      const videoFromArjs = document.getElementById( "videoFromArjs" );
      const videoFromAframe = document.getElementById( "videoFromAframe" );
      const videoMerged = document.getElementById( "videoMerged" );

      const arjsSource = document.getElementById( 'arjs-video' );
      const aframeDom = AFRAME.scenes[0].renderer.domElement;
      const aframeSource = document.getElementById( 'aframe-video' );

      console.dir( aframeSource );

      const arjsCanvas = document.createElement( "canvas" );
      const arjsCanvasContext = arjsCanvas.getContext( '2d' );
      const aframeCanvas = document.createElement( "canvas" );
      const aframeCanvasContext = aframeCanvas.getContext( '2d' );
      const mergedCanvas = document.createElement( "canvas" );
      const mergedCanvasContext = mergedCanvas.getContext( '2d' );

      arjsCanvas.width = 100;//arjsSource.videoWidth;
      arjsCanvas.height = 100;//arjsSource.videoWidth;
      aframeCanvas.width = 100;//aframeSource.width;
      aframeCanvas.height = 100;//aframeSource.height;
      mergedCanvas.width = 100;//arjsSource.videoWidth;
      mergedCanvas.height = 100;//arjsSource.videoHeight;

      setInterval( () => {
        arjsCanvasContext.drawImage( arjsSource, 0, 0, 100, 100 );
        aframeCanvasContext.drawImage( aframeSource, 0, 0, 100, 100 );
        mergedCanvasContext.drawImage( arjsSource, 0, 0, mergedCanvas.width, mergedCanvas.height );
        mergedCanvasContext.drawImage( aframeSource, 0, 0, 100, 100 );
      }, 1000 / 25 );

      videoFromArjs.srcObject = arjsCanvas.captureStream( 25 );
      videoFromAframe.srcObject = aframeCanvas.captureStream( 25 );
      videoMerged.srcObject = mergedCanvas.captureStream( 25 );
      aframeSource.srcObject = aframeDom.captureStream( 25 );
    } );

  }
} );