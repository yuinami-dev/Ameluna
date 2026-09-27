#!/usr/bin/env node
// Render teaser/polaris-drop.html frame by frame in headless Chromium and encode a 1080x1920 H.264 MP4.
//
//   node export/export.cjs [--fps 30] [--loops 1] [--out dist/polaris-drop_1080x1920.mp4] [--audio song.wav | --no-audio]
//
// Audio defaults to audio/chorus.mp3 (cut by audio/make-chorus.sh) when it exists.
//
// Frames are drawn at exact times (i / fps), not captured in real time, so the output never drops
// frames and frame 0 follows the last frame seamlessly when the clip loops.

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const opts = {
    fps: 30,
    loops: 1,
    out: path.join(ROOT, "dist", "polaris-drop_1080x1920.mp4"),
    audio: fs.existsSync(path.join(ROOT, "audio", "chorus.mp3")) ? path.join(ROOT, "audio", "chorus.mp3") : null,
    customAudio: false,
    crf: 16,
    allowFallbackFonts: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], next = () => argv[++i];
    if (a === "--fps") opts.fps = Number(next());
    else if (a === "--loops") opts.loops = Number(next());
    else if (a === "--out") opts.out = path.resolve(next());
    else if (a === "--audio") { opts.audio = path.resolve(next()); opts.customAudio = true; }
    else if (a === "--no-audio") opts.audio = null;
    else if (a === "--crf") opts.crf = Number(next());
    else if (a === "--allow-fallback-fonts") opts.allowFallbackFonts = true;
    else throw new Error(`Unknown option: ${a}`);
  }
  return opts;
}

function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { return require("ffmpeg-static"); } catch { return "ffmpeg"; }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const page_ = path.join(ROOT, "polaris-drop.html");
  if (!fs.existsSync(page_)) throw new Error("polaris-drop.html not found. Run `python3 build.py` first.");
  fs.mkdirSync(path.dirname(opts.out), { recursive: true });

  // Behind a TLS-intercepting proxy (e.g. a cloud sandbox) Chromium cannot reach Google Fonts
  // unless it is pointed at the proxy. Opt in with EXPORT_PROXY=1; not needed on a normal machine.
  const launch = {};
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const context = { viewport: { width: 540, height: 960 }, deviceScaleFactor: 1 };
  if (process.env.EXPORT_PROXY === "1" && process.env.HTTPS_PROXY) {
    launch.proxy = { server: process.env.HTTPS_PROXY };
    context.ignoreHTTPSErrors = true;
  }

  const browser = await chromium.launch(launch);
  const page = await (await browser.newContext(context)).newPage();
  page.on("pageerror", e => console.error("[page]", e.message));
  await page.goto("file://" + page_);
  await page.waitForFunction(() => window.polarisExport);
  await page.evaluate(() => window.polarisExport.ready);

  // The title type is the whole point of the teaser: refuse to encode with fallback fonts.
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      Unbounded: document.fonts.check('200 80px "Unbounded"'),
      "DM Mono": document.fonts.check('400 24px "DM Mono"'),
      "Shippori Mincho": document.fonts.check('500 27px "Shippori Mincho"', "ポラリス・ドロップ")
    };
  });
  const missing = Object.entries(fonts).filter(([, ok]) => !ok).map(([n]) => n);
  if (missing.length && !opts.allowFallbackFonts) {
    await browser.close();
    throw new Error(`Web fonts did not load: ${missing.join(", ")}. Check the network (or EXPORT_PROXY=1), ` +
      "or pass --allow-fallback-fonts to export anyway.");
  }

  const duration = await page.evaluate(() => window.polarisExport.duration);
  const total = Math.round(duration * opts.fps * opts.loops);

  const args = ["-y", "-hide_banner", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(opts.fps), "-c:v", "png", "-i", "-"];
  // loop the audio with the picture; the prepared chorus clip is exactly one loop long
  if (opts.audio) args.push("-stream_loop", "-1", "-i", opts.audio);
  args.push(
    "-c:v", "libx264", "-preset", "slow", "-crf", String(opts.crf),
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", String(opts.fps),
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"
  );
  if (opts.audio) {
    const end = duration * opts.loops;
    args.push("-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-t", String(end));
    // the chorus clip has fades baked in to match the navy dip; other audio gets its own
    if (opts.customAudio) args.push("-af", `afade=t=in:d=0.3,afade=t=out:st=${end - 1}:d=1`);
  }
  args.push("-movflags", "+faststart", opts.out);

  const ff = spawn(ffmpegPath(), args, { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => {
    ff.on("error", rej);
    ff.on("close", code => code === 0 ? res() : rej(new Error(`ffmpeg exited with ${code}`)));
  });

  const started = Date.now();
  for (let i = 0; i < total; i++) {
    const url = await page.evaluate(t => window.polarisExport.renderAt(t), i / opts.fps);
    const png = Buffer.from(url.slice(url.indexOf(",") + 1), "base64");
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % opts.fps === 0 || i === total - 1) {
      process.stdout.write(`\rframe ${i + 1}/${total}`);
    }
  }
  ff.stdin.end();
  await done;
  await browser.close();
  console.log(`\nwrote ${path.relative(process.cwd(), opts.out)} (${total} frames, ${((Date.now() - started) / 1000).toFixed(1)}s)`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
