import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { ScreenplayTemplate } from '../../../src/server/context/index.js';
import type { ImportManifest } from '../../../src/server/schema.js';

describe('ScreenplayTemplate', () => {

    const imports: ImportManifest = {
        '@serenity-js/web': [ 'Navigate' ],
    }

    describe('error handling', () => {

        given([
            { description: 'empty', value: '', expected: 'ScreenplayTemplate value should not be blank' },
            { description: 'undefined', value: undefined, expected: 'ScreenplayTemplate value should be a string' },
        ]).
        it('complains when given an empty template', ({ value, expected }) => {
            expect(() => new ScreenplayTemplate(imports, value))
                .to.throw(Error, expected);
        });
    });

    describe('with no parameters', () => {

        const noParameters = {};

        it('compiles to the template itself', () => {
            const input = 'Navigate.forward()';

            const template = new ScreenplayTemplate(imports, input)
            const compiled = template.compile(noParameters);

            expect(compiled.imports.toJSON()).to.deep.equal(imports);
            expect(compiled.value).to.equal(input);
        });
    });

    describe('with parameters', () => {

        it('substitutes token for static parameters', () => {
            const input = 'Navigate.to($url)';
            const parameters = {
                url: 'https://example.org',
            };
            const expected = `Navigate.to('${ parameters.url }')`;

            const template = new ScreenplayTemplate(imports, input)
            const compiled = template.compile(parameters);

            expect(compiled.imports.toJSON()).to.equal(imports);
            expect(compiled.value).to.equal(expected);
        });

        it('substitutes token for answerable parameters', () => {
            const input = 'Navigate.to($url)';
            const parameters = {
                url: {
                    imports: {
                        '@serenity-js/assertions': [ 'startsWith' ],
                        '@serenity-js/web': [ 'Page' ],
                    },
                    question: `Page.whichName(startsWith('Pop-up window')).url().href`
                },
            };
            const expected = `Navigate.to(${ parameters.url.question })`;

            const template = new ScreenplayTemplate(imports, input)
            const compiled = template.compile(parameters);

            expect(compiled.imports.toJSON()).to.deep.equal({
                '@serenity-js/web': [ 'Navigate', 'Page' ],
                '@serenity-js/assertions': [ 'startsWith' ],
            });
            expect(compiled.value).to.equal(expected);
        });

        it('ignores extra parameters', () => {
            const input = 'Navigate.to($url)';
            const parameters = {
                url: 'https://example.org',
                extra: 'value'
            };
            const expected = `Navigate.to('https://example.org')`;

            const template = new ScreenplayTemplate(imports, input)
            const compiled = template.compile(parameters);

            expect(compiled.imports.toJSON()).to.equal(imports);
            expect(compiled.value).to.equal(expected);
        });
    });

    describe('with missing parameters', () => {

        it('complains if a required parameter is missing', () => {
            const input = 'Navigate.to($url, $second)';
            const parameters = {
                url: 'https://example.org',
            };

            const template = new ScreenplayTemplate(imports, input)
            expect(() => template.compile(parameters))
                .to.throw(Error, `Cannot compile the 'Navigate.to($url, $second)' template, $second parameter is missing`)
        });

    });
});
