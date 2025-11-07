import { z } from 'zod';

export type InputSchema = z.Schema<any>;
export type OutputSchema = z.Schema<any>;

export const ActorNameSchema = z.string().describe('The name of the actor performing the activity or answering the question');
export type ActorName = z.infer<typeof ActorNameSchema>;

export const DependencyManifestSchema = z.array(z.string()).describe('Node modules required to run the code');
export type DependencyManifest = z.infer<typeof DependencyManifestSchema>;

export const ImportManifestSchema = z.record(z.array(z.string())).describe('Node modules and their imports required to run the code');
export type ImportManifest = z.infer<typeof ImportManifestSchema>;

export const ScreenplayToolOutputSchema = z.object({
    dependencies: DependencyManifestSchema, // todo: make sure this is really needed
    imports: ImportManifestSchema,
});

export type QuestionParameter = z.ZodObject<{ imports: typeof ImportManifestSchema; question: z.ZodString; }>;

export type AnswerableParameter<Input extends InputSchema> = z.ZodUnion<[ Input, QuestionParameter ]>;
export function answerableParameterSchema<Input extends InputSchema>(schema: Input): AnswerableParameter<Input> {
    const customDescription = schema.description || 'parameter';
    const lowercaseDescription = customDescription.charAt(0).toLowerCase() + customDescription.slice(1);

    return z.union([
        schema,
        questionParameterSchema(schema),
    ]).describe(`Either ${ lowercaseDescription } or a Question that returns ${ lowercaseDescription }`);
}

export function questionParameterSchema<Input extends InputSchema>(schema: Input): QuestionParameter {
    // todo: avoid duplicating description logic with answerableParameterSchema
    const customDescription = schema.description || 'parameter';
    const lowercaseDescription = customDescription.charAt(0).toLowerCase() + customDescription.slice(1);

    return z.object({
        imports: ImportManifestSchema,
        question: z.string().describe(`The question that returns the ${ lowercaseDescription }`),
    });
}

export interface CapabilityDescriptor {
    path: string[];
    description: string;
}

// todo: move controller schemas to controllers

export const ScreenplayActivityToolOutputSchema = ScreenplayToolOutputSchema.merge(z.object({
    actorName: ActorNameSchema,
    activities: z.array(z.string()).describe('Activities performed by the actor'),
}));

export type ScreenplayActivityToolOutput = z.infer<typeof ScreenplayActivityToolOutputSchema>;
