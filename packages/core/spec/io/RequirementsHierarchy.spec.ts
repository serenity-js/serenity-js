import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import type { JSONObject } from 'tiny-types';

import { FileSystem } from '../../src/io/FileSystem';
import { Path } from '../../src/io/Path';
import { RequirementsHierarchy } from '../../src/io/RequirementsHierarchy';
import { CapabilityTag, FeatureTag, ThemeTag } from '../../src/model/tags';
import { expect } from '../expect';

const { memfs } = require('memfs'); // Typings incorrectly assume the presence of "dom" lib

describe('RequirementsHierarchy', () => {

    const cwd = Path.from(process.cwd());

    describe('rootDirectory', () => {

        given([
            `features`,
            `specs`,
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
        });

        it('defaults to the current working directory when no requirements root directory is recognised', () => {
            const guessedSpecDirectory = new RequirementsHierarchy(
                fileSystem({ '/home/alice/my-project': {} })
            ).rootDirectory();

            expect(guessedSpecDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project`)));
        });

        it('can be configured to use a custom spec directory, as long as it exists', () => {
            const specDirectory = Path.from('e2e');
            const guessedSpecDirectory = new RequirementsHierarchy(
                fileSystem({ '/home/alice/my-project': { [`${ specDirectory.value }`]: {} } }),
                specDirectory,
            ).rootDirectory();

            expect(guessedSpecDirectory).to.equal(cwd.resolve(Path.from(`/home/alice/my-project`).join(specDirectory)));
        });

        it('complains if the custom spec directory does not exist', () => {
            const specDirectory = Path.from('e2e');
            const requirementsHierarchy = new RequirementsHierarchy(
                fileSystem({ '/home/alice/my-project': {} }),
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

    describe('requirement tags', () => {

        it('generates feature tag based on the spec file name when no override is given', () => {
            const requirementsHierarchy = new RequirementsHierarchy(
                fileSystem({
                    '/home/alice/my-project': {
                        'features': {
                            'default_payment_method.feature': 'Feature: Default payment method'
                        }
                    }
                }),
            );

            const tags = requirementsHierarchy.requirementTagsFor(cwd.resolve(Path.from('/home/alice/my-project/features/default_payment_method.feature')));

            expect(tags).to.have.lengthOf(1);
            expect(tags[0]).to.equal(new FeatureTag('Default payment method'));
        });

        it('generates feature tag based on the externally detected feature name when the override is given', () => {
            const requirementsHierarchy = new RequirementsHierarchy(
                fileSystem({
                    '/home/alice/my-project': {
                        'features': {
                            'payment_with_mycardprovider.spec.ts': 'describe(`Payment with MyCardProvider`)'
                        }
                    }
                }),
            );

            const tags = requirementsHierarchy.requirementTagsFor(
                cwd.resolve(Path.from('/home/alice/my-project/features/payment_with_mycardprovider.spec.ts')),
                'Payment with MyCardProvider',
            );

            expect(tags).to.have.lengthOf(1);
            expect(tags[0]).to.equal(new FeatureTag('Payment with MyCardProvider'));
        });

        it('generates a capability tag when the spec file is nested in a sub-directory', () => {

            const requirementsHierarchy = new RequirementsHierarchy(
                fileSystem({
                    '/home/alice/my-project': {
                        'features': {
                            'payments': {
                                'default_payment_method.feature': 'Feature: Default payment method'
                            }
                        }
                    }
                }),
            );

            const tags = requirementsHierarchy.requirementTagsFor(
                cwd.resolve(Path.from('/home/alice/my-project/features/payments/default_payment_method.feature'))
            );

            expect(tags).to.have.lengthOf(2);
            expect(tags[0]).to.equal(new CapabilityTag('Payments'));
            expect(tags[1]).to.equal(new FeatureTag('Default payment method'));
        });

        it('generates theme tags when the spec file is deeply nested', () => {

            const requirementsHierarchy = new RequirementsHierarchy(
                fileSystem({
                    '/home/alice/my-project': {
                        'features': {
                            'sales': {
                                'e-commerce': {
                                    'payments': {
                                        'card_payments': {
                                            'default_payment_method.feature': 'Feature: Default payment method'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }),
            );

            const tags = requirementsHierarchy.requirementTagsFor(
                cwd.resolve(Path.from('/home/alice/my-project/features/sales/e-commerce/payments/card_payments/default_payment_method.feature'))
            );

            expect(tags).to.have.lengthOf(5);
            expect(tags[0]).to.equal(new ThemeTag('Sales'));
            expect(tags[1]).to.equal(new ThemeTag('E-commerce'));
            expect(tags[2]).to.equal(new ThemeTag('Payments'));
            expect(tags[3]).to.equal(new CapabilityTag('Card payments'));
            expect(tags[4]).to.equal(new FeatureTag('Default payment method'));
        });
    });
});

function fileSystem(fakeDirectoryStructure: JSONObject) {
    const cwd = Path.from(Object.keys(fakeDirectoryStructure)[0]);
    return new FileSystem(cwd, memfs(fakeDirectoryStructure).fs);
}
