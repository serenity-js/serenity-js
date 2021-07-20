/* eslint-disable @typescript-eslint/ban-types */
import {
    Accessibility,
    BrowserContext,
    Coverage,
    ElementHandle,
    Frame,
    JSHandle,
    Keyboard,
    Mouse,
    Page,
    Request,
    Response,
    Route,
    Touchscreen,
    Video,
    Worker,
} from 'playwright';
import {
    BindingSource,
    ElementHandleForTag,
    EvaluationArgument,
    Serializable,
} from 'playwright/types/structs';
import { SinonSandbox } from 'sinon';

const notStubbed = 'Method not stubbed. Check your mocks';

export const pageStub = (sandbox: SinonSandbox): Page =>
    sandbox.createStubInstance(TestPage, {
        waitForFunction: sandbox.stub(),
        waitForSelector: sandbox.stub(),
        evaluate: sandbox.stub(),
        evaluateHandle: sandbox.stub(),
        $: sandbox.stub(),
        $$: sandbox.stub(),
        $eval: sandbox.stub(),
        $$eval: sandbox.stub(),
        exposeBinding: sandbox.stub(),
        on: sandbox.stub(),
        once: sandbox.stub(),
        addListener: sandbox.stub(),
        removeListener: sandbox.stub(),
        off: sandbox.stub(),
        addInitScript: sandbox.stub(),
        addScriptTag: sandbox.stub(),
        addStyleTag: sandbox.stub(),
        bringToFront: sandbox.stub(),
        check: sandbox.stub(),
        click: sandbox.stub(),
        close: sandbox.stub(),
        content: sandbox.stub(),
        dblclick: sandbox.stub(),
        dispatchEvent: sandbox.stub(),
        emulateMedia: sandbox.stub(),
        exposeFunction: sandbox.stub(),
        fill: sandbox.stub(),
        focus: sandbox.stub(),
        frame: sandbox.stub(),
        frames: sandbox.stub(),
        getAttribute: sandbox.stub(),
        goBack: sandbox.stub(),
        goForward: sandbox.stub(),
        goto: sandbox.stub(),
        hover: sandbox.stub(),
        innerHTML: sandbox.stub(),
        innerText: sandbox.stub(),
        isChecked: sandbox.stub(),
        isClosed: sandbox.stub(),
        isDisabled: sandbox.stub(),
        isEditable: sandbox.stub(),
        isEnabled: sandbox.stub(),
        isHidden: sandbox.stub(),
        isVisible: sandbox.stub(),
        mainFrame: sandbox.stub(),
        opener: sandbox.stub(),
        pause: sandbox.stub(),
        pdf: sandbox.stub(),
        press: sandbox.stub(),
        reload: sandbox.stub(),
        route: sandbox.stub(),
        screenshot: sandbox.stub(),
        selectOption: sandbox.stub(),
        setContent: sandbox.stub(),
        setDefaultNavigationTimeout: sandbox.stub(),
        setDefaultTimeout: sandbox.stub(),
        setExtraHTTPHeaders: sandbox.stub(),
        setInputFiles: sandbox.stub(),
        setViewportSize: sandbox.stub(),
        tap: sandbox.stub(),
        textContent: sandbox.stub(),
        title: sandbox.stub(),
        type: sandbox.stub(),
        uncheck: sandbox.stub(),
        unroute: sandbox.stub(),
        url: sandbox.stub(),
        video: sandbox.stub(),
        viewportSize: sandbox.stub(),
        waitForEvent: sandbox.stub(),
        waitForLoadState: sandbox.stub(),
        waitForNavigation: sandbox.stub(),
        waitForRequest: sandbox.stub(),
        waitForResponse: sandbox.stub(),
        waitForTimeout: sandbox.stub(),
        waitForURL: sandbox.stub(),
        workers: sandbox.stub(),
    });

class TestPage implements Page {
    waitForFunction(pageFunction: any, arg?: any, options?: any): Promise<any> {
        throw new Error(notStubbed);
    }
    waitForSelector<K extends keyof HTMLElementTagNameMap>(
        selector: K,
        options?: any & { state?: 'attached' | 'visible' }
    ): Promise<ElementHandleForTag<K>>;
    waitForSelector(
        selector: string,
        options?: any & { state?: 'attached' | 'visible' }
    ): Promise<ElementHandle<SVGElement | HTMLElement>>;
    waitForSelector(selector: any, options?: any): Promise<any> {
        throw new Error(notStubbed);
    }
    evaluate(pageFunction: any, arg?: any): Promise<any> {
        throw new Error(notStubbed);
    }
    evaluateHandle(pageFunction: any, arg?: any): Promise<any> {
        throw new Error(notStubbed);
    }
    $(selector: any): Promise<any> {
        throw new Error(notStubbed);
    }
    $$(selector: any): Promise<any> {
        throw new Error(notStubbed);
    }
    $eval(selector: any, pageFunction: any, arg?: any): Promise<any> {
        throw new Error(notStubbed);
    }
    $$eval(selector: any, pageFunction: any, arg?: any): Promise<any> {
        throw new Error(notStubbed);
    }
    exposeBinding(
        name: string,
        playwrightBinding: (source: BindingSource, arg: JSHandle<any>) => any,
        options: { handle: true }
    ): Promise<void>;
    exposeBinding(
        name: string,
        playwrightBinding: (source: BindingSource, ...args: any[]) => any,
        options?: { handle?: boolean }
    ): Promise<void>;
    exposeBinding(name: any, playwrightBinding: any, options?: any): Promise<any> {
        throw new Error(notStubbed);
    }
    on(event: any, listener: any): this {
        throw new Error(notStubbed);
    }
    once(event: any, listener: any): this {
        throw new Error(notStubbed);
    }
    addListener(event: any, listener: any): this {
        throw new Error(notStubbed);
    }
    removeListener(event: any, listener: any): this {
        throw new Error(notStubbed);
    }
    off(event: any, listener: any): this {
        throw new Error(notStubbed);
    }
    accessibility: Accessibility;
    addInitScript(script: string | Function | { path?: string; content?: string }, arg?: Serializable): Promise<void> {
        throw new Error(notStubbed);
    }
    addScriptTag(options?: {
        content?: string;
        path?: string;
        type?: string;
        url?: string;
    }): Promise<ElementHandle<Node>> {
        throw new Error(notStubbed);
    }
    addStyleTag(options?: { content?: string; path?: string; url?: string }): Promise<ElementHandle<Node>> {
        throw new Error(notStubbed);
    }
    bringToFront(): Promise<void> {
        throw new Error(notStubbed);
    }
    check(
        selector: string,
        options?: {
            force?: boolean;
            noWaitAfter?: boolean;
            position?: { x: number; y: number };
            timeout?: number;
            trial?: boolean;
        }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    click(
        selector: string,
        options?: {
            button?: 'left' | 'right' | 'middle';
            clickCount?: number;
            delay?: number;
            force?: boolean;
            modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
            noWaitAfter?: boolean;
            position?: { x: number; y: number };
            timeout?: number;
            trial?: boolean;
        }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    close(options?: { runBeforeUnload?: boolean }): Promise<void> {
        throw new Error(notStubbed);
    }
    content(): Promise<string> {
        throw new Error(notStubbed);
    }
    context(): BrowserContext {
        throw new Error(notStubbed);
    }
    coverage: Coverage;
    dblclick(
        selector: string,
        options?: {
            button?: 'left' | 'right' | 'middle';
            delay?: number;
            force?: boolean;
            modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
            noWaitAfter?: boolean;
            position?: { x: number; y: number };
            timeout?: number;
            trial?: boolean;
        }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    dispatchEvent(
        selector: string,
        type: string,
        eventInit?: EvaluationArgument,
        options?: { timeout?: number }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    emulateMedia(options?: {
        colorScheme?: 'light' | 'dark' | 'no-preference';
        media?: 'screen' | 'print';
    }): Promise<void> {
        throw new Error(notStubbed);
    }
    exposeFunction(name: string, callback: Function): Promise<void> {
        throw new Error(notStubbed);
    }
    fill(selector: string, value: string, options?: { noWaitAfter?: boolean; timeout?: number }): Promise<void> {
        throw new Error(notStubbed);
    }
    focus(selector: string, options?: { timeout?: number }): Promise<void> {
        throw new Error(notStubbed);
    }
    frame(frameSelector: string | { name?: string; url?: string | RegExp | ((url: URL) => boolean) }): Frame {
        throw new Error(notStubbed);
    }
    frames(): Frame[] {
        throw new Error(notStubbed);
    }
    getAttribute(selector: string, name: string, options?: { timeout?: number }): Promise<string> {
        throw new Error(notStubbed);
    }
    goBack(options?: { timeout?: number; waitUntil?: 'domcontentloaded' | 'load' | 'networkidle' }): Promise<Response> {
        throw new Error(notStubbed);
    }
    goForward(options?: {
        timeout?: number;
        waitUntil?: 'domcontentloaded' | 'load' | 'networkidle';
    }): Promise<Response> {
        throw new Error(notStubbed);
    }
    goto(
        url: string,
        options?: { referer?: string; timeout?: number; waitUntil?: 'domcontentloaded' | 'load' | 'networkidle' }
    ): Promise<Response> {
        throw new Error(notStubbed);
    }
    hover(
        selector: string,
        options?: {
            force?: boolean;
            modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
            position?: { x: number; y: number };
            timeout?: number;
            trial?: boolean;
        }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    innerHTML(selector: string, options?: { timeout?: number }): Promise<string> {
        throw new Error(notStubbed);
    }
    innerText(selector: string, options?: { timeout?: number }): Promise<string> {
        throw new Error(notStubbed);
    }
    isChecked(selector: string, options?: { timeout?: number }): Promise<boolean> {
        throw new Error(notStubbed);
    }
    isClosed(): boolean {
        throw new Error(notStubbed);
    }
    isDisabled(selector: string, options?: { timeout?: number }): Promise<boolean> {
        throw new Error(notStubbed);
    }
    isEditable(selector: string, options?: { timeout?: number }): Promise<boolean> {
        throw new Error(notStubbed);
    }
    isEnabled(selector: string, options?: { timeout?: number }): Promise<boolean> {
        throw new Error(notStubbed);
    }
    isHidden(selector: string, options?: { timeout?: number }): Promise<boolean> {
        throw new Error(notStubbed);
    }
    isVisible(selector: string, options?: { timeout?: number }): Promise<boolean> {
        throw new Error(notStubbed);
    }
    keyboard: Keyboard;
    mainFrame(): Frame {
        throw new Error(notStubbed);
    }
    mouse: Mouse;
    opener(): Promise<Page> {
        throw new Error(notStubbed);
    }
    pause(): Promise<void> {
        throw new Error(notStubbed);
    }
    pdf(options?: {
        displayHeaderFooter?: boolean;
        footerTemplate?: string;
        format?: string;
        headerTemplate?: string;
        height?: string | number;
        landscape?: boolean;
        margin?: { top?: string | number; right?: string | number; bottom?: string | number; left?: string | number };
        pageRanges?: string;
        path?: string;
        preferCSSPageSize?: boolean;
        printBackground?: boolean;
        scale?: number;
        width?: string | number;
    }): Promise<Buffer> {
        throw new Error(notStubbed);
    }
    press(
        selector: string,
        key: string,
        options?: { delay?: number; noWaitAfter?: boolean; timeout?: number }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    reload(options?: { timeout?: number; waitUntil?: 'domcontentloaded' | 'load' | 'networkidle' }): Promise<Response> {
        throw new Error(notStubbed);
    }
    route(
        url: string | RegExp | ((url: URL) => boolean),
        handler: (route: Route, request: Request) => void
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    screenshot(options?: {
        clip?: { x: number; y: number; width: number; height: number };
        fullPage?: boolean;
        omitBackground?: boolean;
        path?: string;
        quality?: number;
        timeout?: number;
        type?: 'png' | 'jpeg';
    }): Promise<Buffer> {
        throw new Error(notStubbed);
    }
    selectOption(
        selector: string,
        values:
        | string
        | ElementHandle<Node>
        | string[]
        | { value?: string; label?: string; index?: number }
        | ElementHandle<Node>[]
        | { value?: string; label?: string; index?: number }[],
        options?: { noWaitAfter?: boolean; timeout?: number }
    ): Promise<string[]> {
        throw new Error(notStubbed);
    }
    setContent(
        html: string,
        options?: { timeout?: number; waitUntil?: 'domcontentloaded' | 'load' | 'networkidle' }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    setDefaultNavigationTimeout(timeout: number): void {
        throw new Error(notStubbed);
    }
    setDefaultTimeout(timeout: number): void {
        throw new Error(notStubbed);
    }
    setExtraHTTPHeaders(headers: { [key: string]: string }): Promise<void> {
        throw new Error(notStubbed);
    }
    setInputFiles(
        selector: string,
        files:
        | string
        | string[]
        | { name: string; mimeType: string; buffer: Buffer }
        | { name: string; mimeType: string; buffer: Buffer }[],
        options?: { noWaitAfter?: boolean; timeout?: number }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    setViewportSize(viewportSize: { width: number; height: number }): Promise<void> {
        throw new Error(notStubbed);
    }
    tap(
        selector: string,
        options?: {
            force?: boolean;
            modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
            noWaitAfter?: boolean;
            position?: { x: number; y: number };
            timeout?: number;
            trial?: boolean;
        }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    textContent(selector: string, options?: { timeout?: number }): Promise<string> {
        throw new Error(notStubbed);
    }
    title(): Promise<string> {
        throw new Error(notStubbed);
    }
    touchscreen: Touchscreen;
    type(
        selector: string,
        text: string,
        options?: { delay?: number; noWaitAfter?: boolean; timeout?: number }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    uncheck(
        selector: string,
        options?: {
            force?: boolean;
            noWaitAfter?: boolean;
            position?: { x: number; y: number };
            timeout?: number;
            trial?: boolean;
        }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    unroute(
        url: string | RegExp | ((url: URL) => boolean),
        handler?: (route: Route, request: Request) => void
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    url(): string {
        throw new Error(notStubbed);
    }
    video(): Video {
        throw new Error(notStubbed);
    }
    viewportSize(): { width: number; height: number } {
        throw new Error(notStubbed);
    }
    waitForEvent(event: any, optionsOrPredicate?: any): Promise<any> {
        throw new Error(notStubbed);
    }
    waitForLoadState(state?: 'domcontentloaded' | 'load' | 'networkidle', options?: { timeout?: number }): Promise<void> {
        throw new Error(notStubbed);
    }
    waitForNavigation(options?: {
        timeout?: number;
        url?: string | RegExp | ((url: URL) => boolean);
        waitUntil?: 'domcontentloaded' | 'load' | 'networkidle';
    }): Promise<Response> {
        throw new Error(notStubbed);
    }
    waitForRequest(
        urlOrPredicate: string | RegExp | ((request: Request) => boolean | Promise<boolean>),
        options?: { timeout?: number }
    ): Promise<Request> {
        throw new Error(notStubbed);
    }
    waitForResponse(
        urlOrPredicate: string | RegExp | ((response: Response) => boolean | Promise<boolean>),
        options?: { timeout?: number }
    ): Promise<Response> {
        throw new Error(notStubbed);
    }
    waitForTimeout(timeout: number): Promise<void> {
        throw new Error(notStubbed);
    }
    waitForURL(
        url: string | RegExp | ((url: URL) => boolean),
        options?: { timeout?: number; waitUntil?: 'domcontentloaded' | 'load' | 'networkidle' }
    ): Promise<void> {
        throw new Error(notStubbed);
    }
    workers(): Worker[] {
        throw new Error(notStubbed);
    }
}
