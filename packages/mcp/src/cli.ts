import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ModuleLoader } from '@serenity-js/core/lib/io/index.js';
import { createAxios } from '@serenity-js/rest';
import { program } from 'commander';
import playwright from 'playwright';

import { BrowserConnection } from './mcp/context/BrowserConnection.js';
import { Context, Dispatcher, Server } from './mcp/index.js';
import { packageJSON } from './package.js';
import schematics from './schematics/index.js';
import type { Config } from './server/Config.js';
import { SerenityMcpServer } from './server/index.js';
import { PlaywrightBrowserConnection, SerenityModuleManager } from './server/integration/index.js';
import { ProjectAnalyzeTool } from './tools/index.js';

type CliOptions = {
    allowedOrigins?: string[];
    blockedOrigins?: string[];
    blockServiceWorkers?: boolean;
    browser?: string;
    // caps?: string;
    config?: string;
    device?: string;
    executablePath?: string;
    headless?: boolean;
    ignoreHttpsErrors?: boolean;
    isolated?: boolean;
    sandbox: boolean;
    outputDir?: string;
    proxyBypass?: string;
    proxyServer?: string;
    storageState?: string;
    userAgent?: string;
    userDataDir?: string;
    viewportSize?: string;

    // todo: remove before the release
    experimental?: boolean;
};

function semicolonSeparatedList(value: string): string[] {
    return value.split(';').map(v => v.trim());
}

//
// https://github.com/microsoft/playwright/blob/8a6a4522e83639a6a8327a5d13876c8869e48717/packages/playwright/src/mcp/program.ts#L30

program
    .version(`Version: ${ packageJSON.version }`)
    .name(packageJSON.name)
    .option('--allowed-origins <origins>', 'semicolon-separated list of origins to allow the browser to request. Default is to allow all.', semicolonSeparatedList)
    .option('--blocked-origins <origins>', 'semicolon-separated list of origins to block the browser from requesting. Blocklist is evaluated before allowlist. If used without the allowlist, requests not matching the blocklist are still allowed.', semicolonSeparatedList)
    .option('--block-service-workers', 'block service workers')
    .option('--browser <browser>', 'browser or chrome channel to use, possible values: chrome, firefox, webkit, msedge.')
    // .option('--caps <caps>', 'comma-separated list of capabilities to enable, possible values: tabs, pdf, history, wait, files, install. Default is all.')
    .option('--config <path>', 'path to the configuration file.')
    .option('--device <device>', 'device to emulate, for example: "iPhone 15"')
    .option('--executable-path <path>', 'path to the browser executable.')
    .option('--headless', 'run browser in headless mode, non-headless by default')
    .option('--ignore-https-errors', 'ignore https errors')
    .option('--isolated', 'keep the browser profile in memory, do not save it to disk.')
    .option('--no-sandbox', 'disable the sandbox for all process types that are normally sandboxed.')
    .option('--output-dir <path>', 'path to the directory for output files.')
    .option('--proxy-bypass <bypass>', 'comma-separated domains to bypass proxy, for example ".com,chromium.org,.domain.com"')
    .option('--proxy-server <proxy>', 'specify proxy server, for example "http://myproxy:3128" or "socks5://myproxy:8080"')
    .option('--storage-state <path>', 'path to the storage state file for isolated sessions.')
    .option('--user-agent <ua string>', 'specify user agent string')
    .option('--user-data-dir <path>', 'path to the user data directory. If not specified, a temporary directory will be created.')
    .option('--viewport-size <size>', 'specify browser viewport size in pixels, for example "1280, 720"')
    .option('--experimental', 'enable experimental features') // todo: remove before the release

    .action(async (options: CliOptions) => {

        await (options.experimental ? startNewServer(options) : startLegacyServer(options));
    });

void program.parseAsync(process.argv);

// ---

async function startNewServer(options: CliOptions) {
    const browserConnection = new BrowserConnection({
        browserName: options.browser as 'chromium' | 'firefox' | 'webkit' || 'chromium',
        isolated: options.isolated || false,
        userDataDir: options.userDataDir,
        launchOptions: {
            channel: options.browser && ['chrome', 'msedge'].includes(options.browser) ? options.browser : undefined,
            executablePath: options.executablePath,
            headless: options.headless || false,
            args: [
                options.sandbox === false ? '--no-sandbox' : '',
                options.ignoreHttpsErrors ? '--ignore-certificate-errors' : '',
                options.blockServiceWorkers ? '--disable-features=ServiceWorker' : '',
            ].filter(Boolean),
        },
        contextOptions: {
            viewport: options.viewportSize
                ? {
                    width: Number(options.viewportSize.split(',')[0].trim()),
                    height: Number(options.viewportSize.split(',')[1].trim()),
                }
                : undefined,
            userAgent: options.userAgent || undefined,
            bypassCSP: false,
            javaScriptEnabled: true,
            ignoreHTTPSErrors: options.ignoreHttpsErrors || false,
            storageState: options.storageState || undefined,
            proxy: options.proxyServer ? {
                server: options.proxyServer,
                bypass: options.proxyBypass ? options.proxyBypass.split(',').map(s => s.trim()).join(',') : undefined,
            } : undefined,
            ...options.device ? playwright.devices[options.device] : {},
        },
    });

    const tools = [
        ProjectAnalyzeTool,
    ];

    const context    = new Context(browserConnection);

    const dispatcher = new Dispatcher(context, tools);
    const server     = new Server(dispatcher);

    const exitWith = (code: number) =>
        // eslint-disable-next-line unicorn/no-process-exit
        () => process.exit(code);

    process.stdin.on('close', server.shutdown(exitWith(0)));
    process.on('SIGINT',      server.shutdown(exitWith(130)));
    process.on('SIGTERM',     server.shutdown(exitWith(143)));

    await server.connect(new StdioServerTransport());
}

async function startLegacyServer(options: CliOptions) {
    // todo: load the config and merge with CLI options
    const config: Config = {
        browser: {
            browserName: (options.browser as Config['browser']['browserName']) ?? 'chromium',   // todo: add validation
            launchOptions: {
                headless: options.headless || false,
            },
            contextOptions: {

            },
            // todo: proxy
        }
    };

    const browserConnection = new PlaywrightBrowserConnection({
        ...config.browser,
    });

    // Get the full path of the current file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const moduleLoader = new ModuleLoader(__dirname);
    const axios = createAxios();
    const moduleManager = new SerenityModuleManager(axios);

    const server = new SerenityMcpServer(
        schematics,
        moduleLoader,
        browserConnection,
        moduleManager,
    );
    server.registerProcessExitHandler();

    await server.connect(new StdioServerTransport());
}
