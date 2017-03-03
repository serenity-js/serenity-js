import * as fs from 'graceful-fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

export class FileSystem {

    constructor(private root: string) {}

    public store(relativePathToFile: string, data: any): Promise<string> {
        return this.ensureSpecified(relativePathToFile)
            .then(relativePath => this.prepareDirectory(relativePath))
            .then(absolutePath => this.write(absolutePath, data));
    }

    private ensureSpecified(relativePathToFile: string): Promise<string> {
        return !! (relativePathToFile && relativePathToFile.length)
            ? Promise.resolve(relativePathToFile)
            : Promise.reject<string>(new Error('Please specify where the file should be saved'));
    }

    private prepareDirectory(relativePathToFile: string): PromiseLike<string> {
        const
            absolutePath = path.resolve(this.root, relativePathToFile),
            parent       = path.dirname(absolutePath);

        return new Promise((resolve, reject) => {

            mkdirp(parent, error => {
                if (error) {
                    reject(error);
                }

                resolve(absolutePath);
            });
        });
    }

    private write(path: string, data: any): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, error => {
                if (error) {
                    reject(error);
                }

                resolve(path);
            });
        });
    }
}
