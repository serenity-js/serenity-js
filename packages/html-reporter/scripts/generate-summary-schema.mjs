#!/usr/bin/env node

/**
 * Generates report-summary.schema.json from the Zod schema definition.
 * Run during `npm run compile` to keep the JSON schema in sync with the TypeScript types.
 * The generated schema is included in the published package for external tooling.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { z } from 'zod';

import { ReportSummaryJsonSchema } from '../src/cli/ReportSummaryJson.ts';

const jsonSchema = z.toJSONSchema(ReportSummaryJsonSchema);

// Add metadata
jsonSchema.$id = 'https://serenity-js.org/schemas/report-summary.json';
jsonSchema.title = 'Serenity/JS Report Summary';
jsonSchema.description = 'Machine-readable summary of an aggregated Serenity/JS HTML test report. Designed for AI agents, CI bots, and custom tooling.';

const outputPaths = [
    resolve(dirname(new URL(import.meta.url).pathname), '../lib/cli/report-summary.schema.json'),
    resolve(dirname(new URL(import.meta.url).pathname), '../esm/cli/report-summary.schema.json'),
];

for (const outputPath of outputPaths) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(jsonSchema, undefined, 2) + '\n', 'utf8');
}

const propertyCount = Object.keys(jsonSchema.properties || {}).length;
console.log(`Generated report-summary.schema.json (${propertyCount} top-level properties)`);
