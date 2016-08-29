import * as fs from 'fs';
import * as mockfs from 'mock-fs';

import { FileSystem } from '../../../src/serenity/stage_crew/file_system';

import expect = require('../../expect');

describe('FileSystemOutlet', () => {

    let image      = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=',
        imageBuffer = new Buffer(image, 'base64'),
        originalJSON = { name: 'jan' },
        processCWD   = '/Users/jan/projects/serenityjs';

    beforeEach(() => mockfs({ '/Users/jan/projects/serenityjs': {} }));
    afterEach (() => mockfs.restore());

    describe('storing JSON files', () => {

        it('stores a JSON file at a desired location', () => {
            let out = new FileSystem(processCWD);

            return out.store('outlet/some.json', JSON.stringify(originalJSON)).then((absolutePath) => {

                expect(fs.existsSync(absolutePath)).to.be.true;
                expect(jsonFrom(absolutePath)).to.eql(originalJSON);
            });
        });

        it('tells the absolute path to a JSON file once it is saved', () => {
            let out = new FileSystem(processCWD);

            return expect(out.store('outlet/some.json', JSON.stringify(originalJSON))).to.eventually.equal(`${processCWD}/outlet/some.json`);
        });

        it('complains when provided with a rubbish path', () => {
            let out = new FileSystem(processCWD);

            return expect(out.store('', JSON.stringify(originalJSON))).to.eventually.be.rejectedWith('Please specify where the file should be saved');
        });

    });

    describe('storing pictures', () => {

        it('stores a base64-encoded picture at a desired location', () => {
            let out = new FileSystem(processCWD);

            return out.store('outlet/some.png', imageBuffer).then((absolutePath) => {
                expect(fs.existsSync(absolutePath)).to.be.true;
                expect(pictureAt(absolutePath)).to.eql(image);
            });
        });

        it('tells the absolute path to a JSON file once it is saved', () => {
            let out = new FileSystem(processCWD);

            return expect(out.store('outlet/some.png', imageBuffer)).to.eventually.equal(`${processCWD}/outlet/some.png`);
        });

        it('complains when provided with a rubbish path', () => {
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
