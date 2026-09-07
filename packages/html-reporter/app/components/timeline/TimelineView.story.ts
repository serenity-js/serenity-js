import { TimelineView } from './TimelineView.js';

type Props = Parameters<typeof TimelineView>[0];

export const Default = (props: Props): ReturnType<typeof TimelineView> => TimelineView(props);
