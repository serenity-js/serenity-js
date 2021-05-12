import 'mocha';

import { given } from 'mocha-testdata';

import { Path } from '../../src/io';
import { expect } from '../expect';

describe ('Path', () => {

    describe('when used across different operating systems', () => {
        const linuxPath = new Path(`features/search/full-text.feature`),
            windowsPath = new Path(`features\\search\\full-text.feature`);

        /** @test {Path} */
        it('produces the same result no matter what path it\'s instantiated with', () => {
            expect(linuxPath).to.equal(windowsPath);
        });

        /** @test {Path} */
        it('exposes the normalised path string', () => {
            expect(linuxPath.value).to.equal(windowsPath.value);
            expect(linuxPath.value).to.equal(`features/search/full-text.feature`);
        });

        /** @test {Path} */
        it('splits the same', () => {
            expect(linuxPath.split()).to.deep.equal([
                'features',
                'search',
                'full-text.feature',
            ]);
            expect(linuxPath.split()).to.deep.equal(windowsPath.split());
        });
    });

    /** @test {Path} */
    it('can be serialised and deserialised', () => {
        const path = new Path('/home/jan/file.json');

        expect(Path.fromJSON(path.toJSON() as string)).to.equal(path);
    });

    /** @test {Path} */
    it('can join path components into a single path', () => {
        const
            p1 = new Path('/home/jan'),
            p2 = new Path('file.json');

        expect(p1.join(p2)).to.equal(new Path('/home/jan/file.json'));
    });

    given([
        { path: Path.from('../home'),   expected: '../home' },
        { path: Path.from('./home'),    expected: 'home'    },
        { path: Path.from('home'),      expected: 'home'    },
    ]).
    it('can be instantiated from a path segment', ({ path, expected }) => {
        expect(path.value).to.equal(expected);
    });

    /** @test {Path} */
    it('can be instantiated from path segments', () => {
        const path = Path.from('/home', '..', 'users', 'jan', 'file.json');

        expect(path.value).to.equal('/users/jan/file.json');
    });

    /** @test {Path} */
    it('can split an absolute path', () => {
        const p = new Path('/home/jan/directory/file.json');

        expect(p.split()).to.deep.equal([ 'home', 'jan', 'directory', 'file.json' ]);
    });

    /** @test {Path} */
    it('can split a relative path', () => {
        const p = new Path('directory/file.json');

        expect(p.split()).to.deep.equal([ 'directory', 'file.json' ]);
    });

    /** @test {Path} */
    it('can resolve two paths', () => {
        const
            p1 = new Path('/home/jan/documents'),
            p2 = new Path('../projects');

        expect(p1.resolve(p2).value).to.match(/([A-Z]:)?\/home\/jan\/projects$/);
    });

    /** @test {Path} */
    it('knows the root directory', () => {
        expect(new Path('/home/jan/documents').root()).to.equal(new Path('/'));
    });

    /** @test {Path} */
    it(`knows if it's absolute or relative`, () => {
        expect(new Path('/home/jan/documents').isAbsolute()).to.equal(true);
        expect(new Path('documents').isAbsolute()).to.equal(false);
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
