export class FileUtils {
    static normalizeToPosixPathPromise(pathPromise: Promise<string>): Promise<string> {
        return pathPromise.then(function(path: string): string {
            return FileUtils.normalizeToPosixPath(path);
        });
    }

    static normalizeToPosixPath(path: string): string {
        let rootedPath: string = path;
        const windowsDrivePos: number = path.indexOf(':');
        if (windowsDrivePos > -1) {
            rootedPath = path.substring(windowsDrivePos + 1);
        }
        return rootedPath.replace(/\\/g, '/');
    }
}
