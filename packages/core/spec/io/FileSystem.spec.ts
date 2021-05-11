import 'mocha';

import { FileSystem, Path } from '../../src/io';
import { expect } from '../expect';
import { FakeFS } from '../FakeFS';

/** @test {FileSystem} */
describe ('FileSystem', () => {

    const
        image        = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=',
        imageBuffer  = Buffer.from(image, 'base64'),
        originalJSON = { name: 'jan' },
        processCWD   = new Path('/Users/jan/projects/serenityjs');

    describe ('when storing JSON files', () => {

        it ('stores a JSON file in a desired location', () => {
            const
                fs = FakeFS.with({
                    [ processCWD.value ]: FakeFS.Empty_Directory,
                }),
                out = new FileSystem(processCWD, fs);

            return expect(out.store(new Path('outlet/some.json'), JSON.stringify(originalJSON))).to.be.fulfilled.then(absolutePath => {
                expect(fs.existsSync(absolutePath.value)).to.equal(true);
                expect(jsonFrom(fs.readFileSync(absolutePath.value))).to.eql(originalJSON);
            });
        });

        it ('tells the absolute path to a JSON file once it is saved', () => {
            const
                fs = FakeFS.with({
                    [ processCWD.value ]: FakeFS.Empty_Directory,
                }),
                out = new FileSystem(processCWD, fs),
                destination = new Path('outlet/some.json');

            return expect(out.store(destination, JSON.stringify(originalJSON))).to.be.fulfilled.
                then(result => expect(result.equals(processCWD.resolve(destination))));
        });

        it (`complains when the file can't be written`, () => {
            const fs = FakeFS.with(FakeFS.Empty_Directory);

            (fs as any).writeFile = () => { // memfs doesn't support mocking error conditions or permissions
                throw new Error('EACCES, permission denied');
            };

            const out = new FileSystem(new Path('/'), fs);

            return expect(out.store(new Path('dir/file.json'), JSON.stringify(originalJSON)))
                .to.be.eventually.rejectedWith('EACCES, permission denied');
        });
    });

    describe ('when storing pictures', () => {

        it ('stores a base64-encoded picture at a desired location', () => {
            const
                fs = FakeFS.with({
                    [ processCWD.value ]: FakeFS.Empty_Directory,
                }),
                out = new FileSystem(processCWD, fs);

            return expect(out.store(new Path('outlet/some.png'), imageBuffer)).to.be.fulfilled.then(absolutePath => {
                expect(fs.existsSync(absolutePath.value)).to.equal(true);
                expect(pictureAt(fs.readFileSync(absolutePath.value))).to.eql(image);
            });
        });

        it ('tells the absolute path to a JSON file once it is saved', () => {
            const
                fs = FakeFS.with({
                    [ processCWD.value ]: FakeFS.Empty_Directory,
                }),
                out = new FileSystem(processCWD, fs),
                destination = new Path('outlet/some.png');

            return expect(out.store(destination, imageBuffer)).to.be.fulfilled.then(absolutePath => {
                const expected = processCWD.join(destination).value;
                expect(absolutePath.value).to.match(new RegExp('([A-Z]:)?' + expected + '$'));
            });
        });
    });

    describe ('when removing', () => {

        describe('individual files', () => {

            it('removes the file', () => {
                const
                    fs = FakeFS.with({
                        [processCWD.value]: {
                            outlet: {
                                subdir: {
                                    'file-to-be-deleted.json': '{}',
                                    'file-not-to-be-deleted.json': '{}',
                                },
                            },
                        },
                    }),
                    out = new FileSystem(processCWD, fs);

                return expect(out.remove(new Path('outlet/subdir/file-to-be-deleted.json'))).to.be.fulfilled.then(() => {

                    expect(fs.existsSync(processCWD.join(new Path('outlet/subdir/file-to-be-deleted.json')).value)).to.equal(false);
                    expect(fs.existsSync(processCWD.join(new Path('outlet/subdir/file-not-to-be-deleted.json')).value)).to.equal(true);
                });
            });

            it(`doesn't complain if the file doesn't exist anymore`, () => {
                const
                    fs = FakeFS.with({
                        [processCWD.value]: {
                        },
                    }),
                    out = new FileSystem(processCWD, fs);

                return expect(out.remove(new Path('non-existent.tmp'))).to.be.fulfilled;
            });
        });

        describe('directories', () => {

            it('removes the directory recursively', () => {
                const
                    fs = FakeFS.with({
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
                    }),
                    out = new FileSystem(processCWD, fs);

                return expect(out.remove(new Path('outlet/subdir'))).to.be.fulfilled.then(() => {

                    expect(fs.existsSync(processCWD.join(new Path('outlet/subdir/file-to-be-deleted.json')).value)).to.equal(false);
                    expect(fs.existsSync(processCWD.join(new Path('outlet/subdir')).value)).to.equal(false);
                    expect(fs.existsSync(processCWD.join(new Path('outlet/another/file-not-to-be-deleted.json')).value)).to.equal(true);
                });
            });
        });
    });

    describe('when generating temp file paths', () => {

        const
            fs = FakeFS.with({
                '/var/tmp': { },
            }),
            os = { tmpdir: () => '/var/tmp' },
            out = new FileSystem(processCWD, fs, os as any);

        it('uses a randomly generated file name and .tmp suffix', () => {

            expect(out.tempFilePath().value).to.match(/\/var\/tmp\/[\da-z]+\.tmp/);
        });

        it('allows for the prefix to be overridden', () => {

            expect(out.tempFilePath('serenity-').value).to.match(/\/var\/tmp\/serenity-[\da-z]+\.tmp/);
        });

        it('allows for the suffix to be overridden', () => {

            expect(out.tempFilePath('serenity-', '.out').value).to.match(/\/var\/tmp\/serenity-[\da-z]+\.out/);
        });
    });
});

function jsonFrom(file: Buffer) {
    return JSON.parse(file.toString('ascii'));
}

function pictureAt(file: Buffer) {
    return Buffer.from(file).toString('base64');
}
