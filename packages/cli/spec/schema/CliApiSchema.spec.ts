import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { CliApiSchema } from '../../src';

describe('CliApiSchema', () => {

    describe('when validating a valid cli-api.json', () => {

        it('parses a minimal valid schema', () => {
            const validSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                version: '1.0.0',
                commands: {},
            };

            const result = CliApiSchema.safeParse(validSchema);

            expect(result.success).to.equal(true);
        });

        it('parses a schema with commands', () => {
            const validSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                version: '1.0.0',
                commands: {
                    'check-installation': {
                        description: 'Verifies the installation',
                        activity: 'CheckInstallation',
                    },
                },
            };

            const result = CliApiSchema.safeParse(validSchema);

            expect(result.success).to.equal(true);
            if (result.success) {
                expect(result.data.commands['check-installation'].description).to.equal('Verifies the installation');
                expect(result.data.commands['check-installation'].activity).to.equal('CheckInstallation');
            }
        });

        it('parses a schema with command parameters', () => {
            const validSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'rest',
                version: '1.0.0',
                commands: {
                    send: {
                        description: 'Sends an HTTP request',
                        activity: 'SendRequest',
                        parameters: {
                            method: {
                                type: 'enum',
                                description: 'HTTP method',
                                required: true,
                                values: ['get', 'post', 'put', 'delete'],
                            },
                            url: {
                                type: 'string',
                                description: 'Request URL',
                                required: true,
                            },
                            data: {
                                type: 'string',
                                description: 'Request body',
                                required: false,
                            },
                        },
                        returns: {
                            type: 'HttpResponse',
                            description: 'HTTP response',
                        },
                    },
                },
            };

            const result = CliApiSchema.safeParse(validSchema);

            expect(result.success).to.equal(true);
            if (result.success) {
                const sendCommand = result.data.commands.send;
                expect(sendCommand.parameters?.method.type).to.equal('enum');
                expect(sendCommand.parameters?.method.values).to.deep.equal(['get', 'post', 'put', 'delete']);
                expect(sendCommand.parameters?.url.required).to.equal(true);
                expect(sendCommand.parameters?.data.required).to.equal(false);
            }
        });

        it('parses a schema with array parameters', () => {
            const validSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'rest',
                version: '1.0.0',
                commands: {
                    send: {
                        description: 'Sends an HTTP request',
                        activity: 'SendRequest',
                        parameters: {
                            headers: {
                                type: 'array',
                                description: 'Request headers',
                                items: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            };

            const result = CliApiSchema.safeParse(validSchema);

            expect(result.success).to.equal(true);
            if (result.success) {
                const headersParameter = result.data.commands.send.parameters?.headers;
                expect(headersParameter?.type).to.equal('array');
                expect(headersParameter?.items?.type).to.equal('string');
            }
        });

        it('parses a schema with default parameter values', () => {
            const validSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                version: '1.0.0',
                commands: {
                    start: {
                        description: 'Starts the daemon',
                        activity: 'StartDaemon',
                        parameters: {
                            headless: {
                                type: 'boolean',
                                description: 'Run in headless mode',
                                default: true,
                            },
                        },
                    },
                },
            };

            const result = CliApiSchema.safeParse(validSchema);

            expect(result.success).to.equal(true);
            if (result.success) {
                expect(result.data.commands.start.parameters?.headless.default).to.equal(true);
            }
        });
    });

    describe('when validating an invalid cli-api.json', () => {

        it('rejects a schema missing $schema field', () => {
            const invalidSchema = {
                module: 'cli',
                version: '1.0.0',
                commands: {},
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a schema with wrong $schema value', () => {
            const invalidSchema = {
                $schema: 'https://example.com/wrong-schema.json',
                module: 'cli',
                version: '1.0.0',
                commands: {},
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a schema missing module field', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                version: '1.0.0',
                commands: {},
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a schema with invalid module name', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'Invalid-Module',
                version: '1.0.0',
                commands: {},
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a schema missing version field', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                commands: {},
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a schema with invalid version format', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                version: 'invalid',
                commands: {},
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a schema missing commands field', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                version: '1.0.0',
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a command missing description', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                version: '1.0.0',
                commands: {
                    'check-installation': {
                        activity: 'CheckInstallation',
                    },
                },
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a command missing activity', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                version: '1.0.0',
                commands: {
                    'check-installation': {
                        description: 'Verifies the installation',
                    },
                },
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects an enum parameter without values array', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'rest',
                version: '1.0.0',
                commands: {
                    send: {
                        description: 'Sends an HTTP request',
                        activity: 'SendRequest',
                        parameters: {
                            method: {
                                type: 'enum',
                                description: 'HTTP method',
                            },
                        },
                    },
                },
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects an enum parameter with empty values array', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'rest',
                version: '1.0.0',
                commands: {
                    send: {
                        description: 'Sends an HTTP request',
                        activity: 'SendRequest',
                        parameters: {
                            method: {
                                type: 'enum',
                                description: 'HTTP method',
                                values: [],
                            },
                        },
                    },
                },
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects an array parameter without items definition', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'rest',
                version: '1.0.0',
                commands: {
                    send: {
                        description: 'Sends an HTTP request',
                        activity: 'SendRequest',
                        parameters: {
                            headers: {
                                type: 'array',
                                description: 'Request headers',
                            },
                        },
                    },
                },
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });

        it('rejects a parameter with invalid type', () => {
            const invalidSchema = {
                $schema: 'https://serenity-js.org/schemas/cli-api.json',
                module: 'cli',
                version: '1.0.0',
                commands: {
                    test: {
                        description: 'Test command',
                        activity: 'TestActivity',
                        parameters: {
                            param: {
                                type: 'invalid',
                                description: 'Invalid parameter',
                            },
                        },
                    },
                },
            };

            const result = CliApiSchema.safeParse(invalidSchema);

            expect(result.success).to.equal(false);
        });
    });
});
