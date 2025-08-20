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
    type: 'Activity' | 'Question';
}

export class ScreenplaySchematics<Input extends InputSchema = InputSchema> {
    private static readonly separator = '_';

    constructor(private defaults: Partial<ScreenplaySchematicConfiguration<Input>>) {
    }

    private chunkUp(template: string): string[] {
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
        const { className, toolName } = this.parseTemplate(namespace, moduleName, template);

        const effect = type === 'Activity'
            ? 'destructive'
            : 'readonly';

        return {
            namespace,
            moduleName,
            className,
            toolName,
            title: this.createTitle(definition.template),
            description: this.createDescription(definition.description, definition.template),
            inputSchema,
            imports,
            template,
            type,
            effect,
        };
    }

    private parseTemplate(namespace: string, moduleName: string, template: string): { className: string; toolName: string; } {
        const chunks = this.chunkUp(template);
        const toolName = [ namespace, moduleName, ...chunks ]
            .map(chunk => this.removeParameterTokens(chunk))
            .map(chunk => this.deCamelCase(chunk))
            .join(ScreenplaySchematics.separator)
            .toLocaleLowerCase()

        return {
            className: chunks[0],
            toolName,
        }
    }

    private deCamelCase(templateChunk: string): string {
        return templateChunk.replaceAll(/([^A-Z])([A-Z])/g, '$1_$2');
    }

    private removeParameterTokens(templateChunk: string): string {
        return templateChunk.replaceAll(/(\(.*?\))/g, '');
    }

    private replaceParameterTokensWithNames(templateChunk: string): string {
        return templateChunk.replaceAll(/\$(\w+)/g, '$1');
    }

    private removeParenthesis(templateChunk: string): string {
        return templateChunk.replaceAll(/[()]/g, ' ').trim();
    }

    private createTitle(template: string): string {
        return this.replaceParameterTokensWithNames(template);
    }

    private createDescription(description: string | undefined, template: string): string {
        if (description) {
            return description;
        }

        const newDescription = this.chunkUp(template)
            .map(chunk => this.replaceParameterTokensWithNames(chunk))
            .map(chunk => this.removeParenthesis(chunk))
            .map(chunk => this.deCamelCase(chunk))
            .join(' ')

        return newDescription.charAt(0).toLocaleUpperCase() + newDescription.slice(1);
    }
}
