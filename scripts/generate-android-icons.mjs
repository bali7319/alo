import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");

const ANDROID_RES = path.join(ROOT, "android", "app", "src", "main", "res");
const SOURCE_SVG = path.join(ROOT, "public", "icon.svg");

const DENSITIES = [
  { name: "mipmap-mdpi", legacy: 48, foreground: 108 },
  { name: "mipmap-hdpi", legacy: 72, foreground: 162 },
  { name: "mipmap-xhdpi", legacy: 96, foreground: 216 },
  { name: "mipmap-xxhdpi", legacy: 144, foreground: 324 },
  { name: "mipmap-xxxhdpi", legacy: 192, foreground: 432 },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function sharpFromSvg(svgBuffer) {
  // High density keeps edges crisp when downscaling.
  return sharp(svgBuffer, { density: 1024 });
}

async function writeLegacyIcons({ svgBuffer, outDir, size }) {
  const launcherPng = path.join(outDir, "ic_launcher.png");
  const launcherRoundPng = path.join(outDir, "ic_launcher_round.png");

  const png = await sharpFromSvg(svgBuffer)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  await Promise.all([fs.writeFile(launcherPng, png), fs.writeFile(launcherRoundPng, png)]);
}

async function writeForegroundIcon({ svgBuffer, outDir, size }) {
  // Adaptive icon safe zone: keep content inset to reduce clipping.
  const innerSize = Math.round(size * 0.86);
  const offset = Math.floor((size - innerSize) / 2);

  const inner = await sharpFromSvg(svgBuffer)
    .resize(innerSize, innerSize, { fit: "contain" })
    .png()
    .toBuffer();

  const composed = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: inner, top: offset, left: offset }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  await fs.writeFile(path.join(outDir, "ic_launcher_foreground.png"), composed);
}

async function main() {
  const svgBuffer = await fs.readFile(SOURCE_SVG);

  for (const d of DENSITIES) {
    const outDir = path.join(ANDROID_RES, d.name);
    await ensureDir(outDir);

    await writeLegacyIcons({ svgBuffer, outDir, size: d.legacy });
    await writeForegroundIcon({ svgBuffer, outDir, size: d.foreground });
  }

  // eslint-disable-next-line no-console
  console.log("Android launcher icons generated from:", SOURCE_SVG);
}

await main();

