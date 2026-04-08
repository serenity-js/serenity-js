import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import type { ModuleUpdate, UpdateReport } from '../../src';

describe('UpdateReport', () => {

    it('contains upToDate, updates, and updateCommand', () => {
        const report: UpdateReport = {
            upToDate: true,
            updates: [],
            updateCommand: null,
        };

        expect(report).to.have.property('upToDate', true);
        expect(report).to.have.property('updates');
        expect(report).to.have.property('updateCommand', null);
    });

    it('upToDate is true when updates array is empty', () => {
        const report: UpdateReport = {
            upToDate: true,
            updates: [],
            updateCommand: null,
        };

        expect(report.upToDate).to.equal(true);
        expect(report.updates).to.have.length(0);
    });

    it('upToDate is false when updates array has items', () => {
        const updates: ModuleUpdate[] = [
            {
                name: '@serenity-js/core',
                currentVersion: '3.0.0',
                latestVersion: '3.42.0',
            },
        ];

        const report: UpdateReport = {
            upToDate: false,
            updates,
            updateCommand: 'npm install @serenity-js/core@3.42.0',
        };

        expect(report.upToDate).to.equal(false);
        expect(report.updates).to.have.length(1);
        expect(report.updateCommand).to.be.a('string');
    });

    it('ModuleUpdate contains name, currentVersion, and latestVersion', () => {
        const update: ModuleUpdate = {
            name: '@serenity-js/core',
            currentVersion: '3.0.0',
            latestVersion: '3.42.0',
        };

        expect(update).to.have.property('name', '@serenity-js/core');
        expect(update).to.have.property('currentVersion', '3.0.0');
        expect(update).to.have.property('latestVersion', '3.42.0');
    });
});
