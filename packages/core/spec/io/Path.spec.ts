import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Path } from '../../src/io/Path';
import { expect } from '../expect';

describe ('Path', () => {

    describe('when used across different operating systems', () => {
        const linuxPath = new Path(`features/search/full-text.feature`),
            windowsPath = new Path(`features\\search\\full-text.feature`);

        it('produces the same result no matter what path it\'s instantiated with', () => {
            expect(linuxPath).to.equal(windowsPath);
        });

        it('exposes the normalised path string', () => {
            expect(linuxPath.value).to.equal(windowsPath.value);
            expect(linuxPath.value).to.equal(`features/search/full-text.feature`);
        });

        it('splits the same', () => {
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

    given([
        { path: Path.from('../home'),       expected: '../home' },
        { path: Path.from('./home'),        expected: 'home'    },
        { path: Path.from('home'),          expected: 'home'    },
        { path: Path.from('file:///home'),  expected: '/home'    },
    ]).
    it('can be instantiated from a path segment', ({ path, expected }) => {
        expect(path.value).to.equal(expected);
    });

    it('can be instantiated from path segments', () => {
        const path = Path.from('/home', '..', 'users', 'jan', 'file.json');

        expect(path.value).to.equal('/users/jan/file.json');
    });

    it('can split an absolute path', () => {
        const p = new Path('/home/jan/directory/file.json');

        expect(p.split()).to.deep.equal([ 'home', 'jan', 'directory', 'file.json' ]);
    });

    it('can split a relative path', () => {
        const p = new Path('directory/file.json');

        expect(p.split()).to.deep.equal([ 'directory', 'file.json' ]);
    });

    it('can resolve two paths', () => {
        const
            p1 = new Path('/home/jan/documents'),
            p2 = new Path('../projects');

        expect(p1.resolve(p2).value).to.match(/([A-Z]:)?\/home\/jan\/projects$/);
    });

    describe('relative', () => {

        it('can resolve a relative path based on two absolute paths', () => {
            const
                p1 = new Path('/home/jan/documents'),
                p2 = new Path('/home/jan/documents/projects/serenity-js');

            expect(p1.relative(p2).value).to.match(/projects\/serenity-js$/);
        });

        it('can resolve a relative path based on two identical absolute paths', () => {
            const
                p1 = new Path('/home/jan/documents'),
                p2 = new Path('/home/jan/documents');

            expect(p1.relative(p2).value).to.equal('.');
        });

        it('can resolve an absolute path based on an absolute and relative path', () => {
            const
                p1 = new Path('/home/jan/documents'),
                p2 = new Path('.');

            expect(p1.resolve(p2).value).to.match(/([A-Z]:)?\/home\/jan\/documents$/);
        });
    });

    it('knows the root directory', () => {
        expect(new Path('/home/jan/documents').root()).to.equal(new Path('/'));
    });

    it(`knows if it's absolute or relative`, () => {
        expect(new Path('/home/jan/documents').isAbsolute()).to.equal(true);
        expect(new Path('documents').isAbsolute()).to.equal(false);
    });

    given(
        { description: 'file in a sub-directory',  path: new Path('/home/jan/file.json'),  expected: new Path('/home/jan') },
        { description: 'sub-directory',           path: new Path('/home/jan'),           expected: new Path('/home') },
        { description: 'root',                    path: new Path('/'),                   expected: new Path('/') },
    ).
    it('can tell the parent directory', ({ path, expected }) => {
        expect(path.directory()).to.equal(expected);
    });

    given(
        { description: 'file in a sub-directory',  path: new Path('/home/jan/file.json'),  expected: 'file.json' },
        { description: 'sub-directory',           path: new Path('/home/jan'),           expected: 'jan' },
        { description: 'root',                    path: new Path('/'),                   expected: '' },
    ).
    it('can tell the name of the directory in which the file lives', ({ path, expected }) => {
        expect(path.basename()).to.equal(expected);
    });

    given(
        { description: 'localhost',                                 url: 'file://localhost/etc/fstab',                                                              expected: '/etc/fstab' },
        { description: 'no host',                                   url: 'file:///etc/fstab',                                                                       expected: '/etc/fstab' },
        { description: 'Windows, no host',                          url: 'file:///c:/WINDOWS/clock.avi',                                                            expected: 'c:/WINDOWS/clock.avi' },
        { description: 'Windows, localhost, pipe instead of colon', url: 'file://localhost/c|/WINDOWS/clock.avi',                                                   expected: 'c:/WINDOWS/clock.avi' },
        { description: 'Windows, no host, pipe instead of colon',   url: 'file:///c|/WINDOWS/clock.avi',                                                            expected: 'c:/WINDOWS/clock.avi' },
        { description: 'Windows, localhost',                        url: 'file://localhost/c:/WINDOWS/clock.avi',                                                   expected: 'c:/WINDOWS/clock.avi' },
        { description: 'spaces in file name',                       url: 'file:///hostname/path/to/the%20file.txt',                                                 expected: '/hostname/path/to/the file.txt' },
        { description: 'Windows, spaces in file name',              url: 'file:///c:/path/to/the%20file.txt',                                                       expected: 'c:/path/to/the file.txt' },
        { description: 'Windows, spaces in directory name',         url: 'file:///C:/Documents%20and%20Settings/user/FileSchemeURIs.doc',                           expected: 'C:/Documents and Settings/user/FileSchemeURIs.doc' },
        { description: 'Windows, special characters',               url: 'file:///C:/caf%C3%A9/%C3%A5r/d%C3%BCnn/%E7%89%9B%E9%93%83/Ph%E1%BB%9F/%F0%9F%98%B5.exe',  expected: 'C:/café/år/dünn/牛铃/Phở/😵.exe' },
    ).
    it('can be instantiated from a file:// URI', ({ url, expected }) => {
        expect(Path.fromFileURL(new URL(url)).value).to.equal(expected);
    });

    given(
        { description: 'no host',                           path: '/etc/fstab',                                         expected: 'file:///etc/fstab' },
        { description: 'Windows, no host',                  path: 'c:/WINDOWS/clock.avi',                               expected: 'file:///c:/WINDOWS/clock.avi' },
        { description: 'spaces in file name',               path: '/hostname/path/to/the file.txt',                     expected: 'file:///hostname/path/to/the%20file.txt' },
        { description: 'Windows, backslashes',              path: 'c:\\path\\to\\file.txt',                             expected: 'file:///c:/path/to/file.txt' },
        { description: 'Windows, slashes',                  path: 'c:/path/to/file.txt',                                expected: 'file:///c:/path/to/file.txt' },
        { description: 'Windows, spaces in file name',      path: 'c:/path/to/the file.txt',                            expected: 'file:///c:/path/to/the%20file.txt' },
        { description: 'Windows, spaces in directory name', path: 'C:/Documents and Settings/user/FileSchemeURIs.doc',  expected: 'file:///C:/Documents%20and%20Settings/user/FileSchemeURIs.doc' },
        { description: 'Windows, special characters',       path: 'C:/café/år/dünn/牛铃/Phở/😵.exe',                     expected: 'file:///C:/caf%C3%A9/%C3%A5r/d%C3%BCnn/%E7%89%9B%E9%93%83/Ph%E1%BB%9F/%F0%9F%98%B5.exe' },
    ).
    it('can be converted to a file:// URI', ({ path, expected }) => {
        expect(Path.from(path).toFileURL().toString()).to.equal(expected);
    })

    it('complains when instantiated from URI with a non-file URI', () => {
        expect(() => {
            Path.fromFileURL(new URL('https://serenity-js.org/index.html'));
        }).to.throw(TypeError, `A Path can be created only from URLs that start with 'file://'. Received: https://serenity-js.org/index.html`)
    })
});