import { Ensure, equals, includes, property } from '@serenity-js/assertions';
import { GetRequest, LastResponse, Send } from '@serenity-js/rest';

import { describe, it } from '../../src';

describe('Report', () => {

    describe('Machine-Readable Summary', () => {

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
                Ensure.that(LastResponse.body<{ runs: number }>().runs, equals(2)),
            );
        });

        it('reports the outcome totals for the latest run', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ latestRun: { totals: { passed: number } } }>().latestRun.totals.passed, equals(17)),
                Ensure.that(LastResponse.body<{ latestRun: { totals: { failed: number } } }>().latestRun.totals.failed, equals(2)),
                Ensure.that(LastResponse.body<{ latestRun: { totals: { error: number } } }>().latestRun.totals.error, equals(3)),
            );
        });

        it('groups failures into clusters by error fingerprint', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ failureClusters: unknown[] }>().failureClusters.length, equals(5)),
            );
        });

        it('reports consistency classifications', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ consistency: { flaky: number } }>().consistency, property('flaky', equals(1))),
                Ensure.that(LastResponse.body<{ consistency: { degraded: number } }>().consistency, property('degraded', equals(4))),
                Ensure.that(LastResponse.body<{ consistency: { recovered: number } }>().consistency, property('recovered', equals(2))),
            );
        });

        it('computes composite quality scores', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/summary.json')),
                Ensure.that(LastResponse.body<{ scores: { passRate: number } }>().scores.passRate, equals(77.3)),
                Ensure.that(LastResponse.body<{ scores: { completeness: number } }>().scores.completeness, equals(100)),
                Ensure.that(LastResponse.body<{ scores: { confidence: number } }>().scores.confidence, equals(84.5)),
            );
        });
    });
});
