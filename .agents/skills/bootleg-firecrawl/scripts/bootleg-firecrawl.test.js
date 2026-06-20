import { jest } from '@jest/globals';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  fetchHtml,
  cleanHtml,
  convertToMarkdown,
  consolidateState,
  readCookieFile,
  run,
  HttpForbiddenError,
  ClientSideRenderTrapError
} from './bootleg-firecrawl.js';

describe('Bootleg Firecrawl CLI Suite', () => {
  const targetUrl = 'https://katha-crawl-test.local';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('readCookieFile', () => {
    const tempCookieFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'temp_cookie.txt');

    afterEach(async () => {
      await fs.promises.unlink(tempCookieFile).catch(() => {});
    });

    test('should return null when path is not provided', async () => {
      const result = await readCookieFile(null);
      expect(result).toBeNull();
    });

    test('should parse raw cookie string format', async () => {
      await fs.promises.writeFile(tempCookieFile, 'sessionid=123; user=john', 'utf-8');
      const result = await readCookieFile(tempCookieFile);
      expect(result).toBe('sessionid=123; user=john');
    });

    test('should parse JSON array of cookies', async () => {
      const jsonCookies = [
        { name: 'sessionid', value: '123' },
        { key: 'user', value: 'john' }
      ];
      await fs.promises.writeFile(tempCookieFile, JSON.stringify(jsonCookies), 'utf-8');
      const result = await readCookieFile(tempCookieFile);
      expect(result).toBe('sessionid=123; user=john');
    });

    test('should parse JSON object of cookies', async () => {
      const jsonCookies = {
        sessionid: '123',
        user: 'john'
      };
      await fs.promises.writeFile(tempCookieFile, JSON.stringify(jsonCookies), 'utf-8');
      const result = await readCookieFile(tempCookieFile);
      expect(result).toBe('sessionid=123; user=john');
    });

    test('should parse Netscape cookie file format', async () => {
      const netscapeContent = [
        '# Netscape HTTP Cookie File',
        '# http://curl.haxx.se/rfc/cookie_spec.html',
        '.example.com\tTRUE\t/\tFALSE\t1700000000\tsessionid\t123',
        '.example.com\tTRUE\t/\tFALSE\t1700000000\tuser\tjohn'
      ].join('\n');

      await fs.promises.writeFile(tempCookieFile, netscapeContent, 'utf-8');
      const result = await readCookieFile(tempCookieFile);
      expect(result).toBe('sessionid=123; user=john');
    });

    test('should throw error if file reading fails', async () => {
      await expect(readCookieFile('nonexistent_file_path.txt'))
        .rejects
        .toThrow('Failed to read cookie file');
    });
  });

  describe('fetchHtml', () => {
    test('should fetch raw HTML string on HTTP 200 OK', async () => {
      const responseHtml = '<html><body><h1>Katha</h1></body></html>';
      nock(targetUrl)
        .get('/')
        .reply(200, responseHtml);

      const html = await fetchHtml(targetUrl);
      expect(html).toBe(responseHtml);
    });

    test('should send cookie header if cookieString is provided', async () => {
      const responseHtml = '<html><body><h1>Katha</h1></body></html>';
      nock(targetUrl, {
        reqheaders: {
          'Cookie': 'sessionid=123; user=john'
        }
      })
        .get('/auth-check')
        .reply(200, responseHtml);

      const html = await fetchHtml(`${targetUrl}/auth-check`, 'sessionid=123; user=john');
      expect(html).toBe(responseHtml);
    });

    test('should throw HttpForbiddenError on HTTP 403 Forbidden', async () => {
      nock(targetUrl)
        .get('/auth-wall')
        .reply(403);

      await expect(fetchHtml(`${targetUrl}/auth-wall`))
        .rejects
        .toThrow(HttpForbiddenError);
    });

    test('should throw normal error on other HTTP failures', async () => {
      nock(targetUrl)
        .get('/error')
        .reply(500);

      await expect(fetchHtml(`${targetUrl}/error`))
        .rejects
        .toThrow('HTTP Fetch Failed');
    });
  });

  describe('cleanHtml', () => {
    test('should throw ClientSideRenderTrapError on empty HTML body', () => {
      const html = '<html><body>   </body></html>';
      expect(() => cleanHtml(html, targetUrl)).toThrow(ClientSideRenderTrapError);
    });

    test('should throw ClientSideRenderTrapError on noscript-only body', () => {
      const html = '<html><body><noscript>JavaScript is required</noscript></body></html>';
      expect(() => cleanHtml(html, targetUrl)).toThrow(ClientSideRenderTrapError);
    });

    test('should throw ClientSideRenderTrapError on body with only script and style tags', () => {
      const html = `
        <html>
          <body>
            <script>const run = true;</script>
            <style>body { display: none; }</style>
          </body>
        </html>
      `;
      expect(() => cleanHtml(html, targetUrl)).toThrow(ClientSideRenderTrapError);
    });

    test('should strip script, style, and navigation, but preserve main content', () => {
      const html = `
        <html>
          <body>
            <header>Katha Header</header>
            <nav><a href="/about">About</a></nav>
            <script>const x = 1;</script>
            <style>p { color: beige; }</style>
            <main>
              <h1>Main Page Header</h1>
              <p>Main content paragraph.</p>
            </main>
            <footer>Copyright 2026</footer>
          </body>
        </html>
      `;
      const cleaned = cleanHtml(html, targetUrl);

      // Verify stripped elements
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('<style>');
      expect(cleaned).not.toContain('Katha Header');
      expect(cleaned).not.toContain('About');
      expect(cleaned).not.toContain('Copyright 2026');

      // Verify preserved elements
      expect(cleaned).toContain('Main Page Header');
      expect(cleaned).toContain('Main content paragraph.');
    });
  });

  describe('convertToMarkdown', () => {
    test('should convert cleaned HTML to standard markdown', () => {
      const html = '<h1>Headline</h1><p>Paragraph with <em>emphasis</em>.</p>';
      const markdown = convertToMarkdown(html);

      expect(markdown).toBe('# Headline\n\nParagraph with _emphasis_.');
    });
  });

  describe('consolidateState (Mocked client)', () => {
    test('should correctly invoke the mock client and return response', async () => {
      const mockResultText = '# Consolidated Doc\n- Detail A\n- Detail B';
      const mockAiClient = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: mockResultText
          })
        }
      };

      const result = await consolidateState('## Raw input', null, 'gemini-2.5-flash', mockAiClient);
      
      expect(mockAiClient.models.generateContent).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResultText);

      // Verify structure of the payload passed to the SDK
      const callArgs = mockAiClient.models.generateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-2.5-flash');
      expect(callArgs.contents[0].role).toBe('user');
      expect(callArgs.contents[0].parts[0].text).toContain('## Raw input');
    });

    test('should throw error when api key and client are missing', async () => {
      await expect(consolidateState('## Raw input', null, 'gemini-2.5-flash', null))
        .rejects
        .toThrow('API key is required');
    });

    test('should throw error when api returns empty response', async () => {
      const mockAiClient = {
        models: {
          generateContent: jest.fn().mockResolvedValue(null)
        }
      };
      await expect(consolidateState('## Raw input', null, 'gemini-2.5-flash', mockAiClient))
        .rejects
        .toThrow('Gemini API returned an empty response');
    });
  });

  describe('run (Orchestrator integration test)', () => {
    const tempDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'temp_test_run');
    const tempOutputFile = path.join(tempDirectory, 'crawl_result.md');

    beforeAll(async () => {
      await fs.promises.mkdir(tempDirectory, { recursive: true }).catch(() => {});
    });

    afterAll(async () => {
      await fs.promises.rm(tempDirectory, { recursive: true, force: true }).catch(() => {});
    });

    test('should fetch page, parse, clean, convert, call mock client, and write to output file', async () => {
      const rawHtml = '<html><body><main><h1>Crawl Test</h1><p>Crawl info.</p></main></body></html>';
      
      nock(targetUrl)
        .get('/docs')
        .reply(200, rawHtml);

      const mockResultText = '# Consolidated Results\n- Crawl Test content summary.';
      const mockAiClient = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: mockResultText
          })
        }
      };

      // Mock console.log to avoid polluting output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await run({
        url: `${targetUrl}/docs`,
        output: tempOutputFile,
        apiKey: 'fake-api-key',
        model: 'gemini-2.5-flash'
      }, mockAiClient);

      expect(mockAiClient.models.generateContent).toHaveBeenCalledTimes(1);
      expect(fs.existsSync(tempOutputFile)).toBe(true);

      const writtenContent = await fs.promises.readFile(tempOutputFile, 'utf-8');
      expect(writtenContent).toBe(mockResultText);

      consoleSpy.mockRestore();
    });
  });
});
