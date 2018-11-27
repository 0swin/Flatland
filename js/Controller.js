var Controller = function(width, height, fps, cameraDiv, canvasDiv){
  this.width = width;
  this.height = height;
  this.fps = fps;
  this.roiwidth = 640;
  this.roiheight = 480;
  this.numberOfFaceToTrack = 2;
  this.cameraDiv = cameraDiv;
  this.canvasDiv = canvasDiv;
  //brfv4 data
  this.brfv4 = null;
  this.brfManager = null;
  this.imageDataCtx = null;
  this.resolution = null;
  this.webcam = null;
  this.brfv4ES = null;
  //// DEBUG:
  this.debug = false;
}

Controller.prototype.setDebug = function(state){
  this.debug = state;
}

Controller.prototype.setROI = function(roiwidth, roiheight){
  this.roiwidth = roiwidth;
  this.roiheight = roiheight;
}

Controller.prototype.setNumberOfFacesToTrack = function(numberOfFaceToTrack){
  this.numberOfFaceToTrack = numberOfFaceToTrack;
}

Controller.prototype.initTracking = function(){
  let ctx = this;
  //detect WebAssembly support tro load either WASM or ASM
  //console.log("Checking support of WebAssembly: " + _isWebAssemblySupported + " " + (_isWebAssemblySupported ? "loading WASM (not ASM)." : "loading ASM (not WASM)."));
  if(_isWebAssemblySupported){
    readWASMBinary(brfv4BaseURL + brfv4SDKName + ".wasm",
      function(r) {

        brfv4WASMBuffer = r; // see function waitForSDK. The ArrayBuffer needs to be added to the module object.

        addBRFScript();
        initExample(ctx, ctx.width, ctx.height, ctx.fps, ctx.cameraDiv, ctx.canvasDiv);

      },
      function (e) { console.error(e); },
      function (p) { console.log(p); }
    );
  }else{
    addBRFScript();
    initExample(ctx, ctx.width, ctx.height, ctx.fps, ctx.cameraDiv, ctx.canvasDiv);
  }
}

Controller.prototype.handleTrackingResults = function(faces){
  // Overwrite this function in your minimal example HTML file.
}

Controller.prototype.displayBRFv4Debug = function(faces){
  for(var i = 0; i < faces.length; i++) {

    var face = faces[i];

    if(face.state === this.brfv4.BRFState.FACE_TRACKING_START ||
      face.state === this.brfv4.BRFState.FACE_TRACKING) {

      this.imageDataCtx.strokeStyle="#00a0ff";

      for(var k = 0; k < face.vertices.length; k += 2) {
        this.imageDataCtx.beginPath();
        this.imageDataCtx.arc(face.vertices[k], face.vertices[k + 1], 2, 0, 2 * Math.PI);
        this.imageDataCtx.stroke();
      }
    }
  }
}

Controller.prototype.updateTracking = function(){
  this.brfManager.update(this.imageDataCtx.getImageData(0, 0, this.resolution.width, this.resolution.height).data);
}

Controller.prototype.startStats = function(){
  if(this.brfv4ES.stats.start) this.brfv4ES.stats.start();
}

Controller.prototype.endStats = function(brfv4Example){
  if(this.brfv4ES.stats.end) this.brfv4ES.stats.end();
}

Controller.prototype.drawUser = function(imageDataCtx, resolution, webcam){
  //Draw image of the user
  this.imageDataCtx.setTransform(-1.0, 0, 0, 1, this.resolution.width, 0); // A virtual mirror should be... mirrored
  this.imageDataCtx.drawImage(this.webcam, 0, 0, this.resolution.width, this.resolution.height);
  this.imageDataCtx.setTransform( 1.0, 0, 0, 1, 0, 0); // unmirrored for drawing the results
}

Controller.prototype.update = function(){
  this.startStats();
  this.drawUser();
  this.updateTracking();
  this.handleTrackingResults(this.brfManager.getFaces());
  if(this.debug) this.displayBRFv4Debug(this.brfManager.getFaces());
  this.endStats();
}
