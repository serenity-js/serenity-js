import 'mocha';

import { EventRecorder, expect } from '@integration/testing-tools';
import { Clock, Serenity } from '@serenity-js/core';
import { SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model';
import { Capabilities } from '@wdio/types';
import { RunnerStart } from '@wdio/types/build/Options';
import { PassThrough } from 'stream';

import { BrowserCapabilitiesReporter } from '../../../src/adapter/reporter';

describe('BrowserCapabilitiesReporter', () => {
    
    const 
        someTestStartEvent  = {},
        now                 = new Date(0),
        frozenClock         = new Clock(() => now);

    let browserDetector: BrowserCapabilitiesReporter,
        serenity: Serenity,
        recorder: EventRecorder;
    
    beforeEach(() => {

        serenity = new Serenity(frozenClock);
        recorder = new EventRecorder();

        serenity.configure({
            crew: [ recorder ]
        });

        browserDetector = new BrowserCapabilitiesReporter({
            serenity:       serenity,
            writeStream:    new PassThrough(), // nothing gets printed to writeStream as this is not a "real" WebdriverIO reporter
        });
    });

    describe('when working with a single browser/device', () => {

        it('records browser and platform tags when the test run starts and emits them upon start of the scenario', () => {
            
            // record tags
            browserDetector.emit('runner:start', runnerStart({
                isMultiremote: false,
                capabilities: {
                    browserName:        'Chrome Headless',
                    browserVersion:     '90.0.4430.212',
                    platformName:       'darwin',
                    platformVersion:    '20.4.0',
                },
            }));

            // pretend a new scenario has started
            const sceneId = serenity.assignNewSceneId();
            
            // trigger tag emission
            browserDetector.emit('test:start', someTestStartEvent);

            expect(recorder.events).to.have.lengthOf(2);
            expect(recorder.events[0]).to.equal(new SceneTagged(
                sceneId,
                new BrowserTag('Chrome Headless', '90.0.4430.212'),
                serenity.currentTime(),
            ));
            expect(recorder.events[1]).to.equal(new SceneTagged(
                sceneId,
                new PlatformTag('darwin', '20.4.0'),
                serenity.currentTime(),
            ));
        });

        it('emits the recorded tags whenever a new test scenario starts', () => {

            // record tags
            browserDetector.emit('runner:start', runnerStart({
                isMultiremote: false,
                capabilities: {
                    browserName:        'Chrome Headless',
                    browserVersion:     '90.0.4430.212',
                    platformName:       'darwin',
                    platformVersion:    '20.4.0',
                },
            }));

            // pretend first scenario has started
            const firstSceneId = serenity.assignNewSceneId();

            // trigger tag emission
            browserDetector.emit('test:start', someTestStartEvent);

            expect(recorder.events).to.have.lengthOf(2);
            expect(recorder.events[0]).to.equal(new SceneTagged(
                firstSceneId,
                new BrowserTag('Chrome Headless', '90.0.4430.212'),
                serenity.currentTime(),
            ));
            expect(recorder.events[1]).to.equal(new SceneTagged(
                firstSceneId,
                new PlatformTag('darwin', '20.4.0'),
                serenity.currentTime(),
            ));

            // pretend second scenario has started
            const secondSceneId = serenity.assignNewSceneId();

            // trigger tag emission again
            browserDetector.emit('test:start', someTestStartEvent);

            expect(recorder.events).to.have.lengthOf(4);
            expect(recorder.events[2]).to.equal(new SceneTagged(
                secondSceneId,
                new BrowserTag('Chrome Headless', '90.0.4430.212'),
                serenity.currentTime(),
            ));
            expect(recorder.events[3]).to.equal(new SceneTagged(
                secondSceneId,
                new PlatformTag('darwin', '20.4.0'),
                serenity.currentTime(),
            ));
        });
    });

    describe('when working with multiple browsers/devices', () => {

        it('emits only unique browser and platform tags', () => {

            // record tags
            browserDetector.emit('runner:start', runnerStart({
                isMultiremote: true,
                capabilities: {
                    AliceMac: {
                        browserName:        'Chrome Headless',
                        browserVersion:     '90.0.4430.212',
                        platformName:       'darwin',
                        platformVersion:    '20.4.0',
                    },
                    BenWindows: {
                        browserName:        'Chrome Headless',
                        browserVersion:     '90.0.4430.212',
                        os:                 'Windows',
                        os_version:         '10'
                    },
                    CindyMobile: {
                        deviceName:         'iPhone 6 Plus',
                        platformVersion:    '9.2',
                        platformName:       'iOS',
                        app:                'sauce-storage:myApp.app',
                    },
                },
            }));

            // pretend a new scenario has started
            const sceneId = serenity.assignNewSceneId();

            // trigger tag emission
            browserDetector.emit('test:start', someTestStartEvent);

            expect(recorder.events).to.have.lengthOf(5);
            expect(recorder.events[0]).to.equal(new SceneTagged(
                sceneId,
                new BrowserTag('Chrome Headless', '90.0.4430.212'),
                serenity.currentTime(),
            ));
            expect(recorder.events[1]).to.equal(new SceneTagged(
                sceneId,
                new PlatformTag('darwin', '20.4.0'),
                serenity.currentTime(),
            ));
            expect(recorder.events[2]).to.equal(new SceneTagged(
                sceneId,
                new PlatformTag('Windows', '10'),
                serenity.currentTime(),
            ));
            expect(recorder.events[3]).to.equal(new SceneTagged(
                sceneId,
                new BrowserTag('myApp.app', 'iPhone 6 Plus'),
                serenity.currentTime(),
            ));
            expect(recorder.events[4]).to.equal(new SceneTagged(
                sceneId,
                new PlatformTag('iOS', '9.2'),
                serenity.currentTime(),
            ));
        });
    });
});

type MultiremoteCapabilities = Record<string, Capabilities.DesiredCapabilities | Capabilities.W3CCapabilities>;

/**
 * Fixme: it looks like WDIO RunnerStart 7.4.2 implementation incorrectly defines MultiremoteCapabilities
 *  below is the correct representation of what the reporter actually receives
 */
type RunnerStartEvent = RunnerStart & { capabilities: Capabilities.DesiredCapabilities | Capabilities.W3CCapabilities | MultiremoteCapabilities }

function runnerStart(overrides: Partial<RunnerStartEvent>): RunnerStartEvent {
    return {
        cid: '0-0',
        isMultiremote: false,
        sessionId: 'fake-session-id',
        specs: [ '/path/to/fake.spec.ts' ],
        instanceOptions: undefined,
        capabilities: undefined,
        config: undefined,
        ...overrides
    };
}
