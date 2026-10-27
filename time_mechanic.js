/*
  time_mechanic.js (Xiaoke's part)

  Handles the day and night. One day is 1800 frames (30 s). From the frame count I work out
  which day it is, how far through the day we are, the sky colour and the phase name,
  and where the sun is. The flowers' day follows the same clock, so ageing, falling petals,
  withering leaves and replacing the flowers on a new day are at the bottom of this file.

  The other files only read two numbers from here:
  timeProgress (0 at dawn, 1 at the end of the night) and timeNight (0 = day, 1 = dark).

  Time is only ever frameCount. I save the frame the first day started on and subtract it,
  so the day always matches the frame count.

  Used: frameCount, map, constrain, lerpColor (p5 reference). The smooth curve is smoothstep:
  https://en.wikipedia.org/wiki/Smoothstep
*/

// length of a day in frames.
// 1800 = 30 s. 3600 gives a calm 60 s day, 600 a rushed 10 s one
// (the flowers age over the day so they scale with it)
let timeDayLength = 1800;

// filled in on the first call
let timeDayStartFrame = null;

// day number is recalculated from frameCount every frame
let timeDayNumber = 1;
let timePreviousDayNumber = 1;

let timePhase = "Dawn";
let timeProgress = 0;
let timeNight = 0;

// sky colour stops: [progress 0-1, colour].
// move a number to shift when that colour arrives
let timeSkyColours = [
  [0, "#F6EEDD"], [0.20, "#FFF0CF"], [0.43, "#FAE4B9"],
  [0.62, "#E6B59C"], [0.79, "#29384E"], [0.91, "#29384E"], [1, "#F6EEDD"]
];

function updateTime() {
  if (timeDayStartFrame === null) timeDayStartFrame = frameCount;

  // which day, and how far into it
  let framesSinceStart = frameCount - timeDayStartFrame;
  timeDayNumber = floor(framesSinceStart / timeDayLength) + 1;
  let framesIntoDay = framesSinceStart % timeDayLength;
  timeProgress = framesIntoDay / timeDayLength;

  // new day -> flowers renew
  if (timeDayNumber > timePreviousDayNumber) startNewDay();
  timePreviousDayNumber = timeDayNumber;

  // night fades in from 72% to 84% of the day and out from 96% to 100%
  // change those numbers to move or lengthen the night
  let rise = map(timeProgress, 0.72, 0.84, 0, 1, true);
  let fall = 1 - map(timeProgress, 0.96, 1.0, 0, 1, true);
  timeNight = rise * rise * (3 - 2 * rise) * (fall * fall * (3 - 2 * fall));

  // phase name; each number is where that phase ends
  if (timeProgress < 0.07) timePhase = "Dawn";
  else if (timeProgress < 0.25) timePhase = "Morning";
  else if (timeProgress < 0.53) timePhase = "Daylight";
  else if (timeProgress < 0.74) timePhase = "Evening";
  else if (timeProgress < 0.94) timePhase = "Night";
  else timePhase = "Dawn";

  // write sky colour, phase and day into the page
  document.documentElement.style.setProperty("--sky", timeSkyColour());
  document.documentElement.dataset.phase = timePhase.toLowerCase();
  document.getElementById("phase").textContent = timePhase;
  document.getElementById("day").textContent = "DAY " + nf(timeDayNumber, 2);

  // sun stays put, top right.
  // 82 = % from the left, 14 = % from the top
  let sun = document.getElementById("sun");
  sun.style.left = "82%";
  sun.style.top = "14%";

  // it fades from full at dawn to gone at 0.7 (just before night);
  // lower that 0.7 to make it vanish earlier.
  sun.style.opacity = String(map(timeProgress, 0, 0.7, 1, 0, true));
}

// blend between the two stops either side of progress
function timeSkyColour() {
  for (let i = 1; i < timeSkyColours.length; i++) {
    let endProgress = timeSkyColours[i][0];
    if (timeProgress <= endProgress) {
      let startProgress = timeSkyColours[i - 1][0];
      let amount = map(timeProgress, startProgress, endProgress, 0, 1, true);
      let fromColour = color(timeSkyColours[i - 1][1]);
      let toColour = color(timeSkyColours[i][1]);
      return lerpColor(fromColour, toColour, amount).toString("#rrggbb");
    }
  }
  return timeSkyColours[0][1];
}

// ---- the life of the flowers follows the day ----
// (ageing, falling petals, withering leaves and the new day all come from timeProgress)

function updateLifecycle(progress) {
  syncGrowthToDay(progress);
  for (let i = 0; i < sunflowers.length; i++) {
    updateFlowerLife(sunflowers[i], progress);
    drawFlowerLife(sunflowers[i]);
  }
  witherPotLeaves();
}

function updateFlowerLife(flower, progress) {
  // the flower opens between 1.5% and 20% of the day. Change these to open earlier or later
  let opening = smoothRange(0.015, 0.20, progress);
  // the end of the day is for ageing and falling, everything is gone before the day ends
  // ageing starts at 5/6 of the day (lower it to age earlier, raise it to age later)
  let decayStart = 5 / 6;
  let age = smoothRange(decayStart, 0.975, progress);
  let loss = smoothRange(decayStart + 0.01, 0.982, progress);

  flower.lifeGrowth = opening;
  flower.lifeBloom = opening * (1 - loss);
  flower.ageing = age;
  flower.witherProgress = smoothRange(0.05, 0.94, flower.ageing);
  // mature = nearly fully open (above 0.88) and still young (below 0.65). Seeds only come from mature flowers
  flower.mature = flower.lifeBloom > 0.88 && flower.ageing < 0.65;

  if (flower.ageing > 0.72) flower.growthStage = "fading";
  else if (flower.lifeBloom > 0.88) flower.growthStage = "mature";
  else if (flower.lifeGrowth > 0.2) flower.growthStage = "growing";
  else flower.growthStage = "resting";

  updateFlowerParts(flower);
}

// list the parts that can fall and give each its own drift and spin.
// Petals go one by one. The centre (disc, rings and ALL the seed dots) is ONE piece,
// otherwise single seed dots were left floating in the air
function bindFlowerParts(flower, group) {
  let layers = group.querySelectorAll(':scope > g[id*="-layer-"]');
  let petals = [];
  let centreLayers = [];
  for (let i = 0; i < layers.length; i++) {
    if (/-layer-[1-5]$/.test(layers[i].id)) {
      centreLayers.push(layers[i]);
    } else {
      for (let j = 0; j < layers[i].children.length; j++) petals.push(layers[i].children[j]);
    }
  }

  // every flower withers a bit earlier or later (up to 0.08),
  // so they drop at different moments. Raise 0.02 for more difference
  let flowerOffset = ((stableNoiseOffset(flower.spec.id + "-age") % 9) - 4) * 0.02;

  flower.visualParts = [];
  for (let index = 0; index < petals.length; index++) {
    let stable = stableNoiseOffset(flower.spec.id + "-fall-" + index);
    flower.visualParts.push({
      element: petals[index],
      // ageing value where this petal lets go
      threshold: 0.05 + flowerOffset + (index / max(1, petals.length)) * 0.67,
      drift: ((stable % 17) - 8) * 1.8,   // how far it drifts sideways
      spin: ((stable % 13) - 6) * 8,      // how many degrees it turns while falling
      fallProgress: 0
    });
  }

  // centre goes after the petals, at 0.72 (raise it to keep the centre longer)
  let centreStable = stableNoiseOffset(flower.spec.id + "-fall-centre");
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
    // the petal falls as the flower ages (the ageing itself comes from frameCount)
    // a bigger 0.24 spreads each fall over more of the evening
    part.fallProgress = smoothRange(part.threshold, min(0.98, part.threshold + 0.24), flower.ageing);
    let fall = constrain(part.fallProgress, 0, 1);
    if (fall > 0.72) flower.needsRegrowth = true;

    if (fall <= 0.001) {
      part.element.style.removeProperty("transform-box");
      part.element.style.removeProperty("transform-origin");
      part.element.style.removeProperty("transform");
      part.element.style.removeProperty("opacity");
      continue;
    }

    let x = part.drift * fall;
    // falls 140 px
    let y = 140 * fall * fall;
    part.element.style.transformBox = "fill-box";
    part.element.style.transformOrigin = "center";
    part.element.style.transform = `translate(${x}px, ${y}px) rotate(${part.spin * fall}deg)`;
    // fades fast (the 1.6; lower = lingers longer) so the ground stays clear under the flower
    part.element.style.opacity = String(max(0, 1 - fall * 1.6));
  }
}

// one more wrapper per leaf, so falling and swaying can happen together
function captureLeafWrappers() {
  leafLifecycleWrappers = [];
  for (let index = 0; index < currentLeaves.length; index++) {
    let swayWrapper = svgRoot.querySelector("#leaf-" + (index + 1) + "-sway-wrapper");
    if (swayWrapper) {
      let wrapperId = "leaf-" + (index + 1) + "-lifecycle-wrapper";
      leafLifecycleWrappers[index] = createRuntimeWrapper(swayWrapper, wrapperId, "leaf-lifecycle-wrapper");
    }
  }
}

function drawFlowerLife(flower) {
  let group = svgRoot.querySelector("#" + flower.spec.id);
  if (group) {
    if (!flower.visualParts.length) bindFlowerParts(flower, group);

    group.dataset.growthStage = flower.growthStage;
    group.dataset.ageing = nf(flower.ageing, 0, 3);
    group.style.opacity = "1";
    // old = less saturated + falling parts.
    // 0.58 is how grey it gets
    group.style.filter = `saturate(${nf(1 - flower.ageing * 0.58, 0, 3)})`;

    let stemId = MAIN_STEM_BY_FLOWER[flower.spec.id];
    let stem = null;
    if (stemId) stem = svgRoot.querySelector("#" + stemId);
    if (stem) {
      // stem fades, its leaves fall
      stem.style.opacity = String(1 - flower.witherProgress);
      for (let index = 0; index < currentLeafProfiles.length; index++) {
        if (currentLeafProfiles[index][0] === stemId) witherLeaf(index, flower.witherProgress);
      }
    }
  }
}

// pot leaves belong to nobody so they follow the average of all seven (0 = fresh, 1 = withered)
function witherPotLeaves() {
  if (sunflowers.length) {
    let total = 0;
    for (let i = 0; i < sunflowers.length; i++) total += sunflowers[i].witherProgress;
    let average = total / sunflowers.length;
    for (let index = 0; index < currentLeafProfiles.length; index++) {
      if (currentLeafProfiles[index][0] === "pot") witherLeaf(index, average);
    }
  }
}

// new day: healthy flowers stay, withered ones are replaced by new random ones,
// then everything grows again
function startNewDay() {
  let replaced = false;
  for (let index = 0; index < sunflowers.length; index++) {
    let flower = sunflowers[index];
    if (!flower.needsRegrowth) {
      flower.seedReserve = 32;
    } else {
      let fresh = makeSunflower(flower.spec, 0);
      let oldGroup = svgRoot.querySelector("#" + flower.spec.id);
      if (oldGroup) oldGroup.outerHTML = renderSunflower(fresh);
      sunflowers[index] = fresh;
      replaced = true;
    }
  }
  resetGrowth();

  // new flowers need fresh wrappers
  if (replaced) {
    resetSway();
    captureSway();
    for (let i = 0; i < sunflowers.length; i++) {
      bindFlowerParts(sunflowers[i], svgRoot.querySelector("#" + sunflowers[i].spec.id));
    }
  }
}

// leaf falls and fades as fade goes 0 -> 1, each at its own moment
function witherLeaf(index, fade) {
  let leaf = leafLifecycleWrappers[index];
  if (leaf) {
    if (fade <= 0) {
      leaf.style.removeProperty("transition");
      leaf.style.removeProperty("transform");
      leaf.style.removeProperty("transform-box");
      leaf.style.removeProperty("transform-origin");
      leaf.style.removeProperty("opacity");
      return;
    }
    let stable = stableNoiseOffset("leaf-wither-" + (index + 1));
    let releasePoint = 0.06 + (stable % 9) * 0.035;
    let fall = smoothRange(releasePoint, min(1, releasePoint + 0.48), fade);
    let drift = ((stable % 15) - 7) * fall;
    // 3.2 = how many degrees each unit of spin turns the leaf; raise it for more tumbling
    let rotation = ((stable % 17) - 8) * 3.2 * fall;
    leaf.style.transformBox = "fill-box";
    leaf.style.transformOrigin = "center";
    // falls 125 px
    leaf.style.transform = `translate(${drift}px, ${125 * fall * fall}px) rotate(${rotation}deg)`;
    // only the outer wrapper falls/fades, the leaf itself is untouched
    leaf.style.opacity = String(max(0, 1 - fall * 1.08));
  }
}
