import sinon = require('sinon');
import expect = require('../../../expect');

import { Actor, BrowseTheWeb } from '../../../../src/screenplay-protractor';

import {
    ActivityOfInterest,
    Md5HashedPictureNames,
    Photographer,
    photographer,
    PictureNamingStrategy,
} from '../../../../src/serenity-protractor/stage/photographer';

import {
    Activity,
    ActivityFinished,
    ActivityStarts,
    Outcome,
    Photo,
    PhotoAttempted,
    PhotoReceipt,
    Result,
    Scene,
    SceneFinished,
    SceneStarts,
} from '../../../../src/serenity/domain';

import { TakeAPhoto, TimingBehaviour } from '../../../../src/serenity-protractor/stage/photographer-timing';
import { FileSystem } from '../../../../src/serenity/io/file_system';
import { Cast, Journal, Stage, StageManager } from '../../../../src/serenity/stage';

describe('Photographer', () => {

    const image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYAAzY3fKgAAAAASUVORK5CYII=',
          imageBuffer = new Buffer(image, 'base64');

    describe('with default configuration', () => {

        let thePhotographer: Photographer,
            stageManager: StageManager,
            stage: Stage,
            fileSystem: any,

            activity  = new Activity('Adds an item to the basket'),
            photoName = 'photo.png',
            photoPath = 'target/serenity/site/' + photoName,
            now       = 1469028588000;

        beforeEach( () => {
            fileSystem   = <any> sinon.createStubInstance(FileSystem);

            stageManager = new StageManager(new Journal());
            stage        = new Stage(stageManager);

            thePhotographer = new Photographer(
                new ActivityOfInterest(Result.Finished),
                new TimingBehaviour(new TakeAPhoto(), new TakeAPhoto()),
                fileSystem,
                new CallsEveryPhotoTheSame(photoName),
            );
        });

        class Actors implements Cast {
            actor(name: string): Actor {
                switch (name) {
                    case 'Basil':  return Actor.named(name).whoCan(BrowseTheWeb.using(fawltyBrowserThrowing(invalidSessionError)));
                    case 'Manuel': return Actor.named(name).whoCan(BrowseTheWeb.using(fawltyBrowserThrowing(unknownError)));
                    default:       return Actor.named(name).whoCan(BrowseTheWeb.using(fakeBrowserShowing(image)));
                }
            }
        }

        describe('When the show has started and there is an Actor in the spotlight', () => {

            beforeEach(() => {
                thePhotographer.assignTo(stage);

                stage.enter(new Actors());
                stage.theActorCalled('Sybil');
            });

            describe('When the Actor in the spotlight starts to perform an Activity', () => {

                it('Attempts to take a photo of what the Actor sees in their Browser', () => {

                    thePhotographer.notifyOf(new ActivityStarts(activity, now));

                    expect(stageManager.readTheJournal().pop()).to.be.instanceOf(PhotoAttempted);
                });

                it('Issues a Receipt for the Photo, with the same timestamp as the Activity concerned', () => {

                    thePhotographer.notifyOf(new ActivityStarts(activity, now));

                    let photoAttempted = stageManager.readTheJournal().pop();

                    expect(photoAttempted.timestamp).to.equal(now);
                    expect(photoAttempted.value).to.be.instanceOf(PhotoReceipt);
                    expect(photoAttempted.value.activity).to.deep.equal(activity);
                });

                it('Promises to tell the Stage Manager where they can collect the Photo when it\'s ready', () => {

                    fileSystem.store.withArgs(photoName, imageBuffer).returns(photoPath);

                    thePhotographer.notifyOf(new ActivityStarts(activity, now));

                    let photoAttempted = stageManager.readTheJournal().pop();

                    return expect(photoAttempted.value.photo).to.eventually.deep.equal(new Photo(photoPath));
                });

                it('Ignores any problems related to the Actor\'s browser not being ready to capture a screenshot', () => {

                    stage.theActorCalled('Basil');

                    thePhotographer.notifyOf(new ActivityStarts(activity, now));

                    let photoAttempted = stageManager.readTheJournal().pop();

                    return expect(photoAttempted.value.photo).to.eventually.be.undefined;
                });

                it('Reports any other problems that might occur', () => {

                    stage.theActorCalled('Manuel');

                    thePhotographer.notifyOf(new ActivityStarts(activity, now));

                    let photoAttempted = stageManager.readTheJournal().pop();

                    return expect(photoAttempted.value.photo).to.eventually.be.rejectedWith(unknownError);
                });
            });

            describe('When the Actor in the spotlight finished to perform an Activity', () => {

                describe('Attempts to take a photo of what the Actor sees in their Browser when the execution of their Activity:', () => {

                    it('finished with a Success', () => {

                        fileSystem.store.withArgs(photoName, imageBuffer).returns(photoPath);

                        thePhotographer.notifyOf(new ActivityFinished(new Outcome(activity, Result.SUCCESS), now));

                        let photoAttempted = stageManager.readTheJournal().pop();

                        expect(photoAttempted).to.be.instanceOf(PhotoAttempted);
                        expect(photoAttempted.timestamp).to.equal(now);

                        expect(photoAttempted.value).to.be.instanceOf(PhotoReceipt);
                        expect(photoAttempted.value.activity).to.deep.equal(activity);
                        return expect(photoAttempted.value.photo).to.eventually.deep.equal(new Photo(photoPath));
                    });

                    it('finished with a Failure', () => {

                        let failure = new Error('Expected the list of items to contain 5 items but it only had 4');

                        fileSystem.store.withArgs(photoName, imageBuffer).returns(photoPath);

                        thePhotographer.notifyOf(new ActivityFinished(new Outcome(activity, Result.FAILURE, failure), now));

                        let photoAttempted = stageManager.readTheJournal().pop();

                        expect(photoAttempted).to.be.instanceOf(PhotoAttempted);
                        expect(photoAttempted.timestamp).to.equal(now);

                        expect(photoAttempted.value).to.be.instanceOf(PhotoReceipt);
                        expect(photoAttempted.value.activity).to.deep.equal(activity);
                        return expect(photoAttempted.value.photo).to.eventually.deep.equal(new Photo(photoPath));
                    });

                    it('finished with an Error', () => {

                        let error = new Error('The element was not found');

                        fileSystem.store.withArgs(photoName, imageBuffer).returns(photoPath);

                        thePhotographer.notifyOf(new ActivityFinished(new Outcome(activity, Result.ERROR, error), now));

                        let photoAttempted = stageManager.readTheJournal().pop();

                        expect(photoAttempted).to.be.instanceOf(PhotoAttempted);
                        expect(photoAttempted.timestamp).to.equal(now);

                        expect(photoAttempted.value).to.be.instanceOf(PhotoReceipt);
                        expect(photoAttempted.value.activity).to.deep.equal(activity);
                        return expect(photoAttempted.value.photo).to.eventually.deep.equal(new Photo(photoPath));
                    });

                    it('was Compromised (by problems with 3rd party systems for example)', () => {

                        let error = new Error('Client database is offline');

                        fileSystem.store.withArgs(photoName, imageBuffer).returns(photoPath);

                        thePhotographer.notifyOf(new ActivityFinished(new Outcome(activity, Result.COMPROMISED, error), now));

                        let photoAttempted = stageManager.readTheJournal().pop();

                        expect(photoAttempted).to.be.instanceOf(PhotoAttempted);
                        expect(photoAttempted.timestamp).to.equal(now);

                        expect(photoAttempted.value).to.be.instanceOf(PhotoReceipt);
                        expect(photoAttempted.value.activity).to.deep.equal(activity);
                        return expect(photoAttempted.value.photo).to.eventually.deep.equal(new Photo(photoPath));
                    });
                });

                describe('Does not attempt to take photos of Activity that has never been performed because:', () => {

                    it('was Skipped', () => {

                        thePhotographer.notifyOf(new ActivityFinished(new Outcome(activity, Result.SKIPPED), now));

                        expect(stageManager.readTheJournal()).to.be.empty;
                    });

                    it('was Ignored', () => {

                        thePhotographer.notifyOf(new ActivityFinished(new Outcome(activity, Result.IGNORED), now));

                        expect(stageManager.readTheJournal()).to.be.empty;
                    });

                    it('is Pending', () => {

                        thePhotographer.notifyOf(new ActivityFinished(new Outcome(activity, Result.PENDING), now));

                        expect(stageManager.readTheJournal()).to.be.empty;
                    });
                });
            });

            it('is not interested in events other that the Start and Finish of an Activity', () => {

                let scene = new Scene('A user adds a product to their basket', 'Checkout', 'checkout.feature');

                thePhotographer.notifyOf(new SceneStarts(scene, now));
                thePhotographer.notifyOf(new SceneFinished(new Outcome(scene, Result.SUCCESS), now));

                expect(stageManager.readTheJournal()).to.be.empty;
            });
        });

        describe('When the show has not started', () => {

            it('Won\'t take a photo if there\'s no Cast on the Stage', () => {
                thePhotographer.assignTo(stage);

                thePhotographer.notifyOf(new ActivityStarts(activity));

                expect(stageManager.readTheJournal()).to.be.empty;
            });

            it('Won\'t take a photo unless there\'s an Actor in the spotlight', () => {
                thePhotographer.assignTo(stage);

                stage.enter(new Actors());

                thePhotographer.notifyOf(new ActivityStarts(activity));

                expect(stageManager.readTheJournal()).to.be.empty;
            });
        });

        describe('When there is nothing of interest', () => {

            it('Won\'t take a photo if the events it\'s notified of are not of interest', () => {
                thePhotographer.assignTo(stage);

                thePhotographer.notifyOf(new ActivityStarts(activity));

                expect(stageManager.readTheJournal()).to.be.empty;
            });
        });

        let invalidSessionError = new Error(
                'This driver instance does not have a valid session ID ' +
                '(did you call WebDriver.quit()?) and may no longer be used.'),
            unknownError = new Error('Something\'s probably gone wrong ¯\\_(ツ)_/¯');

        function fakeBrowserShowing(picture: string) {
            return <any> { takeScreenshot: ( () => Promise.resolve(picture) ) };
        }

        function fawltyBrowserThrowing(error: Error) {
            return <any> { takeScreenshot: ( () => { throw error; })};
        }

        class CallsEveryPhotoTheSame implements PictureNamingStrategy {

            constructor(private filename: string) {
            }

            nameFor(base64encodedData: string): string {
                return this.filename;
            }
        }
    });

    describe('PictureNamingStrategy', () => {

        describe('Md5HashedPictureNames', () => {

            it('gives a photo a name based on an MD5 hash of its contents', () => {

                let names = new Md5HashedPictureNames();

                expect(names.nameFor(image)).to.equal('e06827c6a8d3b787d15170da9e0aeeba');
            });

            it('appends a file extension if required', () => {

                let names = new Md5HashedPictureNames('png');

                expect(names.nameFor(image)).to.equal('e06827c6a8d3b787d15170da9e0aeeba.png');
            });
        });
    });

    describe('Easy instantiation', () => {

        describe('When assigning stage crew members in the protractor conf file', () => {

            it('can be instantiated using sensible defaults', () => {
                expect(photographer()).to.be.instanceOf(Photographer);
            });

            it('allows for the time of taking the screenshot to be overridden', () => {
                expect(Photographer.who(_ => _.takesPhotosOf(_.Failures))).to.be.instanceOf(Photographer);
            });

            it('allows for the time of taking the screenshot to be overridden', () => {
                expect(Photographer.who(_ => _.takesPhotosWhen(_.Activity_Finishes))).to.be.instanceOf(Photographer);
            });

            it('allows for path to the reports to be overridden', () => {
                expect(Photographer.who(_ => _.storesPhotosAt('/tmp/reports'))).to.be.instanceOf(Photographer);
            });
        });
    });
});
