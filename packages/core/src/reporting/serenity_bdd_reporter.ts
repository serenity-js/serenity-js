import * as _ from 'lodash';
import * as path from 'path';
import StackTrace = require('stacktrace-js');
import { StackFrame } from 'stacktrace-js';
import { Md5 } from 'ts-md5/dist/md5';

import { serenity } from '../';
import { DomainEvent, Photo, RecordedScene, Result, SceneFinished, Tag } from '../domain';
import { FileSystem, JSONObject } from '../io';
import { Stage, StageCrewMember } from '../stage';
import { ActivityPeriod, RehearsalPeriod, ReportExporter, ScenePeriod } from './index';
import { RehearsalReport } from './rehearsal_report';
import {
    ActivityReport,
    ErrorReport,
    ErrorReportStackFrame,
    FullReport,
    SceneReport,
    ScreenshotReport,
    TagReport,
} from './serenity_bdd_report';

export function serenityBDDReporter(
    requirementsDirectory: string   = serenity.config.requirementsDirectory,
    outputDirectory: string         = serenity.config.outputDirectory,
): StageCrewMember {
    return new SerenityBDDReporter(requirementsDirectory, new FileSystem(outputDirectory));
}

export class SerenityBDDReporter implements StageCrewMember {

    private static Events_of_Interest = [ SceneFinished ];
    private stage: Stage;

    constructor(private readonly requirementsDirectory, private readonly fs: FileSystem) {
    }

    assignTo(stage: Stage) {
        this.stage = stage;
        this.stage.manager.registerInterestIn(SerenityBDDReporter.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        switch (event.constructor) { // tslint:disable-line:switch-default - ignore other events
            case SceneFinished: return this.persistReport();
        }
    }

    private persistReport() {
        this.stage.manager.informOfWorkInProgress(
            RehearsalReport.from(this.stage.manager.readNewJournalEntriesAs('SerenityBDDReporter'))
                .exportedUsing(new SerenityBDDReportExporter(this.requirementsDirectory))
                .then((fullReport: FullReport) => Promise.all(
                    fullReport.scenes.map(
                        (scene: SceneReport) => this.fs.store(reportFileNameFor(scene), JSON.stringify(scene)),
                    ),
                )),
        );
    }
}

function reportFileNameFor(scene: SceneReport): string {
    const id   = scene.id,
          tags = (scene.tags || []).map(t => `${t.type}:${t.name}`).join('-');

    return Md5.hashStr(`${id}-${tags}`) + '.json';
}

// todo: extract

class Tags {
    private readonly tags: Tag[];

    constructor(...tags: Tag[]) {
        this.tags = tags;
    }

    ofType(type: string) {
        return this.tags.filter(tag => tag.type === type);
    }

    process = (...fns: Array<(tags: Tag[]) => Tag[]>) => fns.reduce((tags, fn) => fn(tags), this.tags);
}

const splitIssueTags                = (tags: Tag[]) => {
    const isAnIssue = (tag: Tag): boolean => !! ~['issue', 'issues'].indexOf(tag.type);
    const breakDownIssues = (tag: Tag) => isAnIssue(tag)
            ? tag.values.map(issueId => new Tag('issue', [ issueId ]))
            : tag;

    return _.chain(tags)
        .map(breakDownIssues)
        .flatten()
        .value() as Tag[];
};

const addCapabilityAndFeatureTags   = (scene: RecordedScene, pathToScenario: string) => (tags: Tag[]) => {

    const nonEmpty = <T>(...elements: T[]) => elements.filter(e => !! e);

    const join   = (...elements: string[]) => nonEmpty(...elements).join('/');

    const underscoresToSpaces   = (dirname: string) => dirname.replace(/_+/g, ' ');
    const capitaliseFirstLetter = (text: string) => text && text[0].toUpperCase() + text.slice(1);

    const relativePath   = path.dirname(pathToScenario);
    const subDirectories = (relativePath !== '.')
        ? relativePath.split(path.sep).map(underscoresToSpaces).map(capitaliseFirstLetter).reverse()
        : [];

    const feature       = scene.category;
    const capability    = subDirectories[0];
    const theme         = subDirectories[1];

    return tags.concat(nonEmpty(
                        new Tag('feature',      [ join(capability, feature) ]),
        capability  &&  new Tag('capability',   [ join(theme, capability) ]),
        theme       &&  new Tag('theme',        [ theme ]),
    ));
};

const tagAsManualIfNeeded     = (tags: Tag[]) => tags.concat(...tags.filter(tag => tag.type === 'manual').map(t => new Tag('External Tests', ['Manual'])));

const dashify = (text: string) => text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[ \t\W]/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

// / todo: extract

/**
 * Transforms the tree structure of the RehearsalPeriod to a format acceptable by Protractor
 */
export class SerenityBDDReportExporter implements ReportExporter<JSONObject> {

    private errorExporter = new ErrorExporter();
    private photoExporter = new PhotoExporter();

    constructor(private readonly requirementsDirectory) {
    }

    exportRehearsal(node: RehearsalPeriod): PromiseLike<FullReport> {
        return Promise.all(node.children.map(child => child.exportedUsing(this)))
            .then(children => ({
                scenes: children,
            }));
    }

    exportScene(node: ScenePeriod): PromiseLike<SceneReport> {
        return Promise.all(node.children.map(child => child.exportedUsing(this)))
            .then((children: ActivityReport[]) => this.errorExporter.tryToExport(node.outcome.error).then(error => {
                return node.promisedTags().then(promisedTags => {

                    const
                        scene   = node.value,
                        pathToScenario = path.relative(this.requirementsDirectory, scene.location.path),

                        tags    = new Tags(...scene.tags, ...promisedTags),
                        allTags = tags.process(
                            splitIssueTags,
                            tagAsManualIfNeeded,
                            addCapabilityAndFeatureTags(scene, pathToScenario),
                        );

                    return ({
                        id:         this.idOf(node, allTags),
                        name:       this.idOf(node, allTags),

                        context:    tags.ofType('context').map(tag => tag.value).pop(),
                        manual:     !! tags.ofType('manual').pop(),
                        tags:       this.serialisedTags(allTags),

                        title:          scene.name,
                        description:    '',
                        startTime:      node.startedAt,
                        duration:       node.duration(),
                        testSource:     'cucumber',         // todo: provide the correct test source

                        userStory: {
                            id:         dashify(scene.category),
                            path:       pathToScenario,
                            storyName:  scene.category,
                            type:       'feature',
                        },

                        issues:     this.issuesCoveredBy(scene),
                        testSteps:  children,

                        result:             Result[ node.outcome.result ],
                        annotatedResult:    Result[ node.outcome.result ],
                        testFailureCause:   error,
                    });
                });
            }));
    }

    exportActivity(node: ActivityPeriod): PromiseLike<ActivityReport> {
        return Promise.all(node.children.map(child => child.exportedUsing(this)))
            .then((children: ActivityReport[]) => Promise.all([ node.photos(), this.errorExporter.tryToExport(node.outcome.error)]).then( r => ({
                description: node.value.name,
                duration:    node.duration(),
                startTime:   node.startedAt,
                screenshots: this.photoExporter.tryToExport(r[0]),
                result:      Result[node.outcome.result],
                children,
                exception:   r[1], // this.errorExporter.tryToExport(node.outcome.error),
            })));
    }

    private idOf(node: ScenePeriod, tags: Tag[]) {
        const asString = (t: Tag) => !! t.value ? `${ t.type }:${t.value}` : t.type ;
        const combined = (ts: Tag[]) => (tags || []).map(asString).join(';').replace(' ', '');

        return [
            node.value.name,
            combined(tags),
        ].map(dashify).join(';').replace(/;$/, '');
    }

    private issuesCoveredBy(scene: RecordedScene): string[] {
        const onlyIssueTags = this.isAnIssue,
              toIssueIds    = (tag: Tag): string[] => tag.values;

        return _.chain(scene.tags).filter(onlyIssueTags).map(toIssueIds).flatten().uniq().value() as string[];
    }

    private serialisedTags(tags: Tag[]): TagReport[] {

        function serialise(tag: Tag) {
            const noValue   = (t: Tag) => ({ name: t.type,  type: 'tag' }),
                  withValue = (t: Tag) => ({ name: t.values.join(','), type: t.type });

            return tag.values.length === 0
                ? noValue(tag)
                : withValue(tag);
        }

        return _.chain(tags)
            .map(serialise)
            .uniqBy('name')
            .value();
    }

    private isAnIssue = (tag: Tag): boolean => !! ~['issue', 'issues'].indexOf(tag.type);
}

class PhotoExporter {
    tryToExport(photos: Photo[]): ScreenshotReport[] {
        return this.ifNotEmpty(photos.map(photo => ({ screenshot: path.basename(photo.path) })));
    }

    private ifNotEmpty = <T>(list: T[]): T[] => !! list.length ? list : undefined;
}

class ErrorExporter {
    tryToExport(error: Error): PromiseLike<ErrorReport> {
        if (! error) {
            return Promise.resolve(undefined); // an undefined JSON field does not get serialised and that's what Serenity BDD expects
        }

        return this.stackTraceOf(error).then(frames => ({
            errorType:    error.name,
            message:      error.message,
            stackTrace:   frames,
        }));
    }

    private stackTraceOf(error: Error): PromiseLike<ErrorReportStackFrame[]> {
        return !! error.stack ? this.parsedStackTraceOf(error) : Promise.resolve([]);
    }

    private parsedStackTraceOf(error: Error): PromiseLike<ErrorReportStackFrame[]> {
        const
            serenityCode = /node_modules[\\/]serenity/,
            onlyIfFound  = index => !! ~index ? index : undefined,
            firstSerenityStackFrame = (stack: StackFrame[]): number => onlyIfFound(stack.findIndex(frame => !! serenityCode.exec(frame.fileName))),
            stack = StackTrace.fromError(error);

        return stack.then(frames => frames.slice(0, firstSerenityStackFrame(frames)).map(frame => {
            return {
                declaringClass: '',
                methodName:     `${ frame.functionName }(${ (frame.args || []).join(', ') })`,
                fileName:       frame.fileName,
                lineNumber:     frame.lineNumber,
            };
        }));
    }
}
