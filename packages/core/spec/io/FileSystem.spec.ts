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

    describe ('storing JSON files', () => {

        it ('stores a JSON file in a desired location', () => {
            const
                fs = FakeFS.with({
                    [ processCWD.value ]: FakeFS.Empty_Directory,
                }),
                out = new FileSystem(processCWD, fs);

            return out.store(new Path('outlet/some.json'), JSON.stringify(originalJSON)).then(absolutePath => {

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

            return out.store(dest, JSON.stringify(originalJSON)).
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

    describe ('storing pictures', () => {

        it ('stores a base64-encoded picture at a desired location', () => {
            const
                fs = FakeFS.with({
                    [ processCWD.value ]: FakeFS.Empty_Directory,
                }),
                out = new FileSystem(processCWD, fs);

            return out.store(new Path('outlet/some.png'), imageBuffer).then(absolutePath => {
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

            return out.store(dest, imageBuffer).then(absolutePath => {
                expect(absolutePath.equals(processCWD.join(dest))).to.equal(true);
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
