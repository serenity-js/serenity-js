import { Serialised } from 'tiny-types';

import { Artifact, FileType } from '../../src/io';
import { Name } from '../../src/model';
import { expect } from '../expect';

describe ('Artifact', () => {

    it('can be serialised and deserialised', () => {

        const artifact = new Artifact(
            new Name('report'),
            FileType.JSON,
            { some: 'report '},
        );

        expect(Artifact.fromJSON(artifact.toJSON() as Serialised<Artifact<any>>)).to.equal(artifact);
    });
});
