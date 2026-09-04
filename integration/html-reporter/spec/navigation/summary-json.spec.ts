import { Ensure, equals, includes } from '@serenity-js/assertions';
import type { ReportSummaryJson } from '@serenity-js/html-reporter';
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
                Send.a(GetRequest.to('/single/summary.json')),
                Ensure.that(LastResponse.status(), equals(200)),
                Ensure.that(LastResponse.header('content-type'), includes('json')),
            );
        });

        it('identifies the report title and schema version', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/single/summary.json')),
                Ensure.that(LastResponse.body<ReportSummaryJson>().title, equals('Test Project')),
                Ensure.that(LastResponse.body<ReportSummaryJson>().schemaVersion, equals(1)),
                Ensure.that(LastResponse.body<ReportSummaryJson>().runs, equals(3)),
            );
        });

        it('reports the outcome totals for the latest run', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/single/summary.json')),
                Ensure.that(LastResponse.body<ReportSummaryJson>().latestRun.totals.passed, equals(20)),
                Ensure.that(LastResponse.body<ReportSummaryJson>().latestRun.totals.failed, equals(2)),
                Ensure.that(LastResponse.body<ReportSummaryJson>().latestRun.totals.error, equals(5)),
            );
        });

        it('groups failures into clusters by error fingerprint', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/single/summary.json')),
                Ensure.that(LastResponse.body<ReportSummaryJson>().failureClusters.length, equals(7)),
            );
        });

        it('reports consistency classifications', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/single/summary.json')),
                Ensure.that(LastResponse.body<ReportSummaryJson>().consistency.flaky.length, equals(1)),
                Ensure.that(LastResponse.body<ReportSummaryJson>().consistency.degraded.length, equals(4)),
                Ensure.that(LastResponse.body<ReportSummaryJson>().consistency.recovered.length, equals(2)),
            );
        });

        it('computes composite quality scores', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/single/summary.json')),
                Ensure.that(LastResponse.body<ReportSummaryJson>().scores.passRate, equals(74.1)),
                Ensure.that(LastResponse.body<ReportSummaryJson>().scores.completeness, equals(100)),
                Ensure.that(LastResponse.body<ReportSummaryJson>().scores.confidence, equals(84.4)),
            );
        });

        it('omits per-module breakdown for single-module runs', async ({ actor }) => {
            await actor.attemptsTo(
                Send.a(GetRequest.to('/single/summary.json')),
                Ensure.that(LastResponse.body<ReportSummaryJson>().modules, equals(undefined)),
            );
        });
    });
});
