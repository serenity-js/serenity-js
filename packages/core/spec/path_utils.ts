export function isWinOS() {
    return process.platform === 'win32';
}

export function osNormalizedPath(path: string) {
    if (isWinOS()) {
        return path.replace(/\//g, '\\');
    }
    /* else */
    return path;
}
