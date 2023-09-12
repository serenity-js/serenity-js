import { expect } from '@integration/testing-tools';
import type { Capabilities, Reporters } from '@wdio/types';
import EventEmitter from 'events';
import { describe, it } from 'mocha';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { default as adapter, type WebdriverIOConfig } from '../src/index.js';

describe('@serenity-js/wdio-cucumber-framework', () => {

    const
        cid = '0-0',
        specURIs = [ pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), `examples`, `features`, `passing.feature`)).toString() ],
        capabilities: Capabilities.RemoteCapability = { browserName: 'chrome' };

    it('correctly loads and runs test scenarios', async () => {

        const config: WebdriverIOConfig = {
            capabilities: [ capabilities ],
            cucumberOpts: {
                require: [
                    '**/step_definitions/steps.cjs'
                ]
            }
        };
        const baseReporter = new FakeBaseReporter();

        const instance: {
            hasTests: () => boolean,
            run: () => Promise<number>
        } = await adapter.init(cid, config, specURIs, capabilities, baseReporter);

        expect(instance.hasTests()).to.equal(true);

        const failureCount = await instance.run();

        expect(failureCount).to.equal(0);
    });
});

// https://github.com/webdriverio/webdriverio/blob/main/packages/wdio-runner/src/reporter.ts#L127
// eslint-disable-next-line unicorn/prefer-event-target
class FakeBaseReporter extends EventEmitter {
    public output = '';
    public _reporters = [];

    getWriteStreamObject(reporter: string) {
        return {
            write: (content: string): void => {
                this.output += content;
            }
        };
    }

    _loadReporter(reporter: Reporters.ReporterEntry): any {
        const
            ReporterClass = reporter[0],
            options = reporter[1];

        return new ReporterClass({
            ...options,
            writeStream: this.getWriteStreamObject(ReporterClass.name)
        });
    }
}