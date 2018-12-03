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

function getAllChild(parent, selector) {
  let element = document.getElementById(parent);
  return element.querySelectorAll(selector);
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

function createFacePart(height, width, calque) {
  // GÉNÉRER UNE DIV POUR CHAQUE MORCEAU DE VISAGE
  var facePart = document.createElement("div");
  facePart.id = "facePart" + i;
  lottieContainer.appendChild(facePart)
  facePart.style.zIndex = i;
  facePart.style.position = "absolute";
  facePart.style.height = height + "px";
  facePart.style.width = width + "px";

  // POSITION ALEATOIRE
  facePart.style.top = getRandomInt(-50, 250) + "px";
  facePart.style.left = getRandomInt(-50, 250) + "px";

  // COULEUR ALEATOIRE
  var hue = getRandomInt(0, 359);
  var saturation = getRandomInt(50, 100);
  var lightness = getRandomInt(50, 100);
  var hsl = "hsl(" + hue + "," + saturation + "," + lightness + ")";
  console.log(hsl);

  var animationData = {
    container: facePart,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "json/" + calque + "/" + getRandomInt(1, 4) + ".json"
  };
  var anim = lottie.loadAnimation(animationData);
  //we define a local variable to save the index in the for loop
  let index = i;
  //we add an event to get all the elements when tey are add to the DOM
  anim.addEventListener('DOMLoaded', function(){
      console.log("facePart" + index);
      let child = getAllChild("facePart" + index, "#fill");
      for (let j = 0; j < child.length; j++) {
          console.log(index)
      }
  });
}


for (var i = 1; i <= 6; i++) {
  createFacePart(100, 100, "calque1")
}
