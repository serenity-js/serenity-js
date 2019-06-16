const
    babel = require('@babel/parser'),
    ts = require('typescript'),
    CommentParser = require('esdoc/out/src/Parser/CommentParser').default;

class Plugin {
    constructor() {
        this._enable = true;
    }

    onStart(ev) {
        if (!ev.data.option) return;
        if ('enable' in ev.data.option) this._enable = ev.data.option.enable;
    }

    onHandleConfig(ev) {
        if (!this._enable) return;

        if (!ev.data.config.includes)  ev.data.config.includes = [];
        ev.data.config.includes.push('\\.ts$', '\\.js$');
    }

    onHandleDocs(event) {

        // clean up - simplify import path
        for (const doc of event.data.docs) {
            if (! (isImportable(doc) && belongsToSerenityJS(doc))) {
                continue;
            }

            doc.importPath = importPathToClosestPackageFrom(doc.importPath);
        }
    }

    onHandleCodeParser(ev) {
        if (!this._enable) return;

        const filePath = ev.data.filePath;

        ev.data.parser = code => {

            try {
                const sourceCode = this._convertTypeScriptToDocumentedJavaScript(filePath, code);

                return babel.parse(sourceCode, {
                    sourceType: 'module',
                    plugins: [
                        // 'classPrivateProperties',
                        // 'classPrivateMethods',
                        'classProperties',
                        'objectRestSpread',
                        'typescript',
                    ],
                });
            } catch (error) {
                console.error('Parsing failure', error);
                console.debug(code);

                throw error;
            }
        }
    }

    _convertTypeScriptToDocumentedJavaScript(filePath, code) {

        // hack: make typescript code look like es6
        const es6code = code
            // replace interface with an abstract class so that it's preserved
            .replace(/(\*\/)(?:.|[\r\n])*export[\s]+interface/mg, '* @interface */\nexport abstract class')
        ;

        // create ast and get target nodes
        const sourceFile = ts.createSourceFile(filePath, es6code, ts.ScriptTarget.Latest, true);
        const nodes = this._getTargetTSNodes(sourceFile);

        // rewrite jsdoc comment
        nodes.sort((a,b) => b.pos - a.pos); // hack: transpile comment with reverse
        const lines = [...es6code];
        for (const node of nodes) {
            const jsDocNode = this._getJSDocNode(node);

            if (jsDocNode && jsDocNode.comment) lines.splice(jsDocNode.pos, jsDocNode.end - jsDocNode.pos);

            const newComment = this._transpileComment(node, jsDocNode && jsDocNode.comment ? jsDocNode.comment : '', es6code);
            lines.splice(node.pos, 0, newComment);
        }

        return lines.join('');
    }

    _getTargetTSNodes(sourceFile) {
        const nodes = [];
        walk(sourceFile);
        return nodes;

        function walk(node) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.MethodDeclaration:
                case ts.SyntaxKind.PropertyDeclaration:
                case ts.SyntaxKind.PropertySignature:
                case ts.SyntaxKind.GetAccessor:
                case ts.SyntaxKind.SetAccessor:
                case ts.SyntaxKind.FunctionDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                case ts.SyntaxKind.TypeAliasDeclaration:
                    nodes.push(node);
                    break;
            }

            ts.forEachChild(node, walk);
        }
    }

    _getJSDocNode(node) {
        if (!node.jsDoc) return null;

        return node.jsDoc[node.jsDoc.length - 1];
    }

    _transpileComment(node, comment, code) {
        const esNode = {type: 'CommentBlock', value: `*\n${comment}`};
        const tags = CommentParser.parse(esNode);

        this._applyLOC(node, tags, code);

        switch(node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                // do nothing
                break;
            case ts.SyntaxKind.MethodDeclaration:
                this._applyCallableParam(node, tags);
                this._applyCallableReturn(node, tags);
                this._applyAccessModifiers(node, tags);
                break;
            case ts.SyntaxKind.PropertyDeclaration:
                this._applyClassProperty(node, tags);
                this._applyAccessModifiers(node, tags);
                break;
            case ts.SyntaxKind.PropertySignature:
                this._applyClassProperty(node, tags);
                this._applyAccessModifiers(node, tags);
                break;
            case ts.SyntaxKind.GetAccessor:
                this._applyClassMethodGetter(node, tags);
                break;
            case ts.SyntaxKind.SetAccessor:
                this._applyClassMethodSetter(node, tags);
                break;
            case ts.SyntaxKind.FunctionDeclaration:
                this._applyCallableParam(node, tags);
                this._applyCallableReturn(node, tags);
                break;
        }

        return `\n/*${CommentParser.buildComment(tags)} */\n`;
    }

    _applyAccessModifiers(node, tags) {
        const flags = ts.getCombinedModifierFlags(node);

        const
            isStatic = flags & ts.ModifierFlags.Static,
            isAbstract = flags & ts.ModifierFlags.Abstract,
            isPublic = flags & ts.ModifierFlags.Public,
            isProtected = flags & ts.ModifierFlags.Protected,
            isPrivate = flags & ts.ModifierFlags.Private;

        if (isStatic) {
            tags.push({ tagName: '@static', tagValue: '\\TRUE' }) ;
        }

        if (isProtected) {
            tags.push({ tagName: '@protected', tagValue: '\\TRUE' });
        }

        if (isPrivate) {
            tags.push({ tagName: '@private', tagValue: '\\TRUE' });
        }

        if (isAbstract) {
            tags.push({ tagName: '@abstract', tagValue: '\\TRUE' });
        }

        if (isPublic || ! (isPublic || isProtected || isPrivate)) {
            tags.push({ tagName: '@public', tagValue: '\\TRUE' });
        }
    }

    _applyLOC(node, tags, code) {
        let loc = 1;
        const codeChars = [...code];
        for (let i = 0; i < node.name.end; i++) {
            if (codeChars[i] === '\n') loc++;
        }
        tags.push({tagName: '@lineNumber', tagValue: `${loc}`});
    }

    _applyCallableParam(node, tags) {
        const types = node.parameters.map(param => {
            return {
                type: this._getTypeOf(param),
                name: param.name.text
            };
        });

        const paramTags = tags.filter(tag => tag.tagName === '@param');

        // merge
        // case: params without comments
        if (paramTags.length === 0 && types.length) {
            const tmp = types.map(({type, name}) => {
                return {
                    tagName: '@param',
                    tagValue: `{${type}} ${name}`
                };
            });
            tags.push(...tmp);
            return;
        }

        // case: params with comments
        if (paramTags.length === types.length) {
            for (let i = 0; i < paramTags.length; i++) {
                const paramTag = paramTags[i];
                const type = types[i];
                if (paramTag.tagValue.charAt(0) !== '{') { // does not have type
                    paramTag.tagValue = `{${type.type}} ${paramTag.tagValue}`;
                }
            }
            return;
        }

        // case: mismatch params and comments
        throw new Error('mismatch params and comments');
    }

    _applyCallableReturn(node, tags) {
        if (!node.type) return;

        // get type
        const type = this._getTypeOf(node);
        if (!type) return;

        // get comments
        const returnTag = tags.find(tag => tag.tagName === '@return' || tag.tagName === '@returns');

        // merge
        if (returnTag && returnTag.tagValue.charAt(0) !== '{') { // return with comment but does not have type
            returnTag.tagValue = `{${type}} ${returnTag.tagValue}`;
        } else {
            tags.push({tagName: '@return', tagValue: `{${type}}`});
        }
    }

    _applyClassMethodGetter(node, tags) {
        if (!node.type) return;

        // get type
        const type = this._getTypeOf(node);
        if (!type) return;

        // get comments
        const typeComment = tags.find(tag => tag.tagName === '@type');

        if (typeComment && typeComment.tagValue.charAt(0) !== '{') { // type with comment but does not have tpe
            typeComment.tagValue = `{${type}}`;
        } else {
            tags.push({tagName: '@type', tagValue: `{${type}}`});
        }
    }

    _applyClassMethodSetter(node, tags) {
        if (!node.parameters) return;

        // get type
        const type = this._getTypeOf(node.parameters[0]);
        if (!type) return;

        // get comment
        const typeComment = tags.find(tag => tag.tagName === '@type');
        if (typeComment) return;

        // merge
        // case: param without comment
        tags.push({tagName: '@type', tagValue: `{${type}}`});
    }

    _applyClassProperty(node, tags) {
        if (!node.type) return;

        // get type
        // const type = this._getTypeFromAnnotation(node.type);
        const type = this._getTypeOf(node);
        if (!type) return;

        // get comments
        const typeComment = tags.find(tag => tag.tagName === '@type');

        if (typeComment && typeComment.tagValue && typeComment.tagValue.charAt(0) !== '{') { // type with comment but does not have tpe
            typeComment.tagValue = `{${type}}`;
        } else {
            tags.push({tagName: '@type', tagValue: `{${type}}`});
        }
    }

    _getTypeOf(node) {
        if (node.typeName) {
            return node.typeName.escapedText;
        }

        if (! node.type) {
            // todo: console.log('>> no type', node);
            return 'undefined';
        }

        switch (node.type.kind) {
            case ts.SyntaxKind.NumberKeyword:  return 'number';
            case ts.SyntaxKind.StringKeyword:  return 'string';
            case ts.SyntaxKind.BooleanKeyword: return 'boolean';
            case ts.SyntaxKind.VoidKeyword:    return 'void';
            case ts.SyntaxKind.AnyKeyword:     return 'any';
            case ts.SyntaxKind.FunctionType:   return 'Function';
            case ts.SyntaxKind.UnionType:
                return node.type.types
                    .map(type => this._getTypeOf(type))
                    .join(' | ');
            case ts.SyntaxKind.IntersectionType:
                return node.type.types
                    .map(type => this._getTypeOf(type))
                    .join(' & ');
            // case ts.SyntaxKind.TypeLiteral:
            //     // console.log('>> object', typeNode.members)
            //     return 'object';
            case ts.SyntaxKind.TypeReference:
                return node.type.typeName.text;
            default:
                // todo: console.log('>> _getTypeOf', node.name && node.name.escapedText, ts.SyntaxKind[node.type.kind]);
                return 'UNKNOWN';
        }
    }
}

function importPathToClosestPackageFrom(importPath) {
    const segments = importPath.replace('src','lib')
        .split('/')
        .filter(s => ! s.endsWith('.ts'));

    if (segments.length <= 3) {  // '@serenity-js/module-name/lib'
        return segments.slice(0, 2).join('/');
    }

    return  segments.join('/');
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
