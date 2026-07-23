/**
 * Converts query-param deep links to hash-based routes.
 *
 * When the report URL contains a `route` query parameter, this function
 * translates it into the equivalent hash route and removes the query string
 * via `history.replaceState`. Any additional query parameters are forwarded
 * as hash-route parameters.
 *
 * Examples:
 *   ?route=/tests&search=@tag:showcase  →  #/tests?search=@tag:showcase
 *   ?route=/consistency                 →  #/consistency
 *   ?route=/tests/some:id&browser=chrome →  #/tests/some:id?browser=chrome
 *
 * This enables linking to specific report views from contexts that strip
 * or mangle URL fragments (markdown files viewed on file://, Slack, CI logs).
 */
export function redirectQueryParamsToHash(): void {
    const search = window.location.search;
    if (!search) {
        return;
    }

    const params = new URLSearchParams(search);
    const route = params.get('route');
    if (!route) {
        return;
    }

    params.delete('route');
    const remaining = params.toString();
    const hash = '#' + route + (remaining ? '?' + remaining : '');

    // Replace the current URL without adding a history entry
    const cleanUrl = window.location.pathname + hash;
    window.history.replaceState(null, '', cleanUrl);
}
