import * as gracefulFs from 'graceful-fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

export class FileSystem {

    constructor(
        private readonly root: string,
        private readonly fs = gracefulFs,
    ) {
    }

    public store(relativePathToFile: string, data: any): Promise<string> {
        return this.ensureSpecified(relativePathToFile)
            .then(relativePath => this.prepareDirectory(relativePath))
            .then(absolutePath => this.write(absolutePath, data));
    }

    private ensureSpecified(relativePathToFile: string): Promise<string> {
        return !! (relativePathToFile && relativePathToFile.length)
            ? Promise.resolve(relativePathToFile)
            : Promise.reject(new Error('Please specify where the file should be saved'));
    }

    private prepareDirectory(relativePathToFile: string): PromiseLike<string> {
        const
            absolutePath = path.resolve(this.root, relativePathToFile),
            parent       = path.dirname(absolutePath);

        return new Promise((resolve, reject) => {

            mkdirp(parent, { fs: this.fs }, error => {
                return error
                    ? reject(error)
                    : resolve(absolutePath);
            });
        });
    }

    private write(path: string, data: any): Promise<string> {
        return new Promise((resolve, reject) => {
            this.fs.writeFile(path, data, error => {
                return error
                    ? reject(error)
                    : resolve(path);
            });
        });
    }
}
