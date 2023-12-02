import { expect } from '@integration/testing-tools';
import { ConfigurationError } from '@serenity-js/core';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Photographer, TakePhotosOfFailures, TakePhotosOfInteractions } from '../../../../src';

describe('Photographer', () => {

    it('can be instantiated from JSON configuration (via Serenity/JS ModuleLoader)', () => {
        const photographer = Photographer.fromJSON({ strategy: 'TakePhotosOfInteractions' });

        expect(photographer).to.be.instanceOf(Photographer);
        expect((photographer as any).photoTakingStrategy).to.be.instanceOf(TakePhotosOfInteractions);
    });

    given([
        { description: 'no config',     config: undefined   },
        { description: 'empty config',  config: { }         },
    ]).
    it('defaults to taking photos of failures', ({ config }) => {
        const photographer = Photographer.fromJSON(config);

        expect(photographer).to.be.instanceOf(Photographer);
        expect((photographer as any).photoTakingStrategy).to.be.instanceOf(TakePhotosOfFailures);
    });

    it('complains when the provided strategy is not valid', () => {
        expect(() => {
            Photographer.fromJSON({ strategy: 'Invalid' } as any);
        }).to.throw(ConfigurationError, `'Invalid' is not an available PhotoTakingStrategy, available strategies: TakePhotosBeforeAndAfterInteractions, TakePhotosOfFailures, TakePhotosOfInteractions.`);
    });
});
