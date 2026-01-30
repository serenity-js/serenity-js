import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { FileFinder, Path } from '../../src/io';
import { expect } from '../expect';

describe('FileFinder', () => {

    const cwd = Path.from(__dirname, 'finder-examples');
    let finder: FileFinder;

    beforeEach(() => {
        finder = new FileFinder(cwd);
    });

    given([
        null,
        undefined
    ]).
    it('returns an empty list when given an undefined pattern', (pattern: any) => {
        expect(finder.filesMatching(pattern)).to.deep.equal([])
    });

    it(`returns an empty list when the pattern provided doesn't match any files`, () => {
        expect(finder.filesMatching('non-existent.txt')).to.deep.equal([])
    });

    it('returns a list with an exact match', () => {
        const matches = finder.filesMatching('file1.txt');

        expect(matches).to.have.lengthOf(1);
        expect(matches[0]).to.equal(cwd.join(Path.from('file1.txt')));
    });

    it('returns a list with exact matches', () => {
        const matches = finder.filesMatching([ 'file1.txt', 'file2.txt' ]);

        expect(matches).to.have.lengthOf(2);
        expect(matches[0]).to.equal(cwd.join(Path.from('file1.txt')));
        expect(matches[1]).to.equal(cwd.join(Path.from('file2.txt')));
    });

    it('supports glob patterns', () => {
        const matches = finder.filesMatching([ 'file*.txt' ]);

        expect(matches).to.have.lengthOf(2);
        expect(matches[0]).to.equal(cwd.join(Path.from('file1.txt')));
        expect(matches[1]).to.equal(cwd.join(Path.from('file2.txt')));
    });

    it('supports globstar patterns', () => {
        const matches = finder.filesMatching([ '**/file*.txt' ]);

        expect(matches).to.have.lengthOf(4);
        expect(matches[0]).to.equal(cwd.join(Path.from('file1.txt')));
        expect(matches[1]).to.equal(cwd.join(Path.from('file2.txt')));
        expect(matches[2]).to.equal(cwd.join(Path.from('nested/file3.txt')));
        expect(matches[3]).to.equal(cwd.join(Path.from('nested/file4.txt')));
    });
})
