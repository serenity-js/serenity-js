import {FileSystemOutlet} from '../../../src/serenity/reporting/outlet';
import * as chai from 'chai';
import * as fs from 'fs';
import * as mockfs from 'mock-fs';

import sinon_chai = require('sinon-chai');
import chai_as_promised = require('chai-as-promised');

const expect = chai.expect;

chai.use(<any> sinon_chai);
chai.use(<any> chai_as_promised);

describe('FileSystemOutlet', () => {

    let picture      = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=',
        originalJSON = { name: 'jan' },
        processCWD   = '/Users/jan/projects/serenityjs';

    beforeEach(() => mockfs({ '/Users/jan/projects/serenityjs': {} }));
    afterEach (() => mockfs.restore());

    describe('JSON files', () => {

        it('stores a JSON file at a desired location', () => {
            let out = new FileSystemOutlet(processCWD);

            return out.sendJSON('outlet/some.json', originalJSON).then((absolutePath) => {

                expect(fs.existsSync(absolutePath)).to.be.true;
                expect(jsonFrom(absolutePath)).to.eql(originalJSON);
            });
        });

        it('tells the absolute path to a JSON file once it is saved', () => {
            let out = new FileSystemOutlet(processCWD);

            return expect(out.sendJSON('outlet/some.json', originalJSON)).to.eventually.equal(`${processCWD}/outlet/some.json`);
        });

        it('complains when provided with a rubbish path', () => {
            let out = new FileSystemOutlet(processCWD);

            return expect(out.sendJSON('', originalJSON)).to.eventually.be.rejectedWith('Please specify where the file should be saved.');
        });

    });

    describe('Pictures', () => {

        it('stores a base64-encoded picture at a desired location', () => {
            let out = new FileSystemOutlet(processCWD);

            return out.sendPicture('outlet/some.png', picture).then((absolutePath) => {
                expect(fs.existsSync(absolutePath)).to.be.true;
                expect(pictureAt(absolutePath)).to.eql(picture);
            });
        });

        it('tells the absolute path to a JSON file once it is saved', () => {
            let out = new FileSystemOutlet(processCWD);

            return expect(out.sendPicture('outlet/some.png', picture)).to.eventually.equal(`${processCWD}/outlet/some.png`);
        });

        it('complains when provided with a rubbish path', () => {
            let out = new FileSystemOutlet(processCWD);

            return expect(out.sendPicture('', picture)).to.eventually.be.rejectedWith('Please specify where the file should be saved.');
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
