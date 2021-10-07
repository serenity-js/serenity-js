import { expect } from '@integration/testing-tools';
import { describe } from 'mocha';

import { by } from '../../../src';

/**
 * @test {by}
 * @test {ElementLocations}
 */
describe('by', () => {

    describe('css', () => {

        it('produces a human-readable description', () => {
            const description = by.css('ui li.active').toString();

            expect(description).to.equal('by css "ui li.active"')
        });
    });

    describe('id', () => {

        it('produces a human-readable description', () => {
            const description = by.id('password-input').toString();

            expect(description).to.equal('by id #password-input')
        });
    });

    describe('linkText', () => {

        it('produces a human-readable description', () => {
            const description = by.linkText('register').toString();

            expect(description).to.equal('by link text "register"')
        });
    });

    describe('partialLinkText', () => {

        it('produces a human-readable description', () => {
            const description = by.partialLinkText('unsubscribe from').toString();

            expect(description).to.equal('by partial link text "unsubscribe from"')
        });
    });

    describe('tagName', () => {

        it('produces a human-readable description', () => {
            const description = by.tagName('input').toString();

            expect(description).to.equal('by tag name <input />')
        });
    });

    describe('xPath', () => {

        it('produces a human-readable description', () => {
            const description = by.xPath('div//button').toString();

            expect(description).to.equal('by XPath div//button')
        });
    });
});
