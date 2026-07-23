/**
 * Extracts the value from an event target element.
 * Centralises the HTMLInputElement/HTMLSelectElement cast.
 */
export function targetValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
}
