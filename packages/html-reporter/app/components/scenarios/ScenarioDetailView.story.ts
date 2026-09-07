import { ScenarioDetailView } from './ScenarioDetailView.js';

type Props = Parameters<typeof ScenarioDetailView>[0];

export const Default = (props: Props): ReturnType<typeof ScenarioDetailView> => ScenarioDetailView(props);
