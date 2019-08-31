import { ArtifactArchiver, serenity } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

import { setDefaultTimeout } from 'cucumber';

setDefaultTimeout(5000);

serenity.setTheStage(
    ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
    new SerenityBDDReporter(),
);
