/**
 * @package
 */
export function dashify(text: string): string {
    return text
        .replace(/\W/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}
