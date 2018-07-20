import * as gracefulFs from 'graceful-fs';
import * as mkdirp from 'mkdirp';

import { Path } from './Path';

export class FileSystem {

    constructor(
        private readonly root: Path,
        private readonly fs = gracefulFs,
    ) {
    }

    public store(relativePathToFile: Path, data: any, encoding?: string): Promise<Path> {
        return Promise.resolve(relativePathToFile)
            .then(relativePath => this.prepareDirectory(relativePath))
            .then(absolutePath => this.write(absolutePath, data, encoding));
    }

    private prepareDirectory(relativePathToFile: Path): PromiseLike<Path> {
        const
            absolutePath = this.root.resolve(relativePathToFile),
            parent       = absolutePath.directory();

        return new Promise((resolve, reject) => {

            mkdirp(parent.value, { fs: this.fs }, error => {
                return error
                    ? reject(error)
                    : resolve(absolutePath);
            });
        });
    }

    private write(path: Path, data: any, encoding?: string): Promise<Path> {
        return new Promise((resolve, reject) => {
            this.fs.writeFile(
                path.value,
                data,
                encoding,
                error => error
                    ? reject(error)
                    : resolve(path),
            );
        });
    }
}
