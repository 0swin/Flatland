// Even for a minimal example there are several functions that are commonly used by all minimal examples, eg. adding
// the correct script (wasm or asm.js), starting the webcam etc.

// Once we know whether wasm is supported we add the correct library script and initialize the example.

var _isWebAssemblySupported = (function() {

  function testSafariWebAssemblyBug() {

    var bin   = new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,1,127,1,127,3,2,1,0,5,3,1,0,1,7,8,1,4,116,101,115,116,0,0,10,16,1,14,0,32,0,65,1,54,2,0,32,0,40,2,0,11]);
    var mod   = new WebAssembly.Module(bin);
    var inst  = new WebAssembly.Instance(mod, {});

    // test storing to and loading from a non-zero location via a parameter.
    // Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations

    return (inst.exports.test(4) !== 0);
  }

  var isWebAssemblySupported = (typeof WebAssembly === 'object');

  if(isWebAssemblySupported && !testSafariWebAssemblyBug()) {
    isWebAssemblySupported = false;
  }

  return isWebAssemblySupported;
})();

function readWASMBinary(url, onload, onerror, onprogress) {

  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
    if (xhr.status === 200 || xhr.status === 0 && xhr.response) {
      onload(xhr.response);
      return;
    }
    onerror()
  };
  xhr.onerror = onerror;
  xhr.onprogress = onprogress;
  xhr.send(null);
}

function addBRFScript() {

  var script = document.createElement("script");

  script.setAttribute("type", "text/javascript");
  script.setAttribute("async", true);
  script.setAttribute("src", brfv4BaseURL + brfv4SDKName + ".js");

  document.getElementsByTagName("head")[0].appendChild(script);
}

// Some necessary global vars... (will need to refactor Stats for BRFv5.)

var brfv4Example = { stats: {} };
var brfv4BaseURL = _isWebAssemblySupported ? "js/libs/brf_wasm/" : "js/libs/brf_asmjs/";
var brfv4SDKName = "BRFv4_JS_TK110718_v4.1.0_trial"; // the currently available library
var brfv4WASMBuffer = null;

var onResize = function() {
  // implement this function in your minimal example, eg. fill the whole browser.
};

function initExample(_ctx, _width, _height, _fps, _cameraDiv, _canvasDiv) {

  // This function is called after the BRFv4 script was added.

  // BRFv4 needs the correct input image data size for initialization.
  // That's why we need to start the camera stream first and get the correct
  // video stream dimension. (startCamera, onStreamFetched, onStreamDimensionsAvailable)

  // Once the dimension of the video stream is known we need to wait for
  // BRFv4 to be ready to be initialized (waitForSDK, initSDK)

  // Once BRFv4 was initialized, we can track faces (trackFaces)
  var webcam        = document.getElementById(_cameraDiv);     // our webcam video
  var imageData     = document.getElementById(_canvasDiv);  // image data for BRFv4
  var imageDataCtx  = null;                                   // only fetch the context once

  var brfv4         = null; // the library namespace
  var brfManager    = null; // the API
  var resolution    = null; // the video stream resolution (usually 640x480)
  var camWidth = _width;
  var camHeiht = _height;
  var camFPS = _fps;
  var ctrl = _ctx;


  // iOS has this weird behavior that it freezes the camera stream, if the CPU get's
  // stressed too much, but it doesn't unfreeze the stream upon CPU relaxation.
  // A workaround is to get the video stream dimension and then turn the stream off
  // until BRFv4 was successfully initialized (takes about 3 seconds of heavy CPU work).

  var isIOS = (/iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream);

  startCamera();

  function startCamera() {

    console.log("startCamera");

    // Start video playback once the camera was fetched to get the actual stream dimension.
    function onStreamFetched (mediaStream) {

      console.log("onStreamFetched");

      webcam.srcObject = mediaStream;
      webcam.play();

      // Check whether we know the stream dimension yet, if so, start BRFv4.
      function onStreamDimensionsAvailable () {

        console.log("onStreamDimensionsAvailable: " + (webcam.videoWidth !== 0));

        if(webcam.videoWidth === 0) {

          setTimeout(onStreamDimensionsAvailable, 100);

        } else {

          // Resize the canvas to match the webcam video size.
          imageData.width = webcam.videoWidth;
          imageData.height = webcam.videoHeight;
          imageDataCtx = imageData.getContext("2d");

          window.addEventListener("resize", onResize);
          onResize();

          // on iOS we want to close the video stream first and
          // wait for the heavy BRFv4 initialization to finish.
          // Once that is done, we start the stream again.

          // as discussed above, close the stream on iOS and wait for BRFv4 to be initialized.

          if(isIOS) {

            webcam.pause();
            webcam.srcObject.getTracks().forEach(function(track) {
              track.stop();
            });
          }

          waitForSDK();
        }
      }

      // imageDataCtx is not null if we restart the camera stream on iOS.

      if(imageDataCtx === null) {

        onStreamDimensionsAvailable();

      } else {

        trackFaces();
      }
    }

    // start the camera stream...
    window.navigator.mediaDevices.getUserMedia({ video: { width: camWidth, height: camHeiht, frameRate: camFPS } })
      .then(onStreamFetched).catch(function () { alert("No camera available."); });
  }

  function waitForSDK() {

    if(brfv4 === null && window.hasOwnProperty("initializeBRF")) {

      // Set up the namespace and initialize BRFv4.
      // locateFile tells the asm.js version where to find the .mem file.
      // wasmBinary gets the preloaded .wasm file.

      brfv4 = {
        locateFile: function(fileName) { return brfv4BaseURL + fileName; },
        wasmBinary: brfv4WASMBuffer // Add loaded WASM file to Module
      };

      initializeBRF(brfv4);
    }

    if(brfv4 && brfv4.sdkReady) {

      initSDK();

    } else {

      setTimeout(waitForSDK, 250); // wait a bit...
    }
  }

  function initSDK() {

    // The brfv4 namespace is now filled with the API classes and objects.
    // We can now initialize the BRFManager and the tracking API.

    resolution = new brfv4.Rectangle(0, 0, imageData.width, imageData.height);
    let roi = new brfv4.Rectangle(
      (imageData.width - ctrl.roiwidth) * 0.5,
      (imageData.height - ctrl.roiheight) * 0.5,
      ctrl.roiwidth,
      ctrl.roiheight
    );

    brfManager = new brfv4.BRFManager();
    brfManager.init(resolution, roi, "com.tastenkunst.brfv4.js.examples.minimal.webcam");
    brfManager.setNumFacesToTrack(ctrl.numberOfFaceToTrack);

    //send brf data to controller
    ctrl.brfv4 = brfv4;
    ctrl.brfManager = brfManager;
    ctrl.imageDataCtx = imageDataCtx;
    ctrl.resolution = resolution;
    ctrl.webcam = webcam;
    ctrl.brfv4ES = brfv4Example;

    if(isIOS) {

      // Start the camera stream again on iOS.

      setTimeout(function () {

        console.log('delayed camera restart for iOS');

        startCamera();

      }, 2000)

    } else {

      trackFaces();
    }
  }

  function trackFaces() {
    //Here is our main Loop
    ctrl.update(brfv4Example, brfv4, brfManager, imageDataCtx, resolution, webcam);

    requestAnimationFrame(trackFaces);
  }
}
