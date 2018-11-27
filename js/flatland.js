Controller.prototype.handleTrackingResults = function(faces) {
  // Overwrite this function to update when face are detected
  /*for(var i = 0; i < faces.length; i++) {
    var face = faces[i];

  }*/
  //   for (var n = 0; n < faces.length; n++) {
  //     var face = faces[n];
  //     if (face.state === this.brfv4.BRFState.FACE_TRACKING_START || face.state === this.brfv4.BRFState.FACE_TRACKING) {
  //       console.log("🦊🦊🦊🦊🦊")
  //       this.imageDataCtx.strokeStyle = "#4475BB";
  //       this.imageDataCtx.rect(face.bounds.x, face.bounds.y, face.bounds.width, face.bounds.height);
  //       this.imageDataCtx.stroke();
  //     }
  //   }
  // }

  var firstFace = faces[0];
  if (firstFace.state === this.brfv4.BRFState.FACE_TRACKING_START || firstFace.state === this.brfv4.BRFState.FACE_TRACKING) {
    // cta.style.opacity = 0.0;
    if (boolDisplayCTA === true) {
      cta.style.opacity = 0.0;
      boolDisplayCTA = false;
      console.log("Visage détecté, cta non affiché 🚫");
    }
  } else {
    if (boolDisplayCTA === false) {
      timer = setTimeout(displayCTA, 5000, firstFace, this.brfv4.BRFState.FACE_DETECTION);
      boolDisplayCTA = true;
      console.log("Visage détecté, cta affiché 👱🏻‍")
    }
  }
}

function displayCTA(face, untrackState) {
  if (face.state === untrackState) {
    cta.style.opacity = 1.0;
    clearTimeout(timer);
  }
}

// variables

var timer;
var boolDisplayCTA = true;
var ctrl = new Controller(1280, 720, 30, "webcam", "imageData");
var cta = document.getElementById("CTA");
ctrl.setROI(640, 480);
ctrl.setNumberOfFacesToTrack(2);
ctrl.initTracking();
ctrl.setDebug(true);
