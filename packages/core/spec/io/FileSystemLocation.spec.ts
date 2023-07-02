import { describe } from 'mocha';
import { given } from 'mocha-testdata';
import type { JSONObject } from 'tiny-types';

import { FileSystemLocation, Path } from '../../src/io';
import { expect } from '../expect';

describe ('FileSystemLocation', () => {

    const path = new Path('/home/jan/file.json');

    given(
        { description: 'no line or column',                     location: new FileSystemLocation(path)          },
        { description: 'line available',                        location: new FileSystemLocation(path, 10)      },
        { description: 'line and column available available',   location: new FileSystemLocation(path, 10, 3)   },
    ).
    it('can be serialised and deserialised', ({ location }) => {
        expect(FileSystemLocation.fromJSON(location.toJSON() as JSONObject))
            .to.equal(location);
    });
});
