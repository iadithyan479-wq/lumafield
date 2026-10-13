# LumaField

> A little pocket of atmosphere, made just for this moment.

LumaField is a tiny generative soundscape studio that pairs a living, animated light field with a soft ambient score composed in your browser. Pick an atmosphere, tune its drift, warmth, and texture, and take a breath. **No account, server, tracking, or external audio files.**

![LumaField interface](https://raw.githubusercontent.com/iadithyan479-wq/lumafield/main/preview.png)

## Try it

Open [`index.html`](index.html) in a modern browser, or visit the [live demo](https://iadithyan479-wq.github.io/lumafield/). Press the play button once to enable audio (browsers require a user gesture).

## Four atmospheres

- **Dusk** — warm, low-lit garden tones
- **Tide** — cool, open-water drift
- **Canopy** — soft, rain-washed greens
- **Orbit** — slow, spacious harmonic tones

## Make it yours

Adjust **Drift** to change how the visual field wanders, **Warmth** to tint the light and sound, and **Texture** to add a touch of film grain. The master volume is independent of those controls. Press the red **Record** button to capture the current soundscape; press it again to stop and download your recording. Recording starts audio automatically if needed and exports a browser-supported WebM/Opus or Ogg/Opus file. Your audio is generated and recorded locally — it is never uploaded.

### Keyboard

| Key | Action |
| --- | --- |
| `Space` | Play / pause (when a control isn't focused) |
| `1`–`4` | Select an atmosphere |

## Record a soundscape

Press the red circle beside Play to begin recording (audio starts automatically). Press the square stop control to finish; the recording downloads to your device. The file uses the selected atmosphere in its name. Export format is chosen based on browser support (WebM/Opus or Ogg/Opus). Recordings include the complete mix at the current volume, so set the volume before recording. Use a current browser with the MediaRecorder API; audio remains on your device.

## Run locally

No build step or dependencies. Clone the repo and open `index.html`, or serve the folder with any static file server:

```bash
git clone https://github.com/iadithyan479-wq/lumafield.git
cd lumafield
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## How it works

- Canvas animation: layered gradients and slowly drifting, seeded light forms.
- Sound: Web Audio oscillators, low-pass filtering, and slow envelopes create evolving, randomly voiced ambient tones.
- All controls work locally in a single static HTML file. Audio starts only after you press play.

## Browser support

A modern browser with Canvas 2D, Web Audio API, and MediaRecorder support for recording. The visual field works without audio; Safari/iOS may ask for a tap before sound begins. Recording format availability varies by browser.

## License

MIT — see [LICENSE](LICENSE).
