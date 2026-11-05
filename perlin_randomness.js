// RANDOMNESS MODULE
// Selects appearance parameters when flowers are created and manages randomly appearing sparkles and butterflies.


// Sunflower class.
// Input: spec contains the flower position and size settings; growthDelay is the growth delay in seconds.
// Output: a Sunflower instance containing random appearance, initial Perlin noise values, and lifecycle state.
class Sunflower {
  constructor(spec, growthDelay) {
    let a = sunflowerAppearanceOptions;
    this.spec = spec;
    this.row0PetalCount = random(a.row0PetalCounts);
    this.row1PetalCount = random(a.row1PetalCounts);
    this.row2PetalCount = random(a.row2PetalCounts);
    this.row0PetalColor = random(a.row0PetalColors);
    this.row1PetalColor = random(a.row1PetalColors);
    this.row2PetalColor = random(a.row2PetalColors);
    this.centerBaseColor = random(a.sunflowerCenterBaseColors);
    this.centerMiddleColor = random(a.sunflowerCenterMiddleColors);
    this.petalAspectRatio = random(a.petalAspectRatios);
    this.petalLengthScale = random(a.petalLengthScales);
    this.petalAngleOffset = random(a.petalOffsetOptions);
    this.centerDesign = random(a.centerDesigns);
    this.centerDetailShape = "circle";
    this.growthDelay = growthDelay;
    initializePerlinNoiseState(this);
    this.droopDirection = random([-1, 1]);
    initializeFlowerState(this);
  }
}

// Creates and returns a new sunflower data object.
function makeSunflower(spec, growthDelay) {
  return new Sunflower(spec, growthDelay);
}

// Generates a fixed appearance for every small red flower and stores the results in smallFlowerLooks.
function createSmallFlowerLooks() {
  smallFlowerLooks = [];
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    smallFlowerLooks.push({
      shape: sunflowerAppearanceOptions.smallFlowerShapes[0],
      color: random(
        sunflowerAppearanceOptions.smallRedFlowerPetalColors
      )
    });
  }
}

// Maximum number of sparkle points.
let SPARKLE_COUNT = 4;
// Refreshes sparkle points every 60 frames.
let SPARKLE_REFRESH_FRAMES = 60;
// Sparkle layer.
let sparkleLayer = null;

let sparkles = [];


// Creates the SVG sparkle layer and reusable circle nodes.
function setupSparkles() {
  if (sparkleLayer !== null) {
    return;
  }
  sparkleLayer = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );

  // Assigns attributes to the sparkle layer.
  // Adds an accessible label to the sparkle layer.
  sparkleLayer.setAttribute("id", "orange-sparkles");
  // Prevents the layer from receiving pointer events.
  sparkleLayer.setAttribute("pointer-events", "none");
  // Appends the layer to the SVG canvas.
  svgRoot.appendChild(sparkleLayer);

    // Creates one sparkle point.
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    let glowLayers = [];
    // Glow circle.
    for (let j = 0; j < 10; j++) {
      let glow = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      glow.setAttribute("fill", "#ffe923");
      glow.setAttribute("opacity", "0");
      sparkleLayer.appendChild(glow);
      glowLayers.push(glow);
    }
    // Bright centre circle.
    let point = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    point.setAttribute("fill", "#ffb121");
    point.setAttribute("opacity", "0");
    sparkleLayer.appendChild(point);
    // Stores the centre circle and glow together in the sparkles array.
    sparkles.push({
      glowLayers: glowLayers,
      point: point,
      active: false,
      startFrame: 0,
      duration: 0,
      nextFrame: frameCount + floor(random(0, 60))
    });
  }
}

// Updates all sparkle points once per frame.
function updateSparkles() {
  for (let i = 0; i < sparkles.length; i++) {
    let sparkle = sparkles[i];
    // Starts a new random sparkle when its scheduled frame is reached.
    if (!sparkle.active) {
      if (frameCount >= sparkle.nextFrame) {
        sparkle.active = true;
        sparkle.nextFrame = frameCount + SPARKLE_REFRESH_FRAMES;
        // Randomly selects the sparkle position.
        let x = random(15, 870);
        let y = random(20, 765);
        // Randomly selects the radius; Codex assisted with tuning these values.
        let radius = random(2, 8);
        sparkle.duration = 60;
        sparkle.startFrame = frameCount;
        sparkle.point.setAttribute("cx", "" + x);
        sparkle.point.setAttribute("cy", "" + y);
        sparkle.point.setAttribute("r", "" + radius);
        for (let j = 0; j < sparkle.glowLayers.length; j++) {
          let glow = sparkle.glowLayers[j];
          let scale = 3 - j * 0.2;
          glow.setAttribute("cx", "" + x);
          glow.setAttribute("cy", "" + y);
          glow.setAttribute("r", "" + radius * scale);
        }
      }
    }

    // Updates sparkle points that are currently visible.
    if (sparkle.active) {
      let progress = (frameCount - sparkle.startFrame) / sparkle.duration;
      if (progress >= 1) {
        // Hides a sparkle after its animation ends.
        sparkle.active = false;
        sparkle.point.setAttribute("opacity", "0");
        for (let j = 0; j < sparkle.glowLayers.length; j++) {
          sparkle.glowLayers[j].setAttribute(
            "opacity",
            "0"
          );
        }
      } else {
        let brightness = 1;
        if (progress < 0.1) {
          brightness = map(progress, 0, 0.1, 0, 1);
        } else if (progress > 0.9) {
          brightness = map(progress, 0.9, 1, 1, 0);
        }
        // Updates the opacity of the bright centre.
        sparkle.point.setAttribute(
          "opacity",
          "" + brightness * 0.95
        );
        // Keeps the inner circle brighter and the outer circle more transparent to create a soft glow.
        for (let j = 0; j < sparkle.glowLayers.length; j++) {
          let opacity = brightness * (0.02 + j * 0.009);
          sparkle.glowLayers[j].setAttribute(
            "opacity",
            "" + opacity
          );
        }
      }
    }
  }
}


// Butterfly randomness.
let BUTTERFLY_WAIT_MIN = 0;
let BUTTERFLY_WAIT_MAX = 60;
let BUTTERFLY_HOLD_FRAMES = 60;
let butterflyLayer = null;
let activeButterfly = null;
let nextButterflyFrame = 0;

// Butterfly layer.
function setupButterflies() {
  butterflyLayer = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  // Assigns attributes to the butterfly layer.
  // Adds an accessible label to the butterfly layer.
  butterflyLayer.setAttribute("id", "butterfly-layer");
    // Prevents the layer from receiving pointer events.
  butterflyLayer.setAttribute("pointer-events", "none");
    // Appends the layer to the SVG canvas.
  svgRoot.appendChild(butterflyLayer);

  nextButterflyFrame = frameCount + floor(random(BUTTERFLY_WAIT_MIN, BUTTERFLY_WAIT_MAX));
}

// Randomly creates one butterfly.
function createRandomButterfly() {
  // Randomly selects one of the three butterfly images.
  let selectedImage = random(butterflyImages);
  // Randomly selects the butterfly size.
  let size = random(75, 120);
  // Randomly selects a position within the canvas.
  let x = random(80, W - 80 - size);
  let y = random(90, H - 200 - size);

  let butterfly = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );

  butterfly.setAttribute("href", selectedImage);
  butterfly.setAttribute("x", x);
  butterfly.setAttribute("y", y);
  butterfly.setAttribute("width", size);
  butterfly.setAttribute("height", size);
  butterfly.setAttribute("opacity", 1);
  butterfly.setAttribute(
    "preserveAspectRatio",
    "xMidYMid meet"
  );

  butterflyLayer.appendChild(butterfly);

  activeButterfly = {
    element: butterfly,
    startFrame: frameCount
  };
}

// Manages the butterfly lifecycle.
function updateButterflies() {
  // When no butterfly is visible, waits for the scheduled appearance frame.
  if (activeButterfly === null) {
    if (frameCount >= nextButterflyFrame) {
      createRandomButterfly();
    }
    return;
  }
  let elapsed = frameCount - activeButterfly.startFrame;
  // Removes the current butterfly after it has been visible for one second.
  if (elapsed >= BUTTERFLY_HOLD_FRAMES) {
    activeButterfly.element.remove();
    activeButterfly = null;
    // Generates a random waiting time for the next butterfly.
    nextButterflyFrame = frameCount +
      floor(random(BUTTERFLY_WAIT_MIN, BUTTERFLY_WAIT_MAX));
  }
}


// PERLIN NOISE MODULE
// Converts continuous noise into subtle natural swaying for stems, flower heads, leaves, and small flowers.

// Sway amplitude.
let SWAY_MAX = 8;
// Sway speed.
let SWAY_SPEED = 1.5;
// Initial sway angle.
let SWAY_FADE_FRAMES = 45;
// Leaf sway amplitude relative to the main sway amplitude.
let LEAF_SWAY_FACTOR = 0.4;

let swayAmplitude = SWAY_MAX;
let stemRecords = {};
let flowerWrappers = {};
let leafWrappers = [];
let smallFlowerWrappers = [];
let auxStates = {};
let mainFlowerByStem = {};


// Calculates a stable offset from an object ID; Codex assisted with this function.
function stableNoiseOffset(id) {
  let name = "" + id;
  let number = 7;
  for (let i = 0; i < name.length; i++) {
  number = (number * 31 + name.charCodeAt(i)) % 100000;
  }
  return 20 + number / 977;
}


// Writes independent Perlin noise values to one flower.
function initializePerlinNoiseState(flower) {
  flower.noiseStart = random(20, 200);
  flower.noiseSpeed = 0.08;
}

// Sets the maximum currently allowed sway angle.
function setSwayAmplitude(degrees) {
  if (degrees >= 0) {
    swayAmplitude = degrees;
    if (swayAmplitude > SWAY_MAX) {
      swayAmplitude = SWAY_MAX;
    }
  }
}

// Collects all stems and SVG wrapper nodes; Codex assisted with this function.
function captureSway() {
  stemRecords = {};
  flowerWrappers = {};
  leafWrappers = [];
  smallFlowerWrappers = [];
  auxStates = {};
  mainFlowerByStem = {};

  for (let i = 0; i < sunflowers.length; i++) {
    let id = MAIN_STEM_BY_FLOWER[sunflowers[i].spec.id];
    mainFlowerByStem[id] = sunflowers[i];
  }

  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    let info = stemInfo[id];
    let points = info.points;
    let start = points[0];
    let end = points[points.length - 1];
    stemRecords[id] = {
      path: info.path,
      baseY: start[1],
      topY: end[1],
      offsetX: 0,
      offsetY: 0,
      angle: 0,
      shakeOffset: random(0, 500)
    };

    if (!mainFlowerByStem[id]) {
      let red = isRedStem(id);
      auxStates[id] = {
        noiseStart: random(20, 200),
        noiseSpeed: 0.072,
        swayAngle: 0,
        swayY: 0,
        movementBlend: red ? 1 : 0,
        movementStartFrame: red ? -1000 : null
      };
    }
  }

  for (let i = 0; i < sunflowers.length; i++) {
    let id = sunflowers[i].spec.id;
    flowerWrappers[id] = document.getElementById(id + "-sway-wrapper");
  }

  for (let i = 0; i < currentLeaves.length; i++) {
    leafWrappers[i] = document.getElementById("leaf-" + (i + 1) + "-sway-wrapper");
  }
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    let id = visualSmallFlowers[i][0];
    smallFlowerWrappers[i] = document.getElementById(
      id + "-sway-wrapper"
    );
  }
  // Creates the random sparkle layer.
  setupSparkles();
  // Initialises the random butterfly layer.
  setupButterflies();
}

// Sets a transform on the specified SVG wrapper node.
// Input: wrapper is an SVG element; transform is a transform string.
// Output: updates the node's transform attribute; an empty value restores translate(0 0).
function setWrapperTransform(wrapper, transform) {
  if (wrapper) {
    wrapper.setAttribute(
      "transform",
      transform || "translate(0 0)"
    );
  }
}

// Restores all sway translations and rotations to their initial state.
function resetSway() {
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    let r = stemRecords[id];
    r.offsetX = 0;
    r.offsetY = 0;
    r.angle = 0;
    drawStem(id, stemProgress[id] || 0);
  }

  for (let i = 0; i < sunflowers.length; i++) {
    setWrapperTransform(
      flowerWrappers[sunflowers[i].spec.id],
      ""
    );
  }

  for (let i = 0; i < leafWrappers.length; i++) {
    setWrapperTransform(leafWrappers[i], "");
  }

  for (let i = 0; i < smallFlowerWrappers.length; i++) {
    setWrapperTransform(smallFlowerWrappers[i], "");
  }
}

// Calculates the continuous noise-driven sway state of one object for the current frame.
function updateSwayState(state, ready) {
  if (!ready) {
    state.swayAngle = 0;
    state.swayY = 0;
    state.movementBlend = 0;
    state.movementStartFrame = null;
    return;
  }

  if (state.movementStartFrame === null) {
    state.movementStartFrame = frameCount;
  }

  state.movementBlend = constrain(
    (frameCount - state.movementStartFrame) /
      SWAY_FADE_FRAMES,
    0,
    1
  );

  let frames = frameCount - state.movementStartFrame;
  let location = state.noiseStart + state.noiseSpeed * SWAY_SPEED * frames / 60;
  let fade = easeOutCubic(state.movementBlend);
  state.swayAngle = (noise(location) - 0.5) * 2 * swayAmplitude * fade;
  state.swayY = (noise(location + 80) - 0.5) * 6 * fade;
}

// Updates every animated element once per frame.
function updateFlowers() {
  let seconds = frameCount / 60 * SWAY_SPEED;
  for (let i = 0; i < sunflowers.length; i++) {
    updateSwayState(
      sunflowers[i],
      sunflowers[i].growthState === "finished"
    );
  }

  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    if (auxStates[id]) {
      updateSwayState(
        auxStates[id],
        (stemProgress[id] || 0) >= 1
      );
    }
  }

  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    let r = stemRecords[id];
    let flower = mainFlowerByStem[id];
    let state = flower || auxStates[id];
    let swayAngle = state ? state.swayAngle : 0;
    let height = abs(r.baseY - r.topY);

    if (isRedStem(id) && height < 100) {
      height = 100;
    }

    let ordinary = getRegularMotion(
      flower,
      seconds,
      r.shakeOffset
    );

    r.offsetX = height * sin(radians(swayAngle + ordinary.droopAngle * 0.55)) + ordinary.shakeX + ordinary.inputX;
    r.offsetY = (state ? state.swayY : 0) + ordinary.ageingY + ordinary.inputY;
    r.angle = swayAngle + ordinary.droopAngle + ordinary.shakeAngle;
    drawStem(id, stemProgress[id] || 0);
  }

  swayFlowerHeads();
  swayLeaves(seconds);
  swaySmallFlowers();
  updateSparkles();
  updateButterflies();
}
// Element binding.
// Applies each stem's translation and angle to its corresponding main sunflower head.
function swayFlowerHeads() {
  for (let i = 0; i < sunflowers.length; i++) {
    let f = sunflowers[i];
    let wrapper = flowerWrappers[f.spec.id];
    let record = stemRecords[MAIN_STEM_BY_FLOWER[f.spec.id]];

    if (record) {
      let angle = record.angle;
      let x = f.spec.x;
      let y = f.spec.y;
      let move = "translate(" + formatNumber(record.offsetX) + " " + formatNumber(record.offsetY) + ")";
      move += " rotate(" + formatNumber(angle) + " " + x + " " + y + ")";
      move += getInputTiltTransform(f);
      setWrapperTransform(wrapper, move);
    }
  }
}

// Makes leaves follow their stems and adds a smaller local noise rotation.
function swayLeaves(seconds) {
  for (let i = 0; i < currentLeaves.length; i++) {
    let wrapper = leafWrappers[i];
    let id = currentLeafProfiles[i][0];

    if (wrapper) {
      if (id === "pot") {
        setWrapperTransform(wrapper, "");

      } else if (stemRecords[id]) {
        let r = stemRecords[id];
        let along = currentLeafProfiles[i][1];
        let amount = along * along;
        let offsetX = r.offsetX * amount;
        let offsetY = r.offsetY * amount;
        let state = mainFlowerByStem[id] || auxStates[id];
        let blend = state ? state.movementBlend : 0;
        let localAngle = (noise(50 + i * 5 + seconds * 0.11) - 0.5) * 2 * swayAmplitude * LEAF_SWAY_FACTOR * blend;
        let leaf = currentLeaves[i];
        let transform = "translate(" + formatNumber(offsetX) + " " + formatNumber(offsetY) + ")";
        transform += " rotate(" + formatNumber(localAngle) + " " + formatNumber(leaf[0]) + " " + formatNumber(leaf[1]) + ")";
        setWrapperTransform(wrapper, transform);
      }
    }
  }
}

// Makes the nine small red flowers follow the tops of their respective stems.
function swaySmallFlowers() {
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    let id = "stem-red-0" + (i + 1);
    let record = stemRecords[id];

    if (record) {
      setWrapperTransform(
        smallFlowerWrappers[i],
        "translate(" + formatNumber(record.offsetX) + " " + formatNumber(record.offsetY) + ")"
      );
    }
  }
}
