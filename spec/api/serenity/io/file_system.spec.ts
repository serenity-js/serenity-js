import * as fs from 'fs';
import * as mockfs from 'mock-fs';

import { FileSystem } from '../../../../src/serenity/io/file_system';

import expect = require('../../../expect');

describe ('FileSystem', () => {

    let image      = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=',
        imageBuffer = new Buffer(image, 'base64'),
        originalJSON = { name: 'jan' },
        processCWD   = '/Users/jan/projects/serenityjs';

    beforeEach(() => mockfs({ '/Users/jan/projects/serenityjs': {} }));
    afterEach (() => mockfs.restore());

    describe ('storing JSON files', () => {

        it ('stores a JSON file at a desired location', () => {
            let out = new FileSystem(processCWD);

            return out.store('outlet/some.json', JSON.stringify(originalJSON)).then(absolutePath => {

                expect(fs.existsSync(absolutePath)).to.be.true;
                expect(jsonFrom(absolutePath)).to.eql(originalJSON);
            });
        });

        it ('tells the absolute path to a JSON file once it is saved', () => {
            let out = new FileSystem(processCWD);

            return expect(out.store('outlet/some.json', JSON.stringify(originalJSON))).to.eventually.equal(`${processCWD}/outlet/some.json`);
        });

        it ('complains when provided with an empty path', () => {
            let out = new FileSystem(processCWD);

            return expect(out.store('', JSON.stringify(originalJSON))).to.eventually.be.rejectedWith('Please specify where the file should be saved');
        });

        it ('complains when provided with an inaccessible path', () => {
            mockfs({ '/sys': mockfs.directory({
                mode: 400,
                items: {
                    dir: { /** empty directory */ },
                },
            })});

            let out = new FileSystem('/sys');

            return expect(out.store('dir/file.json', JSON.stringify(originalJSON)))
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

            let out = new FileSystem('/sys');

            return expect(out.store('file.json', JSON.stringify(originalJSON)))
                .to.be.eventually.rejectedWith('EACCES, permission denied \'/sys/file.json\'');
        });
    });

    describe ('storing pictures', () => {

        it ('stores a base64-encoded picture at a desired location', () => {
            let out = new FileSystem(processCWD);

            return out.store('outlet/some.png', imageBuffer).then(absolutePath => {
                expect(fs.existsSync(absolutePath)).to.be.true;
                expect(pictureAt(absolutePath)).to.eql(image);
            });
        });

        it ('tells the absolute path to a JSON file once it is saved', () => {
            let out = new FileSystem(processCWD);

            return expect(out.store('outlet/some.png', imageBuffer)).to.eventually.equal(`${processCWD}/outlet/some.png`);
        });

        it ('complains when provided with an empty path', () => {
            let out = new FileSystem(processCWD);

            return expect(out.store('', imageBuffer)).to.eventually.be.rejectedWith('Please specify where the file should be saved');
        });

    });

    function jsonFrom(file: string) {
        return JSON.parse(fs.readFileSync(file).toString('ascii'));
    }

    function pictureAt(path: string) {
        let binary = fs.readFileSync(path);

        return new Buffer(binary).toString('base64');
    }
});
