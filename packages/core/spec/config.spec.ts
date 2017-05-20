import expect = require('./expect');
import { Config } from '../src/config';

interface Example {
    path?: string;
    mode?: 'dev' | 'prod';
    extensions?: string[];
}

describe('Config', () => {

    it('is a thin wrapper around the underlying object', () => {
        const defaults = { path: '/temp' };
        const config = new Config(defaults);

        expect(config.get).to.deep.equal(defaults);
    });

    it('is immutable', () => {
        const config = new Config({ path: '/temp' });
        config.get.path = '/sys';

        expect(config.get).to.deep.equal({
            path: '/temp',
        });
    });

    describe('merging', () => {

        it('merges config objects', () => {
            const config = new Config<Example>({ path: '/temp' }).mergedWith({ mode: 'dev' });

            expect(config.get).to.deep.equal({
                path: '/temp',
                mode: 'dev',
            });
        });

        it('creates a new Config object when two are merged', () => {
            const config = new Config<Example>({ path: '/temp' });
            const merged = config.mergedWith({ mode: 'dev' });

            expect(config.get).to.not.deep.equal(merged.get);

            expect(merged.get).to.deep.equal({
                path: '/temp',
                mode: 'dev',
            });
        });

        it('concatenates list of properties', () => {
            const config = new Config({ extensions: ['js', 'jsx'] }).mergedWith({ extensions: ['ts', 'tsx'] });

            expect(config.get).to.deep.equal({
                extensions: [
                    'js',
                    'jsx',
                    'ts',
                    'tsx',
                ],
            });
        });
    });

    describe('fallback', () => {

        it('provides defaults', () => {
            const config = new Config({  }).withFallback({ items: [] });

            expect(config.get).to.deep.equal({
                items: [],
            });
        });

        it('creates a new Config object when two are merged', () => {
            const config = new Config<Example>({ path: '/temp' });
            const merged = config.withFallback({ mode: 'dev' });

            expect(config.get).to.not.deep.equal(merged.get);

            expect(merged.get).to.deep.equal({
                path: '/temp',
                mode: 'dev',
            });
        });

        it('merges values, but overrides lists', () => {
            const config = new Config({ extensions: ['js', 'jsx'] }).withFallback({ extensions: ['ts', 'tsx'] });

            expect(config.get).to.deep.equal({
                extensions: ['js', 'jsx'],
            });
        });

        it('falls back to the defaults if no config is provided', () => {
            expect(new Config(undefined).withFallback({items: []}).get).to.deep.equal({
                items: [],
            });
        });
    });
});
