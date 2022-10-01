import { Answerable, AnswersQuestions, CollectsArtifacts, ConfigurationError, Interaction, UsesAbilities } from '@serenity-js/core';
import { d, Path } from '@serenity-js/core/lib/io';
import { CallAnApi } from '@serenity-js/rest';
import { AxiosRequestConfig } from 'axios';

import { DownloadProgressReport, Notification } from '../../model';
import { UseFileSystem } from '../abilities';

/**
 * @package
 */
export class StreamResponse extends Interaction {

    static to(request: Answerable<AxiosRequestConfig>) {    // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
        return {
            to: (destination: Path) => new StreamResponse(request, destination),
        };
    }

    constructor(
        private readonly request: Answerable<AxiosRequestConfig>,
        private readonly destination: Path,
    ) {
        super(d`#actor saves response to ${ request } in ${ destination.value }`);
    }

    /**
     * @desc
     *  Makes the provided {@apilink @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@apilink @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & CollectsArtifacts & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@apilink @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@apilink @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@apilink @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
     * @see {@apilink @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.request)
            .then((config: AxiosRequestConfig) => CallAnApi.as(actor).request({
                ...config,
                responseType: 'stream',
            })
            .then(response => {
                if (response.status !== 200) {
                    throw new ConfigurationError(`Received: "${ response.status } ${ response.statusText }" when trying to download ${ config.url }`);
                }

                return response;
            })
            .then(response => new Promise((resolve, reject) => {

                actor.collect(Notification.fromJSON({ message: `Downloading ${ config.url } to ${ this.destination.value }` }));

                const
                    totalBytes  = Number.parseInt(response.headers['content-length'], 10),
                    output      = UseFileSystem.as(actor).createWriteStreamTo(this.destination);

                let totalDownloadedBytes  = 0;

                response.data.pipe(output);

                response.data.on('data', chunk => {
                    const downloadedBytes = chunk.length;
                    totalDownloadedBytes += downloadedBytes;

                    actor.collect(DownloadProgressReport.fromJSON({
                        downloadedBytes,
                        totalDownloadedBytes,
                        totalBytes,
                    }));
                });

                response.data.on('end', () => {
                    output.end();
                    return resolve();
                });

                response.data.on('error', error => reject(error));
            })));
    }
}
