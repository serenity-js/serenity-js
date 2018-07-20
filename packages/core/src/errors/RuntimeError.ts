export abstract class RuntimeError extends Error {

    protected constructor(type: { new(...args: any[]): RuntimeError } , message: string, cause?: Error) {
        super(message);
        Object.setPrototypeOf(this, type.prototype);
        Error.captureStackTrace(this, type);

        if (!! cause) {
            this.stack = `${ this.stack }\nCaused by: ${ cause.stack }`;
        }
    }

    toString() {
        return `${ this.constructor.name }: ${ this.message }`;
    }
}
