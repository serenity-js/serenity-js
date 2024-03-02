import type { Tag} from '@serenity-js/core/lib/model';
import { BrowserTag, CapabilityTag, ExecutionRetriedTag, FeatureTag, IssueTag, ManualTag, PlatformTag, ThemeTag } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';
import { equal } from 'tiny-types/lib/objects';

import type * as serenitybdd from '../../serenity-bdd-report-schema';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';
import { reportIdIncluding } from './reportIdIncluding';

/**
 * @package
 */
export function tagOf<Context extends SerenityBDDReportContext>(tag: Tag): (context: Context) => Context {
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
                    name: join('/', displayNameOfRecorded(ThemeTag, context.report.tags), tag.name),
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
                    name: join('/', ...displayNamesOfRecorded(ThemeTag, context.report.tags), displayNameOfRecorded(CapabilityTag, context.report.tags), tag.name),
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

                // todo: simplify browser name
                //  https://github.com/serenity-bdd/serenity-core/blob/8bf783fa732d49012f546ad0f8352ace4640ccc6/serenity-model/src/main/java/net/thucydides/core/model/ContextIcon.java#L11

                context.report.context = appendIfNotPresent(context.report.context, simplifyBrowserName(browserTag.browserName));
                context.report.driver = browserTag.browserName;
                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(browserTag));

                return context;
            })
            .when(PlatformTag, (platformTag: PlatformTag) => {

                reportIdIncluding(tag.name)(context);

                // todo: simplify platform name
                //  https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/model/ContextIcon.java

                // https://github.com/serenity-bdd/serenity-core/blob/master/serenity-model/src/main/java/net/thucydides/core/model/ContextIcon.java
                context.report.context = appendIfNotPresent(context.report.context, simplifyPlatformName(platformTag.platformName) /* todo: toLowerCase? */);
                context.report.tags = concatIfNotPresent(context.report.tags, tagReportFor(platformTag));

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

function simplified(aliases: Record<string, string[]>) {
    return (actualName: string) => {
        const lowercasePlatformName = actualName.toLowerCase();

        const recognisedAlias = Object.entries(aliases)
            .find(entry =>
                entry[1].some(alias => lowercasePlatformName.includes(alias))
            );

        return recognisedAlias
            ? recognisedAlias[0]
            : actualName;
    }
}

function simplifyPlatformName(platformName: string) {
    return simplified({
        linux:    ['linux'],
        mac:      ['darwin', 'mac', 'os x'],
        windows:  ['windows'],
        android:  ['android'],
        ios:      ['ios'],
    })(platformName);
}

// https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
// https://www.browserstack.com/automate/capabilities
function simplifyBrowserName(browserName: string) {
    return simplified({
        chrome:     ['chrome', 'chromium'],
        firefox:    ['firefox'],
        safari:     ['safari', 'webkit'],
        opera:      ['opera'],
        ie:         ['internet explorer', 'explorer', 'ie'],
        edge:       ['microsoftedge', 'edge'],
    })(browserName);
}

function concatIfNotPresent<T>(items: T[], item: T) {
    const currentTags = items || [];

    return currentTags.some(current => equal(current, item))
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

function tagReportFor(tag: Tag): serenitybdd.TagSchema {
    return {
        ...tag.toJSON(),
        displayName: tag.name.replaceAll(/_+/g, ' '),
    }
}

function join(separator: string, ...values: string[]) {
    return values.filter(_ => !! _).join(separator);
}

function unique(items: string[]) {
    return [...new Set(items)];
}

function displayNamesOfRecorded(typeOfTag: { Type: string }, tags: serenitybdd.TagSchema[]): string[] {
    const matchingTags = (tags || []).filter(t => t.type === typeOfTag.Type);

    return matchingTags.map(matchingTag => matchingTag.displayName);
}

function displayNameOfRecorded(typeOfTag: { Type: string }, tags: serenitybdd.TagSchema[]): string {
    return displayNamesOfRecorded(typeOfTag, tags)[0] || '';
}
