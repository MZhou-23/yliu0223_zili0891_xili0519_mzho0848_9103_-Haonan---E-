/*
  input_mechanic.js (Ziyi's part: user input)

  The mouse does three things to the picture:
  1. Click the picture: a watering can fades in above the pot. Click again and the can tips
     over and pours drops into the pot. The first drop that lands
     starts the plant growing, and every later drop keeps it fresh (time_mechanic.js reads
     plantWatered, plantWateredFrame and lastWaterFrame for this).
  2. Drag the sun (or the moon, they share one button) anywhere in the picture.
  3. Every sunflower turns its head and leans toward the sun, with the petal layers sliding
     by different amounts so the flat head looks tilted. While the sun turns into the
     moon the flowers slowly lose this pull and straighten up.

  Before the first watering a white dot circles the mouth of the pot to show where to click.

  All timing uses frameCount only (60 frames = 1 s). Each animation stores the frame it
  began on and works out its progress from frameCount minus that frame.

  ---- Things used here that were not taught in class (how each one works) ----
  Each one is also marked with a short comment where it is used.

  p5.js functions (p5 reference, https://p5js.org/reference/):
  - atan2(y, x): the angle of the line that goes x across and y down, in radians. It gives
    the direction from a flower to the sun.
    https://p5js.org/reference/p5/atan2/
  - cos(angle): the partner of sin(). With sin() it turns an angle into a sideways and an
    up-down step, so a distance can be pushed in that direction. Used with sin() in the hint dot.
    https://p5js.org/reference/p5/cos/
  - degrees(radians): converts radians to degrees, because the svg rotate() needs degrees.
    https://p5js.org/reference/p5/degrees/
  - min(a, b) and max(a, b): the smaller or the larger of two numbers. They stop a value
    from going above or below a limit.
    https://p5js.org/reference/p5/min/
  - winMouseX and winMouseY: the mouse position in the browser window. The usual mouseX and
    mouseY are measured from a canvas, and this sketch has no canvas (the picture is an svg).
    https://p5js.org/reference/p5/winMouseX/
  - mousePressed(event), mouseDragged() and mouseReleased(): p5 runs them when the mouse
    button goes down, moves while down, and comes up. event says which element was clicked.
    https://p5js.org/reference/p5/mousePressed/

  Browser (DOM) functions (MDN web docs, https://developer.mozilla.org/):
  - element.closest("#id"): looks at the clicked element and then at its parents, and returns
    the first one that matches. A click on a small shape inside the sun still counts as a click
    on the sun.
    https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
  - element.getBoundingClientRect(): the box of an element on screen (left, top, width,
    height). It is used to find the sun and the picture on the screen.
    https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  - element.style.something: sets one CSS property from code (opacity, cursor, display,
    left, top), the same as writing it in a CSS file.
    https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
  - parent.querySelector("#id"): finds the first element inside parent that matches a CSS
    selector. Class showed getElementById(), which only searches by id from the whole page.
    It is used to find each petal layer of a flower head.
    https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
  - element.remove(): takes an element out of the page.
    https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
  - array.splice(index, 1): takes one item out of an array at a position (class only showed
    push() and pop(), which work at the end of the array).
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice

  SVG features:
  - viewBox: the part of the drawing that is shown. A small svg with its own viewBox is used to
    show only a window of the can png.
    https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
  - <image>: puts a picture file inside an svg.
    https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image
  - transform="translate(x y) rotate(angle)": moves and turns an svg element. It is the svg
    version of the translate() and rotate() taught in Week 11.
    https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform

  Operators: !== is "is not equal" (class showed ===, and !== is its opposite).
  The ! and && operators and the comparisons are from Week 4. Where they are used, a short
  comment says what the condition means in words.

  formatNumber() is a helper written in sketch.js. It turns a number into short text.
*/

// ---- settings: change the numbers to change the feel ----
// All times are in frames (60 frames = 1 second)

// How fast the can fades in and out. Each frame the opacity (0-255) moves by this amount.
// 10, a full fade takes 255 / 10 = about 26 frames (0.4 s).
// Raise it for a snappier fade (20 = 0.2 s), lower it for a slow one (3 = 1.4 s).
let CAN_FADE_SPEED = 10;

// How long the can stays after the last click or pour before it fades away.
// 180 = 3 s. Raise it to keep the can on screen longer, lower it to make it leave sooner.
let CAN_STAY_FRAMES = 180;

// How far the can tips over, in radians (0.9 is about 52 degrees).
// Raise it to tip further so the spout points more steeply down, lower it for a gentle tilt.
// POUR_TILT below has to stay smaller than this number.
let TILT_MAX = 0.9;

// How much the can tips each frame, in radians.
// 0.025, it reaches TILT_MAX in about 36 frames (0.6 s). Raise it to tip faster, lower it
// to tip slowly. A slow tip also delays the first drop, because the water only starts at POUR_TILT.
let TILT_SPEED = 0.025;

// The water only starts once the can has tipped this far, in radians.
// Raise it to wait longer before the first drop, lower it to pour sooner.
// If it is larger than TILT_MAX the can never reaches it and no water comes out.
let POUR_TILT = 0.8;

// One pour is RAIN_DROP_COUNT drops, with one drop born every RAIN_DROP_GAP frames.
// 35 drops x 4 frames = 140 frames, about 2.3 s of water.
// More drops = a longer pour (and more water for the plant). A bigger gap = a thinner,
// slower stream (and a longer pour for the same count).
let RAIN_DROP_COUNT = 35;
let RAIN_DROP_GAP = 4;

// How far a flower slides toward the sun, in px, when the sun is far away.
// 0 = the flowers do not move at all. Raise it for a stronger pull, but large numbers
// make the heads leave their stems.
let MAX_MOVE = 7;

// How much a sunflower head squashes when it turns toward the sun, in radians.
// The head is squeezed to cos(tilt) of its width, and perlin_randomness.js stops the squeeze at
// 82.5% (which is cos(0.6)). So 0.6 is the strongest effect: raising this number further changes
// nothing, while lowering it (for example 0.3) gives a head that stays rounder.
let MAX_TILT = 0.6;

// The distance (px) between a flower and the sun at which the lean reaches full strength.
// The lean grows from 0 (sun right on the flower) to full at this distance.
// Smaller = the flowers lean fully even when the sun is close. Larger = they lean fully
// only when the sun is far away, and only a little when it is near.
let LEAN_DISTANCE = 200;

// Hooks for the audio part. They are empty on purpose: code written inside them runs at
// the right moment.

// Runs each time the can appears (the first click after it has faded away).
function onCanAppear() {}

// Runs when a pour starts. count = the number of drops in this pour.
function onRainStart(count) {}

// Runs when a drop hits the pot. x = where it landed (px), size = the drop size (3 to 9).
function onDropLand(x, size) {}

// From perlin_randomness.js this file reads the `sunflowers` list and the `svgRoot` picture.


// Watering can state. canAlpha is the opacity (0 = invisible, 255 = solid).
// A fade is described by the frame it began on and the alpha it began at,
// so the alpha is always worked out as: start alpha +/- frames since then x speed.
// canOn = the can should be showing. canLastActiveFrame = the frame of the last click or pour.
let canOn = false;
let canAlpha = 0;
let canFadeStartFrame = 0;
let canFadeFromAlpha = 0;
let canLastActiveFrame = 0;

// Tipping works the same way: the frame it began on and the angle it began at.
// canPouring = the can should be tipped over. canTilt = the angle right now, in radians.
let canPouring = false;
let canTilt = 0;
let tiltStartFrame = 0;
let tiltFromAngle = 0;

// Where the middle of the can sits in the 885 x 785 picture, and how big it is (px).
// The spout is on the left, so with the can tipped it hangs over the pot.
// CAN_X moves the can left (smaller) or right (bigger), CAN_Y moves it up (smaller) or
// down (bigger). CAN_W and CAN_H scale the can. If you change TILT_MAX, CAN_W or
// the picture, check DROP_DX and DROP_DY below again so the drops still leave the spout.
let CAN_X = 502;
let CAN_Y = 120;
let CAN_W = 210;
let CAN_H = 152;

// The png is 1254 x 1254 with empty space around the can drawing. Only this window of
// the png is shown: its top-left corner (X, Y) and its size (W, H), in png pixels.
// Making the window larger shows more empty space (the can looks smaller and off centre),
// making it smaller crops into the can. The window shape is 1158 : 839, so if CAN_W changes,
// change CAN_H to keep the same shape, otherwise the can looks stretched.
let CAN_SRC_X = 70;
let CAN_SRC_Y = 220;
let CAN_SRC_W = 1158;
let CAN_SRC_H = 839;

// Where the drops are born, measured from the middle of the can once it is tipped.
// DROP_DX: negative = left of the middle, positive = right. DROP_DY: positive = down.
// Use these to line the stream up with the spout.
let DROP_DX = -60;
let DROP_DY = 90;

// Each drop starts a random amount left/right and up/down of that point, up to this many px.
// Bigger numbers give a wider, messier stream. 0 for DROP_RANGE_X makes a single straight
// line of drops, and 0 for DROP_RANGE_Y makes all the drops start at the same height.
let DROP_RANGE_X = 10;
let DROP_RANGE_Y = 15;

// Hint dot, based on the orbiting dot in the week 11 class example: sin() and cos() of the
// frame count make a dot travel round a circle, and a few older positions behind it make a tail.
// HINT_X and HINT_Y are the centre of the circle, a little above the mouth of the pot.
// Raise HINT_X to move it right. Raise HINT_Y to move it down (smaller = higher on screen).
let HINT_X = 442.5;
let HINT_Y = 548;

// Radius of the circle in px. Bigger = a wider circle around the mouth of the pot,
// smaller = a tighter circle.
let HINT_RADIUS = 50;

// How far the dot moves round the circle each frame, in radians.
// One lap is 6.28 / HINT_SPEED frames, so 0.06 is one lap in about 105 frames (1.7 s).
// Raise it for a faster dot, lower it for a slower one.
let HINT_SPEED = 0.06;

// How many dots make up the tail, and how many frames apart they sit on the circle.
// More dots = a longer tail. A bigger gap = the dots spread further apart (a longer,
// thinner tail); a gap of 0 stacks them all on one spot.
let HINT_TAIL_COUNT = 14;
let HINT_TAIL_GAP = 2;

// The hint fades away over this many frames after the first drop lands in the pot.
// 30 = half a second. Raise it for a slower fade-out, lower it to make it vanish sooner.
let HINT_FADE_FRAMES = 30;

// plantWatered is false until the first drop lands in the pot. time_mechanic.js reads these
// three values to grow the bouquet and to keep it fresh.
// plantWateredFrame = the frame of the first drop, lastWaterFrame = the frame of the latest one.
let plantWatered = false;
let plantWateredFrame = 0;
let lastWaterFrame = 0;

// How many drops are still to come out of the can in this pour. It is refilled to
// RAIN_DROP_COUNT on every click while the can is showing.
let waterLeft = 0;

// The falling drops. A drop's height is: start height + speed x frames since it was born.
let drops = [];

// The height (px) where a drop lands and disappears: the mouth of the pot.
// Raise it to let drops fall further down, lower it to make them land higher up.
let RAIN_END_Y = 578;

// Drops fade out over the last RAIN_FADE_LENGTH pixels before they land.
// A bigger number starts the fade earlier (a longer fade), 0 makes drops vanish suddenly.
let RAIN_FADE_LENGTH = 50;

let canElement;
let dropLayer;
let hintLayer;
let hintDots = [];
let sunElement;

// Runs once at the start. Builds an extra svg layer on top of the picture that holds the hint
// dots, the can and the drops, and finds the sun button so it can be dragged.
function setupInput() {
  let SVG_NS = "http://www.w3.org/2000/svg";
  let layer = document.createElementNS(SVG_NS, "svg");
  layer.id = "input-weather-layer";
  layer.setAttribute("viewBox", "0 0 885 785");
  layer.setAttribute("aria-hidden", "true");

  // the hint dots are added first, so the can and the drops are drawn over them
  hintLayer = document.createElementNS(SVG_NS, "g");
  layer.appendChild(hintLayer);
  for (let i = 0; i < HINT_TAIL_COUNT; i++) {
    let dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("fill", "#FFFFFF");
    hintLayer.appendChild(dot);
    hintDots.push(dot);
  }

  // The can is a group, so it can move and turn as one piece.
  // Inside it, a small svg with a viewBox shows only the coloured part of the png
  // (viewBox is not from class, see the list at the top).
  canElement = document.createElementNS(SVG_NS, "g");
  canElement.style.opacity = "0";

  let view = document.createElementNS(SVG_NS, "svg");
  view.setAttribute("x", -CAN_W / 2);
  view.setAttribute("y", -CAN_H / 2);
  view.setAttribute("width", CAN_W);
  view.setAttribute("height", CAN_H);
  view.setAttribute("viewBox", CAN_SRC_X + " " + CAN_SRC_Y + " " + CAN_SRC_W + " " + CAN_SRC_H);
  view.setAttribute("preserveAspectRatio", "none");

  let picture = document.createElementNS(SVG_NS, "image");
  // the svg <image> element shows a picture file (not from class, see the list at the top)
  picture.setAttribute("href", "./assets/wateringcan.png");
  picture.setAttribute("width", "1254");
  picture.setAttribute("height", "1254");
  view.appendChild(picture);
  canElement.appendChild(view);
  layer.appendChild(canElement);

  // the drops are added last, so they are drawn on top of the can
  dropLayer = document.createElementNS(SVG_NS, "g");
  layer.appendChild(dropLayer);

  document.getElementById("artwork-shell").appendChild(layer);

  // the sun button (it also shows the moon, they share one spot) can be picked up with the mouse
  sunElement = document.getElementById("sun");
}

// Runs every frame (called from draw() in sketch.js): flowers follow the sun, then the hint dot,
// the can and the water are updated.
function updateInput() {
  followSun();
  updateHint();
  updateCan();
  updateWater();
}

// --- the sun: the flowers lean toward it, and the mouse can drag it ---

// sunDragging is true from the press on the sun until the mouse is let go.
// sunGrabX and sunGrabY = the distance from the mouse to the middle of the sun at the moment
// it was picked up, so the sun does not jump to the mouse when the drag begins.
let sunDragging = false;
let sunGrabX = 0;
let sunGrabY = 0;

// Every frame: find where the sun is, then give every sunflower its own push, turn and tilt
// toward that spot (like eyes following a cursor). The numbers are only stored on each
// flower here. perlin_randomness.js reads them when it draws the flower.
function followSun() {
  // the middle of the sun in picture coordinates (885 x 785)
  let box = sunElement.getBoundingClientRect();
  let sunPosition = clientToSvg(box.left + box.width / 2, box.top + box.height / 2);

  // follow = how strongly the flowers follow the sun: 1 in full daylight, 0 when the moon is out.
  // It falls from 1 to 0 as the sun turns into the moon, so the flowers slowly straighten up
  let moon = constrain(timeMoon, 0, 1);
  let follow = 1 - moon;

  for (let i = 0; i < sunflowers.length; i++) {
    let flower = sunflowers[i];

    // direction from this flower to the sun, in radians.
    // atan2 is not from class: it turns "how far across and how far down" into an angle
    let angle = atan2(sunPosition.y - flower.spec.y, sunPosition.x - flower.spec.x);

    // strength: 0 with the sun right on the flower, growing to 1 once the sun is
    // LEAN_DISTANCE px away or more
    let distance = dist(sunPosition.x, sunPosition.y, flower.spec.x, flower.spec.y);
    let strength = constrain(distance / LEAN_DISTANCE, 0, 1);

    // the head only turns to face the sun while the sun is mostly out (moon below 0.5);
    // after that it keeps the last direction it had
    if (moon < 0.5) flower.inputRotation = angle;

    // sideways push in px: up to MAX_MOVE, fading to 0 near the sun and when the moon is out
    flower.inputOffsetX = cos(angle) * MAX_MOVE * strength * follow;
    flower.inputOffsetY = sin(angle) * MAX_MOVE * strength * follow;

    // head tilt in radians: up to MAX_TILT when the sun is far, never below 30% of it while
    // the sun is out. The 0.3 is that minimum; the 0.7 is the part that grows with distance
    // (the two must add up to 1). Raise the 0.3 (and lower the 0.7) for a tilt that depends less
    // on distance.
    flower.inputTilt = MAX_TILT * (0.3 + 0.7 * strength) * follow;
  }
}

// Picking up the sun: remember how far the mouse is from the middle of the sun,
// start the drag and show the closed-hand cursor.
// getBoundingClientRect() gives the sun's box on the screen, and winMouseX / winMouseY are the
// mouse position in the window (neither is from class, see the list at the top)
function startSunDrag() {
  let box = sunElement.getBoundingClientRect();
  sunGrabX = box.left + box.width / 2 - winMouseX;
  sunGrabY = box.top + box.height / 2 - winMouseY;
  sunDragging = true;
  // style.cursor changes the mouse pointer picture (the closed hand)
  sunElement.style.cursor = "grabbing";
}

// Moving it: the sun keeps its place under the mouse, but stays inside the picture area.
// Its position is a percentage of the picture area, so it also works when the window changes size.
// 4 and 96 = how close to the edges it can get (in % of the picture). A smaller first number
// and a bigger second number let it go closer to the edge (0 and 100 = right to the edge, where
// half the sun would hang outside).
function dragSun() {
  let area = document.getElementById("artwork-shell").getBoundingClientRect();
  let percentX = (winMouseX + sunGrabX - area.left) / area.width * 100;
  let percentY = (winMouseY + sunGrabY - area.top) / area.height * 100;
  sunElement.style.left = constrain(percentX, 4, 96) + "%";
  sunElement.style.top = constrain(percentY, 4, 96) + "%";
}

// --- hint: a dot circles the mouth of the pot until the plant is watered ---

// Every frame: place the tail dots on the circle and fade them out after the first watering.
function updateHint() {
  // hintAlpha: 1 = fully visible before watering, then falls to 0 over HINT_FADE_FRAMES
  let hintAlpha = 1;
  if (plantWatered) {
    hintAlpha = map(frameCount - plantWateredFrame, 0, HINT_FADE_FRAMES, 1, 0, true);
  }
  hintLayer.style.display = "none";
  if (hintAlpha > 0) hintLayer.style.display = "inline";

  for (let i = 0; i < hintDots.length; i++) {
    // dot number i sits where the first dot was i * HINT_TAIL_GAP frames ago.
    // sin() gives the sideways position and cos() the up-down position, so together they
    // travel round a circle of size HINT_RADIUS
    let pastFrame = frameCount - i * HINT_TAIL_GAP;
    let x = HINT_X + sin(pastFrame * HINT_SPEED) * HINT_RADIUS;
    let y = HINT_Y + cos(pastFrame * HINT_SPEED) * HINT_RADIUS;

    // tailAmount: 0 for the head of the tail, close to 1 for the last dot.
    // Further back in the tail = smaller (radius 6 px down to 2 px) and more see-through.
    // Raise the 6 for a bigger head, raise the 4 for a tail that shrinks faster
    let tailAmount = i / hintDots.length;
    let dot = hintDots[i];
    dot.setAttribute("cx", formatNumber(x));
    dot.setAttribute("cy", formatNumber(y));
    dot.setAttribute("r", formatNumber(6 - tailAmount * 4));
    dot.setAttribute("opacity", formatNumber((1 - tailAmount) * hintAlpha));
  }
}

// --- click: the watering can appears ---

// Runs when the mouse button goes down (event = what was clicked; not from class, see the list
// at the top). A press on the sun starts dragging it. A press anywhere else on the picture
// works the can: the first click shows it, later clicks pour water.
// Clicks outside the picture do nothing.
function mousePressed(event) {
  // closest() is not from class: it gives back the clicked element, or the element around it,
  // that matches the name, and gives nothing (null) when there is none. In an if(), an
  // element counts as true and null counts as false (see the list at the top)
  let onSun = event.target.closest("#sun");
  let onPicture = event.target.closest("#artwork-shell");

  if (onSun) {
    // pick up the sun
    startSunDrag();

  } else if (onPicture) {

    // ! means "not": this is true while the can is not showing
    if (!canOn) {
      // first click: show the watering can
      setCan(true);
      onCanAppear();

    } else {
      // second and later clicks: pour water
      // true when the can is not pouring yet, so a click while pouring does not start a second pour
      if (!canPouring) {
        onRainStart(RAIN_DROP_COUNT);
      }

      // each click refills the pour, so clicking again while pouring keeps the water coming
      waterLeft = RAIN_DROP_COUNT;
      setPour(true);
    }

    // a click restarts the CAN_STAY_FRAMES countdown, so the can stays visible
    canLastActiveFrame = frameCount;
  }
}

// Fades the can in (true) or out (false). It notes the frame and the alpha at that moment,
// so reversing half way still looks smooth. Does nothing if the can is already in that state.
function setCan(on) {
  // !== means "is not equal": only act when the wanted state differs from the current one
  if (on !== canOn) {
    canFadeFromAlpha = canAlpha;
    canFadeStartFrame = frameCount;
    canOn = on;
  }
}

// Starts (true) or stops (false) the pour by tipping the can over or back. It notes the frame
// and the angle at that moment, so reversing half way still looks smooth.
function setPour(on) {
  // only act when the wanted state differs from the current one
  if (on !== canPouring) {
    tiltFromAngle = canTilt;
    tiltStartFrame = frameCount;
    canPouring = on;
  }
}

// Every frame: hide the can after a while, work out its opacity and tilt, and draw it.
function updateCan() {
  // while the can pours it counts as in use, so it does not leave in the middle of a pour
  if (canPouring) canLastActiveFrame = frameCount;
  // && means "and": the can is showing AND nobody has used it for more than CAN_STAY_FRAMES
  if (canOn && frameCount - canLastActiveFrame > CAN_STAY_FRAMES) setCan(false);

  // fade: from the frame it began, each frame changes the alpha by CAN_FADE_SPEED
  // (up to 255 when showing, down to 0 when leaving)
  let fadeSteps = (frameCount - canFadeStartFrame) * CAN_FADE_SPEED;
  if (canOn) {
    canAlpha = min(canFadeFromAlpha + fadeSteps, 255);
  } else {
    canAlpha = max(canFadeFromAlpha - fadeSteps, 0);
  }

  // tip over (or back): each frame since it began changes the angle by TILT_SPEED
  // (up to TILT_MAX when pouring, back down to 0 when not)
  let tiltSteps = (frameCount - tiltStartFrame) * TILT_SPEED;
  if (canPouring) {
    canTilt = min(tiltFromAngle + tiltSteps, TILT_MAX);
  } else {
    canTilt = max(tiltFromAngle - tiltSteps, 0);
  }

  // the can turns around its middle, anticlockwise (so the angle is negative), and moves to
  // CAN_X and CAN_Y. The opacity is the alpha scaled down to 0-1
  // degrees() changes radians to the degrees that the svg rotate() needs (not from class)
  let turn = "rotate(" + formatNumber(-degrees(canTilt)) + ")";
  canElement.setAttribute("transform", "translate(" + CAN_X + " " + CAN_Y + ") " + turn);
  canElement.style.opacity = canAlpha / 255;
}

// Every frame: let new drops out of the can, move the falling drops down and handle the landings.
function updateWater() {
  // once the can is tipped far enough, a new drop is born every RAIN_DROP_GAP frames
  // until the water is used up
  // true when the can is pouring AND has tipped to POUR_TILT or further
  let tippedEnough = canPouring && canTilt >= POUR_TILT;
  // all three must be true: tipped enough, water left, and this is a frame that is a multiple
  // of RAIN_DROP_GAP (% gives the remainder, so the remainder 0 comes once every RAIN_DROP_GAP frames)
  if (tippedEnough && waterLeft > 0 && frameCount % RAIN_DROP_GAP === 0) {
    // size: the average of two random numbers between 3 and 9, so most drops are medium.
    // Raise the numbers for bigger drops
    let size = (random(3, 9) + random(3, 9)) / 2;
    drops.push({
      size: size,
      x: CAN_X + DROP_DX + random(-DROP_RANGE_X, DROP_RANGE_X),
      startY: CAN_Y + DROP_DY + random(-DROP_RANGE_Y, DROP_RANGE_Y),
      speed: random(4, 6),            // px per frame. Raise the numbers for faster drops
      hollow: random(1) < 0.5,        // 0.5 = half of the drops are outlines only. 1 = all, 0 = none
      spawnFrame: frameCount,         // the frame this drop was born on
      y: 0,
      element: createDropElement()
    });
    waterLeft = waterLeft - 1;
  }

  // all the water is out, so the can tips back
  // still pouring AND no water left: tip the can back
  if (canPouring && waterLeft === 0) setPour(false);

  // move every drop: height = start height + speed x frames since it was born.
  // The loop runs backwards so a landed drop can be removed from the list safely
  for (let index = drops.length - 1; index >= 0; index--) {
    let drop = drops[index];
    drop.y = drop.startY + drop.speed * (frameCount - drop.spawnFrame);

    // fade out over the last RAIN_FADE_LENGTH px before the pot (alpha 255 -> 0)
    let alpha = map(drop.y, RAIN_END_Y - RAIN_FADE_LENGTH, RAIN_END_Y, 255, 0, true);
    drawDrop(drop, alpha);

    // the drop reached the mouth of the pot
    if (drop.y >= RAIN_END_Y) {
      onDropLand(drop.x, drop.size);

      // the first drop in the pot starts the plant growing; every drop updates the time of the
      // latest watering, which keeps the flowers fresh
      // true only for the very first drop that lands
      if (!plantWatered) {
        plantWatered = true;
        plantWateredFrame = frameCount;
      }
      lastWaterFrame = frameCount;
      // remove() takes the drop's svg shape off the page, and splice(index, 1) takes the drop
      // out of the drops array (both are not from class, see the list at the top)
      drop.element.remove();
      drops.splice(index, 1);
    }
  }
}

// Makes one empty svg path for a new drop and adds it to the drop layer.
// fill and stroke give the drops their blue colour; stroke-width 1.6 is the outline thickness
function createDropElement() {
  let element = document.createElementNS("http://www.w3.org/2000/svg", "path");
  element.setAttribute("fill", "#6A88AA");
  element.setAttribute("stroke", "#6A88AA");
  element.setAttribute("stroke-width", "1.6");
  dropLayer.appendChild(element);
  return element;
}

// Writes one point of an svg path as text: a space, x, a space, y.
// For example pathPoint(5, 8) gives " 5 8". drawDrop() below uses it to write the drop outline.
function pathPoint(pointX, pointY) {
  return " " + pointX + " " + pointY;
}

// Draws one drop as a teardrop at the drop's position: a tip at the top and a round belly at the
// bottom, scaled by the drop's size. The outline is built from named points (tip, bulges, bottom)
// with pathPoint(). alpha (0-255) sets how see-through it is. Hollow drops keep only the outline.
function drawDrop(drop, alpha) {
  let x = drop.x;
  let y = drop.y;
  let size = drop.size;

  // The teardrop has a tip at the top and a point at the bottom. The two curves in between
  // bulge out to the right and to the left. The numbers are fractions of the drop size:
  // raise 0.65 and 0.55 for a fatter drop, lower them for a thinner one. The 0.05 and 0.8
  // set how high and how low the bulge sits (a bigger 0.8 pushes the belly further down).
  let topY = y - size;
  let bottomY = y + size;
  let bulgeTopX = size * 0.65;
  let bulgeBottomX = size * 0.55;
  let bulgeTopY = y - size * 0.05;
  let bulgeBottomY = y + size * 0.8;

  // svg path text: M = move to the tip, C = a curve (two bulge points, then where it ends),
  // Z = close the shape. The first C goes down the right side, the second back up the left side
  let start = "M" + pathPoint(x, topY);
  let rightSide = " C" + pathPoint(x + bulgeTopX, bulgeTopY);
  rightSide = rightSide + pathPoint(x + bulgeBottomX, bulgeBottomY) + pathPoint(x, bottomY);
  let leftSide = " C" + pathPoint(x - bulgeBottomX, bulgeBottomY);
  leftSide = leftSide + pathPoint(x - bulgeTopX, bulgeTopY) + pathPoint(x, topY);
  drop.element.setAttribute("d", start + rightSide + leftSide + " Z");

  let fillOpacity = alpha / 255;
  if (drop.hollow) fillOpacity = 0;
  drop.element.setAttribute("fill-opacity", fillOpacity);
  drop.element.setAttribute("stroke-opacity", alpha / 255);
}

// Runs again and again while the mouse moves with the button held down.
function mouseDragged() {
  if (sunDragging) dragSun();
}

// letting go of the mouse puts the sun down and shows the open-hand cursor again
// Runs when the mouse button comes up: put the sun down and show the open-hand cursor again.
function mouseReleased() {
  sunDragging = false;
  sunElement.style.cursor = "grab";
}

// ---- helpers for the flowers ----

// Turns a position in the browser window (px) into a position in the 885 x 785 picture.
// Needed because the picture is scaled to fit the window. The picture fills its box exactly,
// so it is a proportion: how far across the box (0 to 1) times the picture width.
// The box comes from getBoundingClientRect() (not from class, see the list at the top).
// The 885 and 785 are the picture size, the same as the svg viewBox in sketch.js
function clientToSvg(clientX, clientY) {
  let box = svgRoot.getBoundingClientRect();
  return {
    x: (clientX - box.left) / box.width * 885,
    y: (clientY - box.top) / box.height * 785
  };
}

// Fake 3D for a sunflower head: each petal layer slides toward the sun by a different
// amount, so the head looks like it turns.
// The idea comes from web designs where eyes turn to follow the mouse, for example
// https://github.com/krypton225/Eyes-follow-mouse-cursor, and from the parallax example at
// https://happycoding.io/tutorials/p5js/creating-classes/parallax-dots (layers moving by different amounts).
// layerShift holds one number per layer: the first is layer 1 (the centre), the last is
// layer 8 (the back petals). A bigger number slides that layer further (the real distance in
// px is the number / 6 when the head is fully turned, so 40 is about 6.7 px). 0 keeps a layer
// still. Making the front numbers much bigger than the back ones gives the strongest depth.
let layerShift = [40, 40, 40, 40, 40, 20, 10, 0];

// Called by perlin_randomness.js for each flower. Slides every petal layer of the head in the
// direction of the sun.
function shiftHeadLayers(flower) {
  // turned: 0 = flat on, 1 = fully turned toward the sun
  let turned = flower.inputTilt / MAX_TILT;

  for (let layerNumber = 1; layerNumber <= 8; layerNumber++) {
    // querySelector finds one element by its id (not from class, see the list at the top)
    let layer = svgRoot.querySelector("#" + flower.spec.id + "-layer-" + layerNumber);
    // how far this layer slides (px). Raise the 6 for a weaker effect, lower it for a stronger one
    let distance = layerShift[layerNumber - 1] * turned / 6;
    let shiftX = formatNumber(cos(flower.inputRotation) * distance);
    let shiftY = formatNumber(sin(flower.inputRotation) * distance);
    layer.setAttribute("transform", "translate(" + shiftX + " " + shiftY + ")");
  }
}
