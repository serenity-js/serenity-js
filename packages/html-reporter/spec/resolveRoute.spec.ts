import { expect, test } from '@playwright/test';

import { resolveRoute } from '../template/router/resolveRoute';
import type { RouteDefinition } from '../template/router/RouteDefinition';

const stubView = () => null;
const stubData = () => ({});

const testRoutes: RouteDefinition[] = [
    { pattern: '/', title: 'Dashboard', view: stubView, data: stubData },
    { pattern: '/tests/:id', title: 'Detail', view: stubView, data: stubData },
    { pattern: '/tests', title: 'Tests', view: stubView, data: stubData },
    { pattern: '/capabilities', title: 'Capabilities', view: stubView, data: stubData },
    { pattern: '/errors', title: 'Errors', view: stubView, data: stubData },
    { pattern: '/tags', title: 'Tags', view: stubView, data: stubData },
];

test.describe('resolveRoute', () => {

    test('matches exact route for root', () => {
        const match = resolveRoute('/', testRoutes);

        expect(match).toBeDefined();
        expect(match!.definition.title).toBe('Dashboard');
        expect(match!.params.path).toBe('/');
        expect(match!.params.query.toString()).toBe('');
        expect(match!.params.segment).toBeUndefined();
    });

    test('matches exact route with trailing slash', () => {
        const match = resolveRoute('/tags/', testRoutes);

        expect(match).toBeDefined();
        expect(match!.definition.title).toBe('Tags');
        expect(match!.params.path).toBe('/tags/');
    });

    test('matches route with query parameters', () => {
        const match = resolveRoute('/tests?filter=failed&sort=name', testRoutes);

        expect(match).toBeDefined();
        expect(match!.definition.title).toBe('Tests');
        expect(match!.params.path).toBe('/tests');
        expect(match!.params.query.get('filter')).toBe('failed');
        expect(match!.params.query.get('sort')).toBe('name');
    });

    test('matches dynamic segment route', () => {
        const match = resolveRoute('/tests/spec.ts%3A5', testRoutes);

        expect(match).toBeDefined();
        expect(match!.definition.title).toBe('Detail');
        expect(match!.params.path).toBe('/tests/spec.ts%3A5');
        expect(match!.params.segment).toBe('spec.ts%3A5');
    });

    test('matches dynamic segment route with query parameters', () => {
        const match = resolveRoute('/tests/spec.ts%3A5?run=2024-01-01', testRoutes);

        expect(match).toBeDefined();
        expect(match!.definition.title).toBe('Detail');
        expect(match!.params.segment).toBe('spec.ts%3A5');
        expect(match!.params.query.get('run')).toBe('2024-01-01');
    });

    test('returns undefined for unmatched routes', () => {
        const match = resolveRoute('/nonexistent', testRoutes);

        expect(match).toBeUndefined();
    });

    test('evaluates routes in order — dynamic segment before exact match', () => {
        // '/tests/:id' is before '/tests' in the table, so '/tests/foo' matches detail
        const match = resolveRoute('/tests/foo', testRoutes);

        expect(match).toBeDefined();
        expect(match!.definition.title).toBe('Detail');
    });

    test('matches empty string to root route', () => {
        // Edge case: the hash history often returns '' for the root
        const routesWithEmpty: RouteDefinition[] = [
            { pattern: '/', title: 'Dashboard', view: stubView, data: stubData },
        ];
        // Empty string doesn't match '/' directly — the App normalises this
        const match = resolveRoute('', routesWithEmpty);

        expect(match).toBeUndefined();
    });

    test('does not match a dynamic segment route when path equals prefix only', () => {
        // '/tests/' with trailing slash should NOT match '/tests/:id' because there's no segment
        const routesOnlyDynamic: RouteDefinition[] = [
            { pattern: '/tests/:id', title: 'Detail', view: stubView, data: stubData },
        ];
        const match = resolveRoute('/tests/', routesOnlyDynamic);

        // '/tests/' has path '/tests/' and prefix is '/tests/' so path.length equals prefix.length
        expect(match).toBeUndefined();
    });

    test('matches capabilities route with query', () => {
        const match = resolveRoute('/capabilities?path=features/login', testRoutes);

        expect(match).toBeDefined();
        expect(match!.definition.title).toBe('Capabilities');
        expect(match!.params.query.get('path')).toBe('features/login');
    });
});
