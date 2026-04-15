let video;
let handPose;
let hands = [];
let particles = [];
let modelStatus = "Loading ML Model...";

function preload() {
  // Initialize the handPose model before setup starts
  handPose = ml5.handPose();
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  
  // Setup webcam
  video = createCapture(VIDEO, () => {
    // Start tracking once webcam is attached
    handPose.detectStart(video, results => {
      hands = results;
      modelStatus = "Tracking Active";
    });
    
    // Hide instructions once webcam connects
    let instructions = select('#instructions');
    if (instructions) {
      instructions.addClass('fade-out');
    }
  });
  
  // Use a fixed size for the video analysis for stability with ML models
  video.size(640, 480);
  video.hide();
}

function draw() {
  // Use a semi-transparent background to create motion trails
  background(5, 5, 16, 40);
  
  // Check if we have hand predictions from the model
  if (hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];
        
        // Grab the index finger tip coordinate specifically 
        let indexFinger = hand.index_finger_tip;
        
        if (indexFinger && indexFinger.x != null) {
            // Screen is larger than video, so we map video coordinates to canvas coordinates.
            // Notice we flip the X coordinates because webcam feeds are mirrored.
            let mappedX = map(indexFinger.x, 0, video.width, width, 0); 
            let mappedY = map(indexFinger.y, 0, video.height, 0, height);
            
            // Spawn 3 particles per frame around the finger to make a dense glowing trail
            for (let j = 0; j < 3; j++) {
              particles.push(new Particle(mappedX, mappedY));
            }
        }
    }
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.show();
    
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }

  // Draw webcam preview on the top right
  drawMiniPreview();
}

function drawMiniPreview() {
  if (video && video.loadedmetadata) {
    push();
    let previewW = windowWidth > 800 ? 240 : 160;
    let previewH = Math.floor(previewW * (video.height / video.width));
    let xOff = width - previewW - 20;
    let yOff = 20;
    
    fill(0, 0, 0, 150);
    stroke(255, 50);
    strokeWeight(1);
    rect(xOff, yOff, previewW, previewH, 4);
    
    translate(xOff + previewW, yOff);
    scale(-1, 1);
    image(video, 0, 0, previewW, previewH);
    pop();
    
    push();
    fill(255);
    noStroke();
    textSize(10);
    textAlign(LEFT, TOP);
    // Draw the model status over the preview
    if (modelStatus === "Loading ML Model...") {
      fill(255, 100, 100); // Red when loading
    } else {
      fill(100, 255, 100); // Green when active
    }
    text(modelStatus, xOff + 8, yOff + 8);
    pop();
  }
}

// Particle class
class Particle {
  constructor(x, y) {
    this.pos = createVector(x + random(-15, 15), y + random(-15, 15));
    // Erupt outwards initially
    this.vel = p5.Vector.random2D().mult(random(1, 4));
    this.acc = createVector(0, 0);
    
    // Shorter lifespan for trailing
    this.lifespan = random(200, 255);
    this.fadeRate = random(5, 8);
    
    this.color = color(random(0, 50), random(150, 255), random(200, 255));
    this.size = random(4, 10);
  }
  
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= this.fadeRate;
    
    // Smooth upward drift for particles resembling smoke/magic
    this.applyForce(createVector(0, -0.08));
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  isDead() {
    return this.lifespan <= 0;
  }
  
  show() {
    if (this.isDead()) return;
    
    noStroke();
    fill(
      red(this.color), 
      green(this.color), 
      blue(this.color), 
      this.lifespan
    );
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
