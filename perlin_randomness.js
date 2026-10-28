// RANDOMNESS MODULE
function randomChoice(options) {
  return random(options);
}
function randomBetween(a, b) {
  return random(a, b);
}

// A repeatable number derived from an id. The time mechanic uses it
// to give each flower or leaf a different, but stable, random offset.
function stableNoiseOffset(id) {
  let name = "" + id;
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789-_";
  let number = 7;
  for (let i = 0; i < name.length; i++) {
    for (let j = 0; j < characters.length; j++) {
      if (name[i] === characters[j]) {
        number = (number * 31 + j + 1) % 100000;
      }
    }
  }
  return 20 + number / 977;
}

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
    this.growthDelay = growthDelay;
    initializePerlinNoiseState(this);
    this.droopDirection = random([-1, 1]); 
   
    initializeFlowerState(this);
  }
}

function makeSunflower(spec, growthDelay) {
  return new Sunflower(spec, growthDelay);
}

function createSmallFlowerLooks() {
  smallFlowerLooks = [];
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    smallFlowerLooks.push({
      shape: sunflowerAppearanceOptions.smallFlowerShapes[0],
      color: random(sunflowerAppearanceOptions.smallRedFlowerPetalColors)
    });
  }
}

// PERLIN NOISE MODULE

let SWAY_MAX = 8;
let SWAY_SPEED = 1.5;
let SWAY_FADE_FRAMES = 20;
let LEAF_SWAY_FACTOR = 0.4;
let swayAmplitude = SWAY_MAX;

let stemRecords = {};
let flowerWrappers = {};
let leafWrappers = [];
let smallFlowerWrappers = [];
let auxStates = {};
let mainFlowerByStem = {};

function initializePerlinNoiseState(flower) {
  flower.noiseStart = random(20, 200);
  flower.noiseSpeed = 0.08;
}

function setSwayAmplitude(degrees) {
  if (degrees >= 0) {
    swayAmplitude = degrees;
    if (swayAmplitude > SWAY_MAX) swayAmplitude = SWAY_MAX;
  }
}

function captureSway() {
  stemRecords = {}; flowerWrappers = {}; leafWrappers = [];
  smallFlowerWrappers = []; auxStates = {}; mainFlowerByStem = {};
  for (let i = 0; i < sunflowers.length; i++) {
    let id = MAIN_STEM_BY_FLOWER[sunflowers[i].spec.id];
    mainFlowerByStem[id] = sunflowers[i];
  }
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    let info = stemInfo[id], points = info.points;
    let start = points[0], end = points[points.length - 1];
    stemRecords[id] = { path: info.path, baseY: start[1], topY: end[1], offsetX: 0, offsetY: 0,
      angle: 0, shakeOffset: random(0, 500) };
    if (!mainFlowerByStem[id]) {
      let red = isRedStem(id);
      auxStates[id] = { noiseStart: random(20, 200), noiseSpeed: 0.072,
        swayAngle: 0, swayY: 0, movementBlend: red ? 1 : 0,
        movementStartFrame: red ? -1000 : null };
    }
  }
  for (let i = 0; i < sunflowers.length; i++) {
    let id = sunflowers[i].spec.id;
    flowerWrappers[id] = document.getElementById(id + '-sway-wrapper');
  }
  for (let i = 0; i < currentLeaves.length; i++) {
    leafWrappers[i] = document.getElementById('leaf-' + (i + 1) + '-sway-wrapper');
  }
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    let id = visualSmallFlowers[i][0];
    smallFlowerWrappers[i] = document.getElementById(id + '-sway-wrapper');
  }
}

function setWrapperTransform(wrapper, transform) {
  if (wrapper) wrapper.setAttribute('transform', transform || 'translate(0 0)');
}

function resetSway() {
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    let r = stemRecords[id];
    r.offsetX = 0; r.offsetY = 0; r.angle = 0;
    drawStem(id, stemProgress[id] || 0);
  }
  for (let i = 0; i < sunflowers.length; i++) {
    setWrapperTransform(flowerWrappers[sunflowers[i].spec.id], '');
  }
  for (let i = 0; i < leafWrappers.length; i++) setWrapperTransform(leafWrappers[i], '');
  for (let i = 0; i < smallFlowerWrappers.length; i++) setWrapperTransform(smallFlowerWrappers[i], '');
}

function updateSwayState(state, ready) {
  if (!ready) {
    state.swayAngle = 0;
    state.swayY = 0;
    state.movementBlend = 0;
    state.movementStartFrame = null;
    return;
  }
  if (state.movementStartFrame === null) state.movementStartFrame = frameCount;
  state.movementBlend = constrain((frameCount - state.movementStartFrame) / SWAY_FADE_FRAMES, 0, 1);
  let frames = frameCount - state.movementStartFrame;
  let location = state.noiseStart + state.noiseSpeed * SWAY_SPEED * frames / 60;
  let fade = easeOutCubic(state.movementBlend);
  state.swayAngle = (noise(location) - 0.5) * 2 * swayAmplitude * fade;
  state.swayY = (noise(location + 80) - 0.5) * 6 * fade;
}

function updateFlowers() {
  let seconds = frameCount / 60 * SWAY_SPEED;
  for (let i = 0; i < sunflowers.length; i++) {
    updateSwayState(sunflowers[i], sunflowers[i].growthState === 'finished');
  }
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    if (auxStates[id]) updateSwayState(auxStates[id], (stemProgress[id] || 0) >= 1);
  }
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    let r = stemRecords[id];
    let flower = mainFlowerByStem[id];
    let state = flower || auxStates[id];
    let swayAngle = state ? state.swayAngle : 0;
    let height = abs(r.baseY - r.topY);
    if (isRedStem(id) && height < 100) height = 100;
    let ordinary = getRegularMotion(flower, seconds, r.shakeOffset);
    r.offsetX = height * sin(radians(swayAngle + ordinary.droopAngle * 0.55)) +
      ordinary.shakeX + ordinary.inputX;
    r.offsetY = (state ? state.swayY : 0) + ordinary.ageingY + ordinary.inputY;
    r.angle = swayAngle + ordinary.droopAngle + ordinary.shakeAngle;
    drawStem(id, stemProgress[id] || 0);
  }
  swayFlowerHeads();
  swayLeaves(seconds);
  swaySmallFlowers();
}

function swayFlowerHeads() {
  for (let i = 0; i < sunflowers.length; i++) {
    let f = sunflowers[i];
    let wrapper = flowerWrappers[f.spec.id];
    let record = stemRecords[MAIN_STEM_BY_FLOWER[f.spec.id]];
    if (record) {
    let angle = record.angle;
    let x = f.spec.x, y = f.spec.y;
    let move = 'translate(' + formatNumber(record.offsetX) + ' ' + formatNumber(record.offsetY) + ')';
    move += ' rotate(' + formatNumber(angle) + ' ' + x + ' ' + y + ')';
    move += getInputTiltTransform(f);
    setWrapperTransform(wrapper, move);
    }
  }
}

function swayLeaves(seconds) {
  for (let i = 0; i < currentLeaves.length; i++) {
    let wrapper = leafWrappers[i];
    let id = currentLeafProfiles[i][0];
    if (wrapper) {
    if (id === 'pot') setWrapperTransform(wrapper, '');
    else if (stemRecords[id]) {
    let r = stemRecords[id];
    let along = currentLeafProfiles[i][1];
    let amount = along * along; // 与花杆使用的基础弯曲公式保持一致。
    let offsetX = r.offsetX * amount;
    let offsetY = r.offsetY * amount;
    let state = mainFlowerByStem[id] || auxStates[id];
    let blend = state ? state.movementBlend : 0;
    let localAngle = (noise(50 + i * 5 + seconds * 0.11) - 0.5) *
      2 * swayAmplitude * LEAF_SWAY_FACTOR * blend;
    let leaf = currentLeaves[i];
    let transform = 'translate(' + formatNumber(offsetX) + ' ' + formatNumber(offsetY) + ')';
    transform += ' rotate(' + formatNumber(localAngle) + ' ' +
      formatNumber(leaf[0]) + ' ' + formatNumber(leaf[1]) + ')';
    setWrapperTransform(wrapper, transform);
    }
    }
  }
}

function swaySmallFlowers() {
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    let id = 'stem-red-0' + (i + 1);
    let record = stemRecords[id];
    if (record) setWrapperTransform(smallFlowerWrappers[i], 'translate(' + formatNumber(record.offsetX) +
      ' ' + formatNumber(record.offsetY) + ')');
  }
}
