/**
 * AI acknowledgement: ChatGPT helped revise this Audio mechanic and its pure
 * motion mapping. Real waveform RMS drives motion; peaks make flowers nod.
 * The Input module's pointer/tilt fields and the Perlin settings are not written.
 * Waveform API: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatTimeDomainData
 */
const SILENT_AUDIO_FRAME = Object.freeze({ active: false, level: 0, pulse: 0, beat: false });
const AUDIO_MOTION = Object.freeze({ x: 3, y: 3, angle: .04, scale: .035, frequency: 1.2 });

/** Read the A3 flower's final life state; return local SVG pixels and radians. */
function audioFlowerMotion(flower, frame, seconds) {
  const zero = { x: 0, y: 0, angle: 0, scaleOffset: 0 };
  if (!frame?.active || flower.pruned) return zero;
  const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
  // bloomProgress is the original stem/leaf/head growth sequence. It prevents
  // an invisible, newly planted flower from responding before it has unfolded.
  const bloom = clamp(flower.lifeBloom) * clamp(flower.bloomProgress);
  const response = bloom * (1 - .8 * clamp(flower.ageing));
  const level = clamp(frame.level), pulse = clamp(frame.pulse);
  const offset = Number(flower.initialNoiseLocation) || 0; // stable individual phase
  const theta = Math.PI * 2 * AUDIO_MOTION.frequency * seconds + offset;
  const sway = Math.sin(theta) * level * response;
  return {
    x: AUDIO_MOTION.x * sway,
    y: AUDIO_MOTION.y * pulse * response,
    angle: AUDIO_MOTION.angle * sway,
    scaleOffset: AUDIO_MOTION.scale * pulse * response
  };
}

class AudioMechanic {
  constructor(project) {
    this.project = project;
    this.context = null; this.analyser = null; this.output = null;
    this.source = null; this.stream = null; this.buffer = null;
    this.mode = "off"; this.busy = false; this.operation = 0;
    this.pendingKind = "track";
    this.threshold = .055; this.cooldownMs = 700;
    this.noiseFloor = .01; this.referenceLevel = .18; this.pulseDecay = 8;
    this.samples = new Float32Array(1024);
    this.trackName = "Sunflower study";
    this.cuesEnabled = false; this.lastCueTime = new Map(); this.cueVoices = new Set();
    this.resetResponse();
    this.bind(); this.updateButtons();
  }

  bind() {
    document.getElementById("sound").addEventListener("click", () => this.play());
    document.getElementById("microphone").addEventListener("click", () => this.microphone());
    document.getElementById("track-file").addEventListener("change", event => {
      const file = event.target.files[0];
      if (file) this.play(file);
    });
    document.getElementById("audio-cues")?.addEventListener("click", () => {
      this.cuesEnabled = !this.cuesEnabled;
      this.updateButtons();
      showNotice(this.cuesEnabled
        ? "Care sounds on. Play music, then water or plant."
        : "Care sounds off. Music still moves the flowers.");
    });
    // Project notifications are observations of successful care, not new
    // Input rules. input.js remains byte-for-byte identical to the supplied file.
    window.addEventListener("sunflower-care", event => {
      this.playCue(event.detail?.type, event.detail?.strength ?? 1, performance.now());
    });
    // This optional hook already exists in input.js; it adds sound only.
    const previousRainHook = window.onRainStart;
    window.onRainStart = count => {
      previousRainHook?.(count);
      this.playCue("water", .65, performance.now());
    };
    window.addEventListener("beforeunload", () => this.stop());
  }

  async ensureContext() {
    if (!this.context) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error("Audio is not supported in this browser.");
      this.context = new Context();
      this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 1024;
      this.output = this.context.createGain(); this.output.gain.value = .3;
      this.analyser.connect(this.output); this.output.connect(this.context.destination);
    }
    await this.context.resume();
  }

  resetResponse() {
    this.volume = 0; this.previousVolume = 0; this.lastTriggerTime = -Infinity;
    this.armed = true; this.pulse = 0; this.frame = SILENT_AUDIO_FRAME;
  }

  disconnect() {
    if (this.source) {
      try { this.source.stop?.(); } catch (_) { /* already stopped */ }
      this.source.disconnect(); this.source = null;
    }
    this.stream?.getTracks().forEach(track => track.stop()); this.stream = null;
    this.cueVoices.forEach(voice => { try { voice.stop(); } catch (_) {} });
    this.cueVoices.clear(); this.lastCueTime.clear();
    this.mode = "off"; this.resetResponse();
    this.updateButtons();
  }

  stop() {
    this.operation += 1; // invalidate any outstanding decode/permission request
    this.busy = false; this.disconnect();
  }

  async play(file = null) {
    if (!file && (this.mode === "track" || this.busy)) { this.stop(); return; }
    const token = ++this.operation;
    this.busy = true; this.pendingKind = "track"; this.updateButtons();
    try {
      await this.ensureContext();
      if (token !== this.operation) return;
      this.disconnect();
      let buffer = this.buffer, trackName = this.trackName;
      if (file) {
        if (file.size > 50 * 1024 * 1024) throw new Error("Please choose an audio file up to 50 MB.");
        buffer = await this.context.decodeAudioData(await file.arrayBuffer());
        trackName = file.name;
      } else if (!buffer) {
        const raw = atob(DEFAULT_AUDIO_BASE64);
        const bytes = Uint8Array.from(raw, character => character.charCodeAt(0));
        buffer = await this.context.decodeAudioData(bytes.buffer);
      }
      if (token !== this.operation) return;
      this.buffer = buffer; this.trackName = trackName;
      this.output.gain.value = .3;
      this.source = this.context.createBufferSource();
      this.source.buffer = buffer; this.source.loop = true;
      this.source.connect(this.analyser); this.source.start(); this.mode = "track";
      showNotice(`Playing ${this.trackName}. Louder notes sway the flowers; peaks make them nod.`);
    } catch (error) {
      if (token === this.operation) {
        this.disconnect(); showNotice(`Could not play this audio. ${error.message}`);
      }
    } finally {
      if (token === this.operation) { this.busy = false; this.updateButtons(); }
    }
  }

  async microphone() {
    if (this.mode === "mic" || this.busy) { this.stop(); return; }
    const token = ++this.operation;
    this.busy = true; this.pendingKind = "mic"; this.updateButtons();
    try {
      await this.ensureContext();
      if (token !== this.operation) return;
      this.disconnect();
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Use localhost to enable the microphone.");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (token !== this.operation) { stream.getTracks().forEach(track => track.stop()); return; }
      this.stream = stream; this.source = this.context.createMediaStreamSource(stream);
      this.output.gain.value = 0; // analyse without playing the mic back through speakers
      this.source.connect(this.analyser); this.mode = "mic";
      showNotice("Microphone on. Clap to make open flowers nod. The day keeps moving.");
    } catch (_) {
      if (token === this.operation) {
        this.disconnect(); showNotice("Microphone unavailable. Use the included track instead.");
      }
    } finally {
      if (token === this.operation) { this.busy = false; this.updateButtons(); }
    }
  }

  analyseLevel(raw, nowMs) {
    const sample = Number.isFinite(raw) ? Math.max(0, raw) : 0;
    this.previousVolume = this.volume;
    this.volume = this.volume * .35 + sample * .65;
    if (this.volume < this.threshold * .6) this.armed = true;
    const rising = this.volume >= this.threshold && this.previousVolume < this.threshold;
    if (this.armed && rising && nowMs - this.lastTriggerTime >= this.cooldownMs) {
      this.lastTriggerTime = nowMs; this.armed = false;
      return true;
    }
    return false;
  }

  update(deltaSeconds, nowMs = performance.now()) {
    const dt = Math.max(0, Number(deltaSeconds) || 0);
    const active = this.mode !== "off" && this.analyser && this.context?.state === "running";
    if (!active) {
      this.resetResponse();
    } else {
      this.pulse *= Math.exp(-this.pulseDecay * dt);
      this.analyser.getFloatTimeDomainData(this.samples);
      let square = 0;
      for (const sample of this.samples) square += sample * sample;
      const beat = this.analyseLevel(Math.sqrt(square / this.samples.length), nowMs);
      const level = Math.max(0, Math.min(1,
        (this.volume - this.noiseFloor) / Math.max(.0001, this.referenceLevel - this.noiseFloor)));
      if (beat) this.pulse = Math.max(this.pulse, level);
      this.frame = Object.freeze({ active: true, level, pulse: this.pulse, beat });
    }
    const meter = document.getElementById("audio-level");
    meter.style.width = `${this.frame.level * 100}%`;
    meter.dataset.beat = String(this.frame.beat);
    return this.frame;
  }

  /** Optional, original short tones. This branch bypasses the analyser. */
  playCue(type, strength = 1, nowMs = performance.now()) {
    if (!this.cuesEnabled || this.mode !== "track" || this.context?.state !== "running") return false;
    if (type !== "water" && type !== "plant") return false;
    if (nowMs - (this.lastCueTime.get(type) ?? -Infinity) < 300) return false;
    const amount = Math.max(0, Math.min(1, Number(strength) || 0));
    if (!amount) return false;
    this.lastCueTime.set(type, nowMs);
    const t = this.context.currentTime;
    const oscillator = this.context.createOscillator(), gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(type === "water" ? 740 : 330, t);
    oscillator.frequency.exponentialRampToValueAtTime(type === "water" ? 370 : 495, t + .22);
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(.055 * amount, t + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, t + .30);
    oscillator.connect(gain); gain.connect(this.context.destination);
    this.cueVoices.add(oscillator);
    oscillator.onended = () => {
      oscillator.disconnect(); gain.disconnect(); this.cueVoices.delete(oscillator);
    };
    oscillator.start(t); oscillator.stop(t + .32);
    return true;
  }

  updateButtons() {
    const sound = document.getElementById("sound"), mic = document.getElementById("microphone");
    sound.textContent = this.busy && this.pendingKind === "track" ? "Cancel loading"
      : this.mode === "track" ? "Stop music" : "Play music";
    mic.textContent = this.busy && this.pendingKind === "mic" ? "Cancel microphone"
      : this.mode === "mic" ? "Mic off" : "Microphone";
    sound.setAttribute("aria-pressed", String(this.mode === "track"));
    mic.setAttribute("aria-pressed", String(this.mode === "mic"));
    const cues = document.getElementById("audio-cues");
    if (cues) {
      cues.textContent = this.cuesEnabled ? "Care sounds: on" : "Care sounds: off";
      cues.setAttribute("aria-pressed", String(this.cuesEnabled));
    }
  }
}
