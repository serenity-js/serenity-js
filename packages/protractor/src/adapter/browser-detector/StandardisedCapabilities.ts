import { Capabilities, ProtractorBrowser } from 'protractor';

/**
 * @private
 */
export class StandardisedCapabilities {
    static of(currentBrowser: () => ProtractorBrowser): StandardisedCapabilities {
        return new StandardisedCapabilities(currentBrowser);
    }

    constructor(private currentBrowser: () => ProtractorBrowser) {
    }

    browserName(): Promise<string | undefined> {
        return this.get(
            caps => caps.get('browserName'),
        );
    }

    async browserVersion(): Promise<string | undefined> {
        const version = await this.get(
            caps => caps.get('version'),
            caps => caps.get('browserVersion'),
            caps => caps.has('deviceManufacturer') && caps.has('deviceModel')
                ? `${ caps.get('deviceManufacturer') } ${ caps.get('deviceModel') }`
                : undefined,
            caps => caps.has('mobile') && caps.get('mobile').version,
        );

        const suffix = await this.get(
            caps => !! caps.get('mobileEmulationEnabled') && '(mobile emulation)',
        );

        return [
            version,
            suffix,
        ].filter(_ => !!_).join(' ');
    }

    platformName(): Promise<string | undefined> {
        return this.get(
            caps => (!! caps.get('platformName') && ! /any/i.test(caps.get('platformName')))
                ? caps.get('platformName')
                : caps.get('platform'),
        );
    }

    platformVersion(): Promise<string | undefined> {
        return this.get(
            caps => caps.get('platformVersion'),
        );
    }

    private async get(...fetchers: Array<(capabilities: Capabilities) => string>): Promise<string | undefined> {
        const capabilities = await this.currentBrowser().getCapabilities();

        for (const fetcher of fetchers) {
            const result = fetcher(capabilities);
            if (result) {
                return result;
            }
        }

        return undefined;   // eslint-disable-line unicorn/no-useless-undefined
    }
}
