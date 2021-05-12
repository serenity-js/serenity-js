import { PropertyPathKey } from './PropertyPathKey';

/**
 * @package
 */
export function describePath(parts: PropertyPathKey[]): string {
    return parts.reduce(
        (acc, segment) =>
            acc.concat(
                isNumber(segment)
                    ? `[${ segment }]`
                    : segment
            ),
        [],
    ).join('.');
}

/**
 * @private
 */
function isNumber(segment: PropertyPathKey): segment is number {
    return Number.parseInt(String(segment), 10).toString() === segment;
}
