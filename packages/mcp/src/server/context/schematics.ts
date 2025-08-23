import { ConfigurationError } from '@serenity-js/core';
import { z } from 'zod';

import type { ImportManifest, InputSchema } from '../schema.js';

export interface ScreenplaySchematicConfiguration<Input extends InputSchema = InputSchema> {
    description?: string;           // Navigate to a specific URL in the browser
    imports?: ImportManifest;       // { '@serenity-js/web': [ 'Navigate' ] }
    inputSchema?: Input;            // zod schema describing the input parameters
    moduleName: string;             // web
    namespace: string;              // serenity
    template: string;               // Navigate.to($url)
    type: 'Activity' | 'Question';
}

export interface ScreenplaySchematic<Input extends InputSchema = InputSchema>
    extends Required<ScreenplaySchematicConfiguration<Input>>
{
    className: string;
    effect: 'destructive' | 'readonly';
    title: string;
    toolName: string;
    capabilityPath: string[];
    type: 'Activity' | 'Question';
}

export class ScreenplaySchematics<Input extends InputSchema = InputSchema> {
    private static readonly separator = '_';

    constructor(private defaults: Partial<ScreenplaySchematicConfiguration<Input>>) {
    }

    private static chunkUp(template: string): string[] {
        return template.split('.')
            .map(chunk => chunk.trim());
    }

    create(configuration: Partial<ScreenplaySchematicConfiguration<Input>>): ScreenplaySchematic<Input> {
        const definition: ScreenplaySchematicConfiguration<Input> = {
            imports: {},
            inputSchema: z.object({}) as unknown as Input,
            ...this.defaults,
            ...configuration,
        } as ScreenplaySchematicConfiguration<Input>;

        // Validate required properties are present after merging
        for (const requiredProperty of [ 'namespace', 'moduleName', 'template', 'type' ] as const) {
            if (!definition[requiredProperty]) {
                throw new ConfigurationError(`'${ requiredProperty }' property is required to define a Screenplay tool`);
            }
        }

        const { namespace, moduleName, template, type, inputSchema, imports } = definition;
        const { className, toolName, capabilityPath  } = ScreenplaySchematics.parseTemplate(namespace, moduleName, type, template);

        const effect = type === 'Activity'
            ? 'destructive'
            : 'readonly';

        return {
            namespace,
            moduleName,
            className,
            toolName,
            capabilityPath,
            title: ScreenplaySchematics.createTitle(definition.template),
            description: ScreenplaySchematics.createDescription(definition.description, definition.template),
            inputSchema,
            imports,
            template,
            type,
            effect,
        };
    }

    private static parseTemplate(namespace: string, moduleName: string, type: string, template: string): { className: string; toolName: string; capabilityPath: string[] } {
        const chunks = ScreenplaySchematics.chunkUp(template).map(chunk => this.removeParameterTokens(chunk));

        const snakeCaseChunks = chunks.map(chunk => this.camelCaseToSnakeCase(chunk));

        const groupName = type === 'Activity'
            ? 'activities'
            : 'questions';

        const capabilityPath = [ moduleName, groupName, ...snakeCaseChunks ];

        const toolName = [ namespace, moduleName, ...snakeCaseChunks ]
            .join(ScreenplaySchematics.separator)

        return {
            className: chunks[0],
            toolName,
            capabilityPath,
        }
    }

    private static camelCaseToSnakeCase(templateChunk: string): string {
        return templateChunk.replaceAll(/([^A-Z])([A-Z])/g, '$1_$2').toLocaleLowerCase();
    }

    private static removeParameterTokens(templateChunk: string): string {
        return templateChunk.replaceAll(/(\(.*?\))/g, '');
    }

    private static replaceParameterTokensWithNames(templateChunk: string): string {
        return templateChunk.replaceAll(/\$(\w+)/g, '$1');
    }

    private static removeParenthesis(templateChunk: string): string {
        return templateChunk.replaceAll(/[()]/g, ' ').trim();
    }

    private static createTitle(template: string): string {
        return this.replaceParameterTokensWithNames(template);
    }

    private static createDescription(description: string | undefined, template: string): string {
        if (description) {
            return description;
        }

        const newDescription = this.chunkUp(template)
            .map(chunk => this.replaceParameterTokensWithNames(chunk))
            .map(chunk => this.removeParenthesis(chunk))
            .map(chunk => this.camelCaseToSnakeCase(chunk))
            .join(' ')

        return newDescription.charAt(0).toLocaleUpperCase() + newDescription.slice(1);
    }
}
