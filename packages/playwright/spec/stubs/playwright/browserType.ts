import { Browser, BrowserContext, BrowserServer, BrowserType, ConnectOptions, LaunchOptions, Logger } from 'playwright';
import { SinonSandbox } from 'sinon';

export const browserTypeStub = (sandbox: SinonSandbox): BrowserType =>
    sandbox.createStubInstance(TestBrowserType, {
        connectOverCDP: sandbox.stub(),
        connect: sandbox.stub(),
        executablePath: sandbox.stub(),
        launch: sandbox.stub(),
        launchPersistentContext: sandbox.stub(),
        launchServer: sandbox.stub(),
        name: sandbox.stub(),
    });

class TestBrowserType implements BrowserType {
    connectOverCDP(options: any): Promise<Browser> {
        throw new Error('Method not implemented.');
    }
    connect(params: ConnectOptions): Promise<Browser> {
        throw new Error('Method not implemented.');
    }
    executablePath(): string {
        throw new Error('Method not implemented.');
    }
    launch(options?: LaunchOptions): Promise<Browser> {
        throw new Error('Method not implemented.');
    }
    launchPersistentContext(
        // eslint-disable-next-line unicorn/prevent-abbreviations
        userDataDir: string,
        options?: {
            acceptDownloads?: boolean;
            args?: string[];
            bypassCSP?: boolean;
            channel?:
            | 'chrome'
            | 'chrome-beta'
            | 'chrome-dev'
            | 'chrome-canary'
            | 'msedge'
            | 'msedge-beta'
            | 'msedge-dev'
            | 'msedge-canary'
            | 'firefox-stable';
            chromiumSandbox?: boolean;
            colorScheme?: 'light' | 'dark' | 'no-preference';
            deviceScaleFactor?: number;
            devtools?: boolean;
            downloadsPath?: string;
            env?: { [key: string]: string | number | boolean };
            executablePath?: string;
            extraHTTPHeaders?: { [key: string]: string };
            geolocation?: { latitude: number; longitude: number; accuracy?: number };
            handleSIGHUP?: boolean;
            handleSIGINT?: boolean;
            handleSIGTERM?: boolean;
            hasTouch?: boolean;
            headless?: boolean;
            httpCredentials?: { username: string; password: string };
            ignoreDefaultArgs?: boolean | string[];
            ignoreHTTPSErrors?: boolean;
            isMobile?: boolean;
            javaScriptEnabled?: boolean;
            locale?: string;
            logger?: Logger;
            offline?: boolean;
            permissions?: string[];
            proxy?: { server: string; bypass?: string; username?: string; password?: string };
            recordHar?: { omitContent?: boolean; path: string };
            recordVideo?: { dir: string; size?: { width: number; height: number } };
            screen?: { width: number; height: number };
            slowMo?: number;
            timeout?: number;
            timezoneId?: string;
            userAgent?: string;
            videoSize?: { width: number; height: number };
            videosPath?: string;
            viewport?: { width: number; height: number };
        }
    ): Promise<BrowserContext> {
        throw new Error('Method not implemented.');
    }
    launchServer(options?: {
        args?: string[];
        channel?:
        | 'chrome'
        | 'chrome-beta'
        | 'chrome-dev'
        | 'chrome-canary'
        | 'msedge'
        | 'msedge-beta'
        | 'msedge-dev'
        | 'msedge-canary'
        | 'firefox-stable';
        chromiumSandbox?: boolean;
        devtools?: boolean;
        downloadsPath?: string;
        env?: { [key: string]: string | number | boolean };
        executablePath?: string;
        firefoxUserPrefs?: { [key: string]: string | number | boolean };
        handleSIGHUP?: boolean;
        handleSIGINT?: boolean;
        handleSIGTERM?: boolean;
        headless?: boolean;
        ignoreDefaultArgs?: boolean | string[];
        logger?: Logger;
        port?: number;
        proxy?: { server: string; bypass?: string; username?: string; password?: string };
        timeout?: number;
    }): Promise<BrowserServer> {
        throw new Error('Method not implemented.');
    }
    name(): string {
        throw new Error('Method not implemented.');
    }
}
