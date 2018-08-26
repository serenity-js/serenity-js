export interface Constructor<T> {
    new (...args: any[]): T;
}

export interface Constructable<T> {
    constructor: Function;  // tslint:disable-line:ban-types
}

export class FeatureFileMap {

    constructor(private readonly map: { [line: number]: Constructable<any> } = {}) {
    }

    set<T>(item: Constructable<T>) {
        return ({
            onLine: (line: number): FeatureFileMap => {
                this.map[line] = item;

                return this;
            },
        });
    }

    get<T>(type: Constructor<T>) {
        return ({
            onLine: (line: number): T => {
                const found = this.map[line];

                if (! found) {
                    throw new Error(`Nothing was found on line ${ line }`);
                }

                if (! (found instanceof type))  {
                    throw new Error(`Item on line ${ line } is a ${ found.constructor.name }, not a ${ type.name }`);
                }

                return found as T;
            },
        });
    }
}
