import fs from 'fs';
import path from 'path';

const apiKey = process.env.FIRECRAWL_API_KEY;
const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error("Error: Missing target URL argument.");
  process.exit(1);
}
if (!apiKey) {
  console.error("Error: Missing FIRECRAWL_API_KEY environment variable.");
  process.exit(1);
}

const outputDir = '.llm_wiki_vault/raw';
const outputFile = path.join(outputDir, 'target_raw.md');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function runIngestion() {
  console.log(`[Firecrawl] Extricating architectural details from: ${targetUrl}`);
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ['markdown']
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HTTP ${response.status}: ${err}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.error || 'Unknown Firecrawl error');
    }

    const markdown = json.data.markdown;
    const markdownPayload = `---
type: karpathy_llm_wiki_node
source: ${targetUrl}
extracted: ${new Date().toISOString()}
---
# Architectural Blueprint Manifest

${markdown}`;

    fs.writeFileSync(outputFile, markdownPayload);
    console.log(`[Success] Ingestion complete. Context written to ${outputFile}`);
  } catch (error) {
    console.error(`[Fatal Ingestion Error] ${error.message}`);
    process.exit(1);
  }
}

runIngestion();
