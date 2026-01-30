import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { ConfigurationError } from '../../../src/errors';
import { ClassDescriptionParser } from '../../../src/io';
import { expect } from '../../expect';

describe('ClassDescriptionParser', () => {

    let parser: ClassDescriptionParser;

    beforeEach(() => {
        parser = new ClassDescriptionParser();
    });

    describe('parse', () => {

        given([
            {
                description: 'string',
                value: './MyTestReporter',
                expected: { moduleId: './MyTestReporter', className: 'default', parameter: undefined  }
            },
            {
                description: 'string',
                value: './MyTestReporter:default',
                expected: { moduleId: './MyTestReporter', className: 'default', parameter: undefined  }
            },
            {
                description: 'monouple',
                value: [ './MyTestReporter' ],
                expected: { moduleId: './MyTestReporter', className: 'default', parameter: undefined  }
            },
            {
                description: 'monouple',
                value: [ './MyTestReporter:default' ],
                expected: { moduleId: './MyTestReporter', className: 'default', parameter: undefined  }
            },
            {
                description: 'couple',
                value: [ './MyTestReporter', { outputFile: './example.json' } ],
                expected: { moduleId: './MyTestReporter', className: 'default', parameter: { outputFile: './example.json' } }
            },
        ]).
        it('recognises a local module with a default export', ({ value, expected }) => {
            const descriptor = parser.parse(value);

            expect(descriptor).to.deep.equal(expected);
        });

        given([
            {
                description: 'string',
                value: './my-reporters:MyTestReporter',
                expected: { moduleId: './my-reporters', className: 'MyTestReporter', parameter: undefined  }
            },
            {
                description: 'monouple',
                value: [ './my-reporters:MyTestReporter' ],
                expected: { moduleId: './my-reporters', className: 'MyTestReporter', parameter: undefined  }
            },
            {
                description: 'couple',
                value: [ './my-reporters:MyTestReporter', { outputFile: './example.json' } ],
                expected: { moduleId: './my-reporters', className: 'MyTestReporter', parameter: { outputFile: './example.json' } }
            },
        ]).
        it('recognises a local module with a custom class export', ({ value, expected }) => {
            const descriptor = parser.parse(value);

            expect(descriptor).to.deep.equal(expected);
        });

        given([
            {
                description: 'string',
                value: '@serenity-js/console-reporter',
                expected: { moduleId: '@serenity-js/console-reporter', className: 'default', parameter: undefined  }
            },
            {
                description: 'string',
                value: '@serenity-js/console-reporter:default',
                expected: { moduleId: '@serenity-js/console-reporter', className: 'default', parameter: undefined  }
            },
            {
                description: 'monouple',
                value: [ '@serenity-js/console-reporter' ],
                expected: { moduleId: '@serenity-js/console-reporter', className: 'default', parameter: undefined  }
            },
            {
                description: 'monouple',
                value: [ '@serenity-js/console-reporter:default' ],
                expected: { moduleId: '@serenity-js/console-reporter', className: 'default', parameter: undefined  }
            },
            {
                description: 'couple',
                value: [ '@serenity-js/console-reporter', { outputFile: './example.json' } ],
                expected: { moduleId: '@serenity-js/console-reporter', className: 'default', parameter: { outputFile: './example.json' } }
            },
            {
                description: 'couple',
                value: [ '@serenity-js/console-reporter:default', { outputFile: './example.json' } ],
                expected: { moduleId: '@serenity-js/console-reporter', className: 'default', parameter: { outputFile: './example.json' } }
            },
        ]).
        it('recognises a node module with a default export', ({ value, expected }) => {
            const descriptor = parser.parse(value);

            expect(descriptor).to.deep.equal(expected);
        });

        given([
            {
                description: 'string',
                value: '@serenity-js/console-reporter:ConsoleReporter',
                expected: { moduleId: '@serenity-js/console-reporter', className: 'ConsoleReporter', parameter: undefined  }
            },
            {
                description: 'monouple',
                value: [ '@serenity-js/console-reporter:ConsoleReporter' ],
                expected: { moduleId: '@serenity-js/console-reporter', className: 'ConsoleReporter', parameter: undefined  }
            },
            {
                description: 'couple',
                value: [ '@serenity-js/console-reporter:ConsoleReporter', { outputFile: './example.json' } ],
                expected: { moduleId: '@serenity-js/console-reporter', className: 'ConsoleReporter', parameter: { outputFile: './example.json' } }
            },
        ]).
        it('recognises a node module with a custom class', ({ value, expected }) => {
            const descriptor = parser.parse(value);

            expect(descriptor).to.deep.equal(expected);
        });

        given([
            {
                description: 'null',
                value: null,
                expectedError: { type: ConfigurationError, message: 'null is not a valid class description. Valid class description must be a string or an Array with 1-2 items, where the first item is a string.' }
            },
            {
                description: 'undefined',
                value: undefined,
                expectedError: { type: ConfigurationError, message: 'undefined is not a valid class description. Valid class description must be a string or an Array with 1-2 items, where the first item is a string.' }
            },
            {
                description: 'object',
                value: { },
                expectedError: { type: ConfigurationError, message: '{} is not a valid class description. Valid class description must be a string or an Array with 1-2 items, where the first item is a string.' }
            },
            {
                description: 'empty tuple',
                value: [ ],
                expectedError: { type: ConfigurationError, message: '[ ] is not a valid class description. Valid class description must be a string or an Array with 1-2 items, where the first item is a string.' }
            },
            {
                description: 'tuple with too many elements',
                value: [ 'first', 'second', 'third' ],
                expectedError: { type: ConfigurationError, message: `[ 'first', 'second', 'third' ] is not a valid class description. Valid class description must be a string or an Array with 1-2 items, where the first item is a string.` }
            },
            {
                description: 'tuple with invalid class description',
                value: [ false, 'some parameter' ],
                expectedError: { type: ConfigurationError, message: `[ false, 'some parameter' ] is not a valid class description. Valid class description must be a string or an Array with 1-2 items, where the first item is a string.` }
            },
            {
                description: 'invalid node module name',
                value: '$%^',
                expectedError: { type: ConfigurationError, message:
                        `"$%^" doesn't seem like a valid module id:\n` +
                        `- name can only contain URL-friendly characters`
                }
            }
        ]).
        it('complains when provided with an invalid class description', ({ value, expectedError }) => {
            expect(() => parser.parse(value)).to.throw(expectedError.type, expectedError.message);
        });

        given([
            {
                description: 'local module with no class',
                value: './my-reporter:',
                expectedError: { type: ConfigurationError, message:
                        `Invalid class name in "./my-reporter:". If you want to import the default export from a given module, please use the module ID.\n` +
                        `For example, valid class descriptions include "@serenity-js/serenity-bdd", "@serenity-js/serenity-bdd:default", "@serenity-js/serenity-bdd:SerenityBDD".`
                }
            },
            {
                description: 'local module with class name that looks invalid (starts with a number)',
                value: './my-reporter:123',
                expectedError: { type: ConfigurationError, message: `"123" doesn't seem like a valid JavaScript class name in "./my-reporter:123"` }
            },
            {
                description: 'local module with class name that looks invalid (spaces)',
                value: './my-reporter:my class name with spaces',
                expectedError: { type: ConfigurationError, message: `"my class name with spaces" doesn't seem like a valid JavaScript class name in "./my-reporter:my class name with spaces"` }
            },
            {
                description: 'local module with class name that looks invalid (multiple colons)',
                value: './my-reporter:my:class:name:with:multiple:colons',
                expectedError: { type: ConfigurationError, message:
                            `./my-reporter:my:class:name:with:multiple:colons is not a valid class description. Valid class description must be:\n` +
                            `- a module ID of a Node module providing a default export, e.g. "@serenity-js/serenity-bdd"\n` +
                            `- a module ID followed by a class name, e.g. "@serenity-js/core:StreamReporter"`
                }
            },
            {
                description: 'local module with class name that looks invalid (special characters)',
                value: './my-reporter:<invalid>',
                expectedError: { type: ConfigurationError, message: `"<invalid>" doesn't seem like a valid JavaScript class name in "./my-reporter:<invalid>"` }
            },
        ]).
        it('complains when provided with an invalid class name', ({ value, expectedError }) => {
            expect(() => parser.parse(value)).to.throw(expectedError.type, expectedError.message);
        });
    });
});
