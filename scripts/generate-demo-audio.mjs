// Synthesizes short, original placeholder loops for the hero vinyl player.
// usage: node scripts/generate-demo-audio.mjs   (needs macOS `afconvert` for AAC output)
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const OUT = join(import.meta.dirname, "..", "public", "sites", "ayden", "audio");

const midi = (n) => 440 * 2 ** ((n - 69) / 12);

// band-limited-ish saw: first few harmonics
const saw = (phase, harmonics = 6) => {
  let v = 0;
  for (let h = 1; h <= harmonics; h++) v += Math.sin(phase * h) / h;
  return v * 0.6;
};

let seed = 1;
const noise = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
};

function render(t) {
  const beat = 60 / t.bpm;
  const bars = 8;
  const len = Math.ceil(bars * 4 * beat * SR + SR);
  const out = new Float32Array(len);
  const duck = new Float32Array(len).fill(1);

  const add = (start, dur, fn) => {
    const s0 = Math.floor(start * SR);
    const n = Math.floor(dur * SR);
    for (let i = 0; i < n && s0 + i < len; i++) out[s0 + i] += fn(i / SR);
  };

  for (let bar = 0; bar < bars; bar++) {
    const full = bar >= t.introBars;
    const chord = t.chords[Math.floor(bar / 2) % t.chords.length];

    // pad: detuned saws through a one-pole lowpass
    const barStart = bar * 4 * beat;
    let lp = 0;
    add(barStart, 4 * beat, (s) => {
      let v = 0;
      for (const n of chord) {
        const f = midi(n + 12);
        v += saw(2 * Math.PI * f * s) + saw(2 * Math.PI * f * 1.004 * s);
      }
      lp += (v - lp) * t.padCutoff;
      const env = Math.min(1, s / 0.25) * Math.min(1, (4 * beat - s) / 0.1);
      return lp * 0.045 * env;
    });

    for (let b = 0; b < 4; b++) {
      const at = barStart + b * beat;
      if (full) {
        // kick + sidechain envelope
        let ph = 0;
        add(at, 0.45, (s) => {
          ph += (2 * Math.PI * (48 + 110 * Math.exp(-s * 28))) / SR;
          return Math.sin(ph) * Math.exp(-s * 7) * 0.9;
        });
        const d0 = Math.floor(at * SR);
        for (let i = 0; i < beat * SR * 0.9 && d0 + i < len; i++) {
          duck[d0 + i] = Math.min(duck[d0 + i], 0.25 + 0.75 * Math.min(1, i / (beat * SR * 0.6)));
        }
        if (t.clap && (b === 1 || b === 3)) {
          let prev = 0;
          add(at, 0.25, (s) => {
            const x = noise();
            const v = x - prev;
            prev = x;
            return v * Math.exp(-s * 16) * 0.22;
          });
        }
        // bass on the off-beat
        const note = chord[0] - 12 + (t.bassPattern[(bar * 4 + b) % t.bassPattern.length] ?? 0);
        add(at + beat / 2, beat / 2, (s) => {
          const f = midi(note);
          return saw(2 * Math.PI * f * s, 4) * Math.exp(-s * 5) * 0.32;
        });
      }
      // hats
      for (const off of t.hats) {
        let prev = 0;
        add(at + off * beat, 0.08, (s) => {
          const x = noise();
          const v = x - prev;
          prev = x;
          return v * Math.exp(-s * 70) * (full ? 0.11 : 0.06);
        });
      }
      // arp plucks
      if (t.arp && full) {
        for (let k = 0; k < 4; k++) {
          const n = chord[(b * 4 + k) % chord.length] + 24;
          add(at + (k * beat) / 4, beat / 4, (s) => {
            const f = midi(n);
            return saw(2 * Math.PI * f * s, 3) * Math.exp(-s * 18) * 0.07;
          });
        }
      }
    }
  }

  // sidechain the non-kick bed, fade, normalize
  let peak = 0;
  for (let i = 0; i < len; i++) {
    out[i] *= 0.55 + 0.45 * duck[i];
    const s = i / SR;
    out[i] *= Math.min(1, s / 0.3) * Math.min(1, (len / SR - s) / 1.5);
    peak = Math.max(peak, Math.abs(out[i]));
  }
  const gain = 0.89 / peak;
  for (let i = 0; i < len; i++) out[i] = Math.tanh(out[i] * gain * 1.1) * 0.95;
  return out;
}

function wav(samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  return buf;
}

const TRACKS = [
  { file: "demo-01", bpm: 124, introBars: 2, clap: true, arp: false, padCutoff: 0.06, hats: [0.5], chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], bassPattern: [0, 0, 12, 0] },
  { file: "demo-02", bpm: 128, introBars: 1, clap: true, arp: true, padCutoff: 0.04, hats: [0.5, 0.75], chords: [[50, 53, 57], [46, 50, 53], [48, 52, 55]], bassPattern: [0, 7, 0, 10] },
  { file: "demo-03", bpm: 122, introBars: 2, clap: false, arp: true, padCutoff: 0.08, hats: [0.25, 0.5, 0.75], chords: [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]], bassPattern: [0, 0, 7, 5] },
  { file: "demo-04", bpm: 126, introBars: 2, clap: true, arp: false, padCutoff: 0.03, hats: [0.5], chords: [[53, 56, 60], [51, 55, 58]], bassPattern: [0, 12, 0, 10] },
  { file: "demo-05", bpm: 120, introBars: 1, clap: false, arp: true, padCutoff: 0.1, hats: [0.5, 0.75], chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], bassPattern: [0, 7, 12, 7] },
];

mkdirSync(OUT, { recursive: true });
for (const t of TRACKS) {
  seed = 1 + t.bpm;
  const tmp = join(OUT, `${t.file}.wav`);
  writeFileSync(tmp, wav(render(t)));
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "128000", tmp, join(OUT, `${t.file}.m4a`)]);
  rmSync(tmp);
  console.log(`${t.file}.m4a`);
}
