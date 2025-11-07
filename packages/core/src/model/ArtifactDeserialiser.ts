import { LogicError } from '../errors';
import type { SerialisedArtifact } from './Artifact';
import type { Artifact } from './Artifact';
import * as artifacts from './artifacts';

export type ArtifactType = new (base64EncodedValue: string) => Artifact;

export class ArtifactDeserialiser {
    static fromJSON(o: SerialisedArtifact): Artifact {
        const
            recognisedTypes = Object.keys(artifacts),
            type            = this.typeOf(o.type);

        if (! type) {
            throw new LogicError(`
                Couldn't de-serialise artifact of an unknown type.
                ${o.type} is not one of the recognised types: ${recognisedTypes.join(', ')}
           `);
        }

        return new type(o.base64EncodedValue);
    }

    static typeOf(name: string): ArtifactType | undefined {
        const
            types = Object.keys(artifacts),
            type = types.find(constructorName => constructorName === name);

        return artifacts[type];
    }
}
