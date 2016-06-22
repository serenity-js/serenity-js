import chai = require('chai');

var expect = chai.expect;

import {Recorder} from '../../lib/serenity/reporting/test_reports'
import {Test, Result, Step} from "../../lib/serenity/domain";

describe('Test Recorder', () => {
    
    const 
        testStartedTime  = 1466606256001,
        testFinishedTime = 1466606256010,
        test = new Test(
            'Adding an item to an empty list',
            '/fake/path/to/scenario/add_new_items.feature'
        ),
        step        = new Step('Given James adds "Buy a coffee" to his todo list'),
        anotherStep = new Step('Then James adds "Buy some milk" to his todo list'),
        nestedStep  = new Step('Given James enters "Buy some milk" into the input box');


    it('has no recordings to start with', () => {
        
    });

    describe('TestRecording the test lifecycle', () => {
        it('Starts with no recordings', () => {
            expect(new Recorder().recordings).to.deep.equal([]);    
        })
        
        it('Gives access to the recordings', () => {
            let recorder = new Recorder();

            recorder.startARecordingOf(test, testStartedTime);
            recorder.recordResultOf(test, Result.SUCCESS, testFinishedTime);

            expect(recorder.recordings).to.have.length(1);
        });
        
        it('Allows for each recording to be exported as JSON', () => {
            let recorder = new Recorder();
            
            recorder.startARecordingOf(test, testStartedTime);
            recorder.recordResultOf(test, Result.SUCCESS, testFinishedTime);

            let recording = recorder.recordings[0].toJSON();
            
            expect(recording.title)         .to.equal(test.title);
            expect(recording.name)          .to.equal(test.scenarioName);
            expect(recording.testCaseName)  .to.equal(test.testCaseName);
            expect(recording.startTime)     .to.equal(testStartedTime);
            expect(recording.duration)      .to.equal(testFinishedTime - testStartedTime);
            expect(recording.manual)        .to.equal(false);
            expect(recording.result)        .to.equal(Result[Result.SUCCESS]);

            // todo: capture sessionId and the driver information
            // expect(recording.sessionId).to.equal("62f827eb-0194-d844-9646-c1b616bca7a8"),
            // expect(recording.driver).to.equal("firefox"),
        });
        
        it('Records a single test step', () => {
            let recorder = new Recorder(),
                stepStartedAt  = testStartedTime + 1,
                stepFinishedAt = testStartedTime + 4;

            recorder.startARecordingOf(test, testStartedTime);
            recorder.recordStep(step, stepStartedAt);
            recorder.recordStepResultOf(step, Result.SUCCESS, stepFinishedAt);
            recorder.recordResultOf(test, Result.SUCCESS, testFinishedTime);

            let recording = recorder.recordings[0].toJSON();

            expect(recording.testSteps).to.deep.equal([{
                description: step.name,
                duration:    stepFinishedAt - stepStartedAt,
                startTime:   stepStartedAt,
                result:      Result[Result.SUCCESS],
                children:    []
            }]);
        });

        it('Records multiple test steps', () => {
            let recorder = new Recorder(),
                firstStepStarted   = testStartedTime + 1,
                firstStepFinished  = testStartedTime + 3,
                secondStepStarted  = testStartedTime + 4,
                secondStepFinished = testStartedTime + 8;

            recorder.startARecordingOf(test, testStartedTime);

            recorder.recordStep(step, firstStepStarted);
            recorder.recordStepResultOf(step, Result.SUCCESS, firstStepFinished);

            recorder.recordStep(anotherStep, secondStepStarted);
            recorder.recordStepResultOf(anotherStep, Result.SUCCESS, secondStepFinished);

            recorder.recordResultOf(test, Result.SUCCESS, testFinishedTime);

            let recording = recorder.recordings[0].toJSON();

            expect(recording.testSteps).to.deep.equal([{
                description: step.name,
                duration:    firstStepFinished - firstStepStarted,
                startTime:   firstStepStarted,
                result:      Result[Result.SUCCESS],
                children:    []
            }, {
                description: anotherStep.name,
                duration:    secondStepFinished - secondStepStarted,
                startTime:   secondStepStarted,
                result:      Result[Result.SUCCESS],
                children:    []
            }]);
        });

        it('Records nested steps', () => {
            let recorder = new Recorder(),
                firstStepStarted   = testStartedTime + 1,
                nestedStepStarted  = testStartedTime + 3,
                nestedStepFinished = testStartedTime + 4,
                firstStepFinished  = testStartedTime + 8;

            recorder.startARecordingOf(test, testStartedTime);

            recorder.recordStep        (step,       firstStepStarted);

            recorder.recordStep        (nestedStep, nestedStepStarted);
            recorder.recordStepResultOf(nestedStep, Result.SUCCESS, nestedStepFinished);

            recorder.recordStepResultOf(step,       Result.SUCCESS, firstStepFinished);

            recorder.recordResultOf(test, Result.SUCCESS, testFinishedTime);

            let recording = recorder.recordings[0].toJSON();

            expect(recording.testSteps).to.deep.equal([{
                description: step.name,
                duration:    firstStepFinished - firstStepStarted,
                startTime:   firstStepStarted,
                result:      Result[Result.SUCCESS],
                children: [{
                    description: nestedStep.name,
                    duration:    nestedStepFinished - nestedStepStarted,
                    startTime:   nestedStepStarted,
                    result:      Result[Result.SUCCESS],
                    children:    []
                }]
            }]);
        })
    });
});