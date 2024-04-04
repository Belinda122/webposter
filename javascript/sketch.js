let particles = [];
let raining = false; // Variable to track rain state
let snowing = false; // Variable to track snow state
const gravity = 0.01; // Strength of gravity (adjust as needed)
const particleInterval = 20; // Delay between each particle's creation
const particleSize = 5; // Size of each particle (increased size for snowflakes)
const rainSpeedMin = 8; // Minimum speed of raindrops (increased speed for raindrops)
const rainSpeedMax = 14; // Maximum speed of raindrops (increased speed for raindrops)
const snowSpeedMin = 1; // Minimum speed of snowflakes (decreased speed for snowflakes)
const snowSpeedMax = 3; // Maximum speed of snowflakes (decreased speed for snowflakes)

let lastParticleCreation = 0;

let buildings = []; // Array to hold building vertices

// Define vertices for each building
let building1 = [
  { x: 0, y: 1000 },
  { x: 0, y: 500 },
  { x: 200, y: 650 },
  { x: 200, y: 1000 }
];

let building2 = [
  { x: 250, y: 1000 },
  { x: 250, y: 500 },
  { x: 325, y: 450 },
  { x: 400, y: 500 },
  { x: 400, y: 1000 }
];

let building3 = [
  { x: 420, y: 1000 },
  { x: 420, y: 470 },
  { x: 475, y: 400 },
  { x: 530, y: 470 },
  { x: 530, y: 1000 }
];

let building4 = [
    { x: 580, y: 1000 },
    { x: 580, y: 700 },
    { x: 680, y: 550 },
    { x: 800, y: 700 },
    { x: 800, y: 1000 }
];

let building5 = [
    { x: 820, y: 1000 },
    { x: 820, y: 600 },
    { x: 860, y: 500 },
    { x: 900, y: 600 },
    { x: 900, y: 1000 }
];

let building6 = [
    { x: 1000, y: 1000 },
    { x: 1000, y: 620 },
    { x: 1350, y: 500 },
    { x: 1500, y: 600 },
    { x: 1500, y: 1000 }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0); // Set background color to black

  // Add buildings to the buildings array
  buildings.push(building1);
  buildings.push(building2);
  buildings.push(building3);
  buildings.push(building4);
  buildings.push(building5);
  buildings.push(building6);
}

function draw() {
  background(0); // Clear the canvas on each frame

  // Draw each building
  noFill(); // No fill for buildings
  stroke(0); // Set stroke color to black for building outlines
  strokeWeight(1); // Set stroke weight to 1
  for (let i = 0; i < buildings.length; i++) {
    let vertices = buildings[i];
    beginShape();
    for (let j = 0; j < vertices.length; j++) {
      vertex(vertices[j].x, vertices[j].y);
    }
    endShape(CLOSE);
  }

  // Draw rain/snow particles
  if (raining && millis() - lastParticleCreation > particleInterval) { // Only create new raindrops if raining and enough time has passed
    particles.push(new Particle(random(width), random(-500, -50), 'rain')); // Adjusted initial position
    lastParticleCreation = millis();
  }
  if (snowing && millis() - lastParticleCreation > particleInterval) { // Only create new snowflakes if snowing and enough time has passed
    particles.push(new Particle(random(width), random(-500, -50), 'snow')); // Adjusted initial position
    lastParticleCreation = millis();
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].applyGravity();
    particles[i].checkCollision(buildings); // Check collision with buildings
    particles[i].update();
    particles[i].display();
    if (particles[i].position.y > height || (particles[i].type === 'rain' && particles[i].disappear)) {
      // Remove particles that fall out of sight or disappear (only raindrops disappear)
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y, type) {
    this.position = createVector(x, y);
    if (type === 'rain') {
      this.velocity = createVector(0, random(rainSpeedMin, rainSpeedMax)); // Random initial velocity for raindrops
    } else if (type === 'snow') {
      this.velocity = createVector(0, random(snowSpeedMin, snowSpeedMax)); // Random initial velocity for snowflakes
    }
    this.acceleration = createVector(0, 0);
    this.type = type; // Type of particle (rain or snow)
    this.disappear = false; // Variable to track if the raindrop should disappear
  }

  applyGravity() {
    // Apply gravity to acceleration
    this.acceleration.add(0, gravity);
  }

  checkCollision(buildings) {
    for (let i = 0; i < buildings.length; i++) {
      let vertices = buildings[i];
      for (let j = 0; j < vertices.length - 1; j++) {
        let p1 = vertices[j];
        let p2 = vertices[j + 1];
        // Check if the particle's position is within the bounding box of the line segment
        if (
          this.position.x >= min(p1.x, p2.x) &&
          this.position.x <= max(p1.x, p2.x) &&
          this.position.y >= min(p1.y, p2.y) &&
          this.position.y <= max(p1.y, p2.y)
        ) {
          // Calculate the distance from the particle to the line segment
          let distance = abs(
            (p2.y - p1.y) * this.position.x -
            (p2.x - p1.x) * this.position.y +
            p2.x * p1.y -
            p2.y * p1.x
          ) / dist(p1.x, p1.y, p2.x, p2.y);
          // If the distance is less than the particle size, it's a collision
          if (distance <= particleSize) {
            // Stop the particle's movement
            this.velocity.y *= 0;
            this.acceleration.set(0, 0);
            // Mark the raindrop to disappear after a delay
            if (this.type === 'rain') {
              setTimeout(() => {
                this.disappear = true;
              }, 0);
            }
            return;
          }
        }
      }
    }
  }

  update() {
    // Update velocity
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

    // Reset acceleration
    this.acceleration.set(0, 0);

    // Wrap around edges
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
  }

  display() {
    if (this.type === 'snow') {
      stroke(255); // White color for snowflakes
      fill(255); // White color for snowflakes
      ellipse(this.position.x, this.position.y, particleSize, particleSize); // Draw snowflake as an ellipse
    } else {
      stroke(255); // White color for raindrops
      line(this.position.x, this.position.y, this.position.x, this.position.y + particleSize); // Draw raindrop as a line
    }
  }

}

function startRain() {
    raining = !raining; // Toggle rain state
    if (!raining) {
      lastParticleCreation = millis(); // Reset last particle creation time
    }
    snowing = false;   // Ensure snow state is off
  }
  
  function startSnow() {
    snowing = !snowing; // Toggle snow state
    if (!snowing) {
      lastParticleCreation = millis(); // Reset last particle creation time
    }
    raining = false;    // Ensure rain state is off
  }
  
  function clearParticles() {
        particles = []; // Clear all particles
        raining = false; // Stop raining
        snowing = false; // Stop snowing
      }
      
  
