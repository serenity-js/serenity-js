const
    assert = require('assert'),
    path   = require('path'),
    fs     = require('fs'),
    AbstractDoc = require('esdoc/out/src/Doc/AbstractDoc').default;

// --- Monkey patches

/**
 * esdoc/out/src/Parser/ParamParser
 *
 * The original ParamParser does not support @link tags leading to a scoped package,
 * for example {@link @serenity-js/core/lib/screenplay~Actor}.
 * This patch adds support for this behaviour.
 */
function patched_parseParamValue(value, type = true, name = true, desc = true) {
    value = value.trim();

    let match;
    let typeText = null;
    let typeLongname = null;
    let paramName = null;
    let paramDesc = null;

    // e.g {number}
    if (type) {
        const reg = /^\{(.*?)\}(\s+|$)/; // patch(jan-molak) previous: const reg = /^\{([^@]*?)\}(\s+|$)/; // ``@`` is special char in ``{@link foo}``
        match = value.match(reg);
        if (match) {
            typeLongname = match[1];
            typeText = typeLongname.slice(match[1].indexOf('~') + 1); // patch(jan-molak) previous: match[1];
            value = value.replace(reg, '');
        } else {
            typeText = '*';
        }
    }

    // e.g. [p1=123]
    if (name) {
        if (value.charAt(0) === '[') {
            paramName = '';
            let counter = 0;
            for (const c of value) {
                paramName += c;
                if (c === '[') counter++;
                if (c === ']') counter--;
                if (counter === 0) break;
            }

            if (paramName) {
                value = value.substr(paramName.length).trim();
            }
        } else {
            match = value.match(/^(\S+)/);
            if (match) {
                paramName = match[1];
                value = value.replace(/^\S+\s*/, '');
            }
        }
    }

    // e.g. this is p1 desc.
    if (desc) {
        match = value.match(/^-?\s*((:?.|\n)*)$/m);
        if (match) {
            paramDesc = match[1];
        }
    }

    assert(typeText || paramName || paramDesc, `param is invalid. param = "${value}"`);

    return {typeText, typeLongname, paramName, paramDesc};
}
require('esdoc/out/src/Parser/ParamParser').default.parseParamValue = patched_parseParamValue;

/**
 * esdoc/out/src/Doc/ExternalDoc
 *
 * The original ExternalDoc recognised the longname incorrectly; instead of the one defined in the externals.js
 * file it would use the externals file itself.
 *
 * So instead of using the `my-custom-module~Type` from `@external {my-custom-module~Type} description`
 * it would use `externals.js~my-custom-module~Type` and then fail to link it correctly when generating the docs.
 */
require('esdoc/out/src/Doc/ExternalDoc').default.prototype._$name = function patched_$name() {
    const value = this._findTagValue(['@external']);
    if (!value) {
        console.warn('can not resolve name.');
    }

    this._value.name = value;

    const tags = this._findAll(['@external']);
    if (!tags) {
        console.warn('can not resolve name.');
        return;
    }

    let name,
        longname;

    for (const tag of tags) {
        const { typeText, typeLongname, paramDesc } = patched_parseParamValue(tag.tagValue, true, false, true);
        name = typeText;
        longname = typeLongname;        // patch(jan-molak): previously longname was not returned by the ParamParser
        this._value.externalLink = paramDesc;
    }

    this._value.name = name;
    this._value.longname = longname;
};
require('esdoc/out/src/Doc/ExternalDoc').default.prototype._$longname = function() {};

/**
 * esdoc-publish-html-plugin/out/src/Builder/DocResolver
 *
 * The original DocResolver did not support links leading to scoped packages.
 */
require('esdoc-publish-html-plugin/out/src/Builder/DocResolver').default.prototype._resolveLink = function patched_resolveLink () {
    if (this._data.__RESOLVED_LINK__) return;

    const link = str => {
        if (!str) return str;

        // patch(jan-molak): monkey-patched the regex to support `@`
        return str.replace(/\{@link (@?[\w#_\-.:~\/$]+)}/g, (str, longname) => {
            return this._builder._buildDocLinkHTML(longname, longname);
        });
    };

    this._data().each(v => {
        v.description = link(v.description);

        if (v.params) {
            for (const param of v.params) {
                param.description = link(param.description);
            }
        }

        if (v.properties) {
            for (const property of v.properties) {
                property.description = link(property.description);
            }
        }

        if (v.return) {
            v.return.description = link(v.return.description);
        }

        if (v.throws) {
            for (const _throw of v.throws) {
                _throw.description = link(_throw.description);
            }
        }

        if (v.see) {
            for (let i = 0; i < v.see.length; i++) {
                if (v.see[i].indexOf('{@link') === 0) {
                    v.see[i] = link(v.see[i]);
                } else if (v.see[i].indexOf('<a href') === 0) {
                    // ignore
                } else {
                    v.see[i] = `<a href="${v.see[i]}">${v.see[i]}</a>`;
                }
            }
        }
    });

    this._data.__RESOLVED_LINK__ = true;
};

const _exec = require('esdoc-publish-html-plugin/out/src/Plugin')._exec.bind(require('esdoc-publish-html-plugin/out/src/Plugin'));
require('esdoc-publish-html-plugin/out/src/Plugin')._exec = function patched_exec(tags, writeFile, copyDir, readFile) {

    /**
     * write .hbs instead of html so that they can be processed with MetalSmith
     */
    function patched_writeFile(filePath, content, option) {
        const
            [ext, ...parts] = filePath.split('.').reverse(),
            fileName = parts.reverse().join('.');

        const newFilePath = (ext === 'html') ? `${fileName}.html.hbs` : filePath;

        return writeFile(newFilePath, content, option);
    }

    return _exec(tags, patched_writeFile, copyDir, readFile);
};
