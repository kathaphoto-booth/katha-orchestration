const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = __dirname;
const SQS_DIR = path.join(ASSETS_DIR, 'squarespace');
const DIRS = ['marks/wordmark', 'marks/logomark', 'marks/ktha', 'patterns'];

// Base sizes for specific assets when converting to PNG
const getBaseWidth = (filename) => {
  if (filename.includes('wordmark-stacked')) return 290 * 2;
  if (filename.includes('wordmark')) return 290 * 2;
  if (filename.includes('logomark')) return 200 * 2;
  if (filename.includes('ktha-mark')) return 240 * 2;
  if (filename.includes('binakul')) return 480 * 2;
  return 600 * 2;
};

async function processDirectory(dirName) {
  const fullPath = path.join(ASSETS_DIR, dirName);
  const files = fs.readdirSync(fullPath);

  for (const file of files) {
    if (!file.endsWith('.svg')) continue;

    const name = file.replace('.svg', '');
    const svgPath = path.join(fullPath, file);
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    // 1. Generate Squarespace Code Block (.codeblock.html)
    const codeBlockContent = `<div style="width: 100%; max-width: 100%; display: flex; justify-content: center;">\n  ${svgContent}\n</div>`;
    fs.writeFileSync(path.join(SQS_DIR, `${name}.codeblock.html`), codeBlockContent);

    // 2. Generate PNGs using Sharp
    const width = getBaseWidth(name);
    
    // Create @1x, @2x, @3x
    const generatePng = async (scale, suffix) => {
      const density = 72 * scale;
      await sharp(svgPath, { density })
        .resize({ width: width * scale })
        .png()
        .toFile(path.join(SQS_DIR, `${name}${suffix}.png`));
    };

    try {
      await generatePng(0.5, '@1x');
      await generatePng(1.0, '@2x');
      await generatePng(1.5, '@3x');
      
      // If logomark, also generate favicons
      if (name.includes('logomark-iron-bark')) {
        await sharp(svgPath, { density: 300 }).resize(32, 32).png().toFile(path.join(SQS_DIR, 'katha-logomark-favicon-32.png'));
        await sharp(svgPath, { density: 300 }).resize(192, 192).png().toFile(path.join(SQS_DIR, 'katha-logomark-favicon-192.png'));
        await sharp(svgPath, { density: 300 }).resize(512, 512).png().toFile(path.join(SQS_DIR, 'katha-logomark-favicon-512.png'));
      }
      console.log(`Generated raster files for ${name}`);
    } catch (err) {
      console.error(`Error processing ${name}:`, err);
    }
  }
}

async function run() {
  for (const dir of DIRS) {
    await processDirectory(dir);
  }
}

run();
