import { describe, it } from 'mocha';

import { SerenityInstallationDetails, Version } from '../../src/io';
import { expect } from '../expect';

describe ('SerenityInstallationDetails', () => {

    it('can be instantiated from JSON', () => {
        const details = SerenityInstallationDetails.fromJSON({
            packages: {
                '@serenity-js/core': '3.17.0',
                '@serenity-js/cucumber': '3.17.0',
            },
            integrations: {
                '@cucumber/cucumber': '10.0.0',
            },
            updates: {
                '@serenity-js/core': '3.17.2',
                '@serenity-js/cucumber': '3.17.2',
            }
        });

        expect(details.packages.get('@serenity-js/core')).to.equal(new Version('3.17.0'));
        expect(details.packages.get('@serenity-js/cucumber')).to.equal(new Version('3.17.0'));
        expect(details.integrations.get('@cucumber/cucumber')).to.equal(new Version('10.0.0'));
        expect(details.updates.get('@serenity-js/core')).to.equal(new Version('3.17.2'));
        expect(details.updates.get('@serenity-js/cucumber')).to.equal(new Version('3.17.2'));
    });

    it('can be serialised and deserialised', () => {
        const details = SerenityInstallationDetails.fromJSON({
            packages: {
                '@serenity-js/core': '3.17.0',
                '@serenity-js/cucumber': '3.17.0',
            },
            integrations: {
                '@cucumber/cucumber': '10.0.0',
            },
            updates: {
                '@serenity-js/core': '3.17.2',
                '@serenity-js/cucumber': '3.17.2',
            }
        });

        expect(SerenityInstallationDetails.fromJSON(details.toJSON() as any)).to.equal(details);
    });

    it('complains if the JSON is missing `packages`', () => {
        expect(() => SerenityInstallationDetails.fromJSON({}))
            .to.throw('packages should be defined');
    });

    it('complains if the JSON is missing `integrations`', () => {
        expect(() => SerenityInstallationDetails.fromJSON({ packages: {} }))
            .to.throw('integrations should be defined');
    });

    it('complains if the JSON is missing `updates`', () => {
        expect(() => SerenityInstallationDetails.fromJSON({ packages: {}, integrations: {} }))
            .to.throw('updates should be defined');
    });
});