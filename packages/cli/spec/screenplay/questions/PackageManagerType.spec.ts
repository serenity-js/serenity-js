import type * as fs from 'node:fs';

import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { PackageManagerType, UseNodeModules } from '../../../src';

describe('PackageManagerType', () => {

    describe('when detecting package manager', () => {

        it('detects npm from package-lock.json', async () => {
            const mockFs = createMockFs({
                'package-lock.json': true,
            });

            const actor = createActorWith(mockFs);
            const result = await PackageManagerType().answeredBy(actor as any);

            expect(result).to.equal('npm');
        });

        it('detects yarn from yarn.lock', async () => {
            const mockFs = createMockFs({
                'yarn.lock': true,
            });

            const actor = createActorWith(mockFs);
            const result = await PackageManagerType().answeredBy(actor as any);

            expect(result).to.equal('yarn');
        });

        it('detects pnpm from pnpm-lock.yaml', async () => {
            const mockFs = createMockFs({
                'pnpm-lock.yaml': true,
            });

            const actor = createActorWith(mockFs);
            const result = await PackageManagerType().answeredBy(actor as any);

            expect(result).to.equal('pnpm');
        });

        it('defaults to npm when no lock file found', async () => {
            const mockFs = createMockFs({});

            const actor = createActorWith(mockFs);
            const result = await PackageManagerType().answeredBy(actor as any);

            expect(result).to.equal('npm');
        });

        it('prefers pnpm over npm when both lock files exist', async () => {
            const mockFs = createMockFs({
                'package-lock.json': true,
                'pnpm-lock.yaml': true,
            });

            const actor = createActorWith(mockFs);
            const result = await PackageManagerType().answeredBy(actor as any);

            expect(result).to.equal('pnpm');
        });

        it('has a meaningful description', () => {
            const question = PackageManagerType();
            expect(question.toString()).to.include('package manager type');
        });
    });
});

function createMockFs(files: Record<string, boolean>) {
    return {
        promises: {
            readdir: sinon.stub().resolves([]),
            readFile: sinon.stub().rejects(new Error('Not found')),
            access: sinon.stub().callsFake(async (path: string) => {
                const filename = path.split('/').pop();
                if (filename && files[filename]) {
                    return;
                }
                throw new Error('ENOENT');
            }),
        },
    } as unknown as typeof fs;
}

function createActorWith(mockFs: typeof fs) {
    const ability = UseNodeModules.at('/test/project', mockFs);

    return {
        abilityTo: <T>(abilityType: new (...args: any[]) => T): T => {
            if (abilityType === UseNodeModules as any) {
                return ability as unknown as T;
            }
            throw new Error(`Unknown ability: ${ abilityType }`);
        },
    };
}
