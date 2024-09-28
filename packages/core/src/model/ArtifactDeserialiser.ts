import { TinyType } from 'tiny-types';

import { LogicError } from '../errors';
import type { Artifact, SerialisedArtifact } from './Artifact';
import { HTTPRequestResponse, JSONData, LogEntry, Photo, TestReport, TextData } from './artifacts';

export type ArtifactType = new (base64EncodedValue: string) => Artifact;

export abstract class ArtifactDeserialiser extends TinyType {
    private static readonly supportedTypes: Record<string, { new (name: string): Artifact }> = [
        HTTPRequestResponse,
        JSONData,
        LogEntry,
        Photo,
        TestReport,
        TextData,
    ].
    // eslint-disable-next-line unicorn/consistent-function-scoping
    reduce((acc, current)=> ({
        ...acc,
        [ current.name ]: current,
    }), {});

    static fromJSON(o: SerialisedArtifact): Artifact {
        const type = ArtifactDeserialiser.ofType(o.type);

        if (! type) {
            throw new LogicError(`
                Couldn't de-serialise artifact of an unknown type.
                ${ o.type } is not one of the recognised types: ${ Object.keys(this.supportedTypes).join(', ')}
           `);
        }

        return new type(o.base64EncodedValue);
    }

    static ofType(name: string): ArtifactType | undefined {
        return this.supportedTypes[name];
    }
}
