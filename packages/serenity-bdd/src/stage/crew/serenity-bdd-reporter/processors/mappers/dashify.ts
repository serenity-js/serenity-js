/**
 * @package
 */
export function dashify(text: string) {
    return text
        .replace(/[ \t\W]/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}
