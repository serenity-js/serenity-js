import type { Serenity } from '@serenity-js/core';
import { SceneTagged } from '@serenity-js/core/lib/events/index.js';
import type { Tag } from '@serenity-js/core/lib/model/index.js';
import Reporter from '@wdio/reporter';
import type { Capabilities, Options, Reporters } from '@wdio/types';

import { TagPrinter } from './TagPrinter.js';

/**
 * @package
 */
export class BrowserCapabilitiesReporter extends Reporter {

    private readonly tagPrinter = new TagPrinter();
    private readonly serenity: Serenity;

    private readonly tags: Tag[] = [];

    constructor (options: Partial<Reporters.Options> & { serenity: Serenity }) {
        super({ ...options, stdout: false });

        this.serenity = options.serenity;

        this.on('runner:start', BrowserCapabilitiesReporter.prototype.recordBrowserAndPlatformTags.bind(this));
        this.on('test:start',   BrowserCapabilitiesReporter.prototype.emitRecordedTags.bind(this));
    }

    private recordBrowserAndPlatformTags(event: Options.RunnerStart) {
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
