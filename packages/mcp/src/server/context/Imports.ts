import type { ImportManifest } from '../schema.js';

function isTypeOnlyImport(importSpecifier: string): boolean {
    return importSpecifier.startsWith('type ');
}

function getBaseName(importSpecifier: string): string {
    return isTypeOnlyImport(importSpecifier) ? importSpecifier.slice(5) : importSpecifier;
}

function getImportInfo(moduleImports: string[], baseName: string) {
    const hasValueImport = moduleImports.includes(baseName);
    const typeOnlyImportSpecifier = `type ${ baseName }`;
    const typeOnlyImportIndex = moduleImports.indexOf(typeOnlyImportSpecifier);
    const hasTypeOnlyImport = typeOnlyImportIndex !== -1;

    return {
        hasValueImport,
        hasTypeOnlyImport,
        typeOnlyImportIndex,
    };
}

function withTypeOnlyImport(moduleImports: string[], importSpecifier: string, hasValueImport: boolean, hasTypeOnlyImport: boolean): string[] {
    if (!hasValueImport && !hasTypeOnlyImport) {
        return [ ...moduleImports, importSpecifier ];
    }
    return moduleImports;
}

function withValueImport(moduleImports: string[], importSpecifier: string, hasValueImport: boolean, hasTypeOnlyImport: boolean, typeOnlyImportIndex: number): string[] {
    if (hasTypeOnlyImport) {
        const result = [ ...moduleImports ];
        result[typeOnlyImportIndex] = importSpecifier;
        return result;
    }

    if (!hasValueImport) {
        return [ ...moduleImports, importSpecifier ];
    }

    return moduleImports;
}

function processImportSpecifier(moduleImports: string[], importSpecifier: string): string[] {
    const baseName = getBaseName(importSpecifier);
    const { hasValueImport, hasTypeOnlyImport, typeOnlyImportIndex } = getImportInfo(moduleImports, baseName);

    if (isTypeOnlyImport(importSpecifier)) {
        return withTypeOnlyImport(moduleImports, importSpecifier, hasValueImport, hasTypeOnlyImport);
    }

    return withValueImport(moduleImports, importSpecifier, hasValueImport, hasTypeOnlyImport, typeOnlyImportIndex);
}

function processModuleImports(moduleSpecifier: string, importSpecifiers: string[], result: ImportManifest): ImportManifest {
    const updatedImports = importSpecifiers.reduce(
        (accumulator, importSpecifier) => processImportSpecifier(accumulator, importSpecifier),
        result[moduleSpecifier] || []
    );

    return {
        ...result,
        [moduleSpecifier]: updatedImports
    };
}

function mergeImportManifest(aggregateManifest: ImportManifest, importManifest: ImportManifest): ImportManifest {
    return Object.entries(importManifest)
        .reduce((moduleAccumulator, [ moduleSpecifier, importSpecifiers ]) => {
            return processModuleImports(moduleSpecifier, importSpecifiers, moduleAccumulator);
        }, aggregateManifest);
}

function sortImportsAlphabetically(importSpecifiers: string[]): string[] {
    return [ ...importSpecifiers ].sort((a, b) => {
        const aBaseName = getBaseName(a);
        const bBaseName = getBaseName(b);

        return aBaseName.localeCompare(bBaseName);
    });
}

function sortAllImports(importManifest: ImportManifest): ImportManifest {
    return Object.entries(importManifest).reduce((sortedResult, [ moduleSpecifier, importSpecifiers ]) => {
        return {
            ...sortedResult,
            [moduleSpecifier]: sortImportsAlphabetically(importSpecifiers)
        };
    }, {} as ImportManifest);
}

// todo: could use a clean-up
function mergeImports(importManifests: Array<ImportManifest>): ImportManifest {
    const mergedImports = importManifests.reduce(mergeImportManifest, {} as ImportManifest);
    return sortAllImports(mergedImports);
}

export class Imports {
    constructor(private readonly imports: ImportManifest = {}) {
    }

    merge(imports: ImportManifest): Imports {
        return new Imports(mergeImports([this.imports, imports]))
    }

    toJSON(): ImportManifest {
        return this.imports;
    }

    withoutTypeImports(): Imports {
        const filteredImports: ImportManifest = {};

        for (const [ moduleName, identifiers ] of Object.entries(this.imports)) {
            const valueIdentifiers = identifiers.filter(identifier => !isTypeOnlyImport(identifier));

            if (valueIdentifiers.length > 0) {
                filteredImports[moduleName] = valueIdentifiers;
            }
        }

        return new Imports(filteredImports);
    }
}
