import { Result } from '../../serenity/domain/model';
import { JSONObject } from '../../serenity/io/json';
import { ActivityPeriod, RehearsalPeriod, ReportExporter, ScenePeriod } from '../../serenity/reporting';
import { ProtractorActivityReport, ProtractorReport, ProtractorSceneReport } from './protractor_report';

export class ProtractorReportExporter implements ReportExporter<JSONObject> {

    constructor(private passing: (r: Result) => boolean = (r: Result) => ! (r & Result.Failed)) {
    }

    exportRehearsal(node: RehearsalPeriod): PromiseLike<ProtractorReport> {
        return Promise.all(node.children.map(child => child.exportedUsing(this)))
            .then(children => ({
                failedCount: node.children.filter(period => ! this.passing(period.outcome.result)).length,
                specResults: children,
            }));
    }

    exportScene(node: ScenePeriod): PromiseLike<ProtractorSceneReport> {
        return Promise.all(node.children.map(child => child.exportedUsing(this)))
            .then(children => ({
                description: node.value.name,
                assertions:  children,
                duration:    node.duration(),
            }));
    }

    exportActivity(node: ActivityPeriod): PromiseLike<ProtractorActivityReport> {
        // we only export top-level activities as Protractor doesn't care about the nested ones
        return Promise.resolve({
            passed:     this.passing(node.outcome.result),
            errorMsg:   node.outcome.error && node.outcome.error.message,
            stackTrace: node.outcome.error && node.outcome.error.stack,
        });
    }
}
