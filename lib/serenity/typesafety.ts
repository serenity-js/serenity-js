export interface InterfaceDescriptor {
    methodNames?: string[];
    propertyNames?: string[];
    className: string;
}

// todo: rename and cleanup
export class InterfaceChecker {
    static implements<T extends InterfaceDescriptor>(objectToCheck: Object, t: { new (): T; }): boolean {
        var targetInterfaceDescription = new t();

        (targetInterfaceDescription.methodNames || []).forEach((method) => {
            if (!objectToCheck[method] || typeof objectToCheck[method] !== 'function') {
                console.error(`Method: '${method}' not found on ${JSON.stringify(objectToCheck)}`);
                return false;
            }
        });

        (targetInterfaceDescription.propertyNames || []).forEach((property) => {
            if (!objectToCheck[property] || typeof objectToCheck[property] == 'function') {
                console.error(`Property: '${property}' not found on ${JSON.stringify(objectToCheck)}`);
                return false;
            }
        });

        return true;
    }
}

