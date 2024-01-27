import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import type { JSONObject } from 'tiny-types';

import { FileSystem } from '../../src/io/FileSystem';
import { Path } from '../../src/io/Path';
import { RequirementsHierarchy } from '../../src/io/RequirementsHierarchy';
import { expect } from '../expect';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { memfs } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

describe('RequirementsHierarchy', () => {

    const cwd = Path.from(process.cwd());

    describe('rootDirectory', () => {

        given([
            `features`,
            `spec`,
            `tests`,
            `test`,
            `src`,
        ]).
        it('auto-detects the requirements root directory ', (specDirectory) => {
            const guessedSpecDirectory = new RequirementsHierarchy(
                fileSystem({ '/home/alice/my-project': { [`${ specDirectory }`]: {} } })
            ).rootDirectory();

            expect(guessedSpecDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project/${ specDirectory }`)));
        })

        it('defaults to the current working directory when no requirements root directory is recognised', () => {
            const guessedSpecDirectory = new RequirementsHierarchy(
                fileSystem({ '/home/alice/my-project': { } })
            ).rootDirectory();

            expect(guessedSpecDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project`)));
        });

        it('can be configured to use a custom spec directory, as long as it exists', () => {
            const specDirectory = Path.from('e2e');
            const guessedSpecDirectory = new RequirementsHierarchy(
                fileSystem({ '/home/alice/my-project': { [`${ specDirectory.value }`]: {} } }),
                specDirectory,
            ).rootDirectory();

            expect(guessedSpecDirectory).to.equal(Path.from(`/home/alice/my-project`).join(specDirectory));
        });

        it('complains if the custom spec directory does not exist', () => {
            const specDirectory = Path.from('e2e');
            const requirementsHierarchy = new RequirementsHierarchy(
                fileSystem({ '/home/alice/my-project': { } }),
                specDirectory,
            );

            expect(() => requirementsHierarchy.rootDirectory()).to.throw(`Configured specDirectory \`${ specDirectory }\` does not exist`);
        });
    });

    it('represents the relative path to the spec file as a requirements hierarchy', () => {
        const requirementsHierarchy = new RequirementsHierarchy(
            fileSystem({
                '/home/alice/my-project': {
                    'features': {
                        'e-commerce': {
                            'payments': {
                                'card_payments': {
                                    'default_payment_method.feature': 'Feature: Default payment method'
                                }
                            }
                        }
                    }
                }
            })
        );

        const pathToSpec = Path.from(`/home/alice/my-project/features/e-commerce/payments/card_payments/default_payment_method.feature`);

        const requirements = requirementsHierarchy.hierarchyFor(pathToSpec);

        expect(requirements).to.deep.equal([
            'e-commerce',
            'payments',
            'card_payments',
            'default_payment_method',
        ]);
    });

    it('represents the requirements hierarchy as a list of requirement tags', () => {});

    // todo: should this include the feature tag? seems not...
});

function fileSystem(fakeDirectoryStructure: JSONObject) {
    const cwd = Path.from(Object.keys(fakeDirectoryStructure)[0]);
    return new FileSystem(cwd, memfs(fakeDirectoryStructure).fs)
}
