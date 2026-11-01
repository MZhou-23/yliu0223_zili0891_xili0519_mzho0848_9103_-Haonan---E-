// PART 1: DAY AND NIGHT

// One day lasts 1800 frames (about 30 seconds at 60 FPS).
let timeDayLength = 1800;
let timeDayStartFrame = null;
let timeDayNumber = 1;
let timePhase = "Dawn";
let timeProgress = 0;
let timeMoon = 0;

// Each row stores progress, red, green and blue.
let timeSkyColours = [
  [0, 246, 238, 221],
  [0.20, 255, 240, 207],
  [0.43, 250, 228, 185],
  [0.62, 230, 181, 156],
  [0.79, 41, 56, 78],
  [0.91, 41, 56, 78],
  [1, 246, 238, 221]
];

function updateTime() {
  if (timeDayStartFrame === null) {
    timeDayStartFrame = frameCount;
  }

  // Count days and daytime progress using frameCount only.
  let framesSinceStart = frameCount - timeDayStartFrame;
  timeDayNumber = floor(framesSinceStart / timeDayLength) + 1;
  let framesIntoDay = framesSinceStart % timeDayLength;
  timeProgress = framesIntoDay / timeDayLength;

  // Choose the phase of the current day.
  let phaseName = "dawn";
  if (timeProgress < 0.07) {
    timePhase = "Dawn";
    phaseName = "dawn";
  } else if (timeProgress < 0.25) {
    timePhase = "Morning";
    phaseName = "morning";
  } else if (timeProgress < 0.53) {
    timePhase = "Daylight";
    phaseName = "daylight";
  } else if (timeProgress < 0.74) {
    timePhase = "Evening";
    phaseName = "evening";
  } else if (timeProgress < 0.94) {
    timePhase = "Night";
    phaseName = "night";
  } else {
    timePhase = "Dawn";
    phaseName = "dawn";
  }

  // Update the sky and the text on the page.
  document.documentElement.setAttribute(
    "style",
    "--sky: " + timeSkyColour() + ";"
  );

  document.documentElement.setAttribute(
    "data-phase",
    phaseName
  );

  document.getElementById("phase").textContent = timePhase;
  let dayText = "" + timeDayNumber;
  if (timeDayNumber < 10) {
    dayText = "0" + timeDayNumber;
  }

  document.getElementById("day").textContent = "DAY " + dayText;
  // Keep the original sun and moon transition times.
  let moonAmount = smoothRange(0.44, 0.56, timeProgress) * (1 - smoothRange(0.88, 1, timeProgress));
  timeMoon = moonAmount;
  let sunAmount = 1 - moonAmount;
  let ringTurn = "rotate(" + formatNumber(frameCount * 0.15) + ")";
  document.getElementById("sun-body").setAttribute(
    "opacity",
    formatNumber(sunAmount)
  );
  document.getElementById("sun-rays").setAttribute(
    "transform",
    ringTurn
  );
  document.getElementById("moon-body").setAttribute(
    "opacity",
    formatNumber(moonAmount)
  );
  document.getElementById("moon-dots").setAttribute(
    "transform",
    ringTurn
  );
}

// Blend the RGB numbers using lerp() rather than lerpColor().
function timeSkyColour() {
  for (let i = 1; i < timeSkyColours.length; i++) {
    let current = timeSkyColours[i];
    let previous = timeSkyColours[i - 1];
    if (timeProgress <= current[0]) {
      let amount = map(
        timeProgress,
        previous[0],
        current[0],
        0,
        1,
        true
      );
      let red = round(
        lerp(previous[1], current[1], amount)
      );
      let green = round(
        lerp(previous[2], current[2], amount)
      );
      let blue = round(
        lerp(previous[3], current[3], amount)
      );
      return "rgb(" +
        red + "," +
        green + "," +
        blue + ")";
    }
  }
  return "rgb(246,238,221)";
}

// PART 2: FLOWER LIFECYCLE

// One watering keeps the sunflowers fresh for one day.
let WATER_LASTS_DAYS = 1;
let plantGrowStartFrame = 0;
let seenWaterFrame = null;
let freshFrame = 0;
let waterWaiting = false;

function updateLifecycle() {
  // Check whether a new drop has watered the pot.
  if (plantWatered && lastWaterFrame !== seenWaterFrame) {
    if (seenWaterFrame === null) {
      plantGrowStartFrame = lastWaterFrame;
      freshFrame = lastWaterFrame;
    } else if (bouquetWithering()) {
      waterWaiting = true;
    } else {
      waterFlowers();
    }
    seenWaterFrame = lastWaterFrame;
  }

  // Start regrowth only after the old bouquet has disappeared.
  if (waterWaiting && bouquetGone()) {
    renewFlowers();
    waterWaiting = false;
  }

  // Growth and ageing are calculated from frameCount only.
  let growthProgress = 0;
  let dry = 0;
  if (plantWatered) {
    growthProgress = (frameCount - plantGrowStartFrame) / timeDayLength;
    dry = (frameCount - freshFrame) / timeDayLength;
  }

  syncGrowth(growthProgress);

  for (let i = 0; i < sunflowers.length; i++) {
    updateFlowerLife(
      sunflowers[i],
      growthProgress,
      dry
    );
    drawFlowerLife(sunflowers[i]);
  }
  witherPotLeaves();
}

function updateFlowerLife(flower, growthProgress, dry) {
  // Keep the original opening and withering timings.
  let opening = smoothRange(
    0.015,
    0.20,
    growthProgress
  );
  let decayStart = WATER_LASTS_DAYS;
  let age = smoothRange(
    decayStart,
    decayStart + 0.142,
    dry
  );
  let loss = smoothRange(
    decayStart + 0.01,
    decayStart + 0.149,
    dry
  );
  flower.lifeGrowth = opening;
  flower.lifeBloom = opening * (1 - loss);
  flower.ageing = age;
  flower.witherProgress = smoothRange(
    0.05,
    0.94,
    flower.ageing
  );

  flower.mature =flower.lifeBloom > 0.88 && flower.ageing < 0.65;
  if (flower.ageing > 0.72) {
    flower.growthStage = "fading";
  } else if (flower.lifeBloom > 0.88) {
    flower.growthStage = "mature";
  } else if (flower.lifeGrowth > 0.2) {
    flower.growthStage = "growing";
  } else {
    flower.growthStage = "resting";
  }
  updateFlowerParts(flower);
}

// PART 3: PETAL AND CENTRE FADING

// Find petals by their known IDs, using getElementById().
function bindFlowerParts(flower, group) {
  let id = flower.spec.id;
  let petals = [];
  let centreLayers = [];
  // Back petal row (layer 8).
  for (let i = 0; i < flower.row0PetalCount; i++) {
    petals.push(
      document.getElementById(id + "-L8-petal-" + (i + 1))
    );
  }

  // Middle petal row (layer 7).
  for (let i = 0; i < flower.row1PetalCount; i++) {
    petals.push(
      document.getElementById(id + "-L7-petal-" + (i + 1))
    );
  }

  // Front petal row (layer 6).
  for (let i = 0; i < flower.row2PetalCount; i++) {
    petals.push(
      document.getElementById(id + "-L6-petal-" + (i + 1))
    );
  }

  // Five centre layers fade after the petals.
  for (let layer = 5; layer >= 1; layer--) {
    centreLayers.push(
      document.getElementById(
        id + "-layer-" + layer
      )
    );
  }

  // Give different sunflowers slightly different fading times.
  let flowerOffset = ((stableNoiseOffset(id + "-age") % 9) - 4) * 0.02;

  flower.visualParts = [];

  for (let index = 0; index < petals.length; index++) {
    let stable = stableNoiseOffset(id + "-fall-" + index);
    flower.visualParts.push({
      element: petals[index],
      threshold:0.05 + flowerOffset + (index / max(1, petals.length)) * 0.67,
      drift: ((stable % 17) - 8) * 1.8,
      spin: ((stable % 13) - 6) * 8,
      fallProgress: 0
    });
  }

  let centreStable = stableNoiseOffset(
    id + "-fall-centre"
  );

  for (let i = 0; i < centreLayers.length; i++) {
    flower.visualParts.push({
      element: centreLayers[i],
      threshold: 0.72 + flowerOffset,
      drift: ((centreStable % 17) - 8) * 1.8,
      spin: ((centreStable % 13) - 6) * 8,
      fallProgress: 0
    });
  }
}

function updateFlowerParts(flower) {
  for (let i = 0; i < flower.visualParts.length; i++) {
    let part = flower.visualParts[i];
    part.fallProgress = smoothRange(
      part.threshold,
      min(0.98, part.threshold + 0.24),
      flower.ageing
    );

    let fade = constrain(part.fallProgress,0,1);
    if (fade > 0.72) {
      flower.needsRegrowth = true;
    }
    // fade in place, without falling or spinning.
    part.element.setAttribute(
      "opacity",
      "" + (1 - fade)
    );
  }
}

// PART 4: LEAF AND STEM FADING

function captureLeafWrappers() {
  leafLifecycleWrappers = [];
  for (let index = 0; index < currentLeaves.length; index++) {

    leafLifecycleWrappers[index] =
      document.getElementById(
        "leaf-" + (index + 1) + "-lifecycle-wrapper"
      );
  }
}

function drawFlowerLife(flower) {
  let group = document.getElementById(
    flower.spec.id
  );
  // Preserve the growth opacity while individual parts fade.
  group.setAttribute(
    "opacity",
    "" + flower.bloomProgress
  );

  // Make the stem fade gradually, just as before.
  let stemId = MAIN_STEM_BY_FLOWER[
    flower.spec.id
  ];

  let stem = document.getElementById(stemId);

  stem.setAttribute(
    "opacity",
    "" + (1 - flower.witherProgress)
  );

  for (
    let index = 0;
    index < currentLeafProfiles.length;
    index++
  ) {
    if (currentLeafProfiles[index][0] === stemId) {
      witherLeaf(
        index,
        flower.witherProgress
      );
    }
  }
}

function witherPotLeaves() {
  let total = 0;
  for (let i = 0; i < sunflowers.length; i++) {

    total =
      total + sunflowers[i].witherProgress;
  }
  let average = total / sunflowers.length;

  for (
    let index = 0;
    index < currentLeafProfiles.length;
    index++
  ) {
    if (currentLeafProfiles[index][0] === "pot") {
      witherLeaf(index, average);
    }
  }
}

function witherLeaf(index, fade) {
  let leaf = leafLifecycleWrappers[index];
  if (!leaf) {
    return;
  }

  if (fade <= 0) {
    leaf.setAttribute("opacity", "1");
    return;
  }

  let stable = stableNoiseOffset(
    "leaf-wither-" + (index + 1)
  );

  let releasePoint = 0.06 + (stable % 9) * 0.035;
  let progress = smoothRange(
    releasePoint,
    min(1, releasePoint + 0.48),
    fade
  );

  // Keep the V8 effect: the leaf fades without moving or rotating.
  leaf.setAttribute(
    "opacity",
    "" + (1 - constrain(progress, 0, 1))
  );
}

// PART 5: WATERING AND REGROWTH

function bouquetWithering() {
  let withering = false;
  for (let index = 0; index < sunflowers.length; index++) {
    if (sunflowers[index].needsRegrowth) {
      withering = true;
    }
  }
  return withering;
}

function bouquetGone() {
  let gone = true;
  for (let index = 0; index < sunflowers.length; index++) {
    let flower = sunflowers[index];
    if (
      flower.witherProgress < 1 ||
      flower.lifeBloom > 0.01
    ) {
      gone = false;
    }
  }
  return gone;
}
function waterFlowers() {
  freshFrame = lastWaterFrame;
  for (let index = 0; index < sunflowers.length; index++) {

    sunflowers[index].seedReserve = 32;
  }
}

function renewFlowers() {

  plantGrowStartFrame = frameCount;
  freshFrame = frameCount;

  let replaced = false;

  // Call the existing sketch.js function to replace each old flower.
  // The helper redraws SVG and refreshes the element references.
  for (let index = 0; index < sunflowers.length; index++) {
    if (sunflowers[index].needsRegrowth) {
      let fresh = renewSunflower(index);
      if (fresh) {
        // Match the previous lifecycle: new flowers grow together.
        fresh.growthDelay = 0;
        replaced = true;
      }
    }
  }

  resetGrowth();

  if (replaced) {
    // Refresh the swaying references after the flower heads change.
    let redStates = auxStates;
    resetSway();
    captureSway();
    auxStates = redStates;
    for (let i = 0; i < sunflowers.length; i++) {
      bindFlowerParts(
        sunflowers[i],
        document.getElementById(
          sunflowers[i].spec.id
        )
      );
    }
    updateFlowers();
  }
}