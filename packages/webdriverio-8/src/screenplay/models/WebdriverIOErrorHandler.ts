import type { WebdriverProtocolErrorCode } from './WebdriverProtocolErrorCode.js';

export class WebdriverIOErrorHandler {

    constructor(private readonly handlers: Map<WebdriverProtocolErrorCode, (error: Error) => Promise<void> | void> = new Map()) {
    }

    async executeIfHandled<T>(error: Error, action: () => Promise<T> | T): Promise<T> {
        if (! this.handlers.has(error.name as WebdriverProtocolErrorCode)) {
            throw error;
        }

        await this.handlers.get(error.name as WebdriverProtocolErrorCode)(error);

        return action();
    }

    setHandlerFor(errorType: WebdriverProtocolErrorCode, handler: (error: Error) => Promise<void> | void): void {
        this.handlers.set(errorType, handler);
    }

    unsetHandlerFor(errorType: WebdriverProtocolErrorCode): void {
        this.handlers.delete(errorType);
    }
}
