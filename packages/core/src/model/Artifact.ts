import type { JSONObject } from 'tiny-types';
import { ensure, isDefined, isString, Predicate, TinyType } from 'tiny-types';

export interface SerialisedArtifact extends JSONObject {
    type: string;
    base64EncodedValue: string;
}

/**
 * @extends {tiny-types~TinyType}
 */
export abstract class Artifact extends TinyType {

    constructor(public readonly base64EncodedValue: string) {
        super();
        ensure(this.constructor.name, base64EncodedValue, isDefined(), isString(), looksLikeBase64Encoded());
    }

    abstract map<T>(fn: (decodedValue: any) => T): T;

    // todo: serialise on call
    toJSON(): SerialisedArtifact {
        return ({
            type: this.constructor.name,
            base64EncodedValue: this.base64EncodedValue,
        });
    }
}

function looksLikeBase64Encoded(): Predicate<string> {
    const regex = /^[\d+/=A-Za-z]+$/;

    return Predicate.to(`be base64-encoded`, (value: string) => regex.test(value));
}
