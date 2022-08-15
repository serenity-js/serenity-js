const { Converter, ParameterType } = require('typedoc');

/*
 * Based on:
 * - https://github.com/ardalanamini/typedoc-plugin-example-tag/blob/master/src/index.ts
 * - https://github.com/jonchardy/typedoc-plugin-no-inherit
 * - https://github.com/christopherthielen/typedoc-plugin-internal-external/blob/master/typedoc-plugin-internal-external.ts
 */

/**
 * @param {import('typedoc').Application} app
 * @returns void
 */
function load(app) {

    const reflectionsToIgnore = new Set();

    app.options.addDeclaration({
        help: '[Serenity/JS Ignore Inherited Static Methods] Log ignored methods',
        name: 'logIgnoredInheritedStaticMethods',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    app.converter.on(Converter.EVENT_CREATE_DECLARATION, (context, reflection) => {
        const logIgnoredInheritedStaticMethods = app.options.getValue('logIgnoredInheritedStaticMethods');

        if (isInheritedStaticDeclaration(reflection)) {
            if (logIgnoredInheritedStaticMethods) {
                app.logger.info(
                    `[Serenity/JS Ignore Inherited Static Methods] Ignored ${ reflection.parent.name }.${ reflection.name} inherited from ${ reflection.inheritedFrom.qualifiedName }`
                );
            }

            reflectionsToIgnore.add(reflection);
        }
    },  undefined, -1100); // after ImplementsPlugin

    app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context) => {
        reflectionsToIgnore.forEach(reflectionToIgnore => {
            context.project.removeReflection(reflectionToIgnore);
        });
    });
}

function isInheritedStaticDeclaration(reflection) /*: reflection is Reflection & { inheritedFrom: ReferenceType } */ {
    return reflection.flags.isStatic
        && Object.prototype.hasOwnProperty.call(reflection, 'inheritedFrom');
}

exports.load = load;
