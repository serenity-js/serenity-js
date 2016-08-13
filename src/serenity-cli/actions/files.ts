import fs = require('fs');
import constants = require('constants');
import { format } from 'util';

import { Stats } from 'fs';
import mkdirp = require('mkdirp');
import rimraf = require('rimraf');

import { default as filename } from 'mvn-artifact-filename';
import { default as parse } from 'mvn-artifact-name-parser';

export const ensureDirectoryIsPresent = (destination: string) => () => new Promise<string>((resolve, reject) => {

    mkdirp(destination, (error?: Error) => {
        if (!! error) {
            reject(error);
        } else {
            resolve(destination);
        }
    });
});

export const ensureFileIsPresent = (destination: string) => new Promise<string>((resolve, reject) => {

    fs.access(destination, constants.F_OK | constants.X_OK, (error?: Error) => {
        if (!! error) {
            reject(new Error(format('Couldn\'t access "%s"', destination)));
        } else {
            resolve(destination);
        }
    });
});

export const removeDirectory = (destination: string) => () => new Promise<string>((resolve, reject) => {

    rimraf(destination, (error: Error) => {
        if (!! error) {
            reject(error);
        } else {
            resolve(destination);
        }
    });
});

export const checkIfFileMissing = (pathToFile: string) => new Promise<boolean>((resolve, reject) => {
    fs.stat(pathToFile, (error: NodeJS.ErrnoException, stats: Stats) => {
        if (!! error) {
            if (error.code === 'ENOENT') {
                resolve(true);
            }
            else {
                reject(error);
            }
        }

        resolve(stats && ! stats.isFile());
    });
});

export const filenameOf = (artifact: string) => filename(parse(artifact));
