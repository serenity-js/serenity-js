import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, TestSuiteFinished, TestSuiteStarts } from '@serenity-js/core/lib/events';
import { Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { jasmine } from '../src/jasmine';

describe('@serenity-js/jasmine', function () {

    it('detects the filesystem location of a test suite and individual specs', () => jasmine('examples/location.spec.js')
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(TestSuiteStarts,         event => {
                    expect(event.details.name).to.equal(new Name('Jasmine'));
                    expect(event.details.location.path.value).to.match(/location.spec.js$/);
                    expect(event.details.location.line).to.equal(1);
                    expect(event.details.location.column).to.equal(1);
                })
                .next(TestSuiteStarts,         event => {
                    expect(event.details.name).to.equal(new Name('Detecting file system location'));
                    expect(event.details.location.path.value).to.match(/location.spec.js$/);
                    expect(event.details.location.line).to.equal(3);
                    expect(event.details.location.column).to.equal(5);
                })
                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('Detecting file system location works for both the suites and the individual specs'));
                    expect(event.details.location.path.value).to.match(/location.spec.js$/);
                    expect(event.details.location.line).to.equal(5);
                    expect(event.details.location.column).to.equal(9);
                })
                .next(SceneFinished,       event => {
                    expect(event.details.name).to.equal(new Name('Detecting file system location works for both the suites and the individual specs'));
                    expect(event.details.location.path.value).to.match(/location.spec.js$/);
                    expect(event.details.location.line).to.equal(5);
                    expect(event.details.location.column).to.equal(9);
                })
                .next(TestSuiteFinished,   event => {
                    expect(event.details.name).to.equal(new Name('Detecting file system location'));
                    expect(event.details.location.path.value).to.match(/location.spec.js$/);
                    expect(event.details.location.line).to.equal(3);
                    expect(event.details.location.column).to.equal(5);
                })
                .next(TestSuiteFinished,   event => {
                    expect(event.details.name).to.equal(new Name('Jasmine'));
                    expect(event.details.location.path.value).to.match(/location.spec.js$/);
                    expect(event.details.location.line).to.equal(1);
                    expect(event.details.location.column).to.equal(1);
                })
            ;
        }));
});
