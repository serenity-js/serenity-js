import { ensure, isDefined, isString, Predicate, TinyType } from 'tiny-types';

export type Base64EncodedString = string;

export class Photo extends TinyType {

    constructor(public readonly value: Base64EncodedString) {
        super();
        ensure(Photo.name, value, isDefined(), isString(), looksLikeBase64Encoded());
    }
}

function looksLikeBase64Encoded(): Predicate<string> {
    const regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;

    return Predicate.to(`be an ISO-8601-compliant date`, (value: string) => regex.test(value));
}
