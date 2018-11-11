export interface Dictionary {
    [key: string]: any;
}

export function caseInsensitive<T extends Dictionary>(dictionary: T): T & Dictionary {
    return new Proxy(dictionary, {
        get: <K extends keyof T & string>(obj: T & Dictionary, key: K) => {
            const found = Object.keys(obj)
                .find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());

            return found && obj[found];
        },
    });
}

// todo: would this work for optional fields? parent.child.child.child -> undefined ?
