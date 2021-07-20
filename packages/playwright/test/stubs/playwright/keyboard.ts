import { Keyboard } from 'playwright';
import { SinonSandbox } from 'sinon';

export const keyboardStub = (sandbox: SinonSandbox): Keyboard =>
    sandbox.createStubInstance(TestKeyboard, {
        down: sandbox.stub(),
        insertText: sandbox.stub(),
        press: sandbox.stub(),
        type: sandbox.stub(),
        up: sandbox.stub(),
    });

class TestKeyboard implements Keyboard {
    down(key: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    insertText(text: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    press(key: string, options?: { delay?: number }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    type(text: string, options?: { delay?: number }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    up(key: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
