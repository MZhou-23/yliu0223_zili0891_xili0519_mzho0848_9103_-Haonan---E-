// Part 1: Sound Settings

let QUIET_SWAY_AMPLITUDE = 8; // Natural sway amplitude when no music is playing
let AUDIO_THRESHOLD = 0.055; // Smoothed, amplified volume must cross this threshold upwards to trigger seeds
let AUDIO_COOLDOWN_FRAMES = 42; // At least 42 frames between two seed releases
let SWAY_EASE_FRAMES = 21; // The sway amplitude takes 21 frames to change
let audioMode = "off"; // Audio mode: off, track, or mic
let audioTrack = null; // Loaded or loading p5.SoundFile
let audioMic = null; // Current p5.AudioIn instance, including while permission is pending
let audioMeter; // Used to measure audio volume
let audioTrackName = "Sunflower study"; // Music name
// Current audio volume and volume from the previous frame
let audioVolume = 0;
let audioPreviousVolume = 0;

// Frame number of the last seed release
let audioLastTriggerFrame = -100000;
let audioArmed = true; // Re-arm below 60% of the threshold before another upward crossing can trigger seeds
let audioSwayNow = QUIET_SWAY_AMPLITUDE; // Current sway amplitude
let audioSwayFrom = QUIET_SWAY_AMPLITUDE; // Sway amplitude when the previous transition began
let audioSwayChangeFrame = 0; // Frame number when the previous sway transition began
let audioRequest = 0; // Used to distinguish new and previous audio loading requests

// Part 2: Seed Data

let particleLayer; // SVG container for seed graphics
let seedParticles = []; // Active seeds moving along their flight paths
let freeSeedElements = []; // Seed graphics that have disappeared and can be reused

// Part 3: Initialise Audio Functions

function setupAudio() {
  // Create an SVG container for released seeds
  particleLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  particleLayer.setAttribute("id", "ecosystem-particles");
  svgRoot.appendChild(particleLayer);
  audioMeter = new p5.Amplitude(0); // Create an audio amplitude analyser
  document.getElementById("sound").addEventListener("click", playDefaultTrack);
  // Connect the microphone button to the p5.sound input toggle
  document.getElementById("microphone").addEventListener("click", startMicrophone);
}

// Part 4: Play Music

function playDefaultTrack() {
  // Play or stop the bundled WAV track
  playAudio("./assets/sunflower-study.wav","Sunflower study");
}

// Record the state when the sway amplitude starts changing
function startSwayEase() {
  audioSwayFrom = audioSwayNow;
  audioSwayChangeFrame = frameCount;
}

// Stop the current source and reset volume, trigger and button states
function stopAudio() {
  // Ignore callbacks from earlier music loads by advancing the request counter
  audioRequest = audioRequest + 1;
  // Stop the music
  if (audioTrack) {
    audioTrack.stop();
  }
  // Stop the microphone
  if (audioMic) {
    audioMic.stop();
  }
  audioTrack = null;
  audioMic = null;
  audioMode = "off";
  audioVolume = 0;
  audioPreviousVolume = 0;
  audioArmed = true;
  startSwayEase();
  updateAudioButtons();
}


// Load and play music
function playAudio(file, name) {
  // Press the built-in music button again to stop the current music
  if (audioMode === "track" && name === "Sunflower study") 
    {
    stopAudio();
    return;
  }
  stopAudio();
  audioTrackName = name;
  // Record the number of this loading request
  let thisRequest = audioRequest;
  audioTrack = loadSound(file, musicLoaded, musicFailed);

  // Music loaded successfully
  function musicLoaded() {
    if (thisRequest === audioRequest) {
      // Set the volume to 30%
      audioTrack.setVolume(0.3);
      // Play in a loop
      audioTrack.loop();
      // Measure the volume of the current music
      audioMeter.setInput(audioTrack);
      audioMode = "track";
      startSwayEase();
      updateAudioButtons();
      showNotice("Playing " + audioTrackName + ". Sound now drives the flowers.");
    }
  }

  // Failed to load music
  function musicFailed() {
    if (thisRequest === audioRequest) {
      stopAudio();
      showNotice("Could not load this audio file.");
    }
  }
}

function startMicrophone() {
  // Press again to turn off the microphone
  if (audioMode === "mic") {
    stopAudio();
    return;
  }
  // Stop the music before starting the microphone
  stopAudio();
  // Start audio after the user clicks the button
  userStartAudio();
  // Create the microphone input
  let mic = new p5.AudioIn();
  audioMic = mic;
  // Microphone started successfully
  function micReady() {
    if (audioMic !== mic) {
      return;
    }
    // Use the microphone as the audio source
    audioMeter.setInput(mic);
    audioMode = "mic";
    startSwayEase();
    updateAudioButtons();
    showNotice(
      "Microphone on. Your voice now controls the flowers."
    );
  }
  // Microphone could not be started
  function micFailed() {
    if (audioMic !== mic) {
      return;
    }
    stopAudio();
    showNotice(
      "Microphone unavailable. Please check your permission."
    );
  }
  // Start microphone input
  mic.start(micReady, micFailed);
}

// Update the text shown on the buttons

function updateAudioButtons() {
  let soundText = "Play music";
  if (audioMode === "track") {
    soundText = "Stop music";
  }
  let micText = "Microphone";
  if (audioMode === "mic") {
    micText = "Mic off";
  }
  document.getElementById("sound").textContent = soundText;
  document.getElementById("microphone").textContent = micText;
}

// Part 5: Measure Audio Volume Every Frame

function updateAudio() {
  // Released seeds continue moving even after the music stops
  updateSeedParticles();
  if (audioMode !== "off") {
    // Save the volume from the previous frame
    audioPreviousVolume = audioVolume;
    // Measure the selected source before applying gain and smoothing
    // Read the current sound level
    let measuredVolume = audioMeter.getLevel();
    // Amplify the measured level for either music or microphone input
    if (audioMode !== "off") {
      measuredVolume = measuredVolume * 3;
    }
    // Blend 35% of the previous value with 65% of the amplified reading
    audioVolume = audioVolume * 0.35 + measuredVolume * 0.65;
    // Allow another trigger when the sound becomes quieter again
    if (audioVolume < AUDIO_THRESHOLD * 0.6) {
      audioArmed = true;
    }
    // Check whether the sound has just increased past the threshold
    let rising = audioVolume >= AUDIO_THRESHOLD && audioPreviousVolume < AUDIO_THRESHOLD;
    // Require an armed upward crossing and at least 42 frames since the last trigger
    if (audioArmed && rising && frameCount - audioLastTriggerFrame >= AUDIO_COOLDOWN_FRAMES) 
      {
      // Record the frame number of this seed release
      audioLastTriggerFrame = frameCount;
      audioArmed = false;
      // Release seeds
      releaseSeeds(audioVolume);
    }
  }

  // Music sets a volume-dependent sway target capped at 8; off and mic use the base target
  let swayGoal = QUIET_SWAY_AMPLITUDE;
  if (audioMode === "track") {
    swayGoal = 2.5 + audioVolume * 90;
    if (swayGoal > 8) {
      swayGoal = 8;
    }
  }

  // Calculate the sway transition progress using frameCount
  let easeAmount = constrain((frameCount - audioSwayChangeFrame) / SWAY_EASE_FRAMES, 0, 1);
  // Change the sway amplitude smoothly
  audioSwayNow = lerp(audioSwayFrom, swayGoal, easeAmount);

  // Send the sway amplitude to the Perlin Noise file
  setSwayAmplitude(audioSwayNow);
  // Calculate the width of the audio level bar on the page
  let levelWidth = audioVolume * 650;
  if (levelWidth > 100) {
    levelWidth = 100;
  }
  document.getElementById("audio-level").setAttribute("style", "width: " + levelWidth + "%");
}

// Part 6: Release Seeds When the Sound Gets Louder

function releaseSeeds(loudness) {
  // Determine the number of seeds from the volume
  // Request 2 to 10 seeds per mature flower, limited by its reserve and the scene cap
  let count = 2;
  for (let k = 1; k <= 8; k++) {
    if (loudness * 30 >= k) {
      count = count + 1;
    }
  }

  // Loop through the seven sunflowers
  for (let f = 0; f < sunflowers.length; f++) {
    let flower = sunflowers[f];
    // Only mature flowers with seeds remaining can release seeds
    if (
      flower.mature &&
      flower.seedReserve > 0
    ) {
      // Set a shake impulse from the requested seed count, preserving any stronger existing shake
      let shake = 0.55 + count / 18;
      if (shake > 1) {
        shake = 1;
      }
      if (getSeedShake(flower) > shake) {
        shake = getSeedShake(flower);
      }
      setSeedShake(flower, shake);
      // Create seeds for this flower
      for (let i = 0; i < count; i++) {
        // Each flower cannot release more seeds than it has
        // The scene can contain at most 100 active seeds at one time
        if (
          flower.seedReserve > 0 &&
          seedParticles.length < 100
        ) {
          flower.seedReserve = flower.seedReserve - 1;
          let element;
          // Reuse a previously hidden circle first
          if (freeSeedElements.length > 0) {
            element = freeSeedElements.pop();
          } else {
            // Create a new circle if none is available for reuse
            element = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            );
            particleLayer.appendChild(element);
          }

          // Set the size, colour, and visibility of the seed
          element.setAttribute("r","" + (2.6 + random() * 1.5));
          element.setAttribute(
            "class",
            "sound-released-seed"
          );
          element.setAttribute("fill", "#674024");
          element.setAttribute("visibility", "visible");
          element.setAttribute("opacity", "1");
          // Start the seed from a random position near the flower
          let startX = flower.spec.x + (random() - 0.5) * 20;
          // Horizontal flying speed
          let vx = (random() - 0.5) * 44;
          // Upward flying speed
          let vy = -30 - random() * 58;
          // Random starting rotation angle
          let startRotation = random() * 360;
          // Set the initial transform for this new or reused SVG circle
          element.setAttribute(
            "transform",
            "translate(" + visualF(startX) + " " +
            visualF(flower.spec.y) + ") rotate(" +
            visualF(startRotation) + ")"
          );

          // Ensure the seed remains visible after resetting its transform
          element.setAttribute("visibility", "visible");

          // Store this seed in the array
          seedParticles.push({
            element: element,
            x: startX,
            y: flower.spec.y,
            rotation: startRotation,
            startX: startX,
            startY: flower.spec.y,
            startRotation: startRotation,
            vx: vx,
            vy: vy,
            // Record frameCount when the seed is created
            spawnFrame: frameCount,
            // Reserved landing fields; the current flight update does not use them
            landFrame: 0,
            landed: false
          });
        }
      }
    }
  }
}

// Part 7: Update Seed Movement Every Frame


function updateSeedParticles() {

  // Update each seed
  for (let i = seedParticles.length - 1; i >= 0; i--) {

    let seed = seedParticles[i];

    // Convert elapsed frames to nominal seconds, assuming 60 frames per second
    let t = (frameCount - seed.spawnFrame) / 60;

    // Horizontal movement
    seed.x = seed.startX + seed.vx * t;

    // Vertical movement with gravity
    seed.y = seed.startY + seed.vy * t + 130 * t * t;

    // Rotation while falling
    seed.rotation = seed.startRotation + 120 * t;

    // Update SVG position
    let move = "translate(" +
      visualF(seed.x) + " " +
      visualF(seed.y) + ")";

    move = move + " rotate(" +
      visualF(seed.rotation) + ")";

    seed.element.setAttribute("transform", move);

    // Hide and recycle the seed when its y coordinate reaches 800
    // or after 480 frames (8 seconds at 60 frames per second)
    if (seed.y >= 800 || t >= 8) {

      seed.element.setAttribute("visibility", "hidden");

      // Reuse the SVG element later
      freeSeedElements.push(seed.element);

      // Replace this entry with the last active seed, then shorten the array
      seedParticles[i] =
        seedParticles[seedParticles.length - 1];

      seedParticles.pop();
    }
  }
}
