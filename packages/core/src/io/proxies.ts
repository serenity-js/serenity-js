export interface Dictionary {
    [key: string]: any;
}

/**
 * @private
 */
export function caseInsensitive<T extends Dictionary>(dictionary: T): T & Dictionary {
    return new Proxy(dictionary, {
        get: <K extends keyof T & string>(obj: T & Dictionary, key: K) => {
            const found = Object.keys(obj)
                .find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());

            return found && obj[found];
        },
    });
}
