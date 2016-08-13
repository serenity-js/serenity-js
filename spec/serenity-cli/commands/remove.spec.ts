import expect = require('../../expect');
import mockfs = require('mock-fs');
import winston = require('winston');

import { builder as args, handler as remove } from '../../../src/serenity-cli/commands/remove';
import { Directory } from 'mock-fs';

import { logger } from '../../../src/serenity-cli/logger';

describe('serenity remove', () => {

    const Default_Args = { cacheDir: args.cacheDir.default },
          Empty_Directory: Directory = <Directory> {};

    let log: { errorOutput: string[], writeOutput: string[] };

    beforeEach(() => {
        delete process.env.JAVA_HOME;

        logger.add(winston.transports.Memory);
        log = logger.transports['memory'];             // tslint:disable-line:no-string-literal
    });

    afterEach(() => {
        logger.remove(winston.transports.Memory);
        mockfs.restore();
    });

    describe ('considers the removal of the cache directory successful when it', () => {

        it ('existed and got correctly removed', () => {
            mockfs({
                '.cache': {
                    'serenity-cli-1.0.0-all.jar': '',
                },
            });

            return expect(remove(Default_Args))
                .to.be.eventually.fulfilled
                .then(() => {
                    expect('.cache').to.not.be.a.path;
                });
        });

        it ('never existed', () => {
            mockfs({
                '/tmp': Empty_Directory,
            });

            const customCacheDir = '/tmp/some/custom/cache';

            return expect(remove({ cacheDir: customCacheDir }))
                .to.be.eventually.fulfilled
                .then(() => {
                    expect(log.writeOutput.pop()).to.contain('Removed cache directory');

                    expect(customCacheDir).to.not.be.a.file;
                });
        });
    });

    describe ('notifies when the removal', () => {
        it ('was successful (default cache dir)', () => {
            mockfs({
                '.cache': {
                    'serenity-cli-1.0.0-all.jar': '',
                },
            });

            return expect(remove(Default_Args))
                .to.be.eventually.fulfilled
                .then(() => {
                    expect(log.writeOutput.pop()).to.contain('Removed cache directory');
                });
        });

        it ('was successful (custom cache dir)', () => {
            mockfs({
                '/tmp/serenity': {
                    'serenity-cli-1.0.0-all.jar': '',
                },
            });

            return expect(remove({ cacheDir: '/tmp/serenity' }))
                .to.be.eventually.fulfilled
                .then(() => {
                    expect(log.writeOutput.pop()).to.contain('Removed cache directory at /tmp/serenity');
                });
        });

        it ('failed because of the insufficient of permissions', () => {
            mockfs({
                '/some-system-dir': systemDirectoryWith({ 'sytem-file.sys': '' }),
            });

            return expect(remove({ cacheDir: '/some-system-dir' }))
                .to.be.eventually.rejectedWith('EACCES, permission denied \'/some-system-dir/sytem-file.sys\'')
                .then(() => {
                    expect(log.errorOutput.pop())
                        .to.contain('Couldn\'t remove the cache directory. EACCES, permission denied \'/some-system-dir/sytem-file.sys\'');
                });
        });
    });

    function systemDirectoryWith(files: any ): Directory {
        return mockfs.directory({ mode: 0o000, items: files });
    }
});
