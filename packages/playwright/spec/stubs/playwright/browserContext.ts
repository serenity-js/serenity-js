import { Browser, BrowserContext, CDPSession, Cookie, Page, Request, Route, Tracing, Worker } from 'playwright';
import { Serializable } from 'playwright/types/structs';
import { SinonSandbox } from 'sinon';

export const browserContextStub = (sandbox: SinonSandbox): BrowserContext =>
    sandbox.createStubInstance(TestBrowserContext, {
        exposeBinding: sandbox.stub(),
        on: sandbox.stub(),
        once: sandbox.stub(),
        addListener: sandbox.stub(),
        removeListener: sandbox.stub(),
        off: sandbox.stub(),
        addCookies: sandbox.stub(),
        addInitScript: sandbox.stub(),
        backgroundPages: sandbox.stub(),
        browser: sandbox.stub(),
        clearCookies: sandbox.stub(),
        clearPermissions: sandbox.stub(),
        close: sandbox.stub(),
        cookies: sandbox.stub(),
        exposeFunction: sandbox.stub(),
        grantPermissions: sandbox.stub(),
        newCDPSession: sandbox.stub(),
        newPage: sandbox.stub(),
        pages: sandbox.stub(),
        route: sandbox.stub(),
        serviceWorkers: sandbox.stub(),
        setDefaultNavigationTimeout: sandbox.stub(),
        setDefaultTimeout: sandbox.stub(),
        setExtraHTTPHeaders: sandbox.stub(),
        setGeolocation: sandbox.stub(),
        setHTTPCredentials: sandbox.stub(),
        setOffline: sandbox.stub(),
        storageState: sandbox.stub(),
        unroute: sandbox.stub(),
        waitForEvent: sandbox.stub(),
    });

class TestBrowserContext implements BrowserContext {
    tracing: Tracing;
    route(
        url: string | RegExp | ((url: URL) => boolean),
        handler: (route: Route, request: Request) => void
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    serviceWorkers(): Worker[] {
        throw new Error('Method not implemented.');
    }
    unroute(
        url: string | RegExp | ((url: URL) => boolean),
        handler?: (route: Route, request: Request) => void
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    exposeBinding(name: any, playwrightBinding: any, options?: any): Promise<void> {
        throw new Error('Method not implemented.');
    }
    on(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }
    once(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }
    addListener(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }
    removeListener(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }
    off(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }
    addCookies(
        cookies: {
            name: string;
            value: string;
            url?: string;
            domain?: string;
            path?: string;
            expires?: number;
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: 'Strict' | 'Lax' | 'None';
        }[]
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    addInitScript(script: string | Function | { path?: string; content?: string }, arg?: Serializable): Promise<void> {
        throw new Error('Method not implemented.');
    }
    backgroundPages(): Page[] {
        throw new Error('Method not implemented.');
    }
    browser(): Browser {
        throw new Error('Method not implemented.');
    }
    clearCookies(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    clearPermissions(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    close(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    cookies(urls?: string | string[]): Promise<Cookie[]> {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    exposeFunction(name: string, callback: Function): Promise<void> {
        throw new Error('Method not implemented.');
    }
    grantPermissions(permissions: string[], options?: { origin?: string }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    newCDPSession(page: Page): Promise<CDPSession> {
        throw new Error('Method not implemented.');
    }
    newPage(): Promise<Page> {
        throw new Error('Method not implemented.');
    }
    pages(): Page[] {
        throw new Error('Method not implemented.');
    }
    setDefaultNavigationTimeout(timeout: number): void {
        throw new Error('Method not implemented.');
    }
    setDefaultTimeout(timeout: number): void {
        throw new Error('Method not implemented.');
    }
    setExtraHTTPHeaders(headers: { [key: string]: string }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    setGeolocation(geolocation: { latitude: number; longitude: number; accuracy?: number }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    setHTTPCredentials(httpCredentials: { username: string; password: string }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    setOffline(offline: boolean): Promise<void> {
        throw new Error('Method not implemented.');
    }
    storageState(options?: { path?: string }): Promise<{
        cookies: {
            name: string;
            value: string;
            domain: string;
            path: string;
            expires: number;
            httpOnly: boolean;
            secure: boolean;
            sameSite: 'Strict' | 'Lax' | 'None';
        }[];
        origins: { origin: string; localStorage: { name: string; value: string }[] }[];
    }> {
        throw new Error('Method not implemented.');
    }
    waitForEvent(event: any, optionsOrPredicate?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
