import { expect } from '@integration/testing-tools';
import { ConfigurationError } from '@serenity-js/core';
import { beforeEach, describe, it } from 'mocha';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { ScreenplaySchematics } from '../../../src/server/context/index.js';

describe('Schematics', () => {

    describe('SchematicFactory', () => {

        let schematics: ScreenplaySchematics;

        beforeEach(() => {
            schematics = new ScreenplaySchematics({
                namespace: 'serenity',
                moduleName: 'web',
                type: 'Activity',
            });
        });

        describe('toolName', () => {

            it('is based on the namespace, module name and de-camel cased template', () => {
                const result = schematics.create({
                    template: 'DoubleClick.me()',
                });

                expect(result.toolName).to.equal('serenity_web_double_click_me');
            });

            it('ignores parameter names in the template', () => {
                const result = schematics.create({
                    template: 'Drag.element($element).andDrop($dropZone)',
                    type: 'Activity',
                });

                expect(result.toolName).to.equal('serenity_web_drag_element_and_drop');
            });
        });

        describe('className', () => {

            it('is based on the class name derived from the template', () => {

                const result = schematics.create({
                    template: 'Navigate.to($url)',
                    type: 'Activity',
                });

                expect(result.className).to.equal('Navigate');
            });
        })

        describe('title', () => {
            it('is based on the template', () => {
                const result = schematics.create({
                    template: 'Navigate.reloadPage()',
                    type: 'Activity',
                });

                expect(result.title).to.equal('Navigate.reloadPage()');
            });

            it('includes parameter names for parameterised templates', () => {
                const result = schematics.create({
                    template: 'Drag.element($element).andDrop($dropZone)',
                    type: 'Activity',
                });

                expect(result.title).to.equal('Drag.element(element).andDrop(dropZone)');
            });
        });

        describe('description', () => {
            it('can be set explicitly', () => {
                const result = schematics.create({
                    template: 'Navigate.reloadPage()',
                    description: 'Reload the current page in the browser',
                    type: 'Activity',
                });

                expect(result.description).to.equal('Reload the current page in the browser');
            });

            it('can be derived from the template', () => {
                const result = schematics.create({
                    template: 'Click.on($element)',
                    type: 'Activity',
                });

                expect(result.description).to.equal('Click on element');
            });
        });

        describe('inputSchema', () => {

            it('defaults to an empty schema if no custom inputSchema is provided', () => {

                const result = schematics.create({
                    template: 'Navigate.reloadPage()',
                    type: 'Activity',
                });

                expect(zodToJsonSchema(result.inputSchema)).to.deep.equal({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    additionalProperties: false,
                    properties: { },
                    type: 'object',
                });
            });
        });

        describe('template', () => {
            it('must be set explicitly', () => {
                const result = schematics.create({
                    template: 'Navigate.forward()',
                    type: 'Activity',
                });

                expect(result.template).to.equal('Navigate.forward()');
            });

            it('complains if the template is missing', () => {
                expect(() => schematics.create({
                    template: undefined,
                    type: 'Activity',
                })).to.throw(ConfigurationError, `'template' property is required to define a Screenplay tool`)
            });
        });

        describe('type', () => {

            it('complains if the type is missing', () => {
                expect(() => schematics.create({
                    template: 'Navigate.forward()',
                    type: undefined,
                })).to.throw(ConfigurationError, `'type' property is required to define a Screenplay tool`)
            });
        });

        describe('effect', () => {
            it('set to `destructive` for Activities', () => {
                const result = schematics.create({
                    template: 'Navigate.forward()',
                    type: 'Activity',
                });

                expect(result.effect).to.equal('destructive');
            });

            it('set to `readonly` for Questions', () => {
                const result = schematics.create({
                    template: 'Page.current().title()',
                    type: 'Question',
                });

                expect(result.effect).to.equal('readonly');
            });
        });
    });
});
