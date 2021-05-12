import * as cuid from 'cuid';
import * as nodeFS from 'fs';
import * as gracefulFS from 'graceful-fs';
import * as nodeOS from 'os';
import { promisify } from 'util';

import { Path } from './Path';

export class FileSystem {

    constructor(
        private readonly root: Path,
        private readonly fs: typeof nodeFS = gracefulFS,
        private readonly os: typeof nodeOS = nodeOS,
        private readonly directoryMode = Number.parseInt('0777', 8) & (~process.umask()),
    ) {
    }

    public store(relativeOrAbsolutePathToFile: Path, data: string | NodeJS.ArrayBufferView, encoding?: string): Promise<Path> {
        return Promise.resolve()
            .then(() => this.ensureDirectoryExistsAt(relativeOrAbsolutePathToFile.directory()))
            .then(() => this.write(this.root.resolve(relativeOrAbsolutePathToFile), data, encoding));
    }

    public createReadStream(relativeOrAbsolutePathToFile: Path): nodeFS.ReadStream {
        return this.fs.createReadStream(this.root.resolve(relativeOrAbsolutePathToFile).value);
    }

    public createWriteStreamTo(relativeOrAbsolutePathToFile: Path): nodeFS.WriteStream {
        return this.fs.createWriteStream(this.root.resolve(relativeOrAbsolutePathToFile).value);
    }

    public stat(relativeOrAbsolutePathToFile: Path): Promise<nodeFS.Stats> {
        const stat = promisify(this.fs.stat);

        return stat(this.root.resolve(relativeOrAbsolutePathToFile).value);
    }

    public remove(relativeOrAbsolutePathToFileOrDirectory: Path): Promise<void> {
        const
            stat = promisify(this.fs.stat),
            unlink = promisify(this.fs.unlink),
            readdir = promisify(this.fs.readdir),
            rmdir = promisify(this.fs.rmdir);

        const absolutePath = this.root.resolve(relativeOrAbsolutePathToFileOrDirectory);

        return stat(absolutePath.value)
            .then(result =>
                result.isFile()
                    ? unlink(absolutePath.value)
                    : readdir(absolutePath.value)
                        .then(entries =>
                            Promise.all(entries.map(entry =>
                                this.remove(absolutePath.join(new Path(entry)))),
                            ).then(() => rmdir(absolutePath.value)),
                        ),
            )
            .then(() => void 0)
            .catch(error => {
                if (error?.code === 'ENOENT') {
                    return void 0;
                }
                throw error;
            });
    }

    public ensureDirectoryExistsAt(relativeOrAbsolutePathToDirectory: Path): Promise<Path> {

        const absolutePath = this.root.resolve(relativeOrAbsolutePathToDirectory);

        return absolutePath.split().reduce((promisedParent, child) => {
            return promisedParent.then(parent => new Promise((resolve, reject) => {
                const current = parent.resolve(new Path(child));

                this.fs.mkdir(current.value, this.directoryMode, error => {
                    if (! error || error.code === 'EEXIST') {
                        return resolve(current);
                    }

                    // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
                    if (error.code === 'ENOENT') { // Throw the original parentDir error on `current` `ENOENT` failure.
                        throw new Error(`EACCES: permission denied, mkdir '${ parent.value }'`);
                    }

                    const caughtError = !! ~['EACCES', 'EPERM', 'EISDIR'].indexOf(error.code);
                    if (! caughtError || (caughtError && current.equals(relativeOrAbsolutePathToDirectory))) {
                        throw error; // Throw if it's just the last created dir.
                    }

                    return resolve(current);
                });
            }));
        }, Promise.resolve(absolutePath.root()));
    }

    public rename(source: Path, destination: Path): Promise<void> {
        const rename = promisify(this.fs.rename);

        return rename(source.value, destination.value);
    }

    public tempFilePath(prefix = '', suffix = '.tmp'): Path {
        return Path.from(this.fs.realpathSync(this.os.tmpdir()), `${ prefix }${ cuid() }${ suffix }`);
    }

    private write(path: Path, data: string | NodeJS.ArrayBufferView, encoding?: string): Promise<Path> {
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
