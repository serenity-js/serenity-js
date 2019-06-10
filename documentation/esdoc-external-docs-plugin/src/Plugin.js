const
    fs      = require('fs'),
    glob    = require('glob'),
    mkdirp  = require('mkdirp'),
    path    = require('path'),
    rimraf  = require('rimraf');

class Plugin {
    constructor() {
        this._enable = true;
        this._source = undefined;
        this._destination = undefined;
        this._externalImports = [];
    }

    onStart(ev) {
        if (!ev.data.option) return;
        if ('enable' in ev.data.option) this._enable = ev.data.option.enable;
    }

    onHandleConfig(ev) {
        if (!this._enable) return;

        this._source = ev.data.config.source;
        this._destination = ev.data.config.destination;

        glob.sync(ev.data.option.externals).forEach((pathToExports) => {
            const moduleName = pathToExports.match(/@serenity-js\/(.*?)\//)[1];

            const importsFileName = `.imports-from-${moduleName}.js`;
            const destination = path.join(this._source, importsFileName);

            this._externalImports.push(destination);

            fs.copyFileSync(pathToExports, path.resolve(destination))
        });
    }

    onHandleDocs(event) {

        // remove temp files
        this._externalImports.forEach(pathToExternalImportsFile => {
            rimraf.sync(pathToExternalImportsFile);

            const tagIndex = event.data.docs.findIndex(doc =>
                doc.kind === 'file' && doc.name === pathToExternalImportsFile,
            );

            event.data.docs.splice(tagIndex, 1);
        });

        /*
         * Mark as `builtinExternal` so that they're not parsed again by the SourceDocBuilder
         * see https://github.com/esdoc/esdoc-plugins/blob/master/esdoc-external-ecmascript-plugin/src/Plugin.js#L18
         */
        for (const doc of event.data.docs) {
            if (doc.kind === 'external' && this._externalImports.includes(doc.memberof)) {
                doc.builtinExternal = true;
            }
        }

        const exported = {};

        for (const doc of event.data.docs) {
            if (! (isImportable(doc) && belongsToSerenityJS(doc))) {
                continue;
            }

            const
                module     = moduleNameFrom(doc.importPath),
                id         = `${doc.importPath}~${doc.name}`,
                pathToDocs = `/modules/${ module }/${ doc.kind }/${ doc.longname }.html`;

            exported[module] = exported[module] || [];
            exported[module].push({
                id,
                pathToDocs,
            })
        }

        for (const module of Object.keys(exported)) {
            mkdirp.sync(this._destination);
            fs.writeFileSync(path.resolve(this._destination, 'exported.json'), JSON.stringify(exported[module], null, 4));
            fs.writeFileSync(path.resolve(this._destination, 'exported.js'), exported[module].map(doc =>
                `/** @external {${ doc.id }} ${ doc.pathToDocs } */`
            ).join('\n'));
        }
    }
}

function moduleNameFrom(importPath) {
    return importPath.match(/@serenity-js\/([\w]+)/)[1];
}

function belongsToSerenityJS(doc) {
    return doc.importPath
        && doc.importPath.startsWith('@serenity-js');
}

function isImportable(doc) {
    return !! doc.export
        && !! doc.importPath
        && (doc.access === 'public' || doc.access === 'protected' || ! doc.access);
}

module.exports = new Plugin();
