import { describe, it } from 'mocha';

import { FileSystem, Path } from '../../src/io';
import { expect } from '../expect';
import { FakeFS } from '../FakeFS';

describe ('FileSystem', () => {

    const image        = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=';
    const imageBuffer  = Buffer.from(image, 'base64');
    const originalJSON = { name: 'jan' };
    const processCWD   = new Path('/Users/jan/projects/serenityjs');

    describe('when checking if a file exists', () => {
        it('returns false when no file exists at path', () => {
            const fs = FakeFS.with({
                [ processCWD.value ]: FakeFS.Empty_Directory,
            });
            const out = new FileSystem(processCWD, fs);

            expect(out.exists(new Path('outlet/some.json'))).to.equal(false);
        });

        it('returns true when a file exists at path', () => {
            const fs = FakeFS.with({
                [ processCWD.value ]: {
                    'file.txt': 'content'
                },
            });
            const out = new FileSystem(processCWD, fs);

            expect(out.exists(new Path('file.txt'))).to.equal(true);
        });

        it('returns true when a directory exists at path', () => {
            const fs = FakeFS.with({
                [ processCWD.value ]: {
                    'mydir': FakeFS.Empty_Directory
                },
            });
            const out = new FileSystem(processCWD, fs);

            expect(out.exists(new Path('mydir'))).to.equal(true);
        });
    });

    describe ('when storing JSON files', () => {

        it ('stores a JSON file in a desired location', async () => {
            const fs = FakeFS.with({
                [ processCWD.value ]: FakeFS.Empty_Directory,
            });
            const out = new FileSystem(processCWD, fs);

            const absolutePath = await out.store(new Path('outlet/some.json'), JSON.stringify(originalJSON));

            expect(fs.existsSync(absolutePath.value)).to.equal(true);
            expect(jsonFrom(fs.readFileSync(absolutePath.value))).to.eql(originalJSON);
        });

        it ('tells the absolute path to a JSON file once it is saved', async () => {
            const fs = FakeFS.with({
                [ processCWD.value ]: FakeFS.Empty_Directory,
            });
            const out = new FileSystem(processCWD, fs);
            const destination = new Path('outlet/some.json');

            const result = await out.store(destination, JSON.stringify(originalJSON))

            expect(result.equals(processCWD.resolve(destination)));
        });

        it (`complains when the file can't be written`, async () => {
            const fs = FakeFS.with(FakeFS.Empty_Directory);

            (fs as any).promises.writeFile = () => { // memfs doesn't support mocking error conditions or permissions
                return Promise.reject(new Error('EACCES, permission denied'));
            };

            const out = new FileSystem(new Path('/'), fs);

            await expect(out.store(new Path('dir/file.json'), JSON.stringify(originalJSON)))
                .to.be.eventually.rejectedWith('EACCES, permission denied');
        });
    });

    describe ('when storing pictures', () => {

        it ('stores a base64-encoded picture at a desired location', async () => {
            const fs = FakeFS.with({
                [ processCWD.value ]: FakeFS.Empty_Directory,
            });
            const out = new FileSystem(processCWD, fs);

            const absolutePath = await out.store(new Path('outlet/some.png'), imageBuffer);

            expect(fs.existsSync(absolutePath.value)).to.equal(true);
            expect(pictureAt(fs.readFileSync(absolutePath.value))).to.eql(image);
        });

        it ('tells the absolute path to a JSON file once it is saved', async () => {
            const fs = FakeFS.with({
                [ processCWD.value ]: FakeFS.Empty_Directory,
            });
            const out = new FileSystem(processCWD, fs);
            const destination = new Path('outlet/some.png');

            const absolutePath = await out.store(destination, imageBuffer);

            const expected = processCWD.join(destination).value;
            expect(absolutePath.value).to.match(new RegExp('([A-Z]:)?' + expected + '$'));
        });
    });

    describe('when reading files', () => {

        describe('synchronously', () => {

            it('returns the contents', async () => {
                const fs = FakeFS.with({
                    [processCWD.value]: {
                        'file.txt': 'contents'
                    },
                });
                const out = new FileSystem(processCWD, fs);

                const result = out.readFileSync(new Path('file.txt'), { encoding: 'utf8' });

                expect(result).to.equal('contents');
            });
        });

        describe('asynchronously', () => {

            it('returns a Promise of the contents', async () => {
                const fs = FakeFS.with({
                    [processCWD.value]: {
                        'file.txt': 'contents'
                    },
                });
                const out = new FileSystem(processCWD, fs);

                const result = await out.readFile(new Path('file.txt'), { encoding: 'utf8' });

                expect(result).to.equal('contents');
            });
        });
    });

    describe('when writing files', () => {

        describe('synchronously', () => {

            it('writes the contents', async () => {

                const fs = FakeFS.with({
                    [processCWD.value]: { },
                });
                const out = new FileSystem(processCWD, fs);

                const absolutePathToFile = out.writeFileSync(new Path('file.txt'), 'contents', { encoding: 'utf8' });

                expect(absolutePathToFile).to.equal(processCWD.resolve(new Path('file.txt')));
            });
        });

        describe('asynchronously', () => {

            it('writes the contents', async () => {
                const fs = FakeFS.with({
                    [processCWD.value]: { },
                });
                const out = new FileSystem(processCWD, fs);

                const absolutePathToFile = await out.writeFile(new Path('file.txt'), 'contents', { encoding: 'utf8' });

                expect(absolutePathToFile).to.equal(processCWD.resolve(new Path('file.txt')));
            });
        });
    });

    describe ('when removing', () => {

        describe('individual files', () => {

            it('removes the file', async () => {
                const fs = FakeFS.with({
                    [processCWD.value]: {
                        outlet: {
                            subdir: {
                                'file-to-be-deleted.json': '{}',
                                'file-not-to-be-deleted.json': '{}',
                            },
                        },
                    },
                });
                const out = new FileSystem(processCWD, fs);

                await out.remove(new Path('outlet/subdir/file-to-be-deleted.json'));

                expect(fs.existsSync(processCWD.join(new Path('outlet/subdir/file-to-be-deleted.json')).value)).to.equal(false);
                expect(fs.existsSync(processCWD.join(new Path('outlet/subdir/file-not-to-be-deleted.json')).value)).to.equal(true);
            });

            it(`doesn't complain if the file doesn't exist anymore`, async () => {
                const fs = FakeFS.with({
                    [processCWD.value]: { },
                });
                const out = new FileSystem(processCWD, fs);

                await expect(out.remove(new Path('non-existent.tmp'))).to.be.fulfilled;
            });
        });

        describe('directories', () => {

            it('removes the directory recursively', async () => {
                const fs = FakeFS.with({
                    [processCWD.value]: {
                        outlet: {
                            subdir: {
                                'file-to-be-deleted.json': '{}',
                            },
                            another: {
                                'file-not-to-be-deleted.json': '{}',
                            },
                        },
                    },
                });
                const out = new FileSystem(processCWD, fs);

                await out.remove(new Path('outlet/subdir'))

                expect(fs.existsSync(processCWD.join(new Path('outlet/subdir/file-to-be-deleted.json')).value)).to.equal(false);
                expect(fs.existsSync(processCWD.join(new Path('outlet/subdir')).value)).to.equal(false);
                expect(fs.existsSync(processCWD.join(new Path('outlet/another/file-not-to-be-deleted.json')).value)).to.equal(true);
            });
        });
    });

    describe('when generating temporary directory', () => {

        const fs = FakeFS.with({
            '/var/tmp': { },
        });
        const os = { tmpdir: () => '/var/tmp' };
        const out = new FileSystem(processCWD, fs, os as any);

        it('creates a randomly-named sub-directory under OS tmp when no prefix is provided', () => {

            const result = out.temporaryDirectory().value;

            expect(result).to.match(/\/var\/tmp\/[\da-z]+/);
        });

        it('creates a randomly-named sub-directory under OS tmp when the prefix is empty', () => {

            const result = out.temporaryDirectory('').value;

            expect(result).to.match(/\/var\/tmp\/[\da-z]+/);
        });

        it('creates a prefixed randomly-named sub-directory under OS tmp when a prefix is provided', () => {

            const result = out.temporaryDirectory('serenity-').value;

            expect(result).to.match(/\/var\/tmp\/serenity-[\da-z]+/);
        });

        it('allows for the filename to be appended to the result', () => {

            const outputFile = Path.from('output.tmp');
            const result = out.temporaryDirectory('serenity-').join(outputFile).value;

            expect(result).to.match(/\/var\/tmp\/serenity-[\da-z]+\/output\.tmp/);
        });
    });
});

function jsonFrom(file: Buffer) {
    return JSON.parse(file.toString('ascii'));
}

function pictureAt(file: Buffer) {
    return Buffer.from(file).toString('base64');
}
