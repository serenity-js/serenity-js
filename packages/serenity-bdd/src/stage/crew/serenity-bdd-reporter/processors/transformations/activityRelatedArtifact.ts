import { AssertionReportDiffer } from '@serenity-js/core/lib/io';
import { Artifact, AssertionReport, CorrelationId, HTTPRequestResponse, JSONData, LogEntry, Name, RequestAndResponse, TextData, Timestamp } from '@serenity-js/core/lib/model';
import { createHash } from 'crypto';
import { match } from 'tiny-types';
import { inspect } from 'util';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function activityRelatedArtifact<Context extends SerenityBDDReportContext>(activityId: CorrelationId, name: Name, artifact: Artifact, timestamp: Timestamp) {
    const differ = new AssertionReportDiffer({
        expected: line => `+ ${ line }`,
        actual:   line => `- ${ line }`,
        matching: line => `  ${ line }`,
    });

    return (report: Context): Context =>
        match<Artifact, Context>(artifact)
            .when(HTTPRequestResponse, _ =>
                report.with(httpRequestResponse(
                    activityId,
                    artifact.map(data => data),
                    timestamp
                ))
            )
            .when(TextData, _ =>
                report.with(arbitraryData(
                    activityId,
                    name,
                    artifact.map(artifactContents => artifactContents.data),
                    timestamp
                ))
            )
            .when(LogEntry, _ =>
                report.with(arbitraryData(
                    activityId,
                    name,
                    artifact.map(artifactContents => artifactContents.data),
                    timestamp
                ))
            )
            .when(AssertionReport, _ =>
                report.with(arbitraryData(
                    activityId,
                    name,
                    artifact.map(value => differ.diff(value.expected, value.actual)),
                    timestamp
                ))
            )
            .when(JSONData, _ =>
                report.with(arbitraryData(
                    activityId,
                    name,
                    artifact.map(value => JSON.stringify(value, null, 4)),
                    timestamp
                ))
            )
            .else(_ => report)
}

function httpRequestResponse<Context extends SerenityBDDReportContext>(activityId: CorrelationId, requestResponse: RequestAndResponse, timestamp: Timestamp) {
    function mapToString(dictionary: {[key: string]: string}) {
        return Object.keys(dictionary).map(key => `${key}: ${dictionary[key]}`).join('\n');
    }

    function bodyToString(data: any): string {
        if (data === null || data === undefined) {
            return '';
        }

        if (typeof data === 'string') {
            return data;
        }

        if (typeof data === 'object') {
            return JSON.stringify(data, null, 4);
        }

        return inspect(data);
    }

    return (context: Context): Context => {

        if (context.steps.has(activityId.value)) {
            context.steps.get(activityId.value).step.restQuery = {
                method:          requestResponse.request.method.toUpperCase(),
                path:            requestResponse.request.url,
                content:         bodyToString(requestResponse.request.data),
                contentType:     requestResponse.request.headers['Content-Type'] || '', // todo: add a case insensitive proxy around this RFC 2616: 4.2
                requestHeaders:  mapToString(requestResponse.request.headers)  || '',
                requestCookies:  requestResponse.request.headers.Cookie || '', // todo: add a case insensitive proxy around this RFC 2616: 4.2
                statusCode:      requestResponse.response.status,
                responseHeaders: mapToString(requestResponse.response.headers) || '',
                responseCookies: requestResponse.response.headers.Cookie || '', // todo: add a case insensitive proxy around this RFC 2616: 4.2
                responseBody:    bodyToString(requestResponse.response.data),
            };
        }

        return context;
    }
}

function arbitraryData<Context extends SerenityBDDReportContext>(activityId: CorrelationId, name: Name, contents: string, timestamp: Timestamp) {
    return (context: Context): Context => {

        if (context.steps.has(activityId.value)) {
            const id = createHash('sha1')
                .update(name.value)
                .update(contents)
                .update(`${ timestamp.toMillisecondTimestamp() }`)
                .digest('hex');

            context.steps.get(activityId.value).step.reportData.push({
                id: `report-data-${ id }`,
                isEvidence: false,
                path: '',
                title: name.value,
                contents,
            });
        }

        return context;
    }
}
