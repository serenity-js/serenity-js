import { describe, it } from 'mocha';

import { asyncMap } from '../../src/io';
import { expect } from '../expect';

/** @test {asyncMap} */
describe('asyncMap', () => {

    const items = [ 'a', 'b', 'c' ];

    it('should map elements of a list using a synchronous function', async () => {
        const mapped: string[] = await asyncMap(items, item => item.toUpperCase());

        expect(mapped).to.deep.equal([ 'A', 'B', 'C' ])
    });

    it('should map elements of a list using an async function', async () => {
        const mapped: string[] = await asyncMap(items, item => Promise.resolve(item.toUpperCase()));

        expect(mapped).to.deep.equal([ 'A', 'B', 'C' ])
    });

    it('should map elements of a list one by one', async () => {
        const callOrder = [];

        await asyncMap(items, item => {
            callOrder.push(item);
            return Promise.resolve(item);
        });

        expect(callOrder).to.deep.equal([ 'a', 'b', 'c' ])
    });
});
