/*
  input_mechanic.js (Ziyi's part)

  What the mouse does to the picture:
  - the sunflowers turn and lean toward the pointer (a cheap fake 3D)
  - a click brings in a cloud, which fades out again if nothing happens
  - scrolling while the cloud is there makes a short rain shower

  The sunflowers follow the mouse, and when it gets dark they straighten up again.
  All timing is frameCount: when something starts I note the frame, later I check
  frameCount minus that note.

  p5 pages I used: mouseWheel, winMouseX, map, constrain, atan2, dist.
  The cloud drawing is assets/cloud.png.
*/

// settings (all times are frames, 60 = 1 s)

// how many frames the cloud takes to fade in/out (51 = ~0.85 s)
// bigger = slower drift in, small = it almost pops
let CLOUD_FADE_FRAMES = 51;

// the cloud hangs around this long after the last click/scroll (180 = 3 s)
let CLOUD_STAY_FRAMES = 180;

// one shower = 35 drops, one drop every 4 frames, so ~2.3 s of rain.
// More drops = longer shower, bigger interval = thinner rain
let RAIN_DROP_COUNT = 35;
let RAIN_DROP_GAP = 4;

// ease-in time for the lean after the mouse first moves
// 30 frames = half a second, bigger is lazier
let FOLLOW_EASE_FRAMES = 30;

// max shift of a flower toward the mouse in px (0 = none)
let MAX_MOVE = 7;

// max tilt of the disc, radians (0.6 is about 34 deg). Higher looks more slanted
let MAX_TILT = 0.6;

// distance (px) at which a flower leans at full strength
// smaller = full lean even when the mouse is close
let LEAN_DISTANCE = 200;

// Hooks for the audio person. Empty on purpose, fill them in
// and I call them at the right moments.

// cloud just appeared
function onCloudAppear() {}

// shower started, count = number of drops
function onRainStart(count) {}

// a drop hit the pot; x is where, size is 3-9
function onDropLand(x, size) {}

// from perlin_randomness.js I read the `sunflowers` list and the `svgRoot` picture

// null until the mouse moves, so the flowers start out straight
let mouseMovedFrame = null;

// last turn of each flower by id (kept at night)
let flowerRotations = {};

// cloud: alpha 0-255.
// A fade = start frame + the alpha it began at + the alpha it is heading to
let cloudOn = false;
let cloudAlpha = 0;
let cloudFadeStartFrame = 0;
let cloudFadeFromAlpha = 0;
let cloudFadeToAlpha = 0;
let cloudLastActiveFrame = 0;

// cloud position in the 885x785 picture; the png is 129x88 before scaling
let CLOUD_X = 442.5;
let CLOUD_Y = 95;
let CLOUD_SCALE = 1.4;
let CLOUD_W = 129;
let CLOUD_H = 88;

// rain: frame the shower began
// (a big negative number means it is dry when the page loads)
let rainStartFrame = -100000;
let drops = [];
let RAIN_START_Y = 143;       // where a drop is born (inside the cloud)
let RAIN_END_Y = 578;         // where a drop disappears (the mouth of the pot)
let RAIN_FADE_LENGTH = 50;    // drops fade out over the last 50 pixels
let RAIN_HALF_WIDTH = 65;     // the shower is this wide on each side of the cloud

let cloudElement;
let dropLayer;

// builds an extra svg layer on top for the cloud and drops
function setupInput() {
  let SVG_NS = "http://www.w3.org/2000/svg";
  let layer = document.createElementNS(SVG_NS, "svg");
  layer.id = "input-weather-layer";
  layer.setAttribute("viewBox", "0 0 885 785");
  layer.setAttribute("aria-hidden", "true");

  dropLayer = document.createElementNS(SVG_NS, "g");
  layer.appendChild(dropLayer);

  cloudElement = document.createElementNS(SVG_NS, "image");
  cloudElement.setAttribute("href", "assets/cloud.png");
  cloudElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
  cloudElement.style.opacity = "0";
  layer.appendChild(cloudElement);

  document.getElementById("artwork-shell").appendChild(layer);
}

function updateInput() {
  followMouse();
  updateCloud();
  updateRain();
}

// --- lean toward the mouse ---
function followMouse() {
  // winMouseX/Y stay 0,0 until the mouse moves, so the first non-zero one
  // is when I save the frame.
  let mouseMoved = winMouseX !== 0 || winMouseY !== 0;
  if (mouseMoved && mouseMovedFrame === null) mouseMovedFrame = frameCount;

  // before any movement I just use the middle of the picture
  let point = { x: 442.5, y: 392.5 };
  if (mouseMoved) point = clientToSvg(winMouseX, winMouseY);

  // followAmount eases 0 -> 1 after the first move, and gets multiplied by (1 - night)
  // so everything straightens up as it gets dark
  let eased = 0;
  if (mouseMovedFrame !== null) eased = map(frameCount - mouseMovedFrame, 0, FOLLOW_EASE_FRAMES, 0, 1, true);
  let night = constrain(timeNight, 0, 1);
  let followAmount = eased * (1 - night);

  let flowers = sunflowers;
  for (let i = 0; i < flowers.length; i++) {
    let flower = flowers[i];
    let id = flower.spec.id;

    let angle = atan2(point.y - flower.spec.y, point.x - flower.spec.x);

    // 0 with the mouse on the flower, 1 when far enough away
    let distance = dist(point.x, point.y, flower.spec.x, flower.spec.y);
    let strength = constrain(distance / LEAN_DISTANCE, 0, 1);

    // the disc only re-aims while it is still day
    if (night < 0.5 || flowerRotations[id] === undefined) flowerRotations[id] = angle;

    setFlowerInputPose(id, {
      offsetX: cos(angle) * MAX_MOVE * strength * followAmount,
      offsetY: sin(angle) * MAX_MOVE * strength * followAmount,
      rotation: flowerRotations[id],
      // far = more tilt, with 30% of it as the minimum.
      // (0.3 / 0.7 control that)
      tilt: MAX_TILT * (0.3 + 0.7 * strength) * followAmount
    });
  }
}

// --- click: cloud ---

// called from mousePressed() below; only clicks on the picture count
function handleMousePressed(event) {
  let onPicture = event.target.closest("#artwork-shell");

  if (onPicture) {
    // if it is already on I only reset the stay timer
    if (!cloudOn) {
      cloudOn = true;
      startCloudFade(255);
      onCloudAppear();
    }
    cloudLastActiveFrame = frameCount;
  }
}

// starts a fade from the current alpha, so reversing half way still looks smooth
function startCloudFade(targetAlpha) {
  cloudFadeStartFrame = frameCount;
  cloudFadeFromAlpha = cloudAlpha;
  cloudFadeToAlpha = targetAlpha;
}

function updateCloud() {
  // stayed long enough -> fade out
  if (cloudOn && frameCount - cloudLastActiveFrame > CLOUD_STAY_FRAMES) {
    cloudOn = false;
    startCloudFade(0);
  }

  let framesFading = frameCount - cloudFadeStartFrame;
  cloudAlpha = map(framesFading, 0, CLOUD_FADE_FRAMES, cloudFadeFromAlpha, cloudFadeToAlpha, true);

  // little squash and stretch so it looks like it breathes.
  // 0.07 is the speed; 0.035 / 0.07 are how much width / height change
  let breathe = sin(frameCount * 0.07);
  let width = CLOUD_W * CLOUD_SCALE * (1 + breathe * 0.035);
  let height = CLOUD_H * CLOUD_SCALE * (1 - breathe * 0.07);
  cloudElement.setAttribute("x", String(CLOUD_X - width / 2));
  cloudElement.setAttribute("y", String(CLOUD_Y - height / 2));
  cloudElement.setAttribute("width", String(width));
  cloudElement.setAttribute("height", String(height));
  cloudElement.style.opacity = String(cloudAlpha / 255);
}

// --- scroll: rain (only with the cloud out) ---

function handleMouseWheel(event) {
  let onPicture = event.target.closest("#artwork-shell");

  // scrolling anywhere else scrolls the page as usual (true = let the page scroll)
  let letPageScroll = true;

  if (onPicture) {
    if (cloudOn) {
      rainStartFrame = frameCount;           // the shower starts (or starts again) now
      cloudLastActiveFrame = frameCount;     // scrolling also counts as "someone is here", so the cloud stays
      onRainStart(RAIN_DROP_COUNT);
    }
    // false keeps the page still while scrolling over the picture
    letPageScroll = false;
  }
  return letPageScroll;
}

function updateRain() {
  // one drop every few frames until the shower has made all its drops
  let framesSinceRain = frameCount - rainStartFrame;
  let stillRaining = framesSinceRain < RAIN_DROP_COUNT * RAIN_DROP_GAP;
  if (stillRaining && frameCount % RAIN_DROP_GAP === 0) {
    let size = (random(3, 9) + random(3, 9)) / 2;   // the average of two randoms = mostly medium drops
    drops.push({
      size: size,
      x: random(CLOUD_X - RAIN_HALF_WIDTH, CLOUD_X + RAIN_HALF_WIDTH),
      speed: random(4, 6),            // pixels per frame. Bigger = falls faster.
      hollow: random(1) < 0.5,        // about half of the drops are outlines only
      spawnFrame: frameCount,         // the frame this drop was born
      y: RAIN_START_Y,
      element: createDropElement()
    });
  }

  // y = start + speed * age in frames
  for (let index = drops.length - 1; index >= 0; index--) {
    let drop = drops[index];
    drop.y = RAIN_START_Y + drop.speed * (frameCount - drop.spawnFrame);

    // fade out over the last bit before the pot
    let alpha = map(drop.y, RAIN_END_Y - RAIN_FADE_LENGTH, RAIN_END_Y, 255, 0, true);
    drawDrop(drop, alpha);

    // landed
    if (drop.y >= RAIN_END_Y) {
      onDropLand(drop.x, drop.size);
      drop.element.remove();
      drops.splice(index, 1);
    }
  }
}

function createDropElement() {
  let element = document.createElementNS("http://www.w3.org/2000/svg", "path");
  element.setAttribute("fill", "#6A88AA");
  element.setAttribute("stroke", "#6A88AA");
  element.setAttribute("stroke-width", "1.6");
  dropLayer.appendChild(element);
  return element;
}

// teardrop shape
function drawDrop(drop, alpha) {
  let size = drop.size;
  let path = [
    "M " + drop.x + " " + (drop.y - size),
    "C " + (drop.x + size * 0.65) + " " + (drop.y - size * 0.05),
    (drop.x + size * 0.55) + " " + (drop.y + size * 0.8),
    drop.x + " " + (drop.y + size),
    "C " + (drop.x - size * 0.55) + " " + (drop.y + size * 0.8),
    (drop.x - size * 0.65) + " " + (drop.y - size * 0.05),
    drop.x + " " + (drop.y - size) + " Z"
  ].join(" ");
  drop.element.setAttribute("d", path);
  let fillOpacity = alpha / 255;
  if (drop.hollow) fillOpacity = 0;
  drop.element.setAttribute("fill-opacity", String(fillOpacity));
  drop.element.setAttribute("stroke-opacity", String(alpha / 255));
}

// p5 looks for these two by name
function mousePressed(event) {
  handleMousePressed(event);
}

function mouseWheel(event) {
  return handleMouseWheel(event);
}

// ---- helpers for the flowers ----

// window coordinates -> picture coordinates
function clientToSvg(clientX, clientY) {
  let point = svgRoot.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  let matrix = svgRoot.getScreenCTM();
  if (matrix) return point.matrixTransform(matrix.inverse());
  return { x: clientX, y: clientY };
}

// input_mechanic.js tells me how a flower leans; I just store it.
// pose = {offsetX, offsetY, rotation, tilt}
function setFlowerInputPose(id, pose) {
  for (let i = 0; i < sunflowers.length; i++) {
    if (sunflowers[i].spec.id === id) {
      sunflowers[i].inputOffsetX = pose.offsetX;
      sunflowers[i].inputOffsetY = pose.offsetY;
      sunflowers[i].inputRotation = pose.rotation;
      sunflowers[i].inputTilt = constrain(pose.tilt, 0, 0.6);
    }
  }
}

// Fake 3D for a sunflower head: each petal layer slides toward the mouse by a different
// amount, so the head looks like it turns. Bigger numbers in depthByLayer = a stronger effect.
function shiftHeadLayers(flower) {
  let depth = flower.inputTilt / 0.6;
  // back petals first, the centre layers (last) move the most
  let depthByLayer = [0, 10, 20, 40, 40, 40, 40, 40];
  for (let layerIndex = 0; layerIndex < depthByLayer.length; layerIndex++) {
    let layer = svgRoot.querySelector("#" + flower.spec.id + "-layer-" + (8 - layerIndex));
    if (layer) {
      let distance = depthByLayer[layerIndex] * depth / 6;
      if (abs(distance) < 0.0001) {
        layer.removeAttribute("transform");
      } else {
        let shiftX = formatNumber(cos(flower.inputRotation) * distance);
        let shiftY = formatNumber(sin(flower.inputRotation) * distance);
        layer.setAttribute("transform", `translate(${shiftX} ${shiftY})`);
      }
    }
  }
}
