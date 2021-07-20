/* eslint-disable @typescript-eslint/ban-types */
import {
    Browser,
    BrowserContext,
    BrowserContextOptions,
    CDPSession,
    Logger,
    Page,
} from 'playwright';
import { SinonSandbox } from 'sinon';

export const browserStub = (sandbox: SinonSandbox): Browser =>
    sandbox.createStubInstance(TestBrowser, {
        on: sandbox.stub(),
        once: sandbox.stub(),
        addListener: sandbox.stub(),
        removeListener: sandbox.stub(),
        off: sandbox.stub(),
        close: sandbox.stub(),
        contexts: sandbox.stub(),
        isConnected: sandbox.stub(),
        newBrowserCDPSession: sandbox.stub(),
        newContext: sandbox.stub(),
        newPage: sandbox.stub(),
        startTracing: sandbox.stub(),
        stopTracing: sandbox.stub(),
        version: sandbox.stub(),
        removeAllListeners: sandbox.stub(),
        setMaxListeners: sandbox.stub(),
        getMaxListeners: sandbox.stub(),
        listeners: sandbox.stub(),
        rawListeners: sandbox.stub(),
        emit: sandbox.stub(),
        listenerCount: sandbox.stub(),
        prependListener: sandbox.stub(),
        prependOnceListener: sandbox.stub(),
        eventNames: sandbox.stub(),
    });

class TestBrowser implements Browser {
    on(event: 'disconnected', listener: (browser: Browser) => void): this {
        throw new Error('Method not implemented.');
    }
    once(event: 'disconnected', listener: (browser: Browser) => void): this {
        throw new Error('Method not implemented.');
    }
    addListener(
        event: 'disconnected',
        listener: (browser: Browser) => void
    ): this {
        throw new Error('Method not implemented.');
    }
    removeListener(
        event: 'disconnected',
        listener: (browser: Browser) => void
    ): this {
        throw new Error('Method not implemented.');
    }
    off(event: 'disconnected', listener: (browser: Browser) => void): this {
        throw new Error('Method not implemented.');
    }
    close(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    contexts(): BrowserContext[] {
        throw new Error('Method not implemented.');
    }
    isConnected(): boolean {
        throw new Error('Method not implemented.');
    }
    newBrowserCDPSession(): Promise<CDPSession> {
        throw new Error('Method not implemented.');
    }
    newContext(options?: BrowserContextOptions): Promise<BrowserContext> {
        throw new Error('Method not implemented.');
    }
    newPage(options?: {
        acceptDownloads?: boolean;
        bypassCSP?: boolean;
        colorScheme?: 'light' | 'dark' | 'no-preference';
        deviceScaleFactor?: number;
        extraHTTPHeaders?: { [key: string]: string };
        geolocation?: { latitude: number; longitude: number; accuracy?: number };
        hasTouch?: boolean;
        httpCredentials?: { username: string; password: string };
        ignoreHTTPSErrors?: boolean;
        isMobile?: boolean;
        javaScriptEnabled?: boolean;
        locale?: string;
        logger?: Logger;
        offline?: boolean;
        permissions?: string[];
        proxy?: {
            server: string;
            bypass?: string;
            username?: string;
            password?: string;
        };
        recordHar?: { omitContent?: boolean; path: string };
        recordVideo?: { dir: string; size?: { width: number; height: number } };
        screen?: { width: number; height: number };
        storageState?:
        | string
        | {
            cookies?: {
                name: string;
                value: string;
                url?: string;
                domain?: string;
                path?: string;
                expires?: number;
                httpOnly?: boolean;
                secure?: boolean;
                sameSite?: 'Strict' | 'Lax' | 'None';
            }[];
            origins?: {
                origin: string;
                localStorage: { name: string; value: string }[];
            }[];
        };
        timezoneId?: string;
        userAgent?: string;
        videoSize?: { width: number; height: number };
        videosPath?: string;
        viewport?: { width: number; height: number };
    }): Promise<Page> {
        throw new Error('Method not implemented.');
    }
    startTracing(
        page?: Page,
        options?: { categories?: string[]; path?: string; screenshots?: boolean }
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    stopTracing(): Promise<Buffer> {
        throw new Error('Method not implemented.');
    }
    version(): string {
        throw new Error('Method not implemented.');
    }
    removeAllListeners(event?: string | symbol): this {
        throw new Error('Method not implemented.');
    }
    setMaxListeners(n: number): this {
        throw new Error('Method not implemented.');
    }
    getMaxListeners(): number {
        throw new Error('Method not implemented.');
    }
    listeners(event: string | symbol): Function[] {
        throw new Error('Method not implemented.');
    }
    rawListeners(event: string | symbol): Function[] {
        throw new Error('Method not implemented.');
    }
    emit(event: string | symbol, ...args: any[]): boolean {
        throw new Error('Method not implemented.');
    }
    listenerCount(event: string | symbol): number {
        throw new Error('Method not implemented.');
    }
    prependListener(
        event: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        throw new Error('Method not implemented.');
    }
    prependOnceListener(
        event: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        throw new Error('Method not implemented.');
    }
    eventNames(): (string | symbol)[] {
        throw new Error('Method not implemented.');
    }
}
