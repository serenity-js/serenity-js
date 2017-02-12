// todo: move to "io"
export function defer<T>(fn: () => PromiseLike<T>): Promise<T> {
    return new Promise<T>( (resolve, reject) => {
       fn().then(resolve, reject);
    });
}

export class Deferred<T> {
    public promise: Promise<T>;
    public resolve: (T?) => void;
    public reject:  (Error) => void;

    constructor() {
        this.promise = new Promise( (resolve, reject) => {
            this.resolve = resolve;
            this.reject  = reject;
        });
    }
}
