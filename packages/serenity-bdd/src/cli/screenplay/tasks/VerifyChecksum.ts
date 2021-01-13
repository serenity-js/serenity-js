import { Ensure, equals } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { GetRequest, LastResponse, Send } from '@serenity-js/rest';
import { Checksum } from '../questions';

/**
 * @package
 */
export const VerifyChecksum = {
    at: (checksumUrl: string) => ({
        against: (downloadedFile: Path) => ({
            calculatedUsing: (hashingAlgorithm: string) =>
                Task.where(`#actor verifies checksum at ${ checksumUrl } against ${ downloadedFile.value }`,
                    Send.a(GetRequest.to(checksumUrl)),
                    Ensure.that(Checksum.of(downloadedFile).calculatedUsing(hashingAlgorithm), equals(LastResponse.body<string>().describedAs('expected checksum'))),
                ),
        }),
    }),
};
