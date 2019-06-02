import { expect } from '@integration/testing-tools';
import { find } from './find';

describe('Interface', () => {

    it.only('should have a description', () => {
        const doc = find('longname', 'examples/Interface.ts~Interface');

        console.log('>>> Interface:', doc);
    });
});
