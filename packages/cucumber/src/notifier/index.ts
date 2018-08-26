import { serenity } from '@serenity-js/core';
import Gherkin = require('gherkin');    // ts-node:disable-line:no-var-requires     No type definitions available

import { FeatureFileLoader, FeatureFileMapper, FeatureFileParser } from '../gherkin';
import { Notifier } from './Notifier';

export const notifier = new Notifier(
    serenity.stageManager,
    new FeatureFileLoader(
        new FeatureFileParser(new Gherkin.Parser()),
        new FeatureFileMapper(),
    ),
);
