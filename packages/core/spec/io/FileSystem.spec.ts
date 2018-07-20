import * as fs from 'fs';
import * as mockfs from 'mock-fs';

import { FileSystem, Path } from '../../src/io';
import { expect } from '../expect';

describe ('FileSystem', () => {

    const
        image        = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=',
        imageBuffer  = new Buffer(image, 'base64'),
        originalJSON = { name: 'jan' },
        processCWD   = new Path('/Users/jan/projects/serenityjs');

    beforeEach(() => mockfs({ [processCWD.value]: {} }));
    afterEach (() => mockfs.restore());

    describe ('storing JSON files', () => {

        it ('stores a JSON file in a desired location', () => {
            const out = new FileSystem(processCWD);

            return out.store(new Path('outlet/some.json'), JSON.stringify(originalJSON)).then(absolutePath => {

                expect(fs.existsSync(absolutePath.value)).to.equal(true);
                expect(jsonFrom(absolutePath.value)).to.eql(originalJSON);
            });
        });

        it ('tells the absolute path to a JSON file once it is saved', () => {
            const out = new FileSystem(processCWD);
            const dest = new Path('outlet/some.json');

            return out.store(dest, JSON.stringify(originalJSON)).
                then(result => expect(result.equals(processCWD.resolve(dest))));
        });

        it ('complains when provided with an inaccessible path', () => {
            mockfs({ '/sys': mockfs.directory({
                mode: 400,
                items: {
                    dir: { /** empty directory */ },
                },
            })});

            const out = new FileSystem(new Path('/sys'));

            return expect(out.store(new Path('dir/file.json'), JSON.stringify(originalJSON)))
                .to.be.eventually.rejectedWith('EACCES, permission denied \'/sys/dir\'');
        });

        it ('complains when provided with an a path to a file that can\'t be overwritten', () => {
            mockfs({ '/sys': mockfs.directory({
                mode: 400,
                items: {
                    'file.json': mockfs.file({
                        mode: 400,
                        content: '',
                    }),
                },
            })});

            const out = new FileSystem(new Path('/sys'));

            return expect(out.store(new Path('file.json'), JSON.stringify(originalJSON)))
                .to.be.eventually.rejectedWith('EACCES, permission denied \'/sys/file.json\'');
        });
    });

    describe ('storing pictures', () => {

        it ('stores a base64-encoded picture at a desired location', () => {
            const out = new FileSystem(processCWD);

            return out.store(new Path('outlet/some.png'), imageBuffer).then(absolutePath => {
                expect(fs.existsSync(absolutePath.value)).to.equal(true);
                expect(pictureAt(absolutePath.value)).to.eql(image);
            });
        });

        it ('tells the absolute path to a JSON file once it is saved', () => {
            const out = new FileSystem(processCWD);
            const dest = new Path('outlet/some.png');

            return out.store(dest, imageBuffer).then(absolutePath => {
                expect(absolutePath.equals(processCWD.join(dest))).to.equal(true);
            });
        });
    });

    function jsonFrom(file: string) {
        return JSON.parse(fs.readFileSync(file).toString('ascii'));
    }

    function pictureAt(path: string) {
        return new Buffer(fs.readFileSync(path)).toString('base64');
    }
});
