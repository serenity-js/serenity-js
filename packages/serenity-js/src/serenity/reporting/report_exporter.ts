import { ActivityPeriod, RehearsalPeriod, ScenePeriod } from './rehearsal_report';

export interface ReportExporter<FORMAT> {
    exportRehearsal <F extends FORMAT>(node: RehearsalPeriod): PromiseLike<F>;
    exportScene     <F extends FORMAT>(node: ScenePeriod): PromiseLike<F>;
    exportActivity  <F extends FORMAT>(node: ActivityPeriod): PromiseLike<F>;
}
