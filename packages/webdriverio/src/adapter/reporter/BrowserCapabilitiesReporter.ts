import { Serenity } from '@serenity-js/core';
import { SceneTagged } from '@serenity-js/core/lib/events/index.js';
import { Tag } from '@serenity-js/core/lib/model/index.js';
import { RunnerStats } from '@wdio/reporter'
// Todo: correct import when we move to WDIO v8
// eslint-disable-next-line @typescript-eslint/no-var-requires
import reporter from '@wdio/reporter';
import { Capabilities, Reporters } from '@wdio/types';

import { TagPrinter } from './TagPrinter.js';

/**
 * @package
 */
export class BrowserCapabilitiesReporter extends reporter.default {

    private readonly tagPrinter = new TagPrinter();
    private readonly serenity: Serenity;

    private readonly tags: Tag[] = [];

    constructor (options: Partial<Reporters.Options> & { serenity: Serenity }) {
        super({ ...options, stdout: false });

        this.serenity = options.serenity;
    }

    onRunnerStart(runner: RunnerStats): void {
        this.recordBrowserAndPlatformTags(runner);
    }

    onTestStart(): void {
        this.emitRecordedTags();
    }

    private recordBrowserAndPlatformTags(event: RunnerStats) {
        const tags = event.isMultiremote
            ? this.tagsForAll(event.capabilities as unknown as Record<string, Capabilities.DesiredCapabilities | Capabilities.W3CCapabilities>)  // fixme: WDIO MultiremoteCapabilities seem to have incorrect definition?
            : this.tagPrinter.tagsFor(event.capabilities)

        this.tags.push(...tags);
    }

    private tagsForAll(capabilities: Record<string, Capabilities.DesiredCapabilities | Capabilities.W3CCapabilities>): Tag[] {
        return Object.keys(capabilities)
            .reduce((existingTags, entryName) => {

                const newTags       = this.tagPrinter.tagsFor(capabilities[entryName]);
                const uniqueNewTags = newTags.filter(tag => ! existingTags.some((existingTag: Tag) => existingTag.equals(tag)));

                return [
                    ...existingTags,
                    // todo: maybe add some additional tag to indicate the custom capability name,
                    //  or the fact that it's a multi-remote scenario?
                    ...uniqueNewTags,
                ];
            }, []);
    }

    private emitRecordedTags() {
        this.tags.forEach(tag => {
            this.serenity.announce(
                new SceneTagged(
                    this.serenity.currentSceneId(),
                    tag,
                    this.serenity.currentTime(),
                )
            )
        })
    }
}
