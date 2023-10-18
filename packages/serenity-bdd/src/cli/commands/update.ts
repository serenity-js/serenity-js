import { isTrue } from '@serenity-js/assertions';
import { actorCalled, Check, configure } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import * as https from 'https';
import { URL } from 'url';

import type { Argv } from '../Argv';
import { defaults } from '../defaults';
import { formatError } from '../io';
import { Credentials, GAV } from '../model';
import { Printer } from '../Printer';
import { DownloadArtifact, FileExists, Notify } from '../screenplay';
import { NotificationReporter, ProgressReporter, UpdateCommandActors } from '../stage';

const yargs = require('yargs'); // eslint-disable-line @typescript-eslint/no-var-requires

export = {
    command: 'update',
    desc: 'Makes sure the Serenity BDD CLI jar file is available and up to date',
    builder: {
        cacheDir: {
            default:   defaults.cacheDir,
            describe: 'A relative path to where the Serenity BDD CLI jar file should be stored',
        },
        ignoreSSL: {
            default:   false,
            type:     'boolean',
            describe: 'Ignore SSL certificates',
        },
        repository: {
            default:   defaults.repository,
            describe: 'Maven repository url where we should look for the Serenity BDD CLI artifact',
        },
        auth: {
            describe: `Credentials to authenticate with your repository - "<username>:<password>"`,
        },
        artifact: {
            default:   defaults.artifact,
            describe: `The GAV identifier of the Serenity BDD CLI artifact to use; You're best off with the default option unless you want to experiment.`,
        },
    },
    handler: async (argv: Argv): Promise<void> => {

        const
            printer = new Printer(process.stdout, process.stderr),
            artifactGAV = GAV.fromString(argv.artifact),
            pathToArtifact = new Path(argv.cacheDir).join(artifactGAV.toPath()),
            repository = new URL(argv.repository),
            ignoreSSL = Boolean(argv.ignoreSSL);

        configure({
            actors: new UpdateCommandActors(
                new Path(process.cwd()),
                {
                    baseURL: repository.toString(),
                    auth: Credentials.fromString(argv.auth).toJSON() as { username: string, password: string } | undefined,
                    httpsAgent: ignoreSSL
                        ? new https.Agent({ rejectUnauthorized: ! ignoreSSL })
                        : undefined,
                }
            ),
            crew: [
                new NotificationReporter(printer),
                new ProgressReporter(printer),
            ],
        });

        const actor = actorCalled('Serenity/JS Updater');

        try {
            await actorCalled('Serenity/JS Updater').attemptsTo(
                Check.whether(FileExists.at(pathToArtifact), isTrue())
                    .andIfSo(
                        Notify.that(`Looks like you're good to go! Serenity BDD CLI is already at ${ pathToArtifact.value }`),
                    )
                    .otherwise(
                        DownloadArtifact
                            .identifiedBy(artifactGAV)
                            .availableFrom(repository)
                            .to(pathToArtifact.directory()),
                    ),
            );
            await actor.dismiss();
        }
        catch (error) {
            printer.error(formatError(error));
            yargs.exit(1, error.message);
        }
    },
};
