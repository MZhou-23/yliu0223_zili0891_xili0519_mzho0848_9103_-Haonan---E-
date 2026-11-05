# Sunflowers

## 1. Project Overview

*Sunflowers* is an interactive digital artwork inspired by Vincent van Gogh's *Sunflowers*. We use p5.js, JavaScript and SVG to turn a still-life painting into a scene that changes with time, sound and user input.

The artwork centres on a vase with seven main sunflowers and nine small red flowers. It begins with an empty vase. After the user waters it, the bouquet grows, moves gently, follows the sun, ages and can grow again. The sky changes from day to night, music affects the flowers, and small lights and butterflies appear at random times.

Our goal is to let people take part in the life of the artwork rather than only look at a static image.

## 2. Inspiration

Our main inspiration is Vincent van Gogh's *Sunflowers*. We were interested in its warm yellow colours, expressive petals and flower heads at different stages of life.

A traditional painting captures one moment. We asked: **What if the sunflowers in the painting could keep living?**

We kept the central composition of flowers in a vase, but introduced growth, ageing, sunlight and sound. Water helps the flowers grow and stay fresh; without it, they slowly wither. Users can also move the sun, so the flowers react to their actions.

We did not aim to copy the original painting exactly. Instead, we used creative coding to explore the life of flowers, natural change and the connection between people and nature.

## 3. Techniques and Implementation

### 3.1 Randomness

We use `random()` to give the sunflowers different numbers of petals, colours, sizes, angles and centre colours. Most choices come from predefined arrays and limited ranges. This creates variation while keeping a consistent visual style.

Randomness also controls small light particles and butterflies. Three transparent butterfly images are stored in an array in `sketch.js`. The logic in `perlin_randomness.js` randomly selects one image, its size, its position and the time when it appears. Each butterfly stays visible for about one second, disappears immediately, and is followed by a random wait of about two to five seconds before the next one appears.

### 3.2 Perlin Noise

We use p5.js `noise()` to make stems, flower heads and leaves sway smoothly. Unlike independent random values, Perlin Noise changes gradually, so the flowers do not jump from one position to another.

Each flower uses a different noise offset, which keeps the movement from looking perfectly synchronised. We also limit the sway angle to maintain a gentle, natural effect. This gives life to the static SVG illustration.

### 3.3 Time-based Animation

We use `frameCount` to track time, with a target rate of 60 frames per second. One complete day-and-night cycle takes about 30 seconds.

As time passes, the background changes through morning, daytime, evening and night. The sun gradually changes to the moon. Time also controls the flower lifecycle: stems, leaves and flowers grow after watering; without more water, they age, droop and fade. Watering again can keep them fresh or start a new bouquet after they wither.

Functions such as `map()`, `constrain()` and `lerp()`, together with easing calculations, help us control the speed and smoothness of these changes.

### 3.4 User Input

Users interact with the artwork mainly by **dragging the sun** and **watering the flowers**.

Dragging the sun changes its position. The code compares the sun's position with each flower and changes the SVG layers so that the flower heads turn and lean towards it.

The first click on the artwork shows a watering can. The second click tilts the can and starts pouring water. Further clicks add more drops and extend the pouring effect. The drops move down frame by frame. When water reaches the vase, the lifecycle system receives a watering event and updates the growth or ageing state.

These actions let the user influence the scene directly.

### 3.5 Audio Interaction

We use the p5.sound library for built-in music playback, microphone input and volume detection. `p5.Amplitude` measures sound level, and the result is shown through an audio level indicator.

When music plays, its volume also affects the amount of flower sway. When the detected sound rises past a threshold, mature flowers can release seeds. Their movement includes random directions, speeds and falling motion.

We adjust and smooth the measured volume so that quieter music can still create a clear visual response without making the animation too abrupt. The microphone can also provide input for the audio level and seed-release effects.

### 3.6 Code Structure and Design Decisions

We divide the project into separate JavaScript files for the four mechanics. `sketch.js` contains the main SVG drawing and connects the other modules through the `setup()` and `draw()` functions.

The mechanics share a small number of variables and functions. For example, the user-input module records watering events, which the time module uses to control plant growth. The audio module calculates a sound-based sway target, which affects the movement handled by the Perlin Noise module.

We chose **SVG for the visual elements and p5.js for animation and interaction**. This lets us change the artwork's appearance and behaviour separately, while keeping the code organised and easier to adjust.

## 4. Mechanic Ownership

Each team member took primary responsibility for one mechanic. All four members also worked together on the main visual design, integration and testing.

### Miaoyan Zhou — Randomness & Perlin Noise

**Main file:** `perlin_randomness.js`

Responsible for random differences between flowers, including petal numbers, colours, sizes and angles, and for natural movement using Perlin Noise. Also responsible for the randomly appearing light particles and butterflies, including their image selection, location and timing.

### Xiaoke Li — Time-based Animation

**Main file:** `time_mechanic.js`

Responsible for the 30-second day-and-night cycle, background colours, the sun-to-moon transition, plant growth, ageing, withering and regrowth after watering.

### Ziyi Li — User Input

**Main file:** `input_mechanic.js`

Responsible for dragging the sun, making the sunflowers follow it, showing and tilting the watering can, generating falling water drops, and passing successful watering events to the lifecycle system.

### Yexin Liu — Audio Interaction

**Main file:** `audio_mechanic.js`

Responsible for music playback, microphone input, sound level detection, audio feedback, sound-controlled sway and the seed-release effect.

### Shared Work

**Main files:** `sketch.js`, `index.html`

The team worked together on the main flower and vase illustrations, page layout, shared variables, overall animation loop, integration and debugging.

## 5. AI Acknowledgement

During this project, we used **OpenAI ChatGPT and Codex** to support our coding process.

Our team independently developed the project's **design concepts, interaction logic, code structure, and basic code modules**. We explained our ideas and technical requirements to ChatGPT, which helped us identify relevant p5.js functions, coding methods, and examples. Based on the code modules and frameworks we had already created, ChatGPT and Codex assisted us in organising, connecting, and improving the code to implement our planned functions.

We also used ChatGPT to review our code, identify potential issues, check whether the intended functions were working as expected, and suggest possible improvements.

**All AI-assisted code and suggestions were reviewed, modified, and selectively adopted by our team.** The core design decisions, interaction mechanisms, code structure, and final implementation were developed and determined by our team members.

## 6. External References

### Artwork

**Vincent van Gogh — Sunflowers (1888)**

https://www.nationalgallery.org.uk/paintings/vincent-van-gogh-sunflowers

The main visual inspiration for the composition, colours and flower forms. We translated these qualities into a changing digital artwork.

### p5.js Documentation

**p5.js Reference**

https://p5js.org/reference/

Used to understand functions such as `random()`, `noise()`, `frameCount`, `map()`, `constrain()`, `sin()`, `cos()` and `lerp()`.

**p5.sound Reference**

https://p5js.org/reference/p5.sound/

Used for music playback, microphone input and sound analysis, including `loadSound()`, `p5.AudioIn` and `p5.Amplitude`.

### Interaction and Animation References

**Eyes Follow Mouse Cursor**

https://github.com/krypton225/Eyes-follow-mouse-cursor

Inspired the idea of making sunflower heads change direction in response to a moving target.

**Happy Coding — Parallax Dots**

https://happycoding.io/tutorials/p5js/creating-classes/parallax-dots

Helped us understand how moving different visual layers by different amounts can create a sense of depth.

**Smoothstep**

https://en.wikipedia.org/wiki/Smoothstep

Provided background on smooth transitions used for growth and changes between day and night.

### Course Examples and Assets

We also used classroom examples of `frameCount`, `sin()` and `cos()` to understand circular motion and repeating animation. These ideas informed the small guiding light near the vase.

The project contains a watering-can PNG, three butterfly PNGs and a WAV music track. **The final asset credits must state the actual source or creation method of each file, especially the replacement music track.**

**Code attribution:** When an implementation is adapted from an external code example, we will add a source URL and a short explanation in the relevant JavaScript comments, rather than listing the source only here.

## 7. How to Experience

### Step 1 — Explore the Initial Scene

When the page opens, an empty vase appears, with the sun above it and a small guiding light near the vase opening.

### Step 2 — Click to Water

Click the artwork once to show the watering can. Click again to tilt the can and pour water. Keep clicking to add more water drops and help the sunflowers grow.

### Step 3 — Drag the Sun

Click and drag the sun across the scene. Watch how the sunflower heads turn and lean towards its new position.

### Step 4 — Watch Time and Growth

As time passes, the sky changes from day to night. If the flowers are left without water, they slowly age and wither. Watering again can keep them fresh or grow a new bouquet.

### Step 5 — Play Music

Click `Play music` to start the built-in track. Watch the audio level indicator, the flowers' movement and the seeds released during louder moments. Click again to stop the music.

### Step 6 — Use the Microphone

Click `Microphone` and allow browser access. Try speaking or making sounds at different volumes. Watch the audio level indicator and seed-release effect. Click again to turn off the microphone.

### Step 7 — Notice Random Details

Small light particles and butterflies appear automatically. One of three butterfly styles is selected at random, appears in a random place for about one second, and disappears immediately. After a random pause, another butterfly may appear.

## 8. File Structure

- `index.html` — Webpage structure and main styles
- `style.css` — Basic page styles
- `sketch.js` — Main SVG drawing, image arrays and integration of mechanics
- `perlin_randomness.js` — Random flower features, Perlin Noise, light particles and butterflies
- `time_mechanic.js` — Day-and-night cycle and plant lifecycle
- `input_mechanic.js` — Sun dragging and watering interactions
- `audio_mechanic.js` — Music, microphone, volume analysis and seed release
- `assets/` — Image and audio assets
- `libraries/` — p5.js and p5.sound libraries