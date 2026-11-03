// settings (all times are frames, 60 = 1 s)

// how fast the can fades in and out: this much of the 255 opacity per frame
// (10 = about 0.4 s). Smaller = slower fade
let CAN_FADE_SPEED = 10;

// the can hangs around this long after the last click/scroll/pour (180 = 3 s)
let CAN_STAY_FRAMES = 180;

// how far the can tips over, in radians (0.9 is about 52 deg). Bigger = tips further
let TILT_MAX = 0.9;

// how much it tips per frame. Bigger = tips faster
let TILT_SPEED = 0.025;

// water only comes out once the can has tipped this far (keep it smaller than TILT_MAX)
let POUR_TILT = 0.8;

// one pour = 35 drops, one drop every 4 frames, so ~2.3 s of water.
// More drops = longer pour, bigger gap = thinner stream
let RAIN_DROP_COUNT = 35;
let RAIN_DROP_GAP = 4;

// max shift of a flower toward the sun in px (0 = none)
let MAX_MOVE = 7;

// max tilt of the disc, radians (0.6 is about 34 deg). Higher looks more slanted
let MAX_TILT = 0.6;

// distance (px) at which a flower leans at full strength
// smaller = full lean even when the sun is close
let LEAN_DISTANCE = 200;

// Hooks for the audio person. Empty on purpose: add code inside them
// and they run at the right moments.

// the can just appeared
function onCanAppear() {}

// pouring started, count = number of drops
function onRainStart(count) {}

// a drop hit the pot; x is where, size is 3-9
function onDropLand(x, size) {}

// from perlin_randomness.js this file reads the `sunflowers` list and the `svgRoot` picture


// watering can: alpha 0-255.
// A fade = the frame it began on + the alpha it began at
let canOn = false;
let canAlpha = 0;
let canFadeStartFrame = 0;
let canFadeFromAlpha = 0;
let canLastActiveFrame = 0;

// tipping works the same way: the frame it began on + the angle it began at
let canPouring = false;
let canTilt = 0;
let tiltStartFrame = 0;
let tiltFromAngle = 0;

// where the can sits in the 885x785 picture (its middle), and how big it is.
// The spout is on the left, so with the can tipped it hangs over the pot.
// If you change TILT_MAX, CAN_W or the picture, check the drop start below again
let CAN_X = 502;
let CAN_Y = 120;
let CAN_W = 210;
let CAN_H = 152;

// the png is 1254 x 1254 with empty space around the drawing. Only this part is shown
// (the aspect ratio is 1158 : 839, so if CAN_W changes, change CAN_H with it)
let CAN_SRC_X = 70;
let CAN_SRC_Y = 220;
let CAN_SRC_W = 1158;
let CAN_SRC_H = 839;

// where the drops are born, measured from the middle of the can once it is tipped.
// x: negative = left, y: positive = down
let DROP_DX = -60;
let DROP_DY = 90;

// drops start a little left/right and up/down of that point, by up to this many px.
// 0 for DROP_RANGE_X makes a single straight line of drops
let DROP_RANGE_X = 10;
let DROP_RANGE_Y = 15;

// hint dot, based on the orbiting dot in week 11: sin() and cos() of the frame count
// make a dot travel round a circle, and a few older positions behind it make a tail.
// centre of the circle: a little above the mouth of the pot (HINT_Y = height, smaller = higher)
let HINT_X = 442.5;
let HINT_Y = 548;

// radius of the circle in px. Bigger = a wider circle around the mouth
let HINT_RADIUS = 50;

// how far the dot moves each frame, in radians. 0.06 is one lap in about 105 frames (1.7 s)
let HINT_SPEED = 0.06;

// number of dots in the tail, and the frames between them
let HINT_TAIL_COUNT = 14;
let HINT_TAIL_GAP = 2;

// the hint fades away this many frames after the plant is watered
let HINT_FADE_FRAMES = 30;

// false until the first drop lands in the pot; time_mechanic.js reads these to grow
// the bouquet and to keep it fresh.
// plantWateredFrame = the frame of the first drop, lastWaterFrame = the frame of the latest one
let plantWatered = false;
let plantWateredFrame = 0;
let lastWaterFrame = 0;

// how many drops are still to come out of the can
let waterLeft = 0;

// the drops: y = start + speed * frames since it was born
let drops = [];
let RAIN_END_Y = 578;         // where a drop disappears (the mouth of the pot)
let RAIN_FADE_LENGTH = 50;    // drops fade out over the last 50 pixels

let canElement;
let dropLayer;
let hintLayer;
let hintDots = [];
let sunElement;

// builds an extra svg layer on top for the can and the drops
function setupInput() {
  let SVG_NS = "http://www.w3.org/2000/svg";
  let layer = document.createElementNS(SVG_NS, "svg");
  layer.id = "input-weather-layer";
  layer.setAttribute("viewBox", "0 0 885 785");
  layer.setAttribute("aria-hidden", "true");

  // hint dots first, so the can and the drops are drawn over them
  hintLayer = document.createElementNS(SVG_NS, "g");
  layer.appendChild(hintLayer);
  for (let i = 0; i < HINT_TAIL_COUNT; i++) {
    let dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("fill", "#FFFFFF");
    hintLayer.appendChild(dot);
    hintDots.push(dot);
  }

  // the can is a group, so it can move and turn as one piece.
  // Inside, a small svg with a viewBox shows only the coloured part of the png
  canElement = document.createElementNS(SVG_NS, "g");
  canElement.style.opacity = "0";

  let view = document.createElementNS(SVG_NS, "svg");
  view.setAttribute("x", String(-CAN_W / 2));
  view.setAttribute("y", String(-CAN_H / 2));
  view.setAttribute("width", String(CAN_W));
  view.setAttribute("height", String(CAN_H));
  view.setAttribute("viewBox", CAN_SRC_X + " " + CAN_SRC_Y + " " + CAN_SRC_W + " " + CAN_SRC_H);
  view.setAttribute("preserveAspectRatio", "none");

  let picture = document.createElementNS(SVG_NS, "image");
  picture.setAttribute("href", "./assets/wateringcan.png");
  picture.setAttribute("width", "1254");
  picture.setAttribute("height", "1254");
  view.appendChild(picture);
  canElement.appendChild(view);
  layer.appendChild(canElement);

  // the drops go on top of the can
  dropLayer = document.createElementNS(SVG_NS, "g");
  layer.appendChild(dropLayer);

  document.getElementById("artwork-shell").appendChild(layer);

  // the sun (and the moon, they share one spot) can be picked up with the mouse
  sunElement = document.getElementById("sun");
}

function updateInput() {
  followSun();
  updateHint();
  updateCan();
  updateWater();
}

// --- the sun: the flowers lean toward it, and the mouse can drag it ---

// where the sun is picked up: the distance from its middle to the mouse.
// sunDragging is true from the press on the sun until the mouse is let go
let sunDragging = false;
let sunGrabX = 0;
let sunGrabY = 0;

// Each frame: find where the sun is, then give every sunflower
// its own push, turn and tilt toward that spot (like eyes following a cursor).
function followSun() {
  // the middle of the sun in picture coordinates (885 x 785)
  let box = sunElement.getBoundingClientRect();
  let point = clientToSvg(box.left + box.width / 2, box.top + box.height / 2);

  // follow = how strongly the flowers follow, 0 to 1
  // it drops back to 0 while the sun turns into the moon, so the flowers straighten up
  let moon = constrain(timeMoon, 0, 1);
  let follow = 1 - moon;

  for (let i = 0; i < sunflowers.length; i++) {
    let flower = sunflowers[i];

    // direction from this flower to the sun
    let angle = atan2(point.y - flower.spec.y, point.x - flower.spec.x);

    // 0 with the sun on the flower, 1 when far enough away
    let distance = dist(point.x, point.y, flower.spec.x, flower.spec.y);
    let strength = constrain(distance / LEAN_DISTANCE, 0, 1);

    // the disc only turns while the sun is mostly out, after that it keeps its last direction
    if (moon < 0.5) flower.inputRotation = angle;

    // only numbers are stored here; perlin_randomness.js reads them when it draws the flower
    flower.inputOffsetX = cos(angle) * MAX_MOVE * strength * follow;
    flower.inputOffsetY = sin(angle) * MAX_MOVE * strength * follow;

    // far = more tilt, with 30% of it as the minimum
    // (0.3 / 0.7 control that)
    flower.inputTilt = MAX_TILT * (0.3 + 0.7 * strength) * follow;
  }
}

// picking up the sun: remember where on the sun the mouse is
function startSunDrag() {
  let box = sunElement.getBoundingClientRect();
  sunGrabX = box.left + box.width / 2 - winMouseX;
  sunGrabY = box.top + box.height / 2 - winMouseY;
  sunDragging = true;
  sunElement.style.cursor = "grabbing";
}

// moving it: the sun keeps its place under the mouse, but stays inside the picture area.
// Its position is a percentage of the picture area, so it also works when the window changes size.
// 4 and 96 = how close to the edges it can get (in %)
function dragSun() {
  let area = document.getElementById("artwork-shell").getBoundingClientRect();
  let percentX = (winMouseX + sunGrabX - area.left) / area.width * 100;
  let percentY = (winMouseY + sunGrabY - area.top) / area.height * 100;
  sunElement.style.left = constrain(percentX, 4, 96) + "%";
  sunElement.style.top = constrain(percentY, 4, 96) + "%";
}

// --- hint: a dot circles the mouth of the pot until the plant is watered ---
function updateHint() {
  // 1 = fully there, fades to 0 after the watering
  let hintAlpha = 1;
  if (plantWatered) {
    hintAlpha = map(frameCount - plantWateredFrame, 0, HINT_FADE_FRAMES, 1, 0, true);
  }
  hintLayer.style.display = "none";
  if (hintAlpha > 0) hintLayer.style.display = "inline";

  for (let i = 0; i < hintDots.length; i++) {
    // dot number i is where the first dot was i * HINT_TAIL_GAP frames ago
    let pastFrame = frameCount - i * HINT_TAIL_GAP;
    let x = HINT_X + sin(pastFrame * HINT_SPEED) * HINT_RADIUS;
    let y = HINT_Y + cos(pastFrame * HINT_SPEED) * HINT_RADIUS;

    // further back in the tail = smaller and more see-through
    let tailAmount = i / hintDots.length;
    let dot = hintDots[i];
    dot.setAttribute("cx", formatNumber(x));
    dot.setAttribute("cy", formatNumber(y));
    dot.setAttribute("r", formatNumber(6 - tailAmount * 4));
    dot.setAttribute("opacity", formatNumber((1 - tailAmount) * hintAlpha));
  }
}

// --- click: the watering can appears ---

// called from mousePressed() below; only clicks on the picture count
function handleMousePressed(event) {
  let onSun = event.target.closest("#sun");
  let onPicture = event.target.closest("#artwork-shell");

  if (onSun) {
    // a press on the sun picks it up instead of bringing the can
    startSunDrag();
  } else if (onPicture) {
    // if it is already there, only the stay timer is reset
    if (!canOn) {
      setCan(true);
      onCanAppear();
    }
    canLastActiveFrame = frameCount;
  }
}

// fades the can in or out. It notes the frame and the alpha at that moment,
// so reversing half way still looks smooth. Does nothing if nothing changes
function setCan(on) {
  if (on !== canOn) {
    canFadeFromAlpha = canAlpha;
    canFadeStartFrame = frameCount;
    canOn = on;
  }
}

// starts or stops pouring. It notes the frame and the angle at that moment
function setPour(on) {
  if (on !== canPouring) {
    tiltFromAngle = canTilt;
    tiltStartFrame = frameCount;
    canPouring = on;
  }
}

function updateCan() {
  // while it pours it does not count as "nobody is here"
  if (canPouring) canLastActiveFrame = frameCount;
  if (canOn && frameCount - canLastActiveFrame > CAN_STAY_FRAMES) setCan(false);

  // fade: from the frame it began, every frame changes the alpha by CAN_FADE_SPEED
  let fadeSteps = (frameCount - canFadeStartFrame) * CAN_FADE_SPEED;
  if (canOn) {
    canAlpha = min(canFadeFromAlpha + fadeSteps, 255);
  } else {
    canAlpha = max(canFadeFromAlpha - fadeSteps, 0);
  }

  // tip over (or back): every frame since it began changes the angle by TILT_SPEED
  let tiltSteps = (frameCount - tiltStartFrame) * TILT_SPEED;
  if (canPouring) {
    canTilt = min(tiltFromAngle + tiltSteps, TILT_MAX);
  } else {
    canTilt = max(tiltFromAngle - tiltSteps, 0);
  }

  // the can turns around its middle, anticlockwise (so the angle is negative)
  let turn = "rotate(" + formatNumber(-degrees(canTilt)) + ")";
  canElement.setAttribute("transform", "translate(" + CAN_X + " " + CAN_Y + ") " + turn);
  canElement.style.opacity = String(canAlpha / 255);
}

// --- scroll: pour water (only with the can out) ---

function handleMouseWheel(event) {
  let onPicture = event.target.closest("#artwork-shell");

  // scrolling anywhere else scrolls the page as usual (true = let the page scroll)
  let letPageScroll = true;

  if (onPicture) {
    if (canOn) {
      // one scroll gesture sends many wheel events, so the hook only runs when a pour begins
      if (!canPouring) onRainStart(RAIN_DROP_COUNT);

      waterLeft = RAIN_DROP_COUNT;        // a full pour starts (or starts again) now
      setPour(true);
      canLastActiveFrame = frameCount;    // scrolling also counts as "someone is here", so the can stays
    }
    // false keeps the page still while scrolling over the picture
    letPageScroll = false;
  }
  return letPageScroll;
}

function updateWater() {
  // once the can is tipped far enough, one drop every few frames until the water is used up
  let tippedEnough = canPouring && canTilt >= POUR_TILT;
  if (tippedEnough && waterLeft > 0 && frameCount % RAIN_DROP_GAP === 0) {
    let size = (random(3, 9) + random(3, 9)) / 2;   // the average of two randoms = mostly medium drops
    drops.push({
      size: size,
      x: CAN_X + DROP_DX + random(-DROP_RANGE_X, DROP_RANGE_X),
      startY: CAN_Y + DROP_DY + random(-DROP_RANGE_Y, DROP_RANGE_Y),
      speed: random(4, 6),            // pixels per frame. Bigger = falls faster.
      hollow: random(1) < 0.5,        // about half of the drops are outlines only
      spawnFrame: frameCount,         // the frame this drop was born
      y: 0,
      element: createDropElement()
    });
    waterLeft = waterLeft - 1;
  }

  // all the water is out, so the can turns back
  if (canPouring && waterLeft === 0) setPour(false);

  // y = start + speed * age in frames
  for (let index = drops.length - 1; index >= 0; index--) {
    let drop = drops[index];
    drop.y = drop.startY + drop.speed * (frameCount - drop.spawnFrame);

    // fade out over the last bit before the pot
    let alpha = map(drop.y, RAIN_END_Y - RAIN_FADE_LENGTH, RAIN_END_Y, 255, 0, true);
    drawDrop(drop, alpha);

    // landed
    if (drop.y >= RAIN_END_Y) {
      onDropLand(drop.x, drop.size);

      // the first drop in the pot waters the plant, every drop counts as water
      if (!plantWatered) {
        plantWatered = true;
        plantWateredFrame = frameCount;
      }
      lastWaterFrame = frameCount;
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

// mouse press, drag, release and wheel are passed on to the functions above
function mousePressed(event) {
  handleMousePressed(event);
}

function mouseDragged() {
  if (sunDragging) dragSun();
}

function mouseReleased() {
  sunDragging = false;
  if (sunElement) {
    sunElement.style.cursor = "grab";
  }
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
  return point.matrixTransform(svgRoot.getScreenCTM().inverse());
}

// Fake 3D for a sunflower head: each petal layer slides toward the sun by a different
// amount, so the head looks like it turns. Bigger numbers in layerShift = a stronger effect.
// The idea comes from web designs where eyes turn to follow the mouse, for example
// https://github.com/krypton225/Eyes-follow-mouse-cursor, and from the parallax example at
// https://happycoding.io/tutorials/p5js/creating-classes/parallax-dots (layers moving by different amounts).
// layerShift[0] is for layer 1 (the centre), the last one is for layer 8 (the back petals)
let layerShift = [40, 40, 40, 40, 40, 20, 10, 0];

function shiftHeadLayers(flower) {
  // 0 = flat on, 1 = fully turned
  let turned = flower.inputTilt / MAX_TILT;

  for (let layerNumber = 1; layerNumber <= 8; layerNumber++) {
    let layer = svgRoot.querySelector("#" + flower.spec.id + "-layer-" + layerNumber);
    let distance = layerShift[layerNumber - 1] * turned / 6;
    let shiftX = formatNumber(cos(flower.inputRotation) * distance);
    let shiftY = formatNumber(sin(flower.inputRotation) * distance);
    layer.setAttribute("transform", "translate(" + shiftX + " " + shiftY + ")");
  }
}
