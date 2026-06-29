import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Custom Errors ---
export class HttpForbiddenError extends Error {
  constructor(url) {
    super(`Access forbidden (HTTP 403) for URL: ${url}. Bypassing check or auth wall required.`);
    this.name = 'HttpForbiddenError';
  }
}

export class ClientSideRenderTrapError extends Error {
  constructor(url) {
    super(`Client-side render trap detected (empty or <noscript>-only body) for URL: ${url}. Raw HTML fetch cannot render javascript-only SPA.`);
    this.name = 'ClientSideRenderTrapError';
  }
}

// --- Cookie File Parser ---
export async function readCookieFile(filePath) {
  if (!filePath) return null;
  try {
    const rawContent = await fs.promises.readFile(filePath, 'utf-8');
    const content = rawContent.trim();
    if (!content) return null;

    // 1. Try parsing as JSON (Array or Object)
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(c => c && (c.name || c.key) && c.value !== undefined)
          .map(c => `${c.name || c.key}=${c.value}`)
          .join('; ');
      } else if (typeof parsed === 'object') {
        return Object.entries(parsed)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
      }
    } catch {
      // Ignore JSON parse error and fallback to Netscape/Raw parsing
    }

    // 2. Try parsing Netscape HTTP Cookie File format (tab-separated)
    if (content.includes('\t')) {
      const cookies = [];
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim() || line.startsWith('#')) continue;
        const parts = line.split('\t');
        if (parts.length >= 7) {
          const name = parts[5];
          const value = parts[6].trim();
          cookies.push(`${name}=${value}`);
        }
      }
      if (cookies.length > 0) return cookies.join('; ');
    }

    // 3. Fallback: Treat as raw cookie header string
    return content;
  } catch (error) {
    throw new Error(`Failed to read cookie file at ${filePath}: ${error.message}`);
  }
}

// --- Fetch HTML ---
export async function fetchHtml(url, cookieString = null) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  if (cookieString) {
    headers['Cookie'] = cookieString;
  }

  try {
    const response = await axios.get(url, {
      headers,
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      throw new HttpForbiddenError(url);
    }
    throw new Error(`HTTP Fetch Failed: ${error.message}`);
  }
}

// --- Parse and Filter HTML ---
export function cleanHtml(html, url) {
  const $ = cheerio.load(html);
  const body = $('body');

  if (body.length === 0) {
    throw new ClientSideRenderTrapError(url);
  }

  // Pre-clean check: Is body entirely whitespace/empty?
  const rawHtml = body.html() || '';
  if (!rawHtml.trim()) {
    throw new ClientSideRenderTrapError(url);
  }

  // Clone body to execute non-noscript verification check
  const checkBody = body.clone();
  checkBody.find('script, style, noscript').remove();
  
  // If removing scripts, styles, and noscript leaves nothing visible/structured,
  // it is a SPA client-side render trap.
  const hasVisibleText = checkBody.text().trim().length > 0;
  const hasInteractiveElements = checkBody.find('img, iframe, video, audio, object, embed, svg, a, button').length > 0;
  
  if (!hasVisibleText && !hasInteractiveElements) {
    throw new ClientSideRenderTrapError(url);
  }

  // Perform full cleanup on live tree
  $('script, style, iframe, frame, object, embed, noscript').remove();
  
  // Strip navigation and headers/footers to avoid UI garbage
  $('nav, footer, header, aside, .nav, .navigation, .footer, .header, #header, #footer, #nav').remove();

  return $('body').html() || '';
}

// --- Turndown Conversion ---
export function convertToMarkdown(cleanedHtml) {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });
  
  return turndownService.turndown(cleanedHtml);
}

// --- Gemini State Consolidation ---
export async function consolidateState(markdown, apiKey, model = 'gemini-2.5-flash', aiClient = null) {
  if (!apiKey && !aiClient) {
    throw new Error('API key is required. Define GEMINI_API_KEY / GOOGLE_API_KEY or use --api-key.');
  }

  const ai = aiClient || new GoogleGenAI({ apiKey });

  const systemPrompt = `You are a technical document consolidator. Your task is to process raw markdown content retrieved from a crawled webpage and convert it into a clean, well-structured, dense architectural summary for Gemini context ingestion.

Guidelines:
1. Retain all technical facts, requirements, config settings, API endpoints, and code blocks.
2. Strip out UI clutter, navigation, repetitive header/footer text, ads, and copyright boilerplate.
3. Organize into logical sections (e.g., Overview, Architecture, Key API Endpoints, Configurations).
4. Preserve the exact meaning and relationship of terms.
5. Keep it concise, using bullet lists and tables where appropriate.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nRaw Content to Consolidate:\n\n${markdown}` }]
        }
      ]
    });

    if (!response || !response.text) {
      throw new Error('Gemini API returned an empty response.');
    }

    return response.text;
  } catch (error) {
    throw new Error(`Gemini API call failed: ${error.message}`);
  }
}

// --- Main Runner Function ---
export async function run(options, aiClient = null) {
  const { url, output, cookieFile, model, apiKey } = options;

  console.log(`Crawl starting: ${url}`);
  const cookieString = await readCookieFile(cookieFile);
  const rawHtml = await fetchHtml(url, cookieString);
  const cleanedHtml = cleanHtml(rawHtml, url);
  const markdown = convertToMarkdown(cleanedHtml);

  console.log(`Crawl completed. Raw Markdown length: ${markdown.length} bytes`);
  
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const client = aiClient || options.aiClient;
  const consolidated = await consolidateState(markdown, key, model, client);

  // Ensure target folder exists
  const targetPath = path.resolve(output);
  const outputDir = path.dirname(targetPath);
  await fs.promises.mkdir(outputDir, { recursive: true });

  await fs.promises.writeFile(targetPath, consolidated, 'utf-8');
  console.log(`Consolidated context written successfully to: ${targetPath}`);
}

// --- CLI Execution Entry Point ---
const currentFilePath = fileURLToPath(import.meta.url);
const executionFilePath = process.argv[1] ? path.resolve(process.argv[1]) : '';

// Handle execution check in symlinks/realpaths robustly
let isMain = false;
try {
  isMain = fs.realpathSync(currentFilePath) === fs.realpathSync(executionFilePath);
} catch {
  isMain = path.resolve(currentFilePath) === path.resolve(executionFilePath);
}

if (isMain) {
  const program = new Command();
  program
    .name('bootleg-firecrawl')
    .description('DIY tool to crawl web content and convert it into clean markdown via Gemini 3.1 Flash API.')
    .requiredOption('--url <url>', 'URL of the web page to crawl')
    .requiredOption('--output <path>', 'Absolute target path to write output markdown')
    .option('--cookie-file <path>', 'Path to file containing cookies (raw header, JSON object/array, or Netscape tab-separated)')
    .option('--model <model>', 'Gemini model to invoke', 'gemini-2.5-flash')
    .option('--api-key <key>', 'Gemini API Key (otherwise reads GEMINI_API_KEY/GOOGLE_API_KEY environment variables)')
    .parse(process.argv);

  const options = program.opts();

  run(options).catch(err => {
    console.error(`CLI Failure: ${err.message}`);
    process.exit(1);
  });
}
