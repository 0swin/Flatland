/*-------------------------------------------------------
Variables
--------------------------------------------------------*/
var webcamWidth = 1280;
var webcamHeight = 720;
var ctrl = new Controller(webcamWidth, webcamHeight, 30, "webcam", "canvasData");
var cta = document.getElementById("CTA");
var instructions = document.getElementById("instructions");
var timer;
var boolDisplayCTA = true;

ctrl.setROI(webcamWidth, webcamHeight);
ctrl.setNumberOfFacesToTrack(2);
ctrl.initTracking();
ctrl.setDebug(true);

var globalHue = getRandomInt(0, 359)

var bgColor = "hsl(" + globalHue + ", 90%, 30%)";
cta.style.background = bgColor;
instructions.style.background = bgColor;

Controller.prototype.handleTrackingResults = function(faces) {
  var firstFace = faces[0];
  // console.log(firstFace);
  if (firstFace.state === this.brfv4.BRFState.FACE_TRACKING_START ||
    firstFace.state === this.brfv4.BRFState.FACE_TRACKING) {
    if (boolDisplayCTA === true) {
      launchXP();
      boolDisplayCTA = false;
      console.log("Visage detecté, cta non affiché")
    }
    var smile = this.getSmileFactor(firstFace);
    console.log(smile);
    var yawn = this.getYawnFactor(firstFace);
    // console.log("smile factor: " + smile + " yawn factor: " + yawn)
  } else {
    if (boolDisplayCTA === false) {
      timer = setTimeout(displayCTA, 5000, firstFace, this.brfv4.BRFState.FACE_DETECTION);
      boolDisplayCTA = true;
      console.log("Visage non detecté, cta affiché")
    }
  }

  //get the face overlay div
  var scale, ix, iy;
  var imageData;
  var divOverlay = document.getElementById("faceOverlay");
  let nx = (firstFace.bounds.x / webcamWidth) * window.innerWidth; // * scale + ix;
  let ny = (firstFace.bounds.y / webcamHeight) * window.innerHeight; // * scale + iy;
  let nw = (firstFace.bounds.width / webcamWidth) * window.innerWidth;
  let nh = (firstFace.bounds.height / webcamHeight) * window.innerHeight;
  let degrees = firstFace.rotationZ * 180 / Math.PI;
  lottieContainer.style.transform = 'rotate(' + degrees + 'deg) scale(1.5)';
  lottieContainer.style.top = ny + "px";
  lottieContainer.style.left = nx + "px";
  lottieContainer.style.height = nh + "px";
  lottieContainer.style.width = nw + "px";

  if (0.3 < smile && smile <= 1) {
    lottieContainer.style.filter = "grayscale(0%)";
    lottieContainer.style.WebkitFilter = "grayscale(0%)";
  } else {
    lottieContainer.style.filter = "grayscale(85%)";
    lottieContainer.style.WebkitFilter = "grayscale(85%)";
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
FLATLANDER GENERATION
--------------------------------------------------------*/

var lottieContainer = document.getElementById("lottieContainer");

function createFacePart(i, height, width, posMin, posMax, rotMin, rotMax, calque, calqueMin, calqueMax, hueOffset) {
  // GÉNÉRER UNE DIV POUR CHAQUE MORCEAU DE VISAGE
  var facePart = document.createElement("div");
  facePart.id = "facePart" + i;
  lottieContainer.appendChild(facePart)
  facePart.style.zIndex = i;
  facePart.style.position = "absolute";
  facePart.style.height = height + "%";
  facePart.style.width = width + "%";
  //ROTATION ALEATOIRE
  facePart.style.transform = "rotate(" + getRandomInt(rotMin, rotMax) + "deg)";
  // POSITION ALEATOIRE
  facePart.style.top = getRandomInt(posMin, posMax) + "%";
  facePart.style.left = getRandomInt(posMin, posMax) + "%";
  // COULEUR FOND ALEATOIRE
  var hue = globalHue + hueOffset + getRandomInt(0, 40)
  var saturation = getRandomInt(60, 100)
  var lightness = getRandomInt(40, 60)
  var hslFill = "hsl(" + hue + "," + saturation + "%," + lightness + "%)";
  var hslStroke = "hsl(" + hue + "," + (saturation + 20) + "%," + (lightness - 30) + "%)";
  // console.log("Fill " + hslFill);
  // console.log("Stroke " + hslStroke);

  var animationData = {
    container: facePart,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "json/" + calque + "/" + getRandomInt(calqueMin, calqueMax) + ".json"
  };
  var anim = lottie.loadAnimation(animationData);
  //we define a local variable to save the index in the for loop
  let index = i;
  //we add an event to get all the elements when tey are add to the DOM
  anim.addEventListener('DOMLoaded', function() {
    // console.log("facePart" + index);
    let childFill = getAllChild("facePart" + index, ".fill");
    for (let j = 0; j < childFill.length; j++) {
      // console.log(child[j]);
      childFill[j].style.fill = hslFill;
    };
    let childStroke = getAllChild("facePart" + index, ".stroke");
    for (let j = 0; j < childStroke.length; j++) {
      childStroke[j].style.stroke = hslStroke;
      childStroke[j].style.strokeWidth = "1%"
    };
    facePart.style.opacity = 1;
  });
};

for (let i = 1; i <= 3; i++) {
  createFacePart(i, 75, 75, 12.5, 25, 0, 360, "calque2", 1, 12, 0);
};

for (let i = 4; i <= 7; i++) {
  createFacePart(i, 25, 25, 12.5, 62.5, -30, 0, "calque1", 1, 7, 180);
};
