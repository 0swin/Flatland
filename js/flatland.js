Controller.prototype.handleTrackingResults = function(faces) {

  var firstFace = faces[0];
  if (firstFace.state === this.brfv4.BRFState.FACE_TRACKING_START ||
    firstFace.state === this.brfv4.BRFState.FACE_TRACKING) {
    if (boolDisplayCTA === true) {
      launchXP();
      boolDisplayCTA = false;
      console.log("Visage detecté, cta non affiché")
    }
    var smile = this.getSmileFactor(firstFace);
    var yawn = this.getYawnFactor(firstFace);
    console.log("smile factor: " + smile + " yawn factor: " + yawn)
  } else {
    if (boolDisplayCTA === false) {
      timer = setTimeout(displayCTA, 5000, firstFace, this.brfv4.BRFState.FACE_DETECTION);
      boolDisplayCTA = true;
      console.log("Visage non detecté, cta affiché")
    }
  }
}

function launchXP() {
  cta.style.opacity = 0.0;
}

function displayCTA(face, untrackState) {
  if (face.state === untrackState) {
    cta.style.opacity = 1.0;
    clearTimeout(timer);
  }
}

/*-------------------------------------------------------
CECI SONT MES VARIABLES !!:!!!!!!!!!!!
--------------------------------------------------------*/
var ctrl = new Controller(1280, 720, 30, "webcam", "canvasData");
var cta = document.getElementById("CTA");
var timer;
var boolDisplayCTA = true;
ctrl.setROI(640, 480);
ctrl.setNumberOfFacesToTrack(2);
ctrl.initTracking();
ctrl.setDebug(true);
