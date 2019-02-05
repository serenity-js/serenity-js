import 'mocha';
import { given } from 'mocha-testdata';

import { Path } from '../../src/io';
import { expect } from '../expect';

/** @test {Path} */
describe ('Path', () => {

    describe('when used across different operating systems', () => {
        const linuxPath = new Path(`features/search/full-text.feature`),
            windowsPath = new Path(`features\\search\\full-text.feature`);

        it(`produces the same result no matter what path it's instantiated with`, () => {
            expect(linuxPath).to.equal(windowsPath);
        });

        it(`exposes the normalised path string`, () => {
            expect(linuxPath.value).to.equal(windowsPath.value);
            expect(linuxPath.value).to.equal(`features/search/full-text.feature`);
        });

        it(`splits the same`, () => {
            expect(linuxPath.split()).to.deep.equal([
                'features',
                'search',
                'full-text.feature',
            ]);
            expect(linuxPath.split()).to.deep.equal(windowsPath.split());
        });
    });

    it('can be serialised and deserialised', () => {
        const path = new Path('/home/jan/file.json');

        expect(Path.fromJSON(path.toJSON() as string)).to.equal(path);
    });

    it('can join path components into a single path', () => {
        const
            p1 = new Path('/home/jan'),
            p2 = new Path('file.json');

        expect(p1.join(p2)).to.equal(new Path('/home/jan/file.json'));
    });

    it('can resolve two paths', () => {
        const
            p1 = new Path('/home/jan/documents'),
            p2 = new Path('../projects');

        expect(p1.resolve(p2)).to.equal(new Path('/home/jan/projects'));
    });

    given(
        { description: 'file in a sub-directory', path: new Path('/home/jan/file.json'), expected: new Path('/home/jan') },
        { description: 'sub-directory',           path: new Path('/home/jan'),           expected: new Path('/home') },
        { description: 'root',                    path: new Path('/'),                   expected: new Path('/') },
    ).
    it('can tell the parent directory', ({ path, expected }) => {
        expect(path.directory()).to.equal(expected);
    });

    given(
        { description: 'file in a sub-directory', path: new Path('/home/jan/file.json'), expected: 'file.json' },
        { description: 'sub-directory',           path: new Path('/home/jan'),           expected: 'jan' },
        { description: 'root',                    path: new Path('/'),                   expected: '' },
    ).
    it('can tell the name of the directory in which the file lives', ({ path, expected }) => {
        expect(path.basename()).to.equal(expected);
    });
});
