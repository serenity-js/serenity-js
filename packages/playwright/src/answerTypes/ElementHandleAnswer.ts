import { ElementHandle } from 'playwright';

export const extend = (eh: ElementHandle): ElementHandleAnswer => {
    const newObject: ElementHandleAnswer = Object.create(eh);
    if (!Object.getPrototypeOf(newObject)) {
        Object.setPrototypeOf(newObject, Object.getPrototypeOf({}));
    }
    newObject.isExisting = () => Boolean(eh);
    return newObject;
};

export interface ElementHandleAnswer extends ElementHandle {
    isExisting(): boolean;
}
