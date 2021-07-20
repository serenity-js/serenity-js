export class Stack<T> {
    _store: T[] = [];
    push(value: T): void {
        this._store.push(value);
    }
    pop(): T | undefined {
        return this._store.pop();
    }
}
