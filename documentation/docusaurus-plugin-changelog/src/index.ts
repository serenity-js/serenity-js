import type { LoadContext, OptionValidationContext, Plugin } from '@docusaurus/types';
import pluginContentBlog from '@docusaurus/plugin-content-blog';
import { aliasedSitePath, docuHash, normalizeUrl } from '@docusaurus/utils';
import { Joi } from '@docusaurus/utils-validation';
import type { Options, PluginOptions } from './options';

export default function pluginChangelog(
    context: LoadContext,
    options: PluginOptions,
): Plugin {
    // const { id, enable } = options;

    return {
        name: 'docusaurus-plugin-changelog',
    };
}

const pluginOptionsSchema = Joi.object<PluginOptions>({
    // id: Joi.string().required(),
    // enable: Joi.boolean().default(false),
});

export function validateOptions({ validate, options }: OptionValidationContext<Options, PluginOptions>): PluginOptions {
    return validate(pluginOptionsSchema, options);
}

export type { Options, PluginOptions } from './options';
