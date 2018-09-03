/**
 * @access package
 */
export class Current<T> {
    constructor(private val: T = null) {
    }

    set value(value: T) {
        this.val = value;
    }

    get value() {
        return this.val;
    }

    isSet(): boolean {
        return !! this.val;
    }

    clear() {
        this.val = null;
    }
}
