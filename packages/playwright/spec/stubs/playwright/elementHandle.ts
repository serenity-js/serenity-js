import { ElementHandle, Frame, JSHandle } from 'playwright';
import { EvaluationArgument } from 'playwright/types/structs';
import { SinonSandbox } from 'sinon';

export const elementHandleStub = (sandbox: SinonSandbox): ElementHandle =>
    sandbox.createStubInstance(TestElementHandle, {
        $: sandbox.stub(),
        $$: sandbox.stub(),
        $eval: sandbox.stub(),
        $$eval: sandbox.stub(),
        waitForSelector: sandbox.stub(),
        boundingBox: sandbox.stub(),
        check: sandbox.stub(),
        click: sandbox.stub(),
        contentFrame: sandbox.stub(),
        dblclick: sandbox.stub(),
        dispatchEvent: sandbox.stub(),
        fill: sandbox.stub(),
        focus: sandbox.stub(),
        getAttribute: sandbox.stub(),
        hover: sandbox.stub(),
        innerHTML: sandbox.stub(),
        innerText: sandbox.stub(),
        isChecked: sandbox.stub(),
        isDisabled: sandbox.stub(),
        isEditable: sandbox.stub(),
        isEnabled: sandbox.stub(),
        isHidden: sandbox.stub(),
        isVisible: sandbox.stub(),
        ownerFrame: sandbox.stub(),
        press: sandbox.stub(),
        screenshot: sandbox.stub(),
        scrollIntoViewIfNeeded: sandbox.stub(),
        selectOption: sandbox.stub(),
        selectText: sandbox.stub(),
        setInputFiles: sandbox.stub(),
        tap: sandbox.stub(),
        textContent: sandbox.stub(),
        type: sandbox.stub(),
        uncheck: sandbox.stub(),
        waitForElementState: sandbox.stub(),
        evaluate: sandbox.stub(),
        evaluateHandle: sandbox.stub(),
        jsonValue: sandbox.stub(),
        asElement: sandbox.stub(),
        dispose: sandbox.stub(),
        getProperties: sandbox.stub(),
        getProperty: sandbox.stub(),
    });

class TestElementHandle implements ElementHandle {
    $(selector: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    $$(selector: any): Promise<any[]> {
        throw new Error('Method not implemented.');
    }
    $eval(selector: any, pageFunction: any, arg?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    $$eval(selector: any, pageFunction: any, arg?: any): Promise<any[]> {
        throw new Error('Method not implemented.');
    }
    waitForSelector(selector: any, options?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    boundingBox(): Promise<{
        x: number;
        y: number;
        width: number;
        height: number;
    }> {
        throw new Error('Method not implemented.');
    }
    check(options?: {
        force?: boolean;
        noWaitAfter?: boolean;
        position?: { x: number; y: number };
        timeout?: number;
        trial?: boolean;
    }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    click(options?: {
        button?: 'left' | 'right' | 'middle';
        clickCount?: number;
        delay?: number;
        force?: boolean;
        modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
        noWaitAfter?: boolean;
        position?: { x: number; y: number };
        timeout?: number;
        trial?: boolean;
    }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    contentFrame(): Promise<Frame> {
        throw new Error('Method not implemented.');
    }
    dblclick(options?: {
        button?: 'left' | 'right' | 'middle';
        delay?: number;
        force?: boolean;
        modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
        noWaitAfter?: boolean;
        position?: { x: number; y: number };
        timeout?: number;
        trial?: boolean;
    }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dispatchEvent(type: string, eventInit?: EvaluationArgument): Promise<void> {
        throw new Error('Method not implemented.');
    }
    fill(
        value: string,
        options?: { noWaitAfter?: boolean; timeout?: number }
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    focus(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getAttribute(name: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    hover(options?: {
        force?: boolean;
        modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
        position?: { x: number; y: number };
        timeout?: number;
        trial?: boolean;
    }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    innerHTML(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    innerText(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    isChecked(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isDisabled(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isEditable(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isEnabled(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isHidden(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    isVisible(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    ownerFrame(): Promise<Frame> {
        throw new Error('Method not implemented.');
    }
    press(
        key: string,
        options?: { delay?: number; noWaitAfter?: boolean; timeout?: number }
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    screenshot(options?: {
        omitBackground?: boolean;
        path?: string;
        quality?: number;
        timeout?: number;
        type?: 'png' | 'jpeg';
    }): Promise<Buffer> {
        throw new Error('Method not implemented.');
    }
    scrollIntoViewIfNeeded(options?: { timeout?: number }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    selectOption(
        values:
        | string
        | ElementHandle<Node>
        | string[]
        | { value?: string; label?: string; index?: number }
        | ElementHandle<Node>[]
        | { value?: string; label?: string; index?: number }[],
        options?: { noWaitAfter?: boolean; timeout?: number }
    ): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    selectText(options?: { timeout?: number }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    setInputFiles(
        files:
        | string
        | string[]
        | { name: string; mimeType: string; buffer: Buffer }
        | { name: string; mimeType: string; buffer: Buffer }[],
        options?: { noWaitAfter?: boolean; timeout?: number }
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    tap(options?: {
        force?: boolean;
        modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
        noWaitAfter?: boolean;
        position?: { x: number; y: number };
        timeout?: number;
        trial?: boolean;
    }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    textContent(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    type(
        text: string,
        options?: { delay?: number; noWaitAfter?: boolean; timeout?: number }
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    uncheck(options?: {
        force?: boolean;
        noWaitAfter?: boolean;
        position?: { x: number; y: number };
        timeout?: number;
        trial?: boolean;
    }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    waitForElementState(
        state:
        | 'visible'
        | 'hidden'
        | 'stable'
        | 'enabled'
        | 'disabled'
        | 'editable',
        options?: { timeout?: number }
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    evaluate(pageFunction: any, arg?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    evaluateHandle(pageFunction: any, arg?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    jsonValue(): Promise<Node> {
        throw new Error('Method not implemented.');
    }
    asElement(): ElementHandle<Node> {
        throw new Error('Method not implemented.');
    }
    dispose(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getProperties(): Promise<Map<string, JSHandle<any>>> {
        throw new Error('Method not implemented.');
    }
    getProperty(propertyName: string): Promise<JSHandle<any>> {
        throw new Error('Method not implemented.');
    }
}
