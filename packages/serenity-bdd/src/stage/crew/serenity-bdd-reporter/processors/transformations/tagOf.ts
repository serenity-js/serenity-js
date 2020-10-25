import { BrowserTag, CapabilityTag, ContextTag, ExecutionRetriedTag, FeatureTag, IssueTag, ManualTag, PlatformTag, Tag, ThemeTag } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports
import * as serenitybdd from '../../SerenityBDDJsonSchema';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';
import { reportIdIncluding } from './reportIdIncluding';

/**
 * @package
 */
export function tagOf<Context extends SerenityBDDReportContext>(tag: Tag) {
    return (context: Context): Context =>
        match<Tag, Context>(tag)
            .when(ManualTag, _ => {

                context.report.manual = true;
                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(tag));

                return context;
            })
            .when(ThemeTag, _ => {

                const themeTag = {
                    ...tagReportFor(tag),
                    displayName: tag.name,
                };

                context.report.tags = concatIfNotPresent(context.report.tags, themeTag);

                return context;
            })
            .when(CapabilityTag, _ => {

                const capabilityTag = {
                    ...tagReportFor(tag),
                    name: join('/', displayNameOfRecorded(ThemeTag, context.report.tags), tag.name),
                    displayName: tag.name,
                };

                context.report.tags = concatIfNotPresent(context.report.tags, capabilityTag);

                return context;
            })
            .when(FeatureTag, _ => {

                const featureTag = {
                    ...tagReportFor(tag),
                    name: join('/', displayNameOfRecorded(CapabilityTag, context.report.tags), tag.name),
                    displayName: tag.name,
                };

                context.report.featureTag = featureTag;
                context.report.tags = concatIfNotPresent(context.report.tags, featureTag);

                return context;
            })
            .when(IssueTag, _ => {

                context.report.issues = concatIfNotPresent(context.report.issues, tag.name);
                context.report.additionalIssues = concatIfNotPresent(context.report.additionalIssues, tag.name);
                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(tag));

                return context;
            })
            .when(BrowserTag, (browserTag: BrowserTag) => {

                reportIdIncluding(browserTag.name)(context);

                context.report.context = appendIfNotPresent(context.report.context, browserTag.browserName);
                context.report.driver = browserTag.browserName;
                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(browserTag));

                return context;
            })
            .when(PlatformTag, _ => {

                reportIdIncluding(tag.name)(context);

                context.report.context = appendIfNotPresent(context.report.context, tag.name);
                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(tag));

                return context;
            })
            .when(ContextTag, _ => {

                reportIdIncluding(tag.name)(context);

                context.report.context = tag.name;
                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(tag));

                return context;
            })
            .when(ExecutionRetriedTag, _ => {

                reportIdIncluding(tag.name)(context);

                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(tag));

                return context;
            })
            .else(_ => {

                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(tag));

                return context;
            })
}

function concatIfNotPresent<T>(items: T[], item: T) {
    const currentTags = items || [];
    return !! currentTags.find(current => equal(current, item))
        ? currentTags
        : currentTags.concat(item);
}

function appendIfNotPresent(commaSeparatedStringOrEmpty: string, item: string): string {
    return unique((commaSeparatedStringOrEmpty || '')
        .split(',')
        .filter(_ => !! _)
        .concat(item)
    ).join(',');
}

function tagReportFor(tag: Tag): serenitybdd.Tag {
    return {
        ...tag.toJSON(),
        displayName: tag.name.replace(/_+/, ' '),
    }
}

function join(separator: string, ...values: string[]) {
    return values.filter(_ => !! _).join(separator);
}

function unique(items: string[]) {
    return [...new Set(items)];
}

function displayNameOfRecorded(typeOfTag: { Type: string }, tags: serenitybdd.Tag[]) {
    const found = (tags || []).find(t => t.type === typeOfTag.Type);

    return found && found.displayName;
}
