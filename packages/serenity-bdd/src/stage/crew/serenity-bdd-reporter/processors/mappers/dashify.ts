/**
 * @package
 */
export function dashify(text: string): string {
    return text
        .replaceAll(/\W/g, '-')
        .replaceAll(/^-+|-+$/g, '')
        .toLowerCase();
}
