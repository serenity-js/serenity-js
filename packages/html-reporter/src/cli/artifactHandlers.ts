import type { ActivityRelatedArtifactGenerated } from '@serenity-js/core/events';
import type { RequestAndResponse } from '@serenity-js/core/model';
import { HTTPRequestResponse, JSONData, LogEntry, TextData } from '@serenity-js/core/model';

import type { ActivityRecord } from './model/RunData.js';

/**
 * Handles an HTTPRequestResponse artifact by attaching REST query data to the activity record.
 *
 * @package
 */
export function handleHttpArtifact(activityRecord: ActivityRecord, event: ActivityRelatedArtifactGenerated): void {
    const data = event.artifact.map(value => value) as RequestAndResponse;
    activityRecord.restQuery = {
        method: data.request.method.toUpperCase(),
        url: data.request.url,
        requestHeaders: mapToHeaderString(data.request.headers || {}),
        requestBody: bodyToString(data.request.data),
        statusCode: data.response.status,
        responseHeaders: mapToHeaderString(data.response.headers || {}),
        responseBody: bodyToString(data.response.data),
    };
}

/**
 * Handles a TextData artifact by appending report data to the activity record.
 *
 * @package
 */
export function handleTextArtifact(activityRecord: ActivityRecord, event: ActivityRelatedArtifactGenerated): void {
    const data = event.artifact.map(value => value) as { contentType: string; data: string };
    if (!activityRecord.reportData) activityRecord.reportData = [];
    activityRecord.reportData.push({
        title: event.name.value,
        contents: data.data,
        ...(data.contentType ? { contentType: data.contentType } : {}),
    });
}

/**
 * Handles a LogEntry artifact by appending report data to the activity record.
 *
 * @package
 */
export function handleLogArtifact(activityRecord: ActivityRecord, event: ActivityRelatedArtifactGenerated): void {
    const data = event.artifact.map(value => value) as { data: string };
    if (!activityRecord.reportData) activityRecord.reportData = [];
    activityRecord.reportData.push({ title: event.name.value, contents: data.data });
}

/**
 * Handles a JSONData artifact by appending formatted JSON report data to the activity record.
 *
 * @package
 */
export function handleJsonArtifact(activityRecord: ActivityRecord, event: ActivityRelatedArtifactGenerated): void {
    const data = event.artifact.map(value => value);
    if (!activityRecord.reportData) activityRecord.reportData = [];
    activityRecord.reportData.push({ title: event.name.value, contents: JSON.stringify(data, undefined, 4) });
}

/**
 * Dispatches an artifact event to the appropriate handler based on artifact type.
 *
 * @package
 */
export function dispatchArtifact(activityRecord: ActivityRecord, event: ActivityRelatedArtifactGenerated): void {
    if (event.artifact instanceof HTTPRequestResponse) {
        handleHttpArtifact(activityRecord, event);
    } else if (event.artifact instanceof TextData) {
        handleTextArtifact(activityRecord, event);
    } else if (event.artifact instanceof LogEntry) {
        handleLogArtifact(activityRecord, event);
    } else if (event.artifact instanceof JSONData) {
        handleJsonArtifact(activityRecord, event);
    }
}

/**
 * Converts a headers object to a multi-line header string.
 *
 * @package
 */
export function mapToHeaderString(headers: Record<string, string | number | boolean>): string {
    return Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\n');
}

/**
 * Converts a response/request body to a string representation.
 *
 * @package
 */
export function bodyToString(data: unknown): string | undefined {
    if (data === null || data === undefined || data === '') {
        return undefined;
    }
    if (typeof data === 'string') {
        return data;
    }
    if (typeof data === 'object') {
        return JSON.stringify(data, undefined, 4);
    }
    return String(data);
}
