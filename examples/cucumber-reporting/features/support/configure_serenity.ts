import { serenity } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { ArtifactArchiver } from '@serenity-js/core/lib/stage';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

import { setDefaultTimeout } from 'cucumber';

setDefaultTimeout(5000);

serenity.setTheStage(
    new ArtifactArchiver(new FileSystem(new Path('./target/site/serenity'))),
    new SerenityBDDReporter(),
);
