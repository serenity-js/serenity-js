import { ensure, isNotBlank, isString } from 'tiny-types';
import type { z } from 'zod';

import type { AnswerableParameter, ImportManifest, InputSchema, QuestionParameter } from '../schema.js';
import { Imports } from './Imports.js';

export class ScreenplayTemplate {
    private readonly imports: Imports;
    private readonly template: string[];

    constructor(imports: ImportManifest, template: string) {
        this.imports = new Imports(imports);
        this.template = ScreenplayTemplate.chunkUp(template);
    }

    private static chunkUp(template: string): string[] {
        const value = ensure('ScreenplayTemplate value', template, isString(), isNotBlank());

        return value
            .trim()
            .split(/(?<token>\$[a-z][A-Za-z]+)/g);
    }

    compile(parameters: Record<string, z.infer<InputSchema> | z.infer<AnswerableParameter<InputSchema>>>): CompiledTemplate {
        return this.template.reduce((acc, chunk) => {

            if (! this.isToken(chunk)) {
                return {
                    ...acc,
                    value: acc.value + chunk,
                }
            }

            const parameterName = this.parameterNameFrom(chunk);
            const parameterValue = parameters[parameterName];

            if (this.isPrimitiveParameter(parameterValue)) {
                return {
                    ...acc,
                    value: acc.value + this.primitiveToString(parameterValue),
                }
            }

            if (this.isQuestionParameter(parameterValue)) {
                return {
                    imports: acc.imports.merge(parameterValue.imports),
                    value: acc.value + parameterValue.question,
                }
            }

            throw new TypeError(
                `Cannot compile the '${ this.template.join('') }' template, ${ chunk } parameter is missing`
            )

        }, { imports: this.imports, value: '' })
    }

    private primitiveToString(parameter: string | number | boolean): string {
        if (typeof parameter === 'string') {
            return `'${ parameter }'`;
        }
        return String(parameter);
    }

    private isPrimitiveParameter(parameter: unknown): parameter is string | number | boolean {
        return typeof parameter === 'string'
            || typeof parameter === 'number'
            || typeof parameter === 'boolean';
    }

    private isQuestionParameter(parameter: unknown): parameter is z.infer<QuestionParameter> {
        return typeof parameter === 'object'
            && typeof parameter['question'] === 'string';
    }

    private isToken(chunk: string): boolean {
        return chunk.startsWith('$')
    }

    private parameterNameFrom(token: string): string {
        return token.slice(1)
    }
}

export interface CompiledTemplate {
    value: string;
    imports: Imports;
}
