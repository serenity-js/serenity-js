import process from 'node:process';

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { program } from 'commander';

import type { CLIOptions } from './config/CliConfig.js';
import type { Config } from './config/Config.js';
import { packageJSON } from './package.js';
import { SerenityMcpServer } from './server/index.js';

function semicolonSeparatedList(value: string): string[] {
    return value.split(';').map(v => v.trim());
}

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
    .action(async (options: CLIOptions) => {

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

        const server = new SerenityMcpServer(config);
        server.registerProcessExitHandler();

        await server.connect(new StdioServerTransport());
    });

void program.parseAsync(process.argv);
