import chai = require('chai');

var expect = chai.expect;

import {Recorder} from '../../lib/serenity/reporting/test_reports'
import {Test, TestResult} from "../../lib/serenity/domain";

describe('Test Recorder', () => {
    
    const 
        testStartedTime  = 1466606256001,
        testFinishedTime = 1466606256010;


    it('has no recordings to start with', () => {
        expect(new Recorder().recordings).to.deep.equal([]);
    });

    describe('Reporting on test lifecycle', () => {
        it('Captures the test result in the report', () => {
            let recorder = new Recorder();
            
            let test = new Test(
                'displaying_potential_failure_cause',
                'features.ShouldTellWhatBrokeTheBuild',
                'Displaying potential failure cause'
            );
            
            recorder.startARecordingOf(test, testStartedTime);
            recorder.recordResultOf(test, TestResult.Success, testFinishedTime);

            expect(recorder.recordings).to.have.length(1);

            let recording = recorder.recordings[0].toJSON();
            
            expect(recording.title).to.equal("Displaying potential failure cause");
            expect(recording.name).to.equal("displaying_potential_failure_cause");
            expect(recording.testCaseName).to.equal("features.ShouldTellWhatBrokeTheBuild");
            expect(recording.startTime).to.equal(testStartedTime);
            expect(recording.duration).to.equal(testFinishedTime - testStartedTime);
            expect(recording.manual).to.equal(false);
            expect(recording.result).to.equal("Success");

            // expect(recording.sessionId).to.equal("62f827eb-0194-d844-9646-c1b616bca7a8"),
            // expect(recording.driver).to.equal("firefox"),
        });
    });
});