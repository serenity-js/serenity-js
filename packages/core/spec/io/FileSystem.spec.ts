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
                dest = new Path('outlet/some.json');

            return expect(out.store(dest, JSON.stringify(originalJSON))).to.be.fulfilled.
                then(result => expect(result.equals(processCWD.resolve(dest))));
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
                dest = new Path('outlet/some.png');

            return expect(out.store(dest, imageBuffer)).to.be.fulfilled.then(absolutePath => {
                const expected = processCWD.join(dest).value;
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

    function jsonFrom(file: Buffer) {
        return JSON.parse(file.toString('ascii'));
    }

    function pictureAt(file: Buffer) {
        return Buffer.from(file).toString('base64');
    }
});
