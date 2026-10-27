/*
  sketch.js (shared)

  The look of the picture and the p5 setup()/draw(). The arrays at the top are the options the
  flowers pick from at random, so adding a colour or a petal count is just adding to a list.
  Below them are the functions that write the SVG for petals, flower heads, small flowers,
  leaves and the pot. After those come generateSVG() (builds the whole picture), the functions
  that show a stem, leaf or head at a given growth progress, and the falling leaves.
  perlin_randomness.js calls them. setup() and draw() at the bottom call the four mechanics.
*/

// look options
// each array is one thing a flower picks at random (the three petal rows pick on their own)
// colours are from the team colour cards
// add a number to the list to allow more petal counts (each flower picks one)
let row0PetalCountOptions = [7, 8, 9];
let row1PetalCountOptions = [7, 8, 9];
let row2PetalCountOptions = [7, 8, 9];

// back row, longest petals
let row0PetalColorOptions = ["#F6C73D", "#FBB949", "#FBAE49"];
// middle row
let row1PetalColorOptions = ["#FFC967", "#FBD256", "#FDB843"];
// front row, shortest
let row2PetalColorOptions = ["#FFCE6E", "#FFD055", "#FFDA55"];
// centre: one of two browns, middle circle is the green
let baseColorOptions = ["#AF7F4D", "#BA6A17"];
let middleColorOptions = ["#AFBD71"];
// small red flower petals
let redPetalOptions = ["#EA5D59", "#FF885C", "#D85C23", "#FF582C"];

// shapes too, only one of each for now
let lookOptions = {
  row0PetalCounts: row0PetalCountOptions,
  row1PetalCounts: row1PetalCountOptions,
  row2PetalCounts: row2PetalCountOptions,
  row0PetalColors: row0PetalColorOptions,
  row1PetalColors: row1PetalColorOptions,
  row2PetalColors: row2PetalColorOptions,
  baseColors: baseColorOptions,
  middleColors: middleColorOptions,
  redPetalColors: redPetalOptions,
  petalAspectRatios: [2.47],
  centerShapes: ["circle"],
  petalShapes: [{
    startRatio: 50 / 95,
    tipRatios: [235 / 95, 220 / 95, 205 / 95],
    widthRatio: 50 / 95,
    stripeCount: 5,        // lines drawn on each petal; more = busier petals
    stripeColor: "#EE942C",
    stripeOpacity: 130 / 255,
    petalOpacity: 225 / 255   // 1 = solid petals, lower = more see-through
  }],
  centerDesigns: [{
    greenOuter: "#7A9A3E",
    greenInner: "#8CAA4A",
    dot: "#5A2E12"
  }],
  smallFlowerShapes: [{
    petalCount: 5,
    centerColor: "#FBCB7A",
    orbitRatio: 0.8,
    petalRadiusRatio: 0.57,
    centerRadiusRatio: 0.43
  }]
};

// fixed layout of the bouquet
// discRadius = the original centre radius (95) times each flower's scale
let visualMainFlowers = [
  { id: "sunflower-large-left", x: 353.5, y: 314, discRadius: 19.95 },
  { id: "sunflower-left-small-front", x: 260.5, y: 400, discRadius: 20.9 },
  { id: "sunflower-lower-left", x: 335.5, y: 435, discRadius: 24.7 },
  { id: "sunflower-center", x: 443.5, y: 535, discRadius: 19 },
  { id: "sunflower-upper-middle", x: 459.5, y: 394, discRadius: 22.8 },
  { id: "sunflower-lower-right", x: 577.5, y: 442, discRadius: 20.9 },
  { id: "sunflower-right-front", x: 575.5, y: 318, discRadius: 21.85 }
];

// stems are one path each, all ending inside the pot mouth
let visualStems = [
  ["left-big", "M 430.5 576 C 425.1 471.2 380.3 405.7 353.5 314", 4.47],
  ["middle-top", "M 452.5 576 C 455.1 503.2 446.7 457.7 459.5 394", 4.68],
  ["middle-bottom", "M 446.5 576 C 446.5 559.6 443.5 549.4 443.5 535", 4.4],
  ["lower-left", "M 424.5 576 C 418 519.6 367.9 484.4 335.5 435", 4.82],
  ["lower-right", "M 466.5 576 C 472.8 522.4 545.8 488.9 577.5 442", 4.54],
  ["right-upright", "M 460.5 576 C 465.2 472.8 552.1 408.3 575.5 318", 4.61],
  ["far-left", "M 418.5 576 C 410.6 505.6 300.1 461.6 260.5 400", 4.54],
  ["left-branch", "M 438 576 C 420 520 352 460 310 420", 3.4],
  ["red-01", "M 358.5 543 C 402.9 552.9 418.6 559.5 432.5 576", 1.8],
  ["red-02", "M 252.5 370 C 452.5 431.8 357.4 503.9 418.5 576", 1.8],
  ["red-03", "M 634.5 373 C 523.4 433.9 501.8 494.8 468.5 576", 1.8],
  ["red-04", "M 467.5 240 C 356.4 357.6 464.7 424.8 442.5 576", 1.8],
  ["red-05", "M 310 480 C 387.8 508.8 403.8 537.6 426 576", 1.8],
  ["red-06", "M 405 350 C 327.2 417.8 449.9 474.3 436 576", 1.8],
  ["red-07", "M 520 470 C 453.3 501.8 469.4 528.3 450 576", 1.8],
  ["red-08", "M 550 270 C 461.1 377.1 483 453.6 458 576", 1.8],
  ["red-09", "M 665 460 C 565 494.8 496.6 529.6 466 576", 1.8]
];

// two decimals max, keeps the svg text short
function visualF(value) {
  return str(float(nf(value, 0, 2)));
}

function visualXY(x, y) {
  return visualF(x) + " " + visualF(y);
}

// random pick from a list (only used when something is created)
function chooseVisualOption(options) {
  let index = min(options.length - 1, floor(random(options.length)));
  return options[max(0, index)];
}

// point on a ring from radius + angle
function visualRingPoint(orbit, angleDeg) {
  let theta = radians(angleDeg);
  return [orbit * cos(theta), orbit * sin(theta)];
}

function svgCircle(id, x, y, radius, fill) {
  return `<circle id="${id}" cx="${visualF(x)}" cy="${visualF(y)}" r="${visualF(radius)}" fill="${fill}"/>`;
}

// ring of little circles = the seeds in the middle.
// orbit: ring radius, dotRadius: dot size, step: degrees between dots
// (smaller step = more dots), offset: turns the whole ring
function ringOfDots(id, orbit, dotRadius, step, color, offset = 0) {
  let nodes = [];
  for (let baseAngle = 0; baseAngle < 360; baseAngle += step) {
    let angle = baseAngle + offset;
    let p = visualRingPoint(orbit, angle);
    let dotId = id + "-" + String(angle).replace(".", "_");
    nodes.push(svgCircle(dotId, p[0], p[1], dotRadius, color));
  }
  return nodes.join("\n");
}

// one row of petals, each with stripes inside
function stripedPetalRing(id, count, radius, row, shape, color) {
  let start = radius * shape.startRatio;
  let tip = radius * shape.tipRatios[row];
  let halfWidth = radius * shape.widthRatio;
  let length = tip - start;
  let rowOffset = row * (360 / count) / 3;

  let petalPath = "M " + visualF(start) + " 0 ";
  petalPath += "C " + visualF(start + length * 0.1) + " " + visualF(-halfWidth * 1.5) + " ";
  petalPath += visualF(tip - length * 0.05) + " " + visualF(-halfWidth * 1.1) + " " + visualF(tip) + " 0 ";
  petalPath += "C " + visualF(tip - length * 0.05) + " " + visualF(halfWidth * 1.1) + " ";
  petalPath += visualF(start + length * 0.1) + " " + visualF(halfWidth * 1.5) + " " + visualF(start) + " 0 Z";

  let petals = [];
  for (let index = 0; index < count; index++) {
    let angle = index * (360 / count) + rowOffset;

    let stripes = [];
    for (let s = 0; s < shape.stripeCount; s++) {
      let stripeOffset = (s - (shape.stripeCount - 1) / 2) / 2;
      let path = "M " + visualF(start + length * 0.1) + " " + visualF(stripeOffset * halfWidth * 0.12) + " ";
      path += "C " + visualF(start + length * 0.35) + " " + visualF(stripeOffset * halfWidth * 0.95) + " ";
      path += visualF(start + length * 0.7) + " " + visualF(stripeOffset * halfWidth * 0.95) + " ";
      path += visualF(tip - length * 0.08) + " " + visualF(stripeOffset * halfWidth * 0.1);
      stripes.push('<path d="' + path + '" fill="none" stroke="' + shape.stripeColor +
        '" stroke-opacity="' + visualF(shape.stripeOpacity) +
        '" stroke-width="' + visualF(max(0.65, radius * 0.021)) + '"/>');
    }

    // one <g> per petal so a whole petal can fall at once
    petals.push('<g id="' + id + "-petal-" + (index + 1) + '" class="one-complete-petal"' +
      ' data-length="' + visualF(tip) + '" data-width="' + visualF(halfWidth * 2) +
      '" data-angle="' + visualF(angle) + '" transform="rotate(' + visualF(angle) +
      ')" opacity="' + visualF(shape.petalOpacity) + '"><path d="' + petalPath +
      '" fill="' + color + '"/>' + stripes.join("\n") + "</g>");
  }
  return petals.join("\n");
}

// whole sunflower head. Layers 8 to 1 are used by growth, the fake 3D and the falling,
// so keep the numbering
function renderSunflower(flower) {
  let id = flower.spec.id;
  let radius = flower.spec.discRadius;
  let center = flower.centerDesign;
  let back = stripedPetalRing(id + "-L8", flower.row0PetalCount, radius, 0, flower.petalShape, flower.row0PetalColor);
  let middle = stripedPetalRing(id + "-L7", flower.row1PetalCount, radius, 1, flower.petalShape, flower.row1PetalColor);
  let front = stripedPetalRing(id + "-L6", flower.row2PetalCount, radius, 2, flower.petalShape, flower.row2PetalColor);

  let text = '<g id="' + id + '" class="sunflower" transform="translate(' +
    visualF(flower.spec.x) + " " + visualF(flower.spec.y) + ') scale(1)">\n    ';
  text += '<g id="' + id + '-layer-8">' + back + "</g>";
  text += '<g id="' + id + '-layer-7">' + middle + "</g>";
  text += '<g id="' + id + '-layer-6">' + front + "</g>\n    ";
  text += '<g id="' + id + '-layer-5">' + svgCircle(id + "-circle-6", 0, 0, radius, flower.centerBaseColor) + "</g>\n    ";
  text += '<g id="' + id + '-layer-4">' + svgCircle(id + "-green-outer", 0, 0, radius * 0.4, flower.centerMiddleColor) + "</g>\n    ";
  text += '<g id="' + id + '-layer-3" visibility="hidden">' + svgCircle(id + "-green-inner", 0, 0, radius * 0.275, center.greenInner) + "</g>\n    ";
  text += '<g id="' + id + '-layer-2">' + ringOfDots(id + "-seed-inner", radius * 0.66, radius * 0.03158, 15, center.dot) + "</g>\n    ";
  text += '<g id="' + id + '-layer-1">' + ringOfDots(id + "-seed-outer", radius * 0.84, radius * 0.02632, 12, center.dot, 6) + "</g>\n  ";
  text += "</g>";
  return text;
}

// small red flowers: x, y, size
let visualSmallFlowers = [
  ["red-flower-01", 358.5, 543, 15.75], ["red-flower-02", 252.5, 370, 15],
  ["red-flower-03", 634.5, 373, 15], ["red-flower-04", 467.5, 240, 15.75],
  ["red-flower-05", 310, 480, 15], ["red-flower-06", 405, 350, 15],
  ["red-flower-07", 520, 470, 15], ["red-flower-08", 550, 270, 15],
  ["red-flower-09", 665, 460, 15]
];

// one small red flower; shape and colour picked here, once
function smallFlowerSVGText(id, x, y, scale) {
  let appearance = chooseVisualOption(lookOptions.smallFlowerShapes);
  let petalColor = chooseVisualOption(lookOptions.redPetalColors);
  let orbit = scale * appearance.orbitRatio;
  let petalRadius = scale * appearance.petalRadiusRatio;
  let centerRadius = scale * appearance.centerRadiusRatio;

  let petals = [];
  for (let index = 0; index < appearance.petalCount; index++) {
    let angle = -90 + index * (360 / appearance.petalCount);
    let p = visualRingPoint(orbit, angle);
    petals.push(svgCircle(id + "-red-petal-" + (index + 1), p[0], p[1], petalRadius, petalColor));
  }

  let text = '<g id="' + id + '" class="small-flower" transform="translate(' + visualF(x) + " " + visualF(y) + ')">';
  text += '<g id="' + id + '-red-petals">' + petals.join("\n") + "</g>";
  text += '<g id="' + id + '-cream-center">' + svgCircle(id + "-center", 0, 0, centerRadius, appearance.centerColor) + "</g></g>";
  return text;
}

// leaves
// a leaf is [root x, root y, tip x, tip y, width, colour number].
// createLeaves() grows them along the stems with random
// numbers, but always inside the limits in leafRules so it stays tidy.
// Made once at page start, so every visit gets a different bunch.

// limits per stem type. Widen a range for wilder leaves:
//   count        = leaves per stem [min, max]
//   along        = where on the stem, 0 = pot end, 1 = flower end
//                  a narrow range bunches them in the middle
//   length/width = size in px
//   angle        = degrees away from the stem (0 along it, 90 sideways);
//                  they alternate sides
//   gap          = min spacing between leaves, as a fraction of the stem
//   perPixels    = small flowers: one leaf per this many px of stem
//                  (smaller = denser)
let leafRules = {
  sunflower: {
    count: [2, 4], along: [0.3, 0.8], length: [40, 64], width: [14, 22],
    angle: [35, 60], gap: 0.14, colours: [0, 1, 2]
  },
  smallFlower: {
    count: [4, 8], perPixels: 42, along: [0.12, 0.92], length: [20, 32], width: [6, 10],
    angle: [30, 58], gap: 0.07, colours: [0, 1, 2]
  }
};

// the 3 leaves on the pot mouth. They belong to the pot and stay still. Edit the numbers to move one.
// Same format as above.
let potLeaves = [
  [404, 550, 376, 614, 28, 0],
  [428, 563, 428, 600, 22, 2],
  [478, 551, 506, 597, 22, 0]
];

// current leaves, and who owns each one:
// currentLeafProfiles[i] = [stem id, how far up it sits]; pot leaves say "pot"
let currentLeaves = [];
let currentLeafProfiles = [];

// reads the 8 numbers out of "M x y C x y x y x y"
function stemCurve(pathData) {
  let parts = split(pathData, " ");   // "M", x, y, "C", x, y, x, y, x, y
  return {
    p0: [float(parts[1]), float(parts[2])],
    p1: [float(parts[4]), float(parts[5])],
    p2: [float(parts[6]), float(parts[7])],
    p3: [float(parts[8]), float(parts[9])]
  };
}

// point on the bezier at t (0-1)
function pointOnStem(c, t) {
  let u = 1 - t;
  let x = u * u * u * c.p0[0] + 3 * u * u * t * c.p1[0] + 3 * u * t * t * c.p2[0] + t * t * t * c.p3[0];
  let y = u * u * u * c.p0[1] + 3 * u * u * t * c.p1[1] + 3 * u * t * t * c.p2[1] + t * t * t * c.p3[1];
  return [x, y];
}

// direction of the curve at t
function directionOfStem(c, t) {
  let u = 1 - t;
  let dx = 3 * u * u * (c.p1[0] - c.p0[0]) + 6 * u * t * (c.p2[0] - c.p1[0]) + 3 * t * t * (c.p3[0] - c.p2[0]);
  let dy = 3 * u * u * (c.p1[1] - c.p0[1]) + 6 * u * t * (c.p2[1] - c.p1[1]) + 3 * t * t * (c.p3[1] - c.p2[1]);
  let length = dist(0, 0, dx, dy) || 1;
  return [dx / length, dy / length];
}

function between(range) {
  return random(range[0], range[1]);
}

// how many leaves a stem gets (small flowers: ~one per perPixels px, +-1)
function leafCountFor(rules, stemLength) {
  let count = round(between(rules.count));
  if (rules.perPixels) count = round(stemLength / rules.perPixels + random(-1, 1));
  count = constrain(count, rules.count[0], rules.count[1]);
  // short sunflower stems can only carry ~1 leaf per 45 px
  if (!rules.perPixels) count = constrain(count, 1, max(1, floor(stemLength / 45)));
  return count;
}

// where the leaves sit along the stem (0 = pot end, 1 = flower end), smallest first.
// It retries up to 60 times to keep the gap between leaves
function leafPositions(rules, count) {
  let positions = [];
  for (let tries = 0; tries < 60 && positions.length < count; tries++) {
    let t = between(rules.along);
    let farEnough = true;
    for (let i = 0; i < positions.length; i++) {
      if (abs(positions[i] - t) < rules.gap) farEnough = false;
    }
    if (farEnough) positions.push(t);
  }
  return sort(positions);
}

// makes the leaves for one stem. Sunflower stems start at the pot, red ones
// are drawn from the flower down, so t has to be flipped for those.
function leavesForStem(stemId, pathData, rules) {
  let curve = stemCurve(pathData);
  let potAtStart = curve.p0[1] > curve.p3[1];   // the pot end is the lower one (bigger y)
  let stemLength = dist(curve.p0[0], curve.p0[1], curve.p3[0], curve.p3[1]);

  let count = leafCountFor(rules, stemLength);

  // and smaller leaves so a leaf always fits its stem (230 = stem length that gets full size)
  let sizeFactor = constrain(stemLength / 230, 0.55, 1);

  let positions = leafPositions(rules, count);

  let side = -1;
  if (random() < 0.5) side = 1;
  let made = [];
  for (let i = 0; i < positions.length; i++) {
    let along = positions[i];
    // along counts from the pot
    let t = 1 - along;
    if (potAtStart) t = along;
    let base = pointOnStem(curve, t);
    let dir = directionOfStem(curve, t);
    let dirX = dir[0];
    let dirY = dir[1];
    if (!potAtStart) {
      dirX = -dirX;
      dirY = -dirY;
    }

    // turn away from the stem, alternating left/right
    let turn = radians(between(rules.angle)) * side;
    side = -side;
    let leafDirX = dirX * cos(turn) - dirY * sin(turn);
    let leafDirY = dirX * sin(turn) + dirY * cos(turn);

    let length = between(rules.length) * sizeFactor;
    let width = between(rules.width) * sizeFactor;
    let colour = rules.colours[floor(random(rules.colours.length))];

    let leaf = [base[0], base[1], base[0] + leafDirX * length, base[1] + leafDirY * length, width, colour];
    for (let k = 0; k < leaf.length; k++) leaf[k] = round(leaf[k] * 10) / 10;
    made.push({ leaf: leaf, profile: [stemId, along] });
  }
  return made;
}

function createLeaves() {
  let made = [];
  for (let i = 0; i < visualStems.length; i++) {
    let id = visualStems[i][0];
    let rules = leafRules.sunflower;
    if (id.startsWith("red-")) rules = leafRules.smallFlower;
    let items = leavesForStem("stem-" + id, visualStems[i][1], rules);
    for (let k = 0; k < items.length; k++) made.push(items[k]);
  }
  for (let i = 0; i < potLeaves.length; i++) {
    made.push({ leaf: potLeaves[i].slice(), profile: ["pot", 0] });
  }

  currentLeaves = [];
  currentLeafProfiles = [];
  for (let i = 0; i < made.length; i++) {
    currentLeaves.push(made[i].leaf);
    currentLeafProfiles.push(made[i].profile);
  }
}

// closed bezier outline of a leaf from root, tip and width
function leafPath(baseX, baseY, tipX, tipY, width) {
  let dx = tipX - baseX;
  let dy = tipY - baseY;
  let length = dist(0, 0, dx, dy);
  let nx = -dy / length;
  let ny = dx / length;
  // control points sit along the leaf (t) and off to the side (offset)
  let c1 = visualXY(baseX + dx * 0.26 + nx * width * 0.66, baseY + dy * 0.26 + ny * width * 0.66);
  let c2 = visualXY(baseX + dx * 0.67 + nx * width * 1.12, baseY + dy * 0.67 + ny * width * 1.12);
  let c3 = visualXY(baseX + dx * 0.78 + nx * -width * 0.94, baseY + dy * 0.78 + ny * -width * 0.94);
  let c4 = visualXY(baseX + dx * 0.31 + nx * -width * 0.76, baseY + dy * 0.31 + ny * -width * 0.76);
  return "M " + visualXY(baseX, baseY) + " C " + c1 + " " + c2 + " " + visualXY(tipX, tipY) +
    " C " + c3 + " " + c4 + " " + visualXY(baseX, baseY) + " Z";
}

// svg for all leaves, each with a faint vein
function renderLeaves() {
  // the three leaf greens (the last number of a leaf picks one); edit a hex code to recolour them
  let palette = ["#748657", "#6B7E4D", "#819263"];
  let leaves = [];
  for (let index = 0; index < currentLeaves.length; index++) {
    let leaf = currentLeaves[index];
    let id = "leaf-" + (index + 1);
    let middle = visualXY((leaf[0] + leaf[2]) / 2, (leaf[1] + leaf[3]) / 2);
    leaves.push('<g id="' + id + '" class="whole-leaf"><path id="' + id + '-base" d="' +
      leafPath(leaf[0], leaf[1], leaf[2], leaf[3], leaf[4]) + '" fill="' + palette[leaf[5]] +
      '"/><path id="' + id + '-vein" d="M ' + visualXY(leaf[0], leaf[1]) + " Q " + middle + " " +
      visualXY(leaf[2], leaf[3]) + '" fill="none" stroke="#7DB084" stroke-opacity="0.34" stroke-width="1"/></g>');
  }
  return leaves.join("\n");
}

// pot (only one design so far)
let potAppearanceOptions = [{
  bodyColor: "#F8DE9A", rimColor: "#F0C664", lineColor: "#D9A024", shadowColor: "#BE821E",
  sidePoints: [
    [0.17, 0], [0.15, 0.1], [0.145, 0.2], [0.2, 0.28], [0.33, 0.36],
    [0.44, 0.47], [0.49, 0.6], [0.46, 0.74], [0.4, 0.86], [0.3, 0.97], [0.2, 1]
  ]
}];

// smooth closed curve through a ring of points (pot outline)
function closedCurvePath(points) {
  let count = points.length;
  let path = "M " + round2(points[0][0]) + " " + round2(points[0][1]);
  for (let index = 0; index < count; index++) {
    let p0 = points[(index - 1 + count) % count];
    let p1 = points[index];
    let p2 = points[(index + 1) % count];
    let p3 = points[(index + 2) % count];
    let c1x = p1[0] + (p2[0] - p0[0]) / 6;
    let c1y = p1[1] + (p2[1] - p0[1]) / 6;
    let c2x = p2[0] - (p3[0] - p1[0]) / 6;
    let c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += " C " + round2(c1x) + " " + round2(c1y) + " " + round2(c2x) + " " + round2(c2y) +
      " " + round2(p2[0]) + " " + round2(p2[1]);
  }
  return path + " Z";
}

function round2(value) {
  return float(nf(value, 0, 2));
}

function renderCeramicPot() {
  let appearance = chooseVisualOption(potAppearanceOptions);
  let centerX = 442.5;
  let top = 570;
  let width = 175;
  let height = 205;
  let side = appearance.sidePoints;

  // outline: top middle, down the right side, back up the left side
  let points = [[centerX, top]];
  for (let i = 0; i < side.length; i++) {
    points.push([centerX + side[i][0] * width, top + side[i][1] * height]);
  }
  for (let i = side.length - 1; i >= 0; i--) {
    points.push([centerX - side[i][0] * width, top + side[i][1] * height]);
  }
  let body = closedCurvePath(points);

  let stripeY = top + height * 0.72;
  let archRadius = width * 0.13;
  let line = appearance.lineColor;

  // soft shadow bands under the rim
  let shadowBands = [];
  for (let i = 0; i < 10; i++) {
    shadowBands.push('<rect x="' + (centerX - width / 2 - 10) + '" y="' + (top + 8 + i * 3) +
      '" width="' + (width + 20) + '" height="3" fill="' + appearance.shadowColor +
      '" opacity="' + (46 - i * 4.6) / 255 + '"/>');
  }

  let shoulderFans = [];
  for (let i = 0; i < 13; i++) {
    let x = centerX + (i - 6) * 22;
    let y = top + height * 0.46;
    shoulderFans.push('<path d="M ' + (x - 11) + " " + y + " A 11 11 0 0 0 " + (x + 11) + " " + y +
      '" fill="none" stroke="' + line + '" stroke-width="2.5"/>');
  }

  let arches = [];
  let dots = [];
  for (let i = 0; i < 9; i++) {
    let x = centerX + (i - 4) * archRadius * 2;
    arches.push('<path d="M ' + (x - archRadius) + " " + stripeY + " A " + archRadius + " " + archRadius +
      " 0 0 1 " + (x + archRadius) + " " + stripeY + '" fill="none" stroke="' + line +
      '" stroke-width="3.5" stroke-linecap="round"/>');
    dots.push(svgCircle("pot-arch-dot-" + (i + 1), x, stripeY - archRadius * 0.45, 3, line) +
      svgCircle("pot-shoulder-dot-" + (i + 1), x + archRadius, stripeY - archRadius * 0.9, 2.5, line));
  }

  let lowerSemicircles = [];
  for (let i = 0; i < 7; i++) {
    let x = centerX + (i - 3) * width * 0.17;
    let y = top + height * 0.93;
    let radius = width * 0.065;
    lowerSemicircles.push('<path d="M ' + (x - radius) + " " + y + " A " + radius + " " + radius +
      " 0 0 1 " + (x + radius) + " " + y + '" fill="none" stroke="' + line + '" stroke-width="3.5"/>');
  }

  let text = '<defs><clipPath id="pot-clipping"><path d="' + body + '"/></clipPath></defs>';
  text += '<g id="ceramic-pot" filter="url(#pot-soft-shadow)">';
  text += '<path id="pot-body" d="' + body + '" fill="' + appearance.bodyColor + '"/>';
  text += '<g id="pot-pattern" clip-path="url(#pot-clipping)">';
  text += shadowBands.join("\n") + shoulderFans.join("\n") + arches.join("\n") + dots.join("\n");
  text += '<rect x="' + (centerX - width / 2 - 10) + '" y="' + stripeY + '" width="' + (width + 20) +
    '" height="6" fill="' + line + '"/>';
  text += lowerSemicircles.join("\n") + "</g>";
  text += '<rect id="pot-rim-front" x="' + (centerX - width * 0.22) + '" y="' + (top - 3) +
    '" width="' + width * 0.44 + '" height="15" rx="6" fill="' + appearance.rimColor + '"/></g>';
  return text;
}

// ---- building and drawing the picture (called by perlin_randomness.js) ----

// picture size (svg viewBox)
let W = 885;
let H = 785;

let STEM_GREEN = "#68A07C";

// the svg text for all the stems
function stemsSVGText() {
  let text = "";
  for (let i = 0; i < visualStems.length; i++) {
    let stem = visualStems[i];
    if (i > 0) text += "\n";
    text += '\n    <path id="stem-' + stem[0] + '" d="' + stem[1] + '" stroke="' + STEM_GREEN +
      '" stroke-width="' + stem[2] + '" stroke-linecap="round" fill="none"/>\n  ';
  }
  return text;
}

function smallFlowersSVGText() {
  let text = "";
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    let f = visualSmallFlowers[i];
    if (i > 0) text += "\n";
    text += smallFlowerSVGText(f[0], f[1], f[2], f[3]);
  }
  return text;
}

// makes the seven sunflower objects; each starts growing a little after the one before
function makeSunflowers() {
  sunflowers = [];
  for (let i = 0; i < visualMainFlowers.length; i++) {
    sunflowers.push(makeSunflower(visualMainFlowers[i], i * STAGGER_DELAY));
  }
}

function sunflowersSVGText() {
  let text = "";
  for (let i = 0; i < sunflowers.length; i++) {
    if (i > 0) text += "\n";
    text += renderSunflower(sunflowers[i]);
  }
  return text;
}

// builds the whole svg and the seven flower objects.
function generateSVG() {
  createLeaves();

  let stemSVG = stemsSVGText();
  let smallFlowerSVG = smallFlowersSVGText();
  makeSunflowers();
  let sunflowerSVG = sunflowersSVGText();

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${W}"
      height="${H}"
      viewBox="0 0 ${W} ${H}"
      role="img"
      aria-label="Editable sunflower bouquet"
    >
      <defs>
        <filter id="flower-soft-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="3.2" flood-color="#5A321E" flood-opacity="0.22"/>
        </filter>
        <filter id="centre-soft-shadow" x="-25%" y="-25%" width="150%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#3D1D14" flood-opacity="0.32"/>
        </filter>
        <filter id="pot-soft-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#493423" flood-opacity="0.24"/>
        </filter>
      </defs>
      <!-- TRANSPARENT BACKGROUND -->
      <g id="sunflower-bouquet">
        <g id="stems">${stemSVG}</g>
        ${renderCeramicPot()}
        <g id="leaves">${renderLeaves()}</g>
        <g id="small-red-flowers">${smallFlowerSVG}</g>
        <g id="seven-sunflowers">${sunflowerSVG}</g>
      </g>
    </svg>
  `;
}

// stem grows by moving the svg dash offset
function drawStem(stemId, progress) {
  let info = stemInfo[stemId];
  if (info) {

    if (progress >= 1) {
      info.path.style.removeProperty("stroke-dasharray");
      info.path.style.removeProperty("visibility");
      info.path.style.removeProperty("stroke-dashoffset");
      return;
    }

    let hiddenLength = info.length * (1 - progress);
    // hidden until it is a few px long, otherwise the start shows up as a dot.
    // 14 px; bigger = appears later,
    // smaller = sooner (but then you see the dot)
    info.path.style.visibility = "visible";
    if (info.length * progress < 14) info.path.style.visibility = "hidden";
    info.path.style.strokeDasharray = info.length + " " + info.length;
    let dashOffset = hiddenLength;
    if (info.reverseReveal) dashOffset = -hiddenLength;
    info.path.style.strokeDashoffset = String(dashOffset);
  }
}

// leaf grows from its root and fades in, ends at 85% opacity
function drawLeaf(index, progress) {
  let group = svgRoot.querySelector("#leaf-" + (index + 1));
  let leaf = currentLeaves[index];
  if (group && leaf) {

    if (progress >= 1) {
      group.removeAttribute("transform");
      group.setAttribute("opacity", "0.85");
      return;
    }

    let anchorX = leaf[0];
    let anchorY = leaf[1];
    let scale = max(0.001, easeOutCubic(progress));
    let move = `translate(${anchorX} ${anchorY}) scale(${scale})`;
    group.setAttribute("transform", move + ` translate(${-anchorX} ${-anchorY})`);
    group.setAttribute("opacity", String(progress * 0.85));
  }
}

// head scales up from its centre
function drawFlowerHead(flower, progress) {
  let group = svgRoot.querySelector("#" + flower.spec.id);
  if (group) {

    if (progress >= 1) {
      group.setAttribute("transform", `translate(${flower.spec.x} ${flower.spec.y}) scale(1)`);
      group.removeAttribute("opacity");
      return;
    }

    let scale = max(0.001, easeOutCubic(progress));
    group.setAttribute("transform", `translate(${flower.spec.x} ${flower.spec.y}) scale(${scale})`);
    group.setAttribute("opacity", String(progress));
  }
}

// (red flowers are always at progress 1, but it follows the head's pattern)
function drawSmallFlower(index, progress) {
  let id = visualSmallFlowers[index][0];
  let x = visualSmallFlowers[index][1];
  let y = visualSmallFlowers[index][2];
  let group = svgRoot.querySelector("#" + id);
  if (group) {

    if (progress >= 1) {
      group.setAttribute("transform", `translate(${x} ${y})`);
      group.removeAttribute("opacity");
      return;
    }

    let scale = max(0.001, easeOutCubic(progress));
    group.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
    group.setAttribute("opacity", String(progress));
  }
}

// smoothstep: 0 before start, 1 after end
function smoothRange(start, end, value) {
  let t = constrain((value - start) / max(0.0001, end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

// fast then slow (blooming, leaves, sway fade-in)
function easeOutCubic(value) {
  let t = constrain(value, 0, 1);
  return 1 - pow(1 - t, 3);
}

// turns an id into a fixed number so every element has its own spot on the noise line (same on every reload)
function stableNoiseOffset(id) {
  // simple string hash, 31 is the usual multiplier
  let hash = 7;
  let text = String(id);
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100000;
  }
  return 20 + hash / 977;
}

// a number as text with at most 3 decimals (keeps the svg text short)
function formatNumber(value) {
  return str(float(nf(value, 0, 3)));
}

// wraps an element in a <g> so the sway can move it
// (reuses the wrapper if it is already there)
function createRuntimeWrapper(element, id, className) {
  if (element.parentNode.id === id) return element.parentNode;
  let wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
  wrapper.id = id;
  wrapper.setAttribute("class", className);
  element.parentNode.insertBefore(wrapper, element);
  wrapper.appendChild(element);
  return wrapper;
}

// ---- the message line under the picture ----
// how long a message under the picture stays (270 = 4.5 s)
// (the message line under the picture is used by input, audio and the save button)
let NOTICE_FRAMES = 270;

// null while the default hint is showing
let noticeStartFrame = null;

function showNotice(message) {
  let notice = document.getElementById("notice");
  if (notice) {
    notice.textContent = message;
    noticeStartFrame = frameCount;
  }
}

function updateNotice() {
  if (noticeStartFrame === null) return;
  if (frameCount - noticeStartFrame < NOTICE_FRAMES) return;
  document.getElementById("notice").textContent = "Click the artwork for a cloud, then scroll for rain.";
  noticeStartFrame = null;
}

// setup and draw: just wiring, the real work is in the mechanic files

function setup() {
  // the picture is svg, so p5 only needs to run the loop
  noCanvas();

  // everything is timed in frames, so 60 fps = 1 s.
  // Lower this and the whole thing runs in slow motion.
  frameRate(60);

  setupFlowers();
  setupInput();
  setupAudio();

  document.getElementById("save").addEventListener("click", savePicture);
}

// Save image: svg -> picture (loadImage) -> drawn on a p5 graphics buffer over the sky colour
// -> save() as png.
// saved file size in px, bigger = sharper
let PICTURE_WIDTH = 885;
let PICTURE_HEIGHT = 785;

function savePicture() {
  let clone = svgRoot.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  let source = new XMLSerializer().serializeToString(clone);
  let url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
  // the SVG is turned into an image first, then drawn onto a p5 canvas and saved
  function pictureReady(picture) {
    let skyColour = getComputedStyle(document.documentElement).getPropertyValue("--sky").trim();
    let buffer = createGraphics(PICTURE_WIDTH, PICTURE_HEIGHT);
    buffer.pixelDensity(1);
    buffer.background(skyColour || "#F6EEDD");
    buffer.image(picture, 0, 0, PICTURE_WIDTH, PICTURE_HEIGHT);
    save(buffer, "sunflower-ecosystem.png");
    buffer.remove();
    URL.revokeObjectURL(url);
  }

  function pictureFailed() {
    URL.revokeObjectURL(url);
    showNotice("Could not save the picture.");
  }

  loadImage(url, pictureReady, pictureFailed);
}

// order matters here: time first (gives the day progress),
// then input, flowers, audio.
function draw() {
  updateTime();
  updateInput();
  updateNotice();
  updateFlowers();
  updateLifecycle(timeProgress);
  updateAudio();
}
