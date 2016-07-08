export function defer<T>(promise: PromiseLike<T>) {
    let deferred = new Deferred<T>();

    promise.then(v => deferred.resolve(v), e => deferred.reject(e));

    return deferred.promise;
}

export class Deferred<T> {
    public promise: Promise<T>;
    public resolve: (T) => void;
    public reject:  (Error) => void;

    constructor() {
        this.promise = new Promise( (resolve, reject) => {
            this.resolve = resolve;
            this.reject  = reject;
        });
    }
}
