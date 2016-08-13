import expect = require('../../expect');
import mockfs = require('mock-fs');
import { handler as update } from '../../../src/serenity-cli/commands/update';
import { defaults } from '../../../src/serenity-cli/config';
import { logger } from '../../../src/serenity-cli/logger';
import { default as filenameOf } from 'mvn-artifact-filename';
import { default as parseArtifact } from 'mvn-artifact-name-parser';
import winston = require('winston');

import nock = require('nock');
import { Directory } from 'mock-fs';

describe('serenity update', () => {

    const Artifact_File = filenameOf(parseArtifact(defaults.artifact)),
          File_Contents = 'some binary stuff';

    let log: { errorOutput: string[], writeOutput: string[] };

    beforeEach(() => {
        logger.add(winston.transports.Memory);
        log = logger.transports['memory'];             // tslint:disable-line:no-string-literal
    });

    afterEach(() => {
        logger.remove(winston.transports.Memory);

        mockfs.restore();
    });

    it ('does nothing if the Serenity BDD CLI jar is already downloaded', () => {

        mockfs({
            '.cache': directoryWith(Artifact_File),
        });

        return expect(update({ cacheDir: '.cache' })).to.be.eventually.fulfilled
            .then(() => {
                expect(log.writeOutput.pop()).to.contain('Serenity BDD CLI jar file is up to date');
            });
    });

    it ('downloads the Serenity BDD CLI if it is needed', () => {

        let scope = nock(defaults.repository)
            .get(new RegExp(Artifact_File))
            .reply(200);

        mockfs({});

        return expect(update({ cacheDir: '.' })).to.be.eventually.fulfilled
            .then(() => {
                expect(scope.isDone()).to.be.true;

                expect(Artifact_File).to.be.a.file;
            });
    });

    describe ('complains when the cache directory', () => {

        it ('cannot be accessed', () => {

            mockfs({
                '/inaccessible-dir': inaccessibleDirectoryWith({ 'some-file.sys': '' }),
            });

            return expect(update({ cacheDir: '/inaccessible-dir' }))
                .to.be.eventually.rejected
                .then(() => expect(log.errorOutput.pop()).to.contain(
                    'Couldn\'t access the cache directory. EACCES, permission denied'
                ));
        });

        it ('cannot be created', () => {

            mockfs({
                '/inaccessible-dir': inaccessibleDirectoryWith({ 'some-file.sys': '' }),
            });

            return expect(update({ cacheDir: '/inaccessible-dir/cache' }))
                .to.be.eventually.rejectedWith('EACCES, permission denied \'/inaccessible-dir/cache\'')
                .then(() => {
                    expect(log.errorOutput.pop()).to.contain('Couldn\'t create a cache directory. EACCES, permission denied');
                });
        });
    });

    function directoryWith(filename: string): Directory {
        let dir = <Directory> {};

        dir[filename] = File_Contents;

        return dir;
    }

    function inaccessibleDirectoryWith(files: any ): Directory {
        return mockfs.directory({ mode: 0o000, items: files });
    }
});
