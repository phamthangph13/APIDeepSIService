import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { STICKERS, sheetSvg, stickerSvg } from "./sticker-defs.mjs";

const root = process.cwd();
const runDir = path.join(root, "sticker-run");
const decodedDir = path.join(runDir, "decoded");
const promptsDir = path.join(runDir, "prompts");
const referencesDir = path.join(runDir, "references");
const designDir = path.join(root, "design", "sticker-pack");
const svgDir = path.join(designDir, "svg");
const publicDir = path.join(root, "public", "stickers");
const skillDir = path.join(
  process.env.HOME,
  ".gemini",
  "config",
  "skills",
  "creating-sticker-packs",
);

for (const dir of [decodedDir, promptsDir, referencesDir, designDir, svgDir, publicDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const groups = [
  { id: "core", names: STICKERS.slice(0, 6).map((s) => s.name) },
  { id: "infrastructure", names: STICKERS.slice(6, 12).map((s) => s.name) },
  { id: "signals", names: STICKERS.slice(12, 18).map((s) => s.name) },
  { id: "controls", names: STICKERS.slice(18, 24).map((s) => s.name) },
  { id: "extras", names: STICKERS.slice(24, 28).map((s) => s.name) },
];

const stickerByName = new Map(STICKERS.map((s) => [s.name, s]));
const anchorSource = path.join(skillDir, "references", "preset-anchors", "soft-ui-glyphs.png");
if (fs.existsSync(anchorSource)) {
  fs.copyFileSync(anchorSource, path.join(referencesDir, "canonical-anchor.png"));
}

const request = {
  pack_name: "deepsi-agent-ui",
  template: "soft-ui-glyphs",
  finish: "clean-flat",
  style: "soft-ui-glyphs",
  canvas_size: 512,
  padding_ratio: 0.1,
  chroma_key: "#ff00ff",
  groups: groups.map((group) => ({
    id: group.id,
    source: `decoded/${group.id}.png`,
    names: group.names,
  })),
};
fs.writeFileSync(path.join(runDir, "sticker_request.json"), JSON.stringify(request, null, 2) + "\n");

const visualJobs = {
  jobs: groups.map((group) => ({
    id: group.id,
    status: "complete",
    depends_on: group.id === "core" ? [] : ["core"],
    prompt_file: `prompts/${group.id}.md`,
    input_images:
      group.id === "core"
        ? ["references/canonical-anchor.png"]
        : ["references/canonical-anchor.png"],
    output_path: `decoded/${group.id}.png`,
    source_path: `design/sticker-pack/svg/${group.id}.svg`,
    note: "Deterministic vector source rendered on a flat magenta chroma sheet. No image-generation provider was available in the environment; geometry and palette follow the soft-ui-glyphs / clean-flat contract.",
  })),
};
fs.writeFileSync(path.join(runDir, "visual-jobs.json"), JSON.stringify(visualJobs, null, 2) + "\n");

for (const group of groups) {
  const groupStickers = group.names.map((name) => stickerByName.get(name));
  const prompt = `# ${group.id}

Subjects (${group.names.length}, left-to-right, top-to-bottom): ${group.names.join(", ")}.

Template: soft-ui-glyphs. One controlled muted matte tile silhouette per subject — circle, arch, capsule, wide rounded rectangle, squircle, or rounded square. Confident medium-bold near-black monoline glyph, fully rounded caps and joins, stroke about 6% of the tile's short edge, glyph bounds 54–64% in each axis, generous optical breathing room. No exterior white or gray die-cut rim; the colored tile itself is the complete sticker silhouette. No tile outline, no offset underlay, no shadow, no lighting, no gradient, no texture, no text, no logos.

Finish: clean-flat. Smooth opaque fills with no visible grain, hatching, halftone, wax, paper texture, or 3D lighting.

Arrangement: informal offset grid with large real blank gaps, generous outer margins, every subject complete and unclipped. Flat solid chroma background #FF00FF. Do not add scenery, labels, or loose fragments.

Palette: muted sage #C7D1BE, clay #D3A08C, ochre #D6C08A, dusty blue #AFC0C2, lavender #C3BED0, olive #BEC7A6; glyph ink #1C1D18.
`;
  fs.writeFileSync(path.join(promptsDir, `${group.id}.md`), prompt);
}

for (const sticker of STICKERS) {
  fs.writeFileSync(path.join(svgDir, `${sticker.name}.svg`), stickerSvg(sticker) + "\n");
}

for (const group of groups) {
  const groupStickers = group.names.map((name) => stickerByName.get(name));
  const svg = sheetSvg(groupStickers);
  fs.writeFileSync(path.join(svgDir, `${group.id}.svg`), svg + "\n");
  await sharp(Buffer.from(svg)).png().toFile(path.join(decodedDir, `${group.id}.png`));
}

console.log("Sticker sheets rendered. Running the sticker-pack processor...");
const python = process.env.PYTHON || "python3";
const processor = path.join(skillDir, "scripts", "process_sticker_sheet.py");
execFileSync(python, [processor, "--run-dir", runDir, "--force"], {
  stdio: "inherit",
});

const reportPath = path.join(runDir, "qa", "qa-report.json");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
if (!report.ok) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(runDir, "final", "manifest.json"), "utf8"));
const bySlug = new Map(STICKERS.map((s) => [s.name, s]));
const siteManifest = [];
for (const item of manifest.stickers ?? []) {
  const sticker = bySlug.get(item.slug);
  if (!sticker) continue;
  const source = path.join(runDir, "final", `${item.slug}.png`);
  const destination = path.join(publicDir, `${item.slug}.png`);
  fs.copyFileSync(source, destination);
  siteManifest.push({
    name: sticker.name,
    file: `/stickers/${sticker.name}.png`,
    alt: sticker.alt,
    color: sticker.color,
    shape: sticker.shape,
    width: 512,
    height: 512,
  });
}
fs.writeFileSync(
  path.join(publicDir, "manifest.json"),
  JSON.stringify({ pack: "deepsi-agent-ui", template: "soft-ui-glyphs", finish: "clean-flat", stickers: siteManifest }, null, 2) + "\n",
);

fs.copyFileSync(
  path.join(runDir, "qa", "contact-sheet.png"),
  path.join(designDir, "contact-sheet.png"),
);
fs.copyFileSync(
  path.join(runDir, "final", "manifest.json"),
  path.join(designDir, "manifest.json"),
);
fs.copyFileSync(reportPath, path.join(designDir, "qa-report.json"));
fs.copyFileSync(
  path.join(runDir, "sticker_request.json"),
  path.join(designDir, "sticker_request.json"),
);

console.log(`\nSticker pack ready: ${siteManifest.length} transparent PNGs in public/stickers`);
console.log(`QA: ${reportPath}`);
console.log(`Contact sheet: ${path.join(designDir, "contact-sheet.png")}`);
