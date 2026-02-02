import { AstBuilder, GherkinClassicTokenMatcher, Parser } from '@cucumber/gherkin';
import type * as messages from '@cucumber/messages';
import { IdGenerator } from '@cucumber/messages';

import type { Background, Comment, DataTable, DocString, Examples, Feature, GherkinDocument, Scenario, ScenarioDefinition, ScenarioOutline, Step, TableRow, Tag } from './nodes';

/**
 * Adapts the new @cucumber/gherkin Parser to produce output compatible with the old gherkin 5.x format.
 *
 * @private
 */
export class GherkinParserAdapter {
    private readonly parser: Parser<messages.GherkinDocument>;

    constructor() {
        const createUuid = IdGenerator.uuid();
        const builder = new AstBuilder(createUuid);
        const matcher = new GherkinClassicTokenMatcher();
        this.parser = new Parser(builder, matcher);
    }

    parse(featureContent: string): GherkinDocument {
        const newDoc = this.parser.parse(featureContent);
        return this.adaptDocument(newDoc);
    }

    private adaptDocument(doc: messages.GherkinDocument): GherkinDocument {
        return {
            type: 'GherkinDocument',
            feature: doc.feature ? this.adaptFeature(doc.feature) : undefined,
            comments: (doc.comments || []).map(c => this.adaptComment(c)),
        };
    }

    private adaptFeature(feature: messages.Feature): Feature {
        return {
            type: 'Feature',
            location: feature.location,
            tags: feature.tags.map(t => this.adaptTag(t)),
            language: feature.language,
            keyword: feature.keyword,
            name: feature.name,
            description: this.trimDescription(feature.description),
            children: feature.children.map(child => this.adaptChild(child)),
        };
    }

    private adaptChild(child: messages.FeatureChild): ScenarioDefinition {
        if (child.background) {
            return this.adaptBackground(child.background);
        }
        if (child.scenario) {
            // Check if it's a Scenario Outline by looking at the keyword or examples
            if (child.scenario.keyword === 'Scenario Outline' || child.scenario.keyword === 'Scenario Template' || child.scenario.examples.length > 0) {
                return this.adaptScenarioOutline(child.scenario);
            }
            return this.adaptScenario(child.scenario);
        }
        // Rule children are not supported in the legacy format
        throw new Error('Unsupported feature child type');
    }

    private adaptBackground(bg: messages.Background): Background {
        return {
            type: 'Background',
            location: bg.location,
            tags: [],
            keyword: bg.keyword,
            name: bg.name,
            description: this.trimDescription(bg.description),
            steps: bg.steps.map(s => this.adaptStep(s)),
        };
    }

    private adaptScenario(scenario: messages.Scenario): Scenario {
        return {
            type: 'Scenario',
            location: scenario.location,
            tags: scenario.tags.map(t => this.adaptTag(t)),
            keyword: scenario.keyword,
            name: scenario.name,
            description: this.trimDescription(scenario.description),
            steps: scenario.steps.map(s => this.adaptStep(s)),
        };
    }

    private adaptScenarioOutline(scenario: messages.Scenario): ScenarioOutline {
        return {
            type: 'ScenarioOutline',
            location: scenario.location,
            tags: scenario.tags.map(t => this.adaptTag(t)),
            keyword: scenario.keyword,
            name: scenario.name,
            description: this.trimDescription(scenario.description),
            steps: scenario.steps.map(s => this.adaptStep(s)),
            examples: scenario.examples.map(e => this.adaptExamples(e)),
        };
    }

    private adaptStep(step: messages.Step): Step {
        const result: Step = {
            type: 'Step',
            location: step.location,
            keyword: step.keyword,
            text: step.text,
        };

        if (step.dataTable) {
            result.argument = this.adaptDataTable(step.dataTable);
        } else if (step.docString) {
            result.argument = this.adaptDocString(step.docString);
        }

        return result;
    }

    private adaptDataTable(dataTable: messages.DataTable): DataTable {
        return {
            type: 'DataTable',
            location: dataTable.location,
            rows: dataTable.rows.map(r => this.adaptTableRow(r)),
        };
    }

    private adaptDocString(docString: messages.DocString): DocString {
        return {
            type: 'DocString',
            location: docString.location,
            content: docString.content,
        };
    }

    private adaptExamples(examples: messages.Examples): Examples {
        return {
            type: 'Examples',
            location: examples.location,
            tags: examples.tags.map(t => this.adaptTag(t)),
            keyword: examples.keyword,
            name: examples.name,
            description: this.trimDescription(examples.description),
            tableHeader: this.adaptTableRow(examples.tableHeader),
            tableBody: examples.tableBody.map(r => this.adaptTableRow(r)),
        };
    }

    private adaptTableRow(row: messages.TableRow): TableRow {
        return {
            type: 'TableRow',
            location: row.location,
            cells: row.cells.map(c => ({
                type: 'TableCell',
                location: c.location,
                value: c.value,
            })),
        };
    }

    private adaptTag(tag: messages.Tag): Tag {
        return {
            type: 'Tag',
            location: tag.location,
            name: tag.name,
        };
    }

    private adaptComment(comment: messages.Comment): Comment {
        return {
            type: 'Comment',
            location: comment.location,
            text: comment.text,
        };
    }

    /**
     * Trims the description and returns it, or undefined if the description is empty.
     * The old gherkin 5.x parser returned undefined for empty descriptions, which the mapper
     * then passes directly to constructors using `description && new Description(description)`.
     */
    private trimDescription(description: string | undefined): string | undefined {
        const trimmed = description?.trim();
        // Return undefined for empty descriptions to match old gherkin 5.x behavior
        return trimmed || undefined;
    }
}
