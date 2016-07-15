import sinon = require('sinon');
import expect = require('../../expect');

import { Actor, BrowseTheWeb } from '../../../src/screenplay-protractor';
import { Md5HashedPictureNames, Photographer, PictureNamingStrategy } from '../../../src/serenity-protractor/recording/photographer';
import { Screenshot } from '../../../src/serenity/domain/model';
import { FileSystemOutlet } from '../../../src/serenity/reporting/outlet';

describe('serenity-protractor.recording', () => {

    const image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=';

    describe('Photographer', () => {

        it('Takes a picture nameFor what an Actor sees in their Browser', () => {

            let pictureName     = 'picture.png',
                picturePath     = 'target/serenity/site/' + pictureName,
                outlet          = <any> sinon.createStubInstance(FileSystemOutlet);

            let photographer    = new Photographer(outlet, new DummyNamingStrategy(pictureName)),
                actor           = Actor.named('Claire').whoCan(BrowseTheWeb.using(fakeBrowserShowing(image)));

            outlet.sendPicture.withArgs(pictureName, image).returns(picturePath);

            return expect(photographer.photographWorkOf(actor)).to.eventually.eql(new Screenshot(picturePath));
        });

        function fakeBrowserShowing(picture: string) {
            return <any> { takeScreenshot: ( () => Promise.resolve(picture) ) };
        }

        class DummyNamingStrategy implements PictureNamingStrategy {

            constructor(private filename: string) {
            }

            nameFor(base64encodedData: string): string {
                return this.filename;
            }
        }
    });

    describe('PictureNamingStrategy', () => {

        describe('Md5HashedPictureNames', () => {

            it('gives a picture a name based on an MD5 hash of its contents', () => {

                let names = new Md5HashedPictureNames();

                expect(names.nameFor(image)).to.equal('e06827c6a8d3b787d15170da9e0aeeba');
            });

            it('appends a file extension if required', () => {

                let names = new Md5HashedPictureNames('png');

                expect(names.nameFor(image)).to.equal('e06827c6a8d3b787d15170da9e0aeeba.png');
            });
        });

    });
});
