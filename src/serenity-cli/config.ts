import path = require('path');

export interface Configuration {
    artifact:    string;
    repository:  string;
    cacheDir:    string;
    reportDir:   string;
    featuresDir: string;
    sourceDir:   string;
}

export const defaults: Configuration = {
    artifact:    'net.serenity-bdd:serenity-cli:jar:all:0.0.1-rc.3',
    repository:  'https://dl.bintray.com/serenity/maven/',
    cacheDir:    path.resolve(__dirname,     '../../.cache'),
    reportDir:   path.resolve(process.cwd(), 'target/site/serenity'),
    featuresDir: path.resolve(process.cwd(), 'features'),
    sourceDir:   path.resolve(process.cwd(), 'target/site/serenity'),
};
