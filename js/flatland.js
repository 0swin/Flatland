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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*-------------------------------------------------------
Variables
--------------------------------------------------------*/
// var ctrl = new Controller(1280, 720, 30, "webcam", "canvasData");
// var cta = document.getElementById("CTA");
// var timer;
// var boolDisplayCTA = true;
//
// ctrl.setROI(640, 480);
// ctrl.setNumberOfFacesToTrack(2);
// ctrl.initTracking();
// ctrl.setDebug(true);

/*-------------------------------------------------------
FLATLANDER GENERATION
--------------------------------------------------------*/

var lottieContainer = document.getElementById("lottieContainer");

for (i = 1; i <= 6; i++) {
  // GÉNÉRER UNE DIV POUR CHAQUE MORCEAU DE VISAGE
  var facePart = document.createElement("div");
  facePart.id = "facePart" + i;
  lottieContainer.appendChild(facePart)
  facePart.style.zIndex = i;
  facePart.style.position = "absolute";
  facePart.style.height = "200px"
  facePart.style.width = "200px"
  facePart.style.top = getRandomInt(-50, 250)+"px"
  facePart.style.left = getRandomInt(-50, 250)+"px"

  // POSITIONNER ALEATOIREMENT LA DIV

  var animationData = {
    container: facePart,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'json/calque1/' + getRandomInt(1, 3) + '.json'
  };

  lottie.loadAnimation(animationData);
}
