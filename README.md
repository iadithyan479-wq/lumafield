# LumaField

> A little pocket of atmosphere, made just for this moment.

LumaField is a no-build, local-first generative soundscape studio. It combines a slowly shifting canvas scene with procedurally generated ambient tones. Tune the character of a soundscape, save your own presets in this browser, watch the live waveform, and manage saved presets and recorded mixes in one dashboard. Recordings can be previewed, downloaded again, or removed from the browser library.

**No account, backend, external audio assets, analytics, or audio uploads.** Sound generation, recording, and saved presets stay on your device.

## Try it

**[Open the LumaField live preview](https://htmlpreview.github.io/?https://github.com/iadithyan479-wq/lumafield/blob/main/index.html)**, or open [`index.html`](index.html) locally. The preview runs the repository’s `index.html` through HTMLPreview; it is a lightweight hosted preview, not a GitHub Pages deployment. Audio begins only after a user gesture (press **Play** or **Record**). The visual scene works without audio.

## Built-in atmospheres

- **Dusk** — warm, low-lit garden tones
- **Tide** — cool, open-water drift
- **Canopy** — soft, rain-washed greens
- **Orbit** — slow, spacious harmonic tones

Use **Drift** to change how the visuals wander and how quickly new tones arrive; **Warmth** affects the scene palette and synth filter; **Texture** adjusts the film-grain overlay. **Volume** controls the master output and the level captured in a recording. **Mic Mix** controls the level of optional microphone input.

## Save and load custom soundscapes

1. Choose a built-in atmosphere and adjust Drift, Warmth, Texture, and Volume.
2. Press **＋ Save**, enter a name, and confirm. The current settings are saved in this browser.
3. Choose a saved soundscape from **Your saved soundscapes**, then press **Load** to restore it.

Presets are stored as JSON under the browser `localStorage` key `lumafield.customPresets.v1`. Each record contains a display name, built-in atmosphere index, and control values (`drift`, `warmth`, `texture`, `volume`, and `micVolume`). The application validates the stored array when reading it and clamps restored slider values to 0–100. Storage is origin- and browser-specific: saved presets do not sync between devices or browsers. Clearing this site's browser storage removes them. No audio data is stored in a preset.

## Sound library dashboard

Open **My Library** in the top bar to manage this browser's sound collection. The dashboard has separate tabs for custom presets and audio recordings, plus counts and the total size of archived audio.

- **Presets:** load a saved setting into the studio or delete it from the library.
- **Recordings:** preview audio inline, download the original file again, or permanently remove its local archive copy.
- The dashboard is a local browser interface; it does not sync to an account or send data to a server.

Saved preset JSON remains in `localStorage` under `lumafield.customPresets.v1`. Recording blobs and their metadata are stored in IndexedDB (`lumafield-library-v1`, object store `recordings`). Each recording record includes its Blob, MIME type, filename, creation time, duration, byte size, atmosphere, and settings snapshot. The dashboard creates temporary object URLs for inline preview and revokes them when the dialog closes. Removing a recording deletes its IndexedDB copy; it does not delete any file already downloaded to the operating system.

Browser storage is quota-limited and can be cleared by the browser or the user. A very large or long recording may download successfully even if the browser cannot save a second copy to the library; LumaField reports that case in the UI. To free browser storage, delete recordings in My Library or clear site data in browser settings. Presets and recordings are device- and origin-specific and are not backed up or synchronized.

## Live waveform

During playback, the animated trace in the scene is driven by the actual generated audio signal, rather than by a decorative oscillator. The audio graph routes the master mix through a Web Audio `AnalyserNode`. On each animation frame, LumaField reads its time-domain samples with `getByteTimeDomainData()`, recenters the unsigned 8-bit samples around 128, normalizes the current peak, and draws a glowing line into the scene canvas. The trace is hidden while playback is stopped. The analyzer is part of the same graph used for speakers and recording, so it tracks the selected soundscape and master level.

## Microphone input

Press **Mic off** in the Listening card to opt in to microphone input. The browser will request microphone permission; LumaField does not ask until the user presses this control. Set **Mic Mix** to blend voice or ambient room sound into the soundscape independently of the main synth level. Turn the mic off at any time to disconnect the stream.

LumaField requests audio input with echo cancellation, noise suppression, and automatic gain control disabled, preserving room tone and the character of the input. Use headphones to reduce speaker-to-microphone feedback. Microphone audio is processed locally through a gain node and the existing master/analyser graph. It is not uploaded or stored as a separate track; when mic input is enabled during recording, the combined mix is captured. Recording metadata includes the mic mix setting and whether microphone input was included during the recording.

The microphone requires an HTTPS/localhost secure context, browser permission, a working input device, and Web Audio support. If access is denied, no mic stream is connected. Stopping playback or leaving the page stops active mic tracks. Browser-level permission remains controlled by the browser and can be revoked in its site settings.

## Recording and audio export — technical notes

Press the red circle beside Play to start recording; it starts sound playback first if necessary. Press the square stop control to finish and download the recording. The file name includes the selected atmosphere and a timestamp. Set the master volume before recording: the file captures the current output level. When recording ends, LumaField downloads the file and attempts to archive a local copy in My Library using IndexedDB. If storage is unavailable or full, the download still works.

### Audio graph

The synthesizer creates voices from Web Audio oscillators (sine and triangle waves). Each voice is tuned to a note in the app's frequency set, passed through a low-pass `BiquadFilterNode`, shaped by a slow attack/release `GainNode` envelope, and connected to the master gain. New voices are scheduled periodically, with the interval affected by Drift. The master gain is set by the Volume slider.

```text
Oscillator → voice filter → voice envelope ─┐
                                             ├→ master gain → AnalyserNode → speakers
Mic input (opt-in) → microphone mix gain ────┘                         └→ MediaStreamAudioDestinationNode
```

The analyzer branches the final mix to both the audible output and a `MediaStreamAudioDestinationNode`. The latter exposes an audio-only `MediaStream`; it does not capture the desktop or screen. If microphone input is enabled, it is mixed into the graph before the analyzer, so both playback and recordings contain it.

### Browser recording lifecycle

1. **Start audio in response to the click.** Browsers generally require a user action before creating/resuming audible Web Audio. If audio is not already playing, the Record button starts the same sound engine used by Play.
2. **Choose a supported container.** LumaField checks `MediaRecorder.isTypeSupported()` and prefers Opus in WebM, then Opus in Ogg, then MP4, WebM, or Ogg. If none of those explicit types is advertised but `MediaRecorder` exists, it asks the browser to select its default format. Availability depends on browser and OS codecs.
3. **Record the generated mix.** A `MediaRecorder` consumes the audio destination stream. It emits `dataavailable` chunks periodically (one-second timeslice) and does not request any network access or file-system permissions.
4. **Stop and assemble.** Pressing Record again calls `MediaRecorder.stop()`. The final `dataavailable` event is collected, then `stop` assembles the chunks into a typed `Blob`.
5. **Download locally.** LumaField creates a temporary object URL for the Blob, triggers a download link with a timestamped filename, removes the temporary link, and revokes the object URL after a short delay. The resulting file is typically `.webm`, `.ogg`, or `.m4a`, depending on the selected MIME type.

The recording contains the complete output mix at the master volume—including the microphone mix whenever it is enabled—and any silence if playback is paused while recording. It does not include the canvas video. LumaField does not convert recordings to MP3/WAV or upload them. If MediaRecorder or a supported audio codec is unavailable, the browser reports that recording cannot start; playback and the visualizer may still work.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / pause (when a control is not focused) |
| `1`–`4` | Select a built-in atmosphere |

## Run locally

There are no dependencies, build tools, or server-side components. Clone the repository and open `index.html`, or run a static server:

```bash
git clone https://github.com/iadithyan479-wq/lumafield.git
cd lumafield
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Browser support

A modern browser with Canvas 2D and Web Audio API support. Microphone mixing additionally requires an HTTPS/localhost secure context and user permission. Presets require `localStorage`; managing recorded audio in My Library requires IndexedDB. Recording requires `MediaRecorder` plus a browser-supported audio recording format (format support varies; WebM/Opus and Ogg/Opus are preferred, with MP4 as an alternative). Safari/iOS may require a tap to start audio. The visualizer is active during playback and does not require recording support. Microphone permission is only requested after an explicit click; stopping playback stops the active input tracks.

## Project structure

- `index.html` — complete UI, styles, generative canvas, Web Audio graph, visualization, preset storage, recording archive, and MediaRecorder export.
- `README.md` — setup and technical documentation.
- `LICENSE` — MIT license.

## License

MIT — see [LICENSE](LICENSE).
