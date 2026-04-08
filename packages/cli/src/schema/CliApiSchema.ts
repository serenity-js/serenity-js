import { z } from 'zod';

/**
 * Schema URL for cli-api.json files.
 */
export const CLI_API_SCHEMA_URL = 'https://serenity-js.org/schemas/cli-api.json';

/**
 * Supported parameter types in cli-api.json.
 */
export const ParameterTypeSchema = z.enum(['string', 'number', 'boolean', 'enum', 'array']);

/**
 * Parameter type values.
 */
export type ParameterType = z.infer<typeof ParameterTypeSchema>;

/**
 * Parameter type definition.
 */
export interface Parameter {
    type: ParameterType;
    description?: string;
    required?: boolean;
    default?: unknown;
    values?: string[];
    items?: Parameter;
}

/**
 * Parameter schema with validation refinements for enum and array types.
 *
 * Uses a recursive definition to support nested array items.
 */
export const ParameterSchema: z.ZodType<Parameter> = z.lazy(() =>
    z.object({
        type: ParameterTypeSchema,
        description: z.string().optional(),
        required: z.boolean().optional(),
        default: z.unknown().optional(),
        values: z.array(z.string()).optional(),
        items: ParameterSchema.optional(),
    })
).refine(
    (data) => data.type !== 'enum' || (data.values && data.values.length > 0),
    { message: 'Enum parameters must have a non-empty values array', path: ['values'] }
).refine(
    (data) => data.type !== 'array' || data.items !== undefined,
    { message: 'Array parameters must have an items definition', path: ['items'] }
) as z.ZodType<Parameter>;

/**
 * Command returns schema.
 */
export const CommandReturnsSchema = z.object({
    type: z.string(),
    description: z.string().optional(),
});

/**
 * Command returns type.
 */
export type CommandReturns = z.infer<typeof CommandReturnsSchema>;

/**
 * Command schema defining a CLI command.
 */
export const CommandSchema = z.object({
    description: z.string(),
    activity: z.string(),
    parameters: z.record(ParameterSchema).optional(),
    returns: CommandReturnsSchema.optional(),
});

/**
 * Command type inferred from the schema.
 */
export type Command = z.infer<typeof CommandSchema>;

/**
 * CLI API schema for validating cli-api.json files.
 *
 * Each Serenity/JS module can include a cli-api.json file that defines
 * the CLI commands it provides. The CLI discovers these files and
 * dynamically generates commands based on their definitions.
 *
 * ## Example cli-api.json
 *
 * ```json
 * {
 *     "$schema": "https://serenity-js.org/schemas/cli-api.json",
 *     "module": "cli",
 *     "version": "1.0.0",
 *     "commands": {
 *         "check-installation": {
 *             "description": "Verifies the installation",
 *             "activity": "CheckInstallation"
 *         }
 *     }
 * }
 * ```
 *
 * @group Schema
 */
export const CliApiSchema = z.object({
    $schema: z.literal(CLI_API_SCHEMA_URL),
    module: z.string().regex(/^[a-z][a-z0-9-]*$/, {
        message: 'Module name must be lowercase alphanumeric with hyphens, starting with a letter',
    }),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, {
        message: 'Version must be in semver format (e.g., 1.0.0)',
    }),
    commands: z.record(CommandSchema),
});

/**
 * CLI API type inferred from the schema.
 */
export type CliApi = z.infer<typeof CliApiSchema>;
