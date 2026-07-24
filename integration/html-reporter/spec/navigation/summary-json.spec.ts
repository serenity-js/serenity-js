import { Ensure, equals, includes } from '@serenity-js/assertions';
import { GetRequest, LastResponse, Send } from '@serenity-js/rest';

import { describe, it } from '../../src';

describe('Report', () => {

    describe('Machine-Readable Summary', () => {

        it('is discoverable via a <link> tag in the HTML report', async ({ actor, navigation }) => {
            await actor.attemptsTo(
                Ensure.that(navigation.summaryLink(), equals('summary.json')),
                Ensure.that(navigation.summaryLinkTitle(), equals('Machine-readable report summary')),
            );
        });

        it('produces a summary.json served alongside the HTML report', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.status(), equals(200)),
                Ensure.that(LastResponse.header('content-type'), includes('json')),
            );
        });

        it('identifies the report title and schema version', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ title: string }>().title, equals('Test Project')),
                Ensure.that(LastResponse.body<{ schemaVersion: number }>().schemaVersion, equals(1)),
                Ensure.that(LastResponse.body<{ runs: number }>().runs, equals(3)),
            );
        });

        it('reports the outcome totals for the latest run', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ latestRun: { totals: { passed: number } } }>().latestRun.totals.passed, equals(17)),
                Ensure.that(LastResponse.body<{ latestRun: { totals: { failed: number } } }>().latestRun.totals.failed, equals(2)),
                Ensure.that(LastResponse.body<{ latestRun: { totals: { error: number } } }>().latestRun.totals.error, equals(5)),
            );
        });

        it('groups failures into clusters by error fingerprint', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ failureClusters: unknown[] }>().failureClusters.length, equals(7)),
            );
        });

        it('reports consistency classifications', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ consistency: { flaky: unknown[] } }>().consistency.flaky.length, equals(1)),
                Ensure.that(LastResponse.body<{ consistency: { degraded: unknown[] } }>().consistency.degraded.length, equals(4)),
                Ensure.that(LastResponse.body<{ consistency: { recovered: unknown[] } }>().consistency.recovered.length, equals(2)),
            );
        });

        it('computes composite quality scores', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ scores: { passRate: number } }>().scores.passRate, equals(70.8)),
                Ensure.that(LastResponse.body<{ scores: { completeness: number } }>().scores.completeness, equals(100)),
                Ensure.that(LastResponse.body<{ scores: { confidence: number } }>().scores.confidence, equals(82.5)),
            );
        });

        it('omits per-module breakdown for single-module runs', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ modules: unknown }>().modules, equals(undefined)),
            );
        });
    });
});
