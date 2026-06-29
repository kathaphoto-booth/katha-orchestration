import { parseArgs } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../../');
const layoutsPath = path.join(repoRoot, 'photobooth-template-studio/lib/layouts.js');
const templatesPath = path.join(repoRoot, 'photobooth-template-studio/lib/templates.ts');

const options = {
  layout: { type: 'string' },
  format: { type: 'string' },
  slots: { type: 'string' },
  preset: { type: 'string' },
};

async function main() {
  const { values } = parseArgs({ options, strict: false });

  // Dynamically import layouts.js
  let layoutsModule;
  try {
    layoutsModule = await import(`file://${layoutsPath}`);
  } catch (err) {
    console.error(`Failed to load layouts.js from ${layoutsPath}:`, err.message);
    process.exit(1);
  }

  const { LAYOUTS, defaultLayoutFor } = layoutsModule;

  if (values.layout) {
    const layout = LAYOUTS[values.layout];
    if (!layout) {
      console.error(`Layout ID not found: ${values.layout}`);
      process.exit(1);
    }
    console.log(JSON.stringify(layout, null, 2));
    return;
  }

  if (values.format && values.slots) {
    const slotCount = parseInt(values.slots, 10);
    const matches = Object.values(LAYOUTS).filter(l => l.format === values.format && l.slotCount === slotCount);
    if (matches.length === 0) {
      console.error(`No layout found for format ${values.format} with ${slotCount} slots`);
      process.exit(1);
    }
    console.log(JSON.stringify(matches[0], null, 2));
    return;
  }

  if (values.preset) {
    // Read templates.ts as text to extract layout info without compiling TS
    const tsContent = fs.readFileSync(templatesPath, 'utf8');
    
    // Find the preset object block
    const presetRegex = new RegExp(`id:\\s*["']${values.preset}["']\\s*,([\\s\\S]*?)}`, 'm');
    const match = tsContent.match(presetRegex);
    
    if (!match) {
      console.error(`Preset ID not found: ${values.preset}`);
      process.exit(1);
    }
    
    const block = match[1];
    
    // Extract type and layoutId
    const typeMatch = block.match(/type:\s*["']([^"']+)["']/);
    const type = typeMatch ? typeMatch[1] : null;
    
    const layoutIdMatch = block.match(/layoutId:\s*["']([^"']+)["']/);
    const layoutId = layoutIdMatch ? layoutIdMatch[1] : null;
    
    if (!type && !layoutId) {
      console.error(`Could not determine type or layoutId for preset: ${values.preset}`);
      process.exit(1);
    }
    
    let layout;
    if (layoutId && LAYOUTS[layoutId]) {
      layout = LAYOUTS[layoutId];
    } else if (type) {
      layout = defaultLayoutFor(type);
    }
    
    if (!layout) {
      console.error(`Could not resolve layout for preset: ${values.preset}`);
      process.exit(1);
    }
    
    console.log(JSON.stringify({
      presetId: values.preset,
      layoutId: layout.id,
      layout: layout
    }, null, 2));
    return;
  }

  console.error('Usage:');
  console.error('  node lookup.mjs --layout <id>');
  console.error('  node lookup.mjs --format <format> --slots <n>');
  console.error('  node lookup.mjs --preset <id>');
  process.exit(1);
}

main().catch(console.error);
