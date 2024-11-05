import type { Tag } from '@serenity-js/core/lib/model/index.js';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model/index.js';
import type { Capabilities } from '@wdio/types';

/**
 * @package
 */
export class TagPrinter {
    tagsFor(capability: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): Tag[] {
        const desiredCapabilities = this.desired(capability);

        return [
            this.browserTagFor(desiredCapabilities),
            this.platformTagFor(desiredCapabilities),
        ];
    }

    private browserTagFor(capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): Tag {
        return new BrowserTag(
            this.browserNameFrom(capabilities),
            this.browserVersionFrom(capabilities),
        );
    }

    private platformTagFor(capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): Tag {
        return new PlatformTag(
            this.platformNameFrom(capabilities),
            this.platformVersionFrom(capabilities),
        );
    }

    private browserNameFrom(capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): string {
        return capabilities['browserName']
            || capabilities['browser']
            || (capabilities['appium:app'] && capabilities['appium:app'].replace('sauce-storage:', ''))
            || 'unknown';
    }

    private browserVersionFrom(capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): string | undefined {
        return capabilities['deviceName']          // mobile web
            || capabilities['appium:deviceName']
            || capabilities['browserVersion']      // W3C format
            || capabilities['version']             // JSONWP format
            || capabilities['browser_version'];    // BrowserStack
    }

    private platformNameFrom(capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): string {
        return capabilities['platformName']
            || capabilities['appium:platformName']
            || capabilities['platform']
            || capabilities['os']
            || 'unknown';
    }

    private platformVersionFrom(capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): string | undefined {
        return capabilities['appium:platformVersion']
            || capabilities['os_version'];
    }

    private desired(capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): WebdriverIO.Capabilities {
        return this.isW3C(capabilities)
            ? capabilities.alwaysMatch
            : capabilities;
    }

    private isW3C(capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities): capabilities is Capabilities.W3CCapabilities {
        return Boolean(capabilities['alwaysMatch']);
    }
}
