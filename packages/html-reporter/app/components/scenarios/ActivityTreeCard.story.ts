import { ActivityTreeCard } from './ActivityTreeCard.js';

type Props = Parameters<typeof ActivityTreeCard>[0];

export const Default = (props: Props): ReturnType<typeof ActivityTreeCard> => ActivityTreeCard(props);
