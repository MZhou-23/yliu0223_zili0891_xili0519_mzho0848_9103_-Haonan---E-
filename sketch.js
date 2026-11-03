// 1. PRESET ARRAYS 
let sunflowerAppearanceOptions = {
  row0PetalCounts: [7, 8, 9],
  row1PetalCounts: [7, 8, 9],
  row2PetalCounts: [7, 8, 9],
  row0PetalColors: ["#F6C73D", "#FBB949", "#FBAE49"],
  row1PetalColors: ["#FFC967", "#FBD256", "#FDB843"],
  row2PetalColors: ["#FFCE6E", "#FFD055", "#FFDA55"],
  sunflowerCenterBaseColors: ["#AF7F4D", "#BA6A17"],
  sunflowerCenterMiddleColors: ["#AFBD71"],
  smallRedFlowerPetalColors: ["#EA5D59", "#FF885C", "#D85C23", "#FF582C"],
  // Small changes from the original width/length ratio; every selected value is used.
  petalAspectRatios: [2.2, 2.35, 2.47],
  petalLengthScales: [0.98, 1, 1.02],
  petalOffsetOptions: [0, 0.08, 0.16],
  // Seed colours and inner centre are used by renderSunflower.
  centerDesigns: [
    { greenInner: "#8CAA4A", dot: "#5A2E12" },
    { greenInner: "#89A44A", dot: "#633314" }
  ],
  smallFlowerShapes: [
    { petalCount: 5, centerColor: "#FBCB7A", orbitRatio: 0.8,
       petalRadiusRatio: 0.57, centerRadiusRatio: 0.43 }
  ]
};

let visualMainFlowers = [
  { id: "sunflower-large-left", x: 353.5, y: 314, discRadius: 19.95 },
  { id: "sunflower-left-small-front", x: 260.5, y: 400, discRadius: 20.9 },
  { id: "sunflower-lower-left", x: 335.5, y: 435, discRadius: 24.7 },
  { id: "sunflower-center", x: 443.5, y: 535, discRadius: 19 },
  { id: "sunflower-upper-middle", x: 459.5, y: 394, discRadius: 22.8 },
  { id: "sunflower-lower-right", x: 577.5, y: 442, discRadius: 20.9 },
  { id: "sunflower-right-front", x: 575.5, y: 318, discRadius: 21.85 }
];

let visualStems = [
  ["left-big", [
    [430.5, 576.0, -94.1], [429.4, 560.57, -95.2], [427.76, 545.67, -97.4], [425.6, 531.27, -99.5],
    [422.99, 517.31, -101.6], [419.96, 503.75, -103.5], [416.55, 490.52, -105.3], [412.81, 477.59, -106.9],
    [408.78, 464.91, -108.3], [404.51, 452.43, -109.4], [400.03, 440.09, -110.4], [395.38, 427.85, -111.0],
    [390.63, 415.66, -111.5], [385.79, 403.46, -111.6], [380.93, 391.22, -111.6], [376.08, 378.89, -111.2],
    [371.28, 366.4, -110.7], [366.58, 353.72, -109.9], [362.02, 340.79, -108.9], [357.65, 327.57, -107.6],
    [353.5, 314.0, -107.0]
  ], 4.47],
  ["middle-top", [
    [452.5, 576.0, -88.3], [452.81, 565.28, -88.7], [452.98, 554.93, -89.4], [453.04, 544.93, -90.0],
    [453.0, 535.23, -90.4], [452.89, 525.81, -90.8], [452.74, 516.62, -91.0], [452.57, 507.64, -91.1],
    [452.4, 498.83, -91.0], [452.26, 490.16, -90.8], [452.18, 481.59, -90.3], [452.16, 473.08, -89.7],
    [452.26, 464.62, -89.0], [452.47, 456.15, -88.0], [452.83, 447.64, -87.0], [453.37, 439.07, -85.8],
    [454.11, 430.4, -84.5], [455.06, 421.59, -83.1], [456.26, 412.61, -81.6], [457.73, 403.42, -80.1],
    [459.5, 394.0, -79.4]
  ], 4.68],
  ["middle-bottom", [
    [446.5, 576.0, -90.5], [446.48, 573.59, -91.0], [446.42, 571.26, -92.0], [446.32, 569.0, -92.9],
    [446.19, 566.82, -93.8], [446.03, 564.7, -94.6], [445.85, 562.63, -95.3], [445.65, 560.61, -95.8],
    [445.44, 558.63, -96.2], [445.22, 556.68, -96.5], [445.0, 554.75, -96.7], [444.78, 552.84, -96.6],
    [444.56, 550.93, -96.4], [444.35, 549.02, -96.1], [444.15, 547.11, -95.6], [443.97, 545.17, -94.9],
    [443.81, 543.22, -94.2], [443.68, 541.23, -93.3], [443.58, 539.2, -92.2], [443.52, 537.13, -91.1],
    [443.5, 535.0, -90.6]
  ], 4.4],
  ["lower-left", [
    [424.5, 576.0, -98.9], [423.21, 567.69, -101.1], [421.3, 559.68, -105.5], [418.84, 551.93, -109.6],
    [415.86, 544.42, -113.5], [412.41, 537.12, -116.9], [408.53, 530.01, -120.0], [404.28, 523.05, -122.7],
    [399.7, 516.23, -124.9], [394.82, 509.51, -126.8], [389.71, 502.88, -128.2], [384.41, 496.29, -129.3],
    [378.95, 489.73, -130.0], [373.4, 483.17, -130.3], [367.78, 476.58, -130.3], [362.16, 469.94, -130.0],
    [356.57, 463.22, -129.3], [351.07, 456.39, -128.3], [345.69, 449.43, -126.9], [340.49, 442.31, -125.2],
    [335.5, 435.0, -124.3]
  ], 4.82],
  ["lower-right", [
    [466.5, 576.0, -79.7], [467.93, 568.11, -76.3], [470.28, 560.49, -69.7], [473.47, 553.12, -63.8],
    [477.42, 545.98, -58.7], [482.04, 539.05, -54.3], [487.26, 532.28, -50.7], [493.0, 525.67, -47.7],
    [499.16, 519.18, -45.4], [505.68, 512.8, -43.6], [512.48, 506.49, -42.4], [519.46, 500.23, -41.6],
    [526.55, 493.99, -41.3], [533.67, 487.76, -41.4], [540.73, 481.5, -41.9], [547.67, 475.19, -42.9],
    [554.39, 468.8, -44.4], [560.81, 462.31, -46.4], [566.86, 455.7, -49.0], [572.45, 448.94, -52.2],
    [577.5, 442.0, -53.9]
  ], 4.54],
  ["right-upright", [
    [460.5, 576.0, -85.1], [461.8, 560.8, -82.9], [464.23, 546.14, -78.5], [467.67, 531.95, -74.4],
    [472.02, 518.21, -70.7], [477.16, 504.85, -67.4], [482.99, 491.83, -64.6], [489.4, 479.1, -62.2],
    [496.27, 466.61, -60.3], [503.5, 454.31, -59.0], [510.99, 442.16, -58.0], [518.61, 430.11, -57.6],
    [526.26, 418.1, -57.6], [533.84, 406.1, -58.1], [541.23, 394.05, -59.1], [548.32, 381.9, -60.6],
    [555.01, 369.6, -62.6], [561.18, 357.11, -65.1], [566.72, 344.38, -68.1], [571.53, 331.36, -71.6],
    [575.5, 318.0, -73.5]
  ], 4.61],
  ["far-left", [
    [418.5, 576.0, -100.6], [416.57, 565.63, -104.5], [413.23, 555.63, -112.0], [408.61, 545.95, -118.6],
    [402.84, 536.58, -124.2], [396.05, 527.46, -128.8], [388.37, 518.58, -132.5], [379.94, 509.9, -135.5],
    [370.88, 501.38, -137.8], [361.32, 492.99, -139.4], [351.39, 484.7, -140.6], [341.22, 476.48, -141.2],
    [330.95, 468.29, -141.4], [320.7, 460.1, -141.1], [310.6, 451.88, -140.3], [300.78, 443.59, -139.1],
    [291.38, 435.2, -137.2], [282.52, 426.68, -134.7], [274.33, 418.0, -131.6], [266.95, 409.11, -127.5],
    [260.5, 400.0, -125.3]
  ], 4.54],
  ["red-01", [
    [432.5, 576.0, -131.2], [430.4, 573.6, -132.3], [428.25, 571.33, -134.8], [426.03, 569.2, -137.4],
    [423.73, 567.18, -140.2], [421.32, 565.27, -143.1], [418.78, 563.47, -146.0], [416.09, 561.75, -148.8],
    [413.23, 560.11, -151.4], [410.19, 558.54, -153.9], [406.94, 557.02, -156.2], [403.46, 555.56, -158.2],
    [399.73, 554.14, -160.0], [395.73, 552.75, -161.5], [391.44, 551.38, -162.9], [386.84, 550.01, -164.0],
    [381.91, 548.65, -165.0], [376.63, 547.28, -165.8], [370.99, 545.88, -166.5], [364.95, 544.46, -167.0],
    [358.5, 543.0, -167.2]
  ], 1.8],
  ["red-02", [
    [418.5, 576.0, -126.7], [410.45, 565.19, -123.1], [404.4, 554.38, -115.8], [400.03, 543.59, -109.0],
    [396.97, 532.82, -103.4], [394.91, 522.09, -99.2], [393.5, 511.39, -96.7], [392.4, 500.74, -96.0],
    [391.27, 490.14, -97.1], [389.78, 479.6, -100.0], [387.59, 469.14, -104.6], [384.35, 458.75, -110.8],
    [379.74, 448.44, -118.1], [373.4, 438.23, -125.9], [365.01, 428.12, -133.6], [354.22, 418.12, -140.7],
    [340.7, 408.23, -146.9], [324.1, 398.47, -152.1], [304.1, 388.84, -156.4], [280.34, 379.35, -159.9],
    [252.5, 370.0, -161.4]
  ], 1.8],
  ["red-03", [
    [468.5, 576.0, -67.8], [473.42, 563.97, -67.7], [478.24, 552.23, -67.5], [483.04, 540.76, -67.0],
    [487.89, 529.55, -66.1], [492.86, 518.59, -64.9], [498.04, 507.85, -63.4], [503.5, 497.33, -61.6],
    [509.32, 487.0, -59.5], [515.57, 476.86, -57.1], [522.33, 466.89, -54.6], [529.66, 457.06, -51.8],
    [537.66, 447.38, -49.0], [546.4, 437.82, -46.1], [555.94, 428.36, -43.3], [566.38, 418.99, -40.5],
    [577.77, 409.7, -37.9], [590.2, 400.47, -35.3], [603.75, 391.29, -33.0], [618.49, 382.14, -30.7],
    [634.5, 373.0, -29.7]
  ], 1.8],
  ["red-04", [
    [442.5, 576.0, -83.8], [444.89, 553.93, -85.9], [445.59, 533.03, -90.0], [444.86, 513.18, -93.9],
    [442.96, 494.28, -97.3], [440.15, 476.25, -100.1], [436.69, 458.97, -102.1], [432.85, 442.35, -103.4],
    [428.89, 426.28, -103.8], [425.08, 410.66, -103.2], [421.66, 395.4, -101.5], [418.92, 380.39, -98.7],
    [417.1, 365.53, -94.7], [416.47, 350.72, -89.6], [417.3, 335.86, -83.6], [419.85, 320.85, -76.9],
    [424.37, 305.59, -69.9], [431.13, 289.97, -63.2], [440.4, 273.9, -56.9], [452.44, 257.28, -51.4],
    [467.5, 240.0, -48.9]
  ], 1.8],
  ["red-05", [
    [426.0, 576.0, -120.1], [422.71, 570.31, -120.2], [419.46, 564.76, -120.7], [416.2, 559.34, -121.5],
    [412.88, 554.04, -122.8], [409.45, 548.85, -124.4], [405.86, 543.77, -126.3], [402.05, 538.8, -128.6],
    [397.98, 533.91, -131.1], [393.6, 529.12, -133.8], [388.85, 524.4, -136.6], [383.68, 519.75, -139.5],
    [378.05, 515.17, -142.3], [371.89, 510.65, -145.1], [365.17, 506.18, -147.7], [357.82, 501.75, -150.1],
    [349.81, 497.36, -152.4], [341.07, 492.99, -154.5], [331.55, 488.65, -156.4], [321.21, 484.32, -158.1],
    [310.0, 480.0, -158.9]
  ], 1.8],
  ["red-06", [
    [436.0, 576.0, -85.8], [437.1, 561.08, -89.2], [436.41, 546.79, -96.0], [434.17, 533.1, -102.1],
    [430.64, 519.95, -107.4], [426.08, 507.32, -111.8], [420.73, 495.15, -115.2], [414.85, 483.4, -117.5],
    [408.69, 472.04, -118.9], [402.5, 461.02, -119.2], [396.54, 450.29, -118.4], [391.06, 439.81, -116.3],
    [386.31, 429.55, -112.7], [382.54, 419.46, -107.4], [380.01, 409.49, -100.2], [378.98, 399.61, -91.0],
    [379.68, 389.78, -80.2], [382.39, 379.94, -68.8], [387.34, 370.06, -58.0], [394.79, 360.09, -48.6],
    [405.0, 350.0, -44.7]
  ], 1.8],
  ["red-07", [
    [450.0, 576.0, -69.2], [452.66, 569.0, -70.4], [454.87, 562.3, -72.8], [456.73, 555.88, -74.7],
    [458.33, 549.71, -76.0], [459.74, 543.79, -76.7], [461.07, 538.08, -76.7], [462.4, 532.57, -75.8],
    [463.81, 527.24, -74.0], [465.4, 522.07, -71.3], [467.26, 517.04, -67.7], [469.48, 512.13, -63.4],
    [472.13, 507.31, -58.5], [475.32, 502.58, -53.4], [479.13, 497.9, -48.2], [483.65, 493.27, -43.2],
    [488.97, 488.66, -38.7], [495.17, 484.04, -34.6], [502.36, 479.41, -31.1], [510.6, 474.73, -28.1],
    [520.0, 470.0, -26.7]
  ], 1.8],
  ["red-08", [
    [458.0, 576.0, -79.3], [461.42, 557.97, -80.0], [464.25, 540.58, -81.4], [466.62, 523.76, -82.5],
    [468.63, 507.46, -83.3], [470.42, 491.61, -83.7], [472.09, 476.17, -83.7], [473.78, 461.07, -83.4],
    [475.58, 446.26, -82.5], [477.63, 431.67, -81.3], [480.04, 417.26, -79.5], [482.93, 402.97, -77.4],
    [486.41, 388.73, -74.9], [490.61, 374.49, -72.1], [495.65, 360.19, -69.0], [501.64, 345.78, -65.8],
    [508.69, 331.2, -62.5], [516.94, 316.39, -59.2], [526.5, 301.29, -56.1], [537.48, 285.85, -53.1],
    [550.0, 270.0, -51.7]
  ], 1.8],
  ["red-09", [
    [466.0, 576.0, -54.7], [470.87, 569.13, -52.8], [476.31, 562.42, -49.2], [482.3, 555.86, -45.9],
    [488.85, 549.46, -42.9], [495.94, 543.19, -40.1], [503.58, 537.06, -37.5], [511.76, 531.05, -35.2],
    [520.47, 525.15, -33.1], [529.71, 519.35, -31.2], [539.48, 513.65, -29.4], [549.76, 508.04, -27.9],
    [560.56, 502.5, -26.4], [571.88, 497.04, -25.2], [583.7, 491.63, -24.0], [596.02, 486.28, -23.0],
    [608.84, 480.97, -22.0], [622.15, 475.7, -21.2], [635.95, 470.45, -20.5], [650.24, 465.22, -19.8],
    [665.0, 460.0, -19.5]
  ], 1.8]
];

let visualSmallFlowers = [
  ["red-flower-01", 358.5, 543, 15.75], ["red-flower-02", 252.5, 370, 15],
  ["red-flower-03", 634.5, 373, 15], ["red-flower-04", 467.5, 240, 15.75],
  ["red-flower-05", 310, 480, 15], ["red-flower-06", 405, 350, 15],
  ["red-flower-07", 520, 470, 15], ["red-flower-08", 550, 270, 15],
  ["red-flower-09", 665, 460, 15]
];

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

let potLeaves = [
  [404, 550, 376, 614, 28, 0],
  [428, 563, 428, 600, 22, 2],
  [478, 551, 506, 597, 22, 0]
];

let LEAF_PALETTE = ["#748657", "#6B7E4D", "#819263"];
let STEM_GREEN = "#68A07C";
let W = 885;
let H = 785;

// Original pot appearance and smooth outline
let potAppearanceOptions = [{
  bodyColor: "#F8DE9A", rimColor: "#F0C664", lineColor: "#D9A024", shadowColor: "#BE821E",
  sidePoints: [
    [0.17, 0], [0.15, 0.1], [0.145, 0.2], [0.2, 0.28], [0.33, 0.36],
    [0.44, 0.47], [0.49, 0.6], [0.46, 0.74], [0.4, 0.86], [0.3, 0.97], [0.2, 1]
  ]
}];

function round2(value) {
  return round(value * 100) / 100;
}

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


let MAIN_STEM_BY_FLOWER = {
  "sunflower-large-left": "stem-left-big",
  "sunflower-left-small-front": "stem-far-left",
  "sunflower-lower-left": "stem-lower-left",
  "sunflower-center": "stem-middle-bottom",
  "sunflower-upper-middle": "stem-middle-top",
  "sunflower-lower-right": "stem-lower-right",
  "sunflower-right-front": "stem-right-upright"
};

let STEM_DURATION = 0.2;
let LEAF_DURATION = 0.05;
let BLOOM_DURATION = 0.2;
let STAGGER_DELAY = 0.02;
let svgRoot;
let sunflowers = [];
let stemInfo = {};
let stemProgress = {};
let leafLifecycleWrappers = [];
let currentLeaves = [];
let currentLeafProfiles = [];
let currentLeafAngles = [];
let smallFlowerLooks = [];

// V7 team feature: small red flowers appear on the first watering, then remain.
let redGrown = false;

function easeInOutCubic(value) {
  let t = constrain(value, 0, 1);
  return t * t * (3 - 2 * t);
}
function easeOutCubic(value) {
  let t = constrain(value, 0, 1);
  return lerp(t, 1, t);
}
function formatNumber(value) {
  return "" + (round(value * 100) / 100);
}

function smoothRange(start, end, value) {
  let distance = end - start;
  if (distance < 0.0001) distance = 0.0001;
  let t = constrain((value - start) / distance, 0, 1);
  return (1 - cos(radians(t * 180))) / 2;
}

// V7 lifecycle compatibility; initializing a new flower also resets its growth.
function setStartingLife(flower) {
  initializeFlowerState(flower);
}

function initializeFlowerState(flower) {
  flower.inputOffsetX = 0;
  flower.inputOffsetY = 0;
  flower.inputRotation = 0;
  flower.inputTilt = 0;
  flower.seedShake = 0;
  flower.seedShakeFrame = frameCount;
  flower.ageing = 0;
  flower.witherProgress = 0;
  flower.lifeBloom = 0;
  flower.lifeGrowth = 0;
  flower.mature = false;
  flower.seedReserve = 32;
  flower.growthStage = "waiting";
  flower.needsRegrowth = false;
  flower.visualParts = [];
  resetFlowerGrowth(flower);
}

function visualF(value) { return String(round(value * 100) / 100); }
function visualXY(x, y) { return visualF(x) + " " + visualF(y); }
function svgCircle(id, x, y, radius, fill) {
  return '<circle id="' + id + '" cx="' + visualF(x) + '" cy="' + visualF(y) +
    '" r="' + visualF(radius) + '" fill="' + fill + '"/>';
}
function visualRingPoint(orbit, angle) {
  return [orbit * cos(radians(angle)), orbit * sin(radians(angle))];
}
function ringOfDots(id, orbit, dotRadius, step, color, offset) {
  let result = "";
  for (let a = 0; a < 360; a += step) {
    let position = visualRingPoint(orbit, a + offset);
    result += svgCircle(id + '-' + a, position[0], position[1], dotRadius, color);
  }
  return result;
}
function linePath(points) {
  let result = '';
  for (let i = 0; i < points.length; i++) {
    result += (i === 0 ? 'M ' : ' L ') + visualXY(points[i][0], points[i][1]);
  }
  return result;
}

function stripedPetalRing(id, count, radius, row, color, flower) {
  let start = radius * 50 / 95;
  let tipOptions = [235 / 95, 220 / 95, 205 / 95];
  let tip = radius * tipOptions[row] * flower.petalLengthScale;
  let length = tip - start;
  let petalWidth = length / flower.petalAspectRatio;
  let centerX = (start + tip) / 2;
  let rowOffset = row * (360 / count) / 3;
  let result = '';
  for (let i = 0; i < count; i++) {
    let angle = i * 360 / count + rowOffset + flower.petalAngleOffset;
    result += '<g id="' + id + '-petal-' + (i + 1) +
      '" class="one-complete-petal" data-length="' + visualF(length) +
      '" data-width="' + visualF(petalWidth) + '" data-angle="' + visualF(angle) +
      '" transform="rotate(' + visualF(angle) + ')" opacity="0.88">' +
      '<ellipse cx="' + visualF(centerX) + '" cy="0" rx="' + visualF(length / 2) +
      '" ry="' + visualF(petalWidth / 2) + '" fill="' + color + '"/></g>';
  }
  return result;
}
function renderSunflower(flower) {
  let id = flower.spec.id;
  let r = flower.spec.discRadius;
  let center = flower.centerDesign;
  let text = '<g id="' + id +
    '" class="sunflower" transform="translate(' + visualXY(flower.spec.x, flower.spec.y) + ') scale(1)">';
  text += '<g id="' + id + '-layer-8">' + stripedPetalRing(id + '-L8', flower.row0PetalCount, r, 0, flower.row0PetalColor, flower) + '</g>';
  text += '<g id="' + id + '-layer-7">' + stripedPetalRing(id + '-L7', flower.row1PetalCount, r, 1, flower.row1PetalColor, flower) + '</g>';
  text += '<g id="' + id + '-layer-6">' + stripedPetalRing(id + '-L6', flower.row2PetalCount, r, 2, flower.row2PetalColor, flower) + '</g>';
  text += '<g id="' + id + '-layer-5">' + svgCircle(id + '-circle-6', 0, 0, r, flower.centerBaseColor) + '</g>';
  text += '<g id="' + id + '-layer-4">' + svgCircle(id + '-green-outer', 0, 0, r * 0.4, flower.centerMiddleColor) + '</g>';
  text += '<g id="' + id + '-layer-3" visibility="hidden">' + svgCircle(id + '-green-inner', 0, 0, r * 0.275, center.greenInner) + '</g>';
  text += '<g id="' + id + '-layer-2">' + ringOfDots(id + '-seed-inner', r * 0.66, r * 0.03158, 15, center.dot, 0) + '</g>';
  text += '<g id="' + id + '-layer-1">' + ringOfDots(id + '-seed-outer', r * 0.84, r * 0.02632, 12, center.dot, 6) + '</g>';
  return text + '</g>';
}

// Main SVG needs the outer sway wrapper; time_mechanic.js replaces only the inner flower.
function renderSunflowerWithSway(flower) {
  return '<g id="' + flower.spec.id + '-sway-wrapper">' + renderSunflower(flower) + '</g>';
}

// 4. SMALL RED FLOWERS. Chosen random appearance is passed IN from perlin_randomness.js.
function smallFlowerSVGText(id, x, y, size, flowerLook) {
  let a = flowerLook.shape;
  let text = '<g id="' + id + '-sway-wrapper"><g id="' + id +
    '" class="small-flower" transform="translate(' + visualXY(x, y) + ')">';
  text += '<g id="' + id + '-red-petals">';
  for (let i = 0; i < a.petalCount; i++) {
    let angle = -90 + i * 360 / a.petalCount;
    let pos = visualRingPoint(size * a.orbitRatio, angle);
    text += svgCircle(id + '-red-petal-' + (i + 1), pos[0], pos[1],
      size * a.petalRadiusRatio, flowerLook.color);
  }
  text += '</g><g id="' + id + '-cream-center">' +
    svgCircle(id + '-center', 0, 0, size * a.centerRadiusRatio, a.centerColor) + '</g>';
  return text + '</g></g>';
}

function renderLeaves() {
  let result = '';
  for (let i = 0; i < currentLeaves.length; i++) {
    let f = currentLeaves[i];
    let angle = currentLeafAngles[i];
    let length = dist(f[0], f[1], f[2], f[3]);
    result += '<g id="leaf-' + (i + 1) + '-lifecycle-wrapper" class="leaf-lifecycle-wrapper">' +
      '<g id="leaf-' + (i + 1) + '-sway-wrapper">' +
      '<g id="leaf-' + (i + 1) + '" class="whole-leaf" transform="translate(' +
      visualXY(f[0], f[1]) + ') rotate(' + visualF(angle) + ')">' +
      '<ellipse id="leaf-' + (i + 1) + '-base" cx="' + visualF(length / 2) +
      '" cy="0" rx="' + visualF(length / 2) + '" ry="' + visualF(f[4] / 2) +
      '" fill="' + LEAF_PALETTE[f[5]] + '"/>' +
      '<line id="leaf-' + (i + 1) +
      '-vein" x1="0" y1="0" x2="' +
      visualF(length) +
      '" y2="0" stroke="#7DB084"' +
      ' stroke-opacity="0.34" stroke-width="1"/>' +
      '</g></g></g>';
  }
  return result;
}


function renderCeramicPot() {
  let appearance = potAppearanceOptions[0];
  let centerX = 442.5;
  let top = 570;
  let width = 175;
  let height = 205;
  let side = appearance.sidePoints;

  // Build the original curved outline.
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

  // Original shadow bands near the neck.
  let shadowBands = [];

  for (let i = 0; i < 10; i++) {
    shadowBands.push('<rect x="' + (centerX - width / 2 - 10) + '" y="' + (top + 8 + i * 3) + '" width="' + (width + 20) + '" height="3" fill="' + appearance.shadowColor + '" opacity="' + (46 - i * 4.6) / 255 + '"/>');
  }

  // Original fan shapes on the shoulders.
  let shoulderFans = [];
  for (let i = 0; i < 13; i++) {
    let x = centerX + (i - 6) * 22;
    let y = top + height * 0.46;
    shoulderFans.push('<path d="M ' + (x - 11) + " " + y + " A 11 11 0 0 0 " + (x + 11) + " " + y + '" fill="none" stroke="' + line + '" stroke-width="2.5"/>');
  }

  // Original middle arches and decorative dots.
  let arches = [];
  let dots = [];

  for (let i = 0; i < 9; i++) {
    let x = centerX + (i - 4) * archRadius * 2;
    arches.push('<path d="M ' + (x - archRadius) + " " + stripeY + " A " + archRadius + " " + archRadius + " 0 0 1 " + (x + archRadius) + " " + stripeY + '" fill="none" stroke="' + line + '" stroke-width="3.5" stroke-linecap="round"/>');
    dots.push(svgCircle("pot-arch-dot-" + (i + 1), x, stripeY - archRadius * 0.45, 3, line) +
      svgCircle("pot-shoulder-dot-" + (i + 1), x + archRadius, stripeY - archRadius * 0.9, 2.5, line));
  }

  // Original lower semicircles.
  let lowerSemicircles = [];

  for (let i = 0; i < 7; i++) {
    let x = centerX + (i - 3) * width * 0.17;
    let y = top + height * 0.93;
    let radius = width * 0.065;
    lowerSemicircles.push('<path d="M ' + (x - radius) + " " + y + " A " + radius + " " + radius +
      " 0 0 1 " + (x + radius) + " " + y + '" fill="none" stroke="' + line + '" stroke-width="3.5"/>');
  }

  // Original shadow and clipping definitions.
  let text = '<defs>' +
    '<filter id="pot-soft-shadow" x="-20%" y="-20%" width="140%" height="160%">' +
    '<feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#493423" flood-opacity="0.24"/>' +
    '</filter>' +
    '<clipPath id="pot-clipping"><path d="' + body + '"/></clipPath>' +
    '</defs>';

  text += '<g id="ceramic-pot" filter="url(#pot-soft-shadow)">';
  text += '<path id="pot-body" d="' + body + '" fill="' + appearance.bodyColor + '"/>';
  text += '<g id="pot-pattern" clip-path="url(#pot-clipping)">';
  text += shadowBands.join("\n") + shoulderFans.join("\n") + arches.join("\n") + dots.join("\n");
  text += '<rect x="' + (centerX - width / 2 - 10) + '" y="' + stripeY + '" width="' + (width + 20) + '" height="6" fill="' + line + '"/>';
  text += lowerSemicircles.join("\n") + '</g>';
  text += '<rect id="pot-rim-front" x="' + (centerX - width * 0.22) + '" y="' + (top - 3) + '" width="' + width * 0.44 + '" height="15" rx="6" fill="' + appearance.rimColor + '"/></g>';
  return text;
}

function generateSVG() {
  createLeaves();
  createSmallFlowerLooks();
  let stemSVG = '';
  for (let i = 0; i < visualStems.length; i++) {
    let s = visualStems[i];
    stemSVG += '<path id="stem-' + s[0] + '" d="' + linePath(s[1]) +
      '" stroke="' + STEM_GREEN + '" stroke-width="' + s[2] +
      '" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  }
  let smallSVG = '';
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    let spec = visualSmallFlowers[i];
    smallSVG += smallFlowerSVGText(spec[0], spec[1], spec[2], spec[3], smallFlowerLooks[i]);
  }
  sunflowers = [];
  for (let i = 0; i < visualMainFlowers.length; i++) {
    sunflowers.push(makeSunflower(visualMainFlowers[i], i * STAGGER_DELAY));
  }
  let headSVG = '';
  for (let i = 0; i < sunflowers.length; i++) headSVG += renderSunflowerWithSway(sunflowers[i]);
  return '<svg id="sunflower-svg" xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H +
    '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sunflower bouquet">' +
    '<g id="sunflower-bouquet"><g id="stems">' + stemSVG + '</g>' +
    renderCeramicPot() + '<g id="leaves">' + renderLeaves() + '</g>' +
    '<g id="small-red-flowers">' + smallSVG + '</g>' +
    '<g id="seven-sunflowers">' + headSVG + '</g></g></svg>';
}

let NOTICE_FRAMES = 270;
let noticeStartFrame = null;
function showNotice(message) {
  let notice = document.getElementById('notice');
  if (!notice) return;
  notice.textContent = message;
  noticeStartFrame = frameCount;
}
function updateNotice() {
  if (noticeStartFrame === null) return;
  if (frameCount - noticeStartFrame < NOTICE_FRAMES) return;
  let notice = document.getElementById('notice');
  if (notice) notice.textContent = 'Click the artwork for a watering can, scroll to pour water, and drag the sun to move it.';
  noticeStartFrame = null;
}
function setup() {
  noCanvas();
  frameRate(60);
  setupFlowers();
  setupInput();
  setupAudio();
  let saveButton = document.getElementById('save');
  if (saveButton) saveButton.addEventListener('click', savePicture);
}

function savePicture() {
  showNotice('PNG export needs code beyond the provided course lessons.');
}
function draw() {
  updateTime();
  updateInput();
  updateNotice();
  updateFlowers();
  updateRegularFlowerLayers();
  // V7 lifecycle uses frameCount and watering frames, not the day progress.
  updateLifecycle();
  updateAudio();
}

function isRedStem(id) {
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    if (id === "stem-red-0" + (i + 1)) return true;
  }
  return false;
}

function getSeedShake(flower) {
  let shake = flower.seedShake - (frameCount - flower.seedShakeFrame) / 60 * 2.6;
  if (shake < 0) shake = 0;
  return shake;
}

function setSeedShake(flower, value) {
  flower.seedShake = value;
  flower.seedShakeFrame = frameCount;
}

function resetFlowerGrowth(flower) {
  flower.growthProgress = 0;
  flower.bloomProgress = 0;
  flower.growthState = 'waiting';
  flower.growthElapsed = 0;
  resetFlowerMovement(flower);
}

function resetFlowerMovement(flower) {
  flower.swayAngle = 0;
  flower.swayY = 0;
  flower.movementBlend = 0;
  flower.movementStartFrame = null;
}

function setFlowerGrowth(flower, seconds) {
  flower.growthElapsed = seconds;
  if (flower.growthElapsed < 0) flower.growthElapsed = 0;
  let active = flower.growthElapsed - flower.growthDelay;
  if (active <= 0) {
    flower.growthProgress = 0;
    flower.bloomProgress = 0;
    flower.growthState = 'waiting';
  } else if (active < STEM_DURATION) {
    flower.growthProgress = constrain(active / STEM_DURATION, 0, 1);
    flower.bloomProgress = 0;
    flower.growthState = 'growingStem';
  } else {
    flower.growthProgress = 1;
    flower.bloomProgress = constrain((active - STEM_DURATION) / BLOOM_DURATION, 0, 1);
    if (flower.bloomProgress < 1) flower.growthState = 'blooming';
    else flower.growthState = 'finished';
  }
}

function stemPointAt(points, t) {
  let value = constrain(t, 0, 1) * (points.length - 1);
  let index = floor(value);
  if (index >= points.length - 1) return points[points.length - 1];
  let amount = value - index;
  let a = points[index], b = points[index + 1];
  return [lerp(a[0], b[0], amount), lerp(a[1], b[1], amount),
          lerp(a[2], b[2], amount)];
}

function createLeaves() {
  currentLeaves = [];
  currentLeafProfiles = [];
  currentLeafAngles = [];
  for (let i = 0; i < visualStems.length; i++) {
    let stem = visualStems[i];
    let id = 'stem-' + stem[0];
    let points = stem[1];
    let red = isRedStem(id);
    let rule = leafRules.sunflower;
    if (red) rule = leafRules.smallFlower;
    let base = points[0], top = points[points.length - 1];
    let stemLength = dist(base[0], base[1], top[0], top[1]);
    let count = round(randomBetween(rule.count[0], rule.count[1]));
    if (red) count = round(stemLength / rule.perPixels + randomBetween(-1, 1));
    count = constrain(count, rule.count[0], rule.count[1]);
    if (!red) {
      let limit = floor(stemLength / 45);
      if (limit < 1) limit = 1;
      count = constrain(count, 1, limit);
    }
    let scale = constrain(stemLength / 230, 0.55, 1);
    let positions = [];
    for (let tries = 0; tries < 60 && positions.length < count; tries++) {
      let place = randomBetween(rule.along[0], rule.along[1]);
      let fits = true;
      for (let j = 0; j < positions.length; j++) {
        if (abs(positions[j] - place) < rule.gap) fits = false;
      }
      if (fits) positions.push(place);
    }
    for (let j = 0; j < positions.length; j++) {
      for (let k = j + 1; k < positions.length; k++) {
        if (positions[k] < positions[j]) {
          let old = positions[j]; positions[j] = positions[k]; positions[k] = old;
        }
      }
    }
    let side = randomChoice([-1, 1]);
    for (let j = 0; j < positions.length; j++) {
      let along = positions[j];
      let point = stemPointAt(points, along);
      let angle = point[2] + side * randomBetween(rule.angle[0], rule.angle[1]);
      side = -side;
      let length = randomBetween(rule.length[0], rule.length[1]) * scale;
      let width = randomBetween(rule.width[0], rule.width[1]) * scale;
      let colour = randomChoice(rule.colours);
      let tipX = point[0] + cos(radians(angle)) * length;
      let tipY = point[1] + sin(radians(angle)) * length;
      currentLeaves.push([point[0], point[1], tipX, tipY, width, colour]);
      currentLeafAngles.push(angle);
      currentLeafProfiles.push([id, along]);
    }
  }
  for (let i = 0; i < potLeaves.length; i++) {
    let f = potLeaves[i];
    currentLeaves.push([f[0], f[1], f[2], f[3], f[4], f[5]]);
    let dx = f[2] - f[0];
    let angle = 90;
    if (dx > 0) angle = 55;
    if (dx < 0) angle = 125;
    currentLeafAngles.push(angle);
    currentLeafProfiles.push(['pot', 0]);
  }
}


// time_mechanic.js calls this helper to find the already-created leaf container.
function createRuntimeWrapper(element, id, className) {
  return document.getElementById(id);
}

function setupFlowers() {
  let container = document.getElementById('artwork');
  container.innerHTML = generateSVG();
  svgRoot = document.getElementById('sunflower-svg');
  captureStems();
  resetGrowth();
  captureSway();
  captureLeafWrappers();
  for (let i = 0; i < sunflowers.length; i++) {
    if (typeof bindFlowerParts === 'function') {
      bindFlowerParts(sunflowers[i], document.getElementById(sunflowers[i].spec.id));
    }
  }
}

function captureStems() {
  stemInfo = {};
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    let points = visualStems[i][1];
    let length = 0;
    for (let j = 1; j < points.length; j++) {
      length = length + dist(points[j - 1][0], points[j - 1][1], points[j][0], points[j][1]);
    }
    stemInfo[id] = {
      path: document.getElementById(id),
      points: points,
      length: length,
      reverseReveal: false
    };
  }
}

function resetGrowth() {
  for (let i = 0; i < sunflowers.length; i++) resetFlowerGrowth(sunflowers[i]);
  stemProgress = {};
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    let progress = 0;
    if (isRedStem(id) && redGrown) progress = 1;
    stemProgress[id] = progress;
    drawStem(id, progress);
  }
  for (let i = 0; i < sunflowers.length; i++) drawFlowerHead(sunflowers[i], 0);
  for (let i = 0; i < currentLeaves.length; i++) {
    let progress = 0;
    if (isRedStem(currentLeafProfiles[i][0]) && redGrown) progress = 1;
    drawLeaf(i, progress);
  }
  for (let i = 0; i < visualSmallFlowers.length; i++) {
    let progress = 0;
    if (redGrown) progress = 1;
    drawSmallFlower(i, progress);
  }
}

function totalGrowthDuration() {
  let duration = 0;
  for (let i = 0; i < sunflowers.length; i++) {
    let time = sunflowers[i].growthDelay + STEM_DURATION + BLOOM_DURATION;
    if (time > duration) duration = time;
  }
  return duration;
}

// V7 time_mechanic.js calls syncGrowth(progress). Keep its interface.
// The day progress passed by that module must itself originate from frameCount.
function syncGrowth(growthProgress) {
  syncGrowthToDay(growthProgress);
}

function syncGrowthToDay(dayProgress) {
  let growthTime = constrain(dayProgress / 0.20, 0, 1) * totalGrowthDuration();
  for (let i = 0; i < sunflowers.length; i++) setFlowerGrowth(sunflowers[i], growthTime);
  drawGrowth(growthTime);
}

function secondsSinceStemDone(id, growthTime) {
  if (id === 'pot') {
    let last = 0;

    for (let i = 0; i < sunflowers.length; i++) {
      let time = sunflowers[i].growthDelay + STEM_DURATION;
      if (time > last) last = time;
    }

    return growthTime - last;
  }
  for (let i = 0; i < sunflowers.length; i++) {
    if (MAIN_STEM_BY_FLOWER[sunflowers[i].spec.id] === id) {
      let f = sunflowers[i];

      return growthTime -
        f.growthDelay -
        STEM_DURATION;
    }
  }
  return -1;
}

function drawGrowth(growthTime) {
  // V7: the red flowers grow on the first watering; after that they stay visible.
  let redProgress = 1;
  if (!redGrown) {
    redProgress = easeInOutCubic(constrain(growthTime / STEM_DURATION, 0, 1));
    if (redProgress >= 1) redGrown = true;
  }
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    if (isRedStem(id)) {
      stemProgress[id] = redProgress;
      drawStem(id, redProgress);
    }
  }
  for (let i = 0; i < sunflowers.length; i++) {
    let flower = sunflowers[i];
    let id = MAIN_STEM_BY_FLOWER[flower.spec.id];
    if (id) {
      stemProgress[id] = easeInOutCubic(flower.growthProgress);
      drawStem(id, stemProgress[id]);
    }
    drawFlowerHead(flower, flower.bloomProgress);
  }
  for (let i = 0; i < currentLeafProfiles.length; i++) {
    let id = currentLeafProfiles[i][0];
    let progress = 0;
    if (isRedStem(id)) {
      progress = constrain((redProgress - 0.5) / 0.5, 0, 1);
    } else {
      let waiting = (i % 4) * 0.045;
      progress = constrain((secondsSinceStemDone(id, growthTime) - waiting) / LEAF_DURATION, 0, 1);
    }
    drawLeaf(i, progress);
  }
  let smallProgress = constrain((redProgress - 0.5) / 0.5, 0, 1);
  for (let i = 0; i < visualSmallFlowers.length; i++) drawSmallFlower(i, smallProgress);
}

function finishGrowth() {
  redGrown = true;
  for (let i = 0; i < sunflowers.length; i++) {
    let f = sunflowers[i];
    f.growthProgress = 1;
    f.bloomProgress = 1;
    f.growthState = "finished";
    drawFlowerHead(f, 1);
  }
  for (let i = 0; i < visualStems.length; i++) {
    let id = "stem-" + visualStems[i][0];
    stemProgress[id] = 1;
    drawStem(id, 1);
  }
  for (let i = 0; i < currentLeaves.length; i++) drawLeaf(i, 1);
  for (let i = 0; i < visualSmallFlowers.length; i++) drawSmallFlower(i, 1);
}

function drawStem(id, progress) {
  let info = stemInfo[id];
  if (!info) return;
  let p = constrain(progress, 0, 1);
  let points = info.points;
  if (p <= 0) {
    info.path.setAttribute("visibility", "hidden");
    return;
  }
  let position = p * (points.length - 1);
  let whole = floor(position);
  let finalIndex = whole + 1;
  if (finalIndex >= points.length) finalIndex = points.length - 1;
  let offsetX = 0;
  let offsetY = 0;
  if (stemRecords[id]) {
    offsetX = stemRecords[id].offsetX;
    offsetY = stemRecords[id].offsetY;
  }
  let pathText = "";
  for (let i = 0; i <= finalIndex; i++) {
    let x = points[i][0];
    let y = points[i][1];
    if (i === finalIndex && whole < points.length - 1 && p < 1) {
      x = lerp(points[whole][0], points[whole + 1][0], position - whole);
      y = lerp(points[whole][1], points[whole + 1][1], position - whole);
    }
    let fraction = i / (points.length - 1);
    if (i === finalIndex && p < 1) fraction = p;
    x = x + offsetX * fraction * fraction;
    y = y + offsetY * fraction * fraction;
    if (i === 0) pathText = "M " + formatNumber(x) + " " + formatNumber(y);
    else pathText += " L " + formatNumber(x) + " " + formatNumber(y);
  }
  info.path.setAttribute("d", pathText);
  info.path.setAttribute("visibility", "visible");
}

function drawLeaf(index, progress) {
  let group = document.getElementById('leaf-' + (index + 1));
  if (!group) return;
  let f = currentLeaves[index], angle = currentLeafAngles[index];
  let p = constrain(progress, 0, 1);
  let amount = easeOutCubic(p);
  if (amount < 0.001) amount = 0.001;
  group.setAttribute('transform', 'translate(' + formatNumber(f[0]) + ' ' +
    formatNumber(f[1]) + ') rotate(' + formatNumber(angle) + ') scale(' +
    formatNumber(amount) + ')');
  group.setAttribute('opacity', formatNumber(p * 0.85));
}

function drawFlowerHead(flower, progress) {
  let g = document.getElementById(flower.spec.id);
  if (!g) return;
  let p = constrain(progress, 0, 1);
  let amount = easeOutCubic(p);
  if (amount < 0.001) amount = 0.001;
  g.setAttribute('transform', 'translate(' + formatNumber(flower.spec.x) + ' ' +
    formatNumber(flower.spec.y) + ') scale(' + formatNumber(amount) + ')');
  g.setAttribute('opacity', formatNumber(p));
}

function drawSmallFlower(index, progress) {
  let f = visualSmallFlowers[index];
  let g = document.getElementById(f[0]);
  if (!g) return;
  let p = constrain(progress, 0, 1);
  g.setAttribute('transform', 'translate(' + formatNumber(f[1]) + ' ' +
    formatNumber(f[2]) + ') scale(' + formatNumber(p > 0.001 ? p : 0.001) + ')');
  g.setAttribute('opacity', formatNumber(p));
}

function renewSunflower(index) {
  let old = sunflowers[index];
  if (!old) return null;
  // makeSunflower() is in perlin_randomness.js and always chooses new random values.
  let fresh = makeSunflower(old.spec, old.growthDelay);
  sunflowers[index] = fresh;
  let heads = document.getElementById("seven-sunflowers");
  let html = "";
  for (let i = 0; i < sunflowers.length; i++) html += renderSunflowerWithSway(sunflowers[i]);
  heads.innerHTML = html;
  // Only refresh DOM references; do not reset the already-growing plants.
  for (let i = 0; i < sunflowers.length; i++) {
    let id = sunflowers[i].spec.id;
    flowerWrappers[id] = document.getElementById(id + "-sway-wrapper");
    if (typeof bindFlowerParts === "function") {
      bindFlowerParts(sunflowers[i], document.getElementById(id));
    }
  }
  let stemId = MAIN_STEM_BY_FLOWER[fresh.spec.id];
  mainFlowerByStem[stemId] = fresh;
  captureLeafWrappers();
  return fresh;
}

function getRegularMotion(flower, seconds, phaseOffset) {
  let result = { shakeX: 0, shakeAngle: 0, droopAngle: 0, ageingY: 0,
                 inputX: 0, inputY: 0 };
  if (flower) {
    let shake = getSeedShake(flower);
    let phase = seconds * 58 + phaseOffset;
    result.shakeX = sin(phase) * shake * 7;
    result.shakeAngle = sin(phase) * shake * 2.2;
    result.droopAngle = flower.droopDirection * flower.ageing * 8;
    result.ageingY = flower.ageing * 48;
    result.inputX = flower.inputOffsetX;
    result.inputY = flower.inputOffsetY;
  }
  return result;
}

function getInputTiltTransform(flower) {
  let transform = "";
  if (flower.inputTilt > 0.0001) {
    let degrees = flower.inputRotation * 180 / PI;
    let squeeze = cos(flower.inputTilt);
    if (squeeze < 0.825) squeeze = 0.825;
    let x = flower.spec.x;
    let y = flower.spec.y;
    transform += " translate(" + x + " " + y + ")";
    transform += " rotate(" + formatNumber(degrees) + ")";
    transform += " scale(" + formatNumber(squeeze) + " 1)";
    transform += " rotate(" + formatNumber(-degrees) + ")";
    transform += " translate(" + (-x) + " " + (-y) + ")";
  }
  return transform;
}

function updateRegularFlowerLayers() {
  if (typeof shiftHeadLayers === "function") {
    for (let i = 0; i < sunflowers.length; i++) shiftHeadLayers(sunflowers[i]);
  }
}