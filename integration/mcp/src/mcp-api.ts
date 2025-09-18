import fs from 'node:fs/promises';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import path from 'node:path';
import process from 'node:process';
import url from 'node:url';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Config } from '@serenity-js/mcp';
import { useFixtures } from '@serenity-js/playwright-test';

export interface StartClientOptions {
    clientName?: string;
    args?: string[];
    config?: Config;
}

export interface TestOptions {
    mcpBrowser: 'chrome' | 'chromium' | 'msedge' | 'firefox' | 'webkit';
}

export interface TestFixtures {
    client: Client;
    clientOptions: StartClientOptions;
    startClient: (options?: StartClientOptions) => Promise<{ client: Client, stderr: () => string }>;
    mcpHeadless: boolean;
    createMcpTransport: (args: string[]) => StdioClientTransport;
    env: typeof process['env'];
}

export interface WorkerFixtures {
    testServerUrl: string;
}

function getArgs(condition: unknown, ...args: string[]): string[] {
    return condition
        ? args
        : [];
}

export const {
    describe,
    it,
    test,
    expect,
} = useFixtures<TestFixtures & TestOptions, WorkerFixtures>({

    // eslint-disable-next-line no-empty-pattern
    env: async ({}, use) => {
        await use(process.env);
    },

    mcpBrowser: [ 'chrome', { option: true } ],

    mcpHeadless: async ({ headless }, use) => {
        await use(headless);
    },

    createMcpTransport: async ({ env }, use) => {

        await use((args: string[]) => {
            const command = process.execPath;   // path to Node.js executable
            const __filename = url.fileURLToPath(import.meta.url);
            const moduleRootDirectory = path.resolve(path.dirname(__filename), '..');
            const pathToMcpServer = path.resolve(moduleRootDirectory, './node_modules/@serenity-js/mcp/esm/cli.js')

            return new StdioClientTransport({
                command,
                args: [
                    pathToMcpServer,
                    ...args
                ],
                cwd: moduleRootDirectory,
                stderr: 'pipe',
                env: {
                    ...env,
                },
            })
        });
    },

    startClient: async ({ createMcpTransport, mcpBrowser, mcpHeadless, env, platform }, use, testInfo) => {
        const userDataDirectory = testInfo.outputPath('user-data-dir');
        const configDirectory = path.dirname(test.info().config.configFile!);

        let client: Client | undefined;

        await use(async (options: StartClientOptions = {}) => {

            const args: string[] = [
                ...getArgs(userDataDirectory, `--user-data-dir=${ userDataDirectory }`),
                ...getArgs(env.CI && platform.name === 'Linux', '--no-sandbox'),
                ...getArgs(mcpHeadless, '--headless'),
                ...getArgs(mcpBrowser, `--browser=${ mcpBrowser }`),
                ...(options?.args || []),
            ];

            if (options?.config) {
                const configFile = testInfo.outputPath('config.json');
                await fs.writeFile(configFile, JSON.stringify(options.config, undefined, 2));
                args.push(`--config=${ path.relative(configDirectory, configFile) }`);
            }

            client = new Client({
                name: options?.clientName ?? 'mcp-client-serenity-js',
                version: '1.0.0',
            });

            const transport = createMcpTransport(args);
            let stderrBuffer = '';
            transport.stderr?.on('data', (data: string) => {
                stderrBuffer += data.toString();
            });

            await client.connect(transport, { timeout: 30_000 });
            await client.ping();

            return {
                client,
                stderr: () => stderrBuffer,
            };
        });

        await client?.close();
    },

    client: async ({ startClient }, use) => {
        const { client, stderr } = await startClient();
        await use(client);

        console.log({ stderr: stderr() })
    },

    // eslint-disable-next-line no-empty-pattern
    testServerUrl: [ async ({ }, use) => {
        const server = http.createServer((request, response) => {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(`
<html lang="en">
<head>                        
  <title>Test Page</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>
            `);
        });

        await new Promise<void>((resolve) => {
            server.listen(0, () => {
                resolve();
            });
        });

        await use(`http://localhost:${ (server.address() as AddressInfo).port }`);

        await new Promise<void>((resolve) => {
            server.close(() => {
                resolve();
            });
        });
    }, { scope: 'worker' } ],
})
