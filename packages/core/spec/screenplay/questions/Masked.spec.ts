import { beforeEach, describe, it } from 'mocha';

import type { Actor} from '../../../src';
import { actorCalled } from '../../../src';
import { Masked } from '../../../src';
import { expect } from '../../expect';

describe('Masked', () => {

    let Fiona: Actor;

    beforeEach(() => {
        Fiona = actorCalled('Fiona');
    });

    afterEach(async () => {
        await Fiona.dismiss()
    });

    it('should return the sensitive value when answered by an actor', async () => {
        const sensitiveValue = 'your_masked_value';
        const answer = await Masked.valueOf(sensitiveValue).answeredBy(Fiona);
        expect(answer).to.equal(sensitiveValue);
    });

    it('should return masked value in description when using valueOf', async () => {
        const sensitiveValue = 'your_masked_value';
        const maskedDescription =  Masked.valueOf(sensitiveValue).toString();
        expect(maskedDescription).to.equal('[a masked value]');
    });

});
