import { expect, test } from '@playwright/test';

import { formatRunLabel } from '../../app/utils/format';

test.describe('formatRunLabel', () => {

    test('shows only formatted timestamp when label is an ISO timestamp', () => {
        const result = formatRunLabel('2024-06-15T14:30:00.000Z', '2024-06-15T14:30:00.000Z');

        expect(result).not.toContain('2024-06-15T');
        expect(result).toContain('2024');
    });

    test('shows label and formatted timestamp when label is a CI build number', () => {
        const result = formatRunLabel('42', '2024-06-15T14:30:00.000Z');

        expect(result).toContain('42');
        expect(result).toContain('—');
        expect(result).toContain('2024');
    });

    test('shows label and formatted timestamp when label is a branch name', () => {
        const result = formatRunLabel('feat/html-reporter', '2024-06-15T14:30:00.000Z');

        expect(result).toContain('feat/html-reporter');
        expect(result).toContain('—');
    });
});
