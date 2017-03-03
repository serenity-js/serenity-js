import expect = require('../../expect');

import * as webdriver from 'selenium-webdriver';

import { keyNameOf } from '../../../src/serenity-protractor/keys';

describe('Protractor', () => {

    describe ('keyNameOf', () => {

        it ('should determine the name of the key pressed', () => {
            expect(keyNameOf(webdriver.Key.ENTER)).to.equal('ENTER');
        });

        it ('should return the name of the searched for key, if it could not be found', () => {
            expect(keyNameOf('unknown-key')).to.equal('unknown-key');
        });
    });
});
