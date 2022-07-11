export class ProtractorErrorHandler {

    constructor(private readonly handlers: Map<string, (error: Error) => Promise<void> | void> = new Map()) {
    }

    async executeIfHandled<T>(error: Error, action: () => Promise<T> | T): Promise<T> {
        if (! this.handlers.has(error.name)) {
            throw error;
        }

        await this.handlers.get(error.name)(error);

        return action();
    }

    setHandlerFor(errorType: string, handler: (error: Error) => Promise<void> | void): void {
        this.handlers.set(errorType, handler);
    }

    unsetHandlerFor(errorType: string): void {
        this.handlers.delete(errorType);
    }
}
