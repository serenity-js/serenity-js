import { readFileSync } from 'node:fs';
import { createServer, Server } from 'node:http';
import { resolve } from 'node:path';

import type { Page } from 'playwright';
import { Browser,chromium } from 'playwright';

const fixturesDirectory = resolve(__dirname, '..', '..', 'fixtures');

let indexHtml: string;

function getIndexHtml(): string {
    if (!indexHtml) {
        const templatePath = resolve(__dirname, '..', '..', '..', '..', 'packages', 'html-reporter', 'lib', 'template.js');
        const templateModule = require(templatePath);
        indexHtml = templateModule.reportTemplate;
    }
    return indexHtml;
}

function createReportServer(dataFile = 'data.js'): Server {
    const dataContent = readFileSync(resolve(fixturesDirectory, dataFile), 'utf8');
    const html = getIndexHtml();

    return createServer((request, response) => {
        const url = (request.url || '/').split('?')[0].split('#')[0];

        if (url === '/data.js') {
            response.setHeader('Content-Type', 'text/javascript');
            response.end(dataContent);
            return;
        }

        response.setHeader('Content-Type', 'text/html');
        response.setHeader('Cache-Control', 'no-store');
        response.end(html);
    });
}

export interface ReportFixture {
    page: Page;
    baseUrl: string;
}

let browser: Browser | null = null;
let server: Server | null = null;

export async function setupReport(dataFile = 'data.js'): Promise<ReportFixture> {
    server = createReportServer(dataFile);
    await new Promise<void>(done => server!.listen(0, '127.0.0.1', done));
    const address = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${address.port}`;

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    return { page, baseUrl };
}

export async function teardownReport(): Promise<void> {
    if (browser) {
        await browser.close();
        browser = null;
    }
    if (server) {
        server.close();
        server = null;
    }
}
